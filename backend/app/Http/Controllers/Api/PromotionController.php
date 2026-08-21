<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Promotion;
use Illuminate\Http\Request;

class PromotionController extends Controller
{
    public function index(Request $request)
    {
        $query = Promotion::where('status', 'active')
            ->where('end_date', '>=', now()->toDateString())
            ->with(['business.category']);

        $promotions = $query->latest()->paginate(12);

        return response()->json($promotions);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'business_id' => 'required|exists:businesses,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'discount' => 'required|string|max:50',
            'promo_code' => 'nullable|string|max:50',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'image' => 'nullable|string',
        ]);

        $business = Business::findOrFail($validated['business_id']);
        if ($business->owner_id !== $user->id && !$user->isAdmin()) {
            abort(403, 'Unauthorized');
        }

        $promotion = Promotion::create($validated);

        return response()->json($promotion, 201);
    }

    public function update(Request $request, $id)
    {
        $promotion = Promotion::with('business')->findOrFail($id);
        $user = $request->user();

        if ($promotion->business->owner_id !== $user->id && !$user->isAdmin()) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'discount' => 'sometimes|required|string|max:50',
            'promo_code' => 'nullable|string|max:50',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after_or_equal:start_date',
            'image' => 'nullable|string',
            'status' => 'sometimes|in:active,inactive',
        ]);

        $promotion->update($validated);

        return response()->json($promotion);
    }

    public function destroy(Request $request, $id)
    {
        $promotion = Promotion::with('business')->findOrFail($id);
        $user = $request->user();

        if ($promotion->business->owner_id !== $user->id && !$user->isAdmin()) {
            abort(403, 'Unauthorized');
        }

        $promotion->delete();

        return response()->json(['message' => 'Promotion deleted successfully']);
    }
}
