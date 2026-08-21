<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Destination;
use App\Models\Favorite;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $favorites = Favorite::where('user_id', $user->id)
            ->with(['favoritable'])
            ->latest()
            ->get();

        $destinations = [];
        $businesses = [];

        foreach ($favorites as $fav) {
            if ($fav->favoritable_type === Destination::class && $fav->favoritable) {
                $fav->favoritable->load(['category', 'images']);
                $destinations[] = $fav->favoritable;
            } elseif ($fav->favoritable_type === Business::class && $fav->favoritable) {
                $fav->favoritable->load(['category', 'promotions']);
                $businesses[] = $fav->favoritable;
            }
        }

        return response()->json([
            'destinations' => $destinations,
            'businesses' => $businesses,
            'all_favorites' => $favorites,
        ]);
    }

    public function toggle(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:destination,business',
            'id' => 'required|integer',
        ]);

        $modelClass = $validated['type'] === 'destination' ? Destination::class : Business::class;
        $user = $request->user();

        $existing = Favorite::where('user_id', $user->id)
            ->where('favoritable_type', $modelClass)
            ->where('favoritable_id', $validated['id'])
            ->first();

        if ($existing) {
            $existing->delete();
            return response()->json([
                'favorited' => false,
                'message' => 'Removed from favorites',
            ]);
        }

        Favorite::create([
            'user_id' => $user->id,
            'favoritable_type' => $modelClass,
            'favoritable_id' => $validated['id'],
        ]);

        return response()->json([
            'favorited' => true,
            'message' => 'Added to favorites',
        ]);
    }
}
