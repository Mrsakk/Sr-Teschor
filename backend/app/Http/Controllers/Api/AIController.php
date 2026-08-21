<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Destination;
use App\Services\AITravelService;
use Illuminate\Http\Request;

class AIController extends Controller
{
    protected AITravelService $aiService;

    public function __construct(AITravelService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * AI Travel Chat Concierge
     */
    public function chat(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:1000',
            'lang' => 'nullable|string|in:km,en',
        ]);

        $response = $this->aiService->chat($validated['message'], $validated['lang'] ?? null);

        return response()->json($response);
    }

    /**
     * AI Multi-Day Itinerary Generator
     */
    public function generateItinerary(Request $request)
    {
        $validated = $request->validate([
            'days' => 'nullable|integer|min:1|max:7',
            'style' => 'nullable|string|in:heritage,romantic,family,adventure,photography,foodie',
            'budget' => 'nullable|string|in:budget,comfort,luxury',
            'lang' => 'nullable|string|in:km,en',
        ]);

        $itinerary = $this->aiService->generateItinerary($validated);

        return response()->json($itinerary);
    }

    /**
     * AI Curated Smart Recommendations
     */
    public function recommendations(Request $request)
    {
        $category = $request->query('category');
        $limit = min(10, (int) ($request->query('limit', 4)));

        $destinationsQuery = Destination::with(['category', 'images'])->where('status', 'published');
        if ($category) {
            $destinationsQuery->whereHas('category', function($q) use ($category) {
                $q->where('slug', $category);
            });
        }
        $destinations = $destinationsQuery->inRandomOrder()->take($limit)->get();

        $businesses = Business::with(['category', 'promotions'])->where('status', 'active')->inRandomOrder()->take($limit)->get();

        return response()->json([
            'status' => 'success',
            'destinations' => $destinations,
            'businesses' => $businesses,
        ]);
    }
}
