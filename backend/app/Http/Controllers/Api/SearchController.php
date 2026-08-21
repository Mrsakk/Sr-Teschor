<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Category;
use App\Models\Destination;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function suggestions(Request $request)
    {
        $q = $request->query('q', '');

        if (strlen($q) < 2) {
            // Return top popular suggestions
            $topDestinations = Destination::where('status', 'published')
                ->orderBy('views_count', 'desc')
                ->take(4)
                ->get(['id', 'name', 'slug', 'address', 'rating'])
                ->map(fn($d) => [
                    'id' => $d->id,
                    'title' => $d->name,
                    'subtitle' => $d->address,
                    'slug' => $d->slug,
                    'type' => 'destination',
                    'url' => '/destinations/' . $d->slug,
                ]);

            $topBusinesses = Business::where('status', 'active')
                ->where('verification_status', 'approved')
                ->orderBy('rating', 'desc')
                ->take(3)
                ->get(['id', 'name', 'slug', 'address', 'price_range'])
                ->map(fn($b) => [
                    'id' => $b->id,
                    'title' => $b->name,
                    'subtitle' => $b->address . ' • ' . $b->price_range,
                    'slug' => $b->slug,
                    'type' => 'business',
                    'url' => '/businesses/' . $b->slug,
                ]);

            return response()->json([
                'destinations' => $topDestinations,
                'businesses' => $topBusinesses,
                'categories' => [],
            ]);
        }

        $destinations = Destination::where('status', 'published')
            ->where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                      ->orWhere('khmer_name', 'like', "%{$q}%")
                      ->orWhere('description', 'like', "%{$q}%")
                      ->orWhere('address', 'like', "%{$q}%");
            })
            ->take(5)
            ->get(['id', 'name', 'slug', 'address', 'rating', 'entrance_fee'])
            ->map(fn($d) => [
                'id' => $d->id,
                'title' => $d->name,
                'subtitle' => $d->address . ($d->entrance_fee > 0 ? " • \${$d->entrance_fee}" : ' • Free'),
                'slug' => $d->slug,
                'type' => 'destination',
                'url' => '/destinations/' . $d->slug,
            ]);

        $businesses = Business::where('status', 'active')
            ->where('verification_status', 'approved')
            ->where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                      ->orWhere('khmer_name', 'like', "%{$q}%")
                      ->orWhere('description', 'like', "%{$q}%")
                      ->orWhere('address', 'like', "%{$q}%");
            })
            ->take(5)
            ->get(['id', 'name', 'slug', 'address', 'rating', 'price_range'])
            ->map(fn($b) => [
                'id' => $b->id,
                'title' => $b->name,
                'subtitle' => $b->address . " • {$b->price_range}",
                'slug' => $b->slug,
                'type' => 'business',
                'url' => '/businesses/' . $b->slug,
            ]);

        $categories = Category::where('name', 'like', "%{$q}%")
            ->take(3)
            ->get(['id', 'name', 'slug'])
            ->map(fn($c) => [
                'id' => $c->id,
                'title' => $c->name,
                'subtitle' => 'Explore Category',
                'slug' => $c->slug,
                'type' => 'category',
                'url' => '/destinations?category=' . $c->slug,
            ]);

        return response()->json([
            'destinations' => $destinations,
            'businesses' => $businesses,
            'categories' => $categories,
        ]);
    }

    public function mapLocations(Request $request)
    {
        $destinations = Destination::where('status', 'published')
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->with([
                'category:id,name,slug,icon',
                'primaryImage:id,destination_id,image',
                'images:id,destination_id,image',
            ])
            ->select([
                'id', 'category_id', 'name', 'khmer_name', 'slug',
                'address', 'latitude', 'longitude', 'entrance_fee',
                'rating', 'review_count', 'is_featured', 'is_hidden_gem'
            ])
            ->get();

        $businesses = Business::where('status', 'active')
            ->where('verification_status', 'approved')
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->with([
                'category:id,name,slug,icon',
            ])
            ->select([
                'id', 'category_id', 'name', 'khmer_name', 'slug',
                'address', 'latitude', 'longitude', 'cover_image', 'logo',
                'rating', 'review_count', 'price_range', 'is_featured'
            ])
            ->get();

        return response()->json([
            'destinations' => $destinations,
            'businesses' => $businesses,
        ]);
    }
}
