<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Destination;
use App\Models\Notification;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->query('type'); // destination or business
        $id = $request->query('id');

        $query = Review::where('status', 'approved')->with('user');

        if ($type && $id) {
            $modelClass = $type === 'destination' ? Destination::class : Business::class;
            $query->where('reviewable_type', $modelClass)->where('reviewable_id', $id);
        }

        $reviews = $query->latest()->paginate(10);

        return response()->json($reviews);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:destination,business',
            'id' => 'required|integer',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:5|max:2000',
            'images' => 'nullable|array',
        ]);

        $modelClass = $validated['type'] === 'destination' ? Destination::class : Business::class;
        $target = $modelClass::findOrFail($validated['id']);

        $user = $request->user();

        $review = Review::create([
            'user_id' => $user->id,
            'reviewable_type' => $modelClass,
            'reviewable_id' => $target->id,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
            'images' => $validated['images'] ?? null,
            'status' => 'approved',
        ]);

        // Recalculate rating & review count for destination / business
        $avgRating = Review::where('reviewable_type', $modelClass)
            ->where('reviewable_id', $target->id)
            ->where('status', 'approved')
            ->avg('rating');

        $count = Review::where('reviewable_type', $modelClass)
            ->where('reviewable_id', $target->id)
            ->where('status', 'approved')
            ->count();

        $target->update([
            'rating' => round($avgRating, 2),
            'review_count' => $count,
        ]);

        // If target is a business, notify business owner
        if ($validated['type'] === 'business') {
            Notification::create([
                'user_id' => $target->owner_id,
                'title' => 'New Review on ' . $target->name,
                'message' => "{$user->name} rated your business {$validated['rating']} stars: \"{$validated['comment']}\"",
                'type' => 'review',
                'link' => '/business/dashboard',
            ]);
        }

        return response()->json([
            'message' => 'Review submitted successfully',
            'review' => $review->load('user'),
        ], 201);
    }

    public function reply(Request $request, $id)
    {
        $review = Review::findOrFail($id);
        $user = $request->user();

        if ($review->reviewable_type !== Business::class) {
            abort(400, 'Can only reply to business reviews');
        }

        $business = Business::findOrFail($review->reviewable_id);
        if ($business->owner_id !== $user->id && !$user->isAdmin()) {
            abort(403, 'Unauthorized to reply to this review.');
        }

        $validated = $request->validate([
            'reply' => 'required|string|max:1000',
        ]);

        $review->update([
            'reply' => $validated['reply'],
            'reply_date' => now(),
        ]);

        // Notify user about reply
        Notification::create([
            'user_id' => $review->user_id,
            'title' => 'Response to your review',
            'message' => "{$business->name} responded to your review.",
            'type' => 'review',
            'link' => '/businesses/' . $business->slug,
        ]);

        return response()->json([
            'message' => 'Reply posted successfully',
            'review' => $review,
        ]);
    }

    public function myReviews(Request $request)
    {
        $user = $request->user();
        $reviews = Review::where('user_id', $user->id)
            ->with(['reviewable'])
            ->latest()
            ->paginate(15);

        return response()->json($reviews);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        $review = Review::findOrFail($id);

        if ($review->user_id !== $user->id && !$user->isAdmin()) {
            abort(403, 'Unauthorized to edit this review.');
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:5|max:2000',
        ]);

        $review->update($validated);

        // Recalculate rating
        $avgRating = Review::where('reviewable_type', $review->reviewable_type)
            ->where('reviewable_id', $review->reviewable_id)
            ->where('status', 'approved')
            ->avg('rating');

        $target = $review->reviewable;
        if ($target) {
            $target->update(['rating' => round($avgRating, 2)]);
        }

        return response()->json([
            'message' => 'Review updated successfully!',
            'review' => $review->load(['user', 'reviewable']),
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $review = Review::findOrFail($id);

        if ($review->user_id !== $user->id && !$user->isAdmin()) {
            abort(403, 'Unauthorized to delete this review.');
        }

        $targetClass = $review->reviewable_type;
        $targetId = $review->reviewable_id;

        $review->delete();

        // Recalculate
        $avgRating = Review::where('reviewable_type', $targetClass)
            ->where('reviewable_id', $targetId)
            ->where('status', 'approved')
            ->avg('rating') ?? 0;

        $count = Review::where('reviewable_type', $targetClass)
            ->where('reviewable_id', $targetId)
            ->where('status', 'approved')
            ->count();

        $target = $targetClass::find($targetId);
        if ($target) {
            $target->update([
                'rating' => round($avgRating, 2),
                'review_count' => $count,
            ]);
        }

        return response()->json([
            'message' => 'Review deleted successfully.',
        ]);
    }
}
