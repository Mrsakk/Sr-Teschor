<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TripItem;
use App\Models\TripPlan;
use Illuminate\Http\Request;

class TripPlanController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // User's own trip plans
        $myTrips = TripPlan::where('user_id', $user->id)
            ->with(['items.destination.images', 'items.business'])
            ->latest()
            ->get();

        // Public featured itineraries
        $publicTrips = TripPlan::where('is_public', true)
            ->with(['user', 'items.destination.images', 'items.business'])
            ->latest()
            ->take(6)
            ->get();

        return response()->json([
            'my_trips' => $myTrips,
            'public_trips' => $publicTrips,
        ]);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $trip = TripPlan::with([
            'items.destination.images',
            'items.destination.category',
            'items.business.category',
            'user'
        ])->findOrFail($id);

        if (!$trip->is_public && $trip->user_id !== $user->id) {
            abort(403, 'This itinerary is private.');
        }

        return response()->json($trip);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'is_public' => 'boolean',
        ]);

        $trip = TripPlan::create([
            'user_id' => $user->id,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'start_date' => $validated['start_date'] ?? null,
            'end_date' => $validated['end_date'] ?? null,
            'is_public' => $validated['is_public'] ?? false,
        ]);

        return response()->json($trip->load('items'), 201);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        $trip = TripPlan::findOrFail($id);

        if ($trip->user_id !== $user->id && !$user->isAdmin()) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'is_public' => 'boolean',
        ]);

        $trip->update($validated);

        return response()->json($trip->load(['items.destination.images', 'items.business']));
    }

    public function addItem(Request $request, $id)
    {
        $user = $request->user();
        $trip = TripPlan::findOrFail($id);

        if ($trip->user_id !== $user->id) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'destination_id' => 'nullable|exists:destinations,id',
            'business_id' => 'nullable|exists:businesses,id',
            'custom_title' => 'nullable|string|max:255',
            'day_number' => 'required|integer|min:1',
            'notes' => 'nullable|string',
            'estimated_time' => 'nullable|string',
            'estimated_distance' => 'nullable|string',
        ]);

        // Find max visit order for day
        $maxOrder = TripItem::where('trip_plan_id', $trip->id)
            ->where('day_number', $validated['day_number'])
            ->max('visit_order') ?? 0;

        $item = TripItem::create([
            'trip_plan_id' => $trip->id,
            'destination_id' => $validated['destination_id'] ?? null,
            'business_id' => $validated['business_id'] ?? null,
            'custom_title' => $validated['custom_title'] ?? null,
            'day_number' => $validated['day_number'],
            'visit_order' => $maxOrder + 1,
            'notes' => $validated['notes'] ?? null,
            'estimated_time' => $validated['estimated_time'] ?? null,
            'estimated_distance' => $validated['estimated_distance'] ?? null,
        ]);

        return response()->json($item->load(['destination.images', 'business']), 201);
    }

    public function removeItem(Request $request, $id, $itemId)
    {
        $user = $request->user();
        $trip = TripPlan::findOrFail($id);

        if ($trip->user_id !== $user->id) {
            abort(403, 'Unauthorized');
        }

        $item = TripItem::where('trip_plan_id', $trip->id)->where('id', $itemId)->firstOrFail();
        $item->delete();

        return response()->json(['message' => 'Stop removed from itinerary']);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $trip = TripPlan::findOrFail($id);

        if ($trip->user_id !== $user->id) {
            abort(403, 'Unauthorized');
        }

        $trip->delete();

        return response()->json(['message' => 'Trip plan deleted']);
    }
}
