<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\BusinessService;
use Illuminate\Http\Request;

class BusinessServiceController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'business_id' => 'required|exists:businesses,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration' => 'nullable|string|max:100',
            'image' => 'nullable|string',
        ]);

        $business = Business::findOrFail($validated['business_id']);
        if ($business->owner_id !== $user->id && !$user->isAdmin()) {
            abort(403, 'Unauthorized');
        }

        $service = BusinessService::create($validated);

        return response()->json($service, 201);
    }

    public function update(Request $request, $id)
    {
        $service = BusinessService::with('business')->findOrFail($id);
        $user = $request->user();

        if ($service->business->owner_id !== $user->id && !$user->isAdmin()) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'duration' => 'nullable|string|max:100',
            'image' => 'nullable|string',
            'status' => 'sometimes|in:active,inactive',
        ]);

        $service->update($validated);

        return response()->json($service);
    }

    public function destroy(Request $request, $id)
    {
        $service = BusinessService::with('business')->findOrFail($id);
        $user = $request->user();

        if ($service->business->owner_id !== $user->id && !$user->isAdmin()) {
            abort(403, 'Unauthorized');
        }

        $service->delete();

        return response()->json(['message' => 'Service deleted successfully']);
    }
}
