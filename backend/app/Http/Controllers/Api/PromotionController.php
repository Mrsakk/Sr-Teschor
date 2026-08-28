<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Promotion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class PromotionController extends Controller
{
    public function index(Request $request)
    {
        $page = $request->query('page', 1);
        $cacheKey = 'public_promotions_page_' . $page;

        $promotions = Cache::remember($cacheKey, 180, function () {
            return Promotion::where('status', 'active')
                ->where('end_date', '>=', now()->toDateString())
                ->with(['business.category'])
                ->latest()
                ->paginate(12)
                ->toArray();
        });

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
