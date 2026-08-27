<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class BusinessController extends Controller
{
    public function index(Request $request)
    {
        $query = Business::query()
            ->where('status', 'active')
            ->where('verification_status', 'approved')
            ->with(['category', 'promotions' => function ($q) {
                $q->where('status', 'active');
            }]);

        // Search
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('khmer_name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%");
            });
        }

        // Category Filter
        if ($request->filled('category')) {
            $catSlug = $request->input('category');
            $query->whereHas('category', function ($q) use ($catSlug) {
                $q->where('slug', $catSlug);
            });
        }

        // Price Range ($ to $$$$)
        if ($request->filled('price_range')) {
            $query->where('price_range', $request->input('price_range'));
        }

        // Rating Filter
        if ($request->filled('min_rating')) {
            $query->where('rating', '>=', (float) $request->input('min_rating'));
        }

        // Featured Filter
        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }

        // Sorting (boost premium / featured listings)
        $sortBy = $request->input('sort', 'featured');
        switch ($sortBy) {
            case 'rating':
                $query->orderBy('rating', 'desc');
                break;
            case 'reviews':
                $query->orderBy('review_count', 'desc');
                break;
            case 'newest':
                $query->latest();
                break;
            case 'featured':
            default:
                $query->orderByRaw("CASE subscription_plan WHEN 'premium' THEN 1 WHEN 'pro' THEN 2 ELSE 3 END ASC")
                      ->orderBy('is_featured', 'desc')
                      ->orderBy('rating', 'desc');
                break;
        }

        $perPage = (int) $request->input('per_page', 12);
        $cacheKey = 'businesses_list_' . md5(json_encode($request->all()));

        $businesses = \Illuminate\Support\Facades\Cache::remember($cacheKey, 120, function () use ($query, $perPage) {
            return $query->paginate($perPage);
        });

        return response()->json($businesses);
    }

    public function show($slug)
    {
        $cacheKey = 'business_detail_' . $slug;

        $data = \Illuminate\Support\Facades\Cache::remember($cacheKey, 120, function () use ($slug) {
            $business = Business::where('slug', $slug)
                ->with([
                    'category',
                    'services' => function ($q) {
                        $q->where('status', 'active');
                    },
                    'promotions' => function ($q) {
                        $q->where('status', 'active');
                    },
                    'reviews' => function ($q) {
                        $q->where('status', 'approved')->with('user')->latest();
                    },
                ])
                ->firstOrFail();

            $similar = Business::where('category_id', $business->category_id)
                ->where('id', '!=', $business->id)
                ->where('status', 'active')
                ->where('verification_status', 'approved')
                ->with('category')
                ->take(4)
                ->get();

            return [
                'business' => $business,
                'similar' => $similar,
            ];
        });

        // Increment views safely
        try {
            Business::where('slug', $slug)->increment('views_count');
        } catch (\Throwable $e) {}

        return response()->json($data);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if (!$user || (!$user->isBusinessOwner() && !$user->isAdmin())) {
            // Auto upgrade role to business if user submits a business
            $user->update(['role' => 'business']);
        }

        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'khmer_name' => 'nullable|string|max:255',
            'description' => 'required|string',
            'short_description' => 'nullable|string',
            'address' => 'required|string|max:255',
            'location_code' => 'nullable|string|max:20',
            'map_link' => 'nullable|url|max:500',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'phone' => 'required|string|max:50',
            'email' => 'nullable|email',
            'website' => 'nullable|string',
            'logo' => 'nullable|string',
            'cover_image' => 'nullable|string',
            'gallery_images' => 'nullable|array',
            'gallery_files' => 'nullable|array',
            'gallery_files.*' => 'image|max:5120',
            'price_range' => 'nullable|in:$,$$,$$$,$$$$',
            'opening_hours' => 'nullable|string',
        ]);

        $galleryImages = $request->input('gallery_images', []);
        
        if ($request->hasFile('gallery_files')) {
            foreach ($request->file('gallery_files') as $file) {
                // Store in the database so uploads persist on serverless environments
                $galleryImages[] = \App\Support\DbStorage::putUploadedFile($file, 'businesses/gallery', 'biz');
            }
        }
        $validated['gallery_images'] = $galleryImages;

        $validated['owner_id'] = $user->id;
        $validated['slug'] = Str::slug($validated['name']) . '-' . Str::random(4);
        $validated['verification_status'] = $user->isAdmin() ? 'approved' : 'pending';
        $validated['status'] = 'active';

        $business = Business::create($validated);

        // Notify admins about new business registration
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'title' => 'New Business Awaiting Approval',
                'message' => "{$business->name} was registered by {$user->name} and is awaiting review.",
                'type' => 'approval',
                'link' => '/admin/businesses',
            ]);
        }

        return response()->json([
            'message' => 'Business submitted successfully. It is now awaiting admin approval.',
            'business' => $business,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $business = Business::findOrFail($id);
        $user = $request->user();

        if ($business->owner_id !== $user->id && !$user->isAdmin()) {
            abort(403, 'Unauthorized to edit this business.');
        }

        $validated = $request->validate([
            'category_id' => 'sometimes|required|exists:categories,id',
            'name' => 'sometimes|required|string|max:255',
            'khmer_name' => 'nullable|string|max:255',
            'description' => 'sometimes|required|string',
            'short_description' => 'nullable|string',
            'address' => 'sometimes|required|string|max:255',
            'location_code' => 'nullable|string|max:20',
            'map_link' => 'nullable|url|max:500',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'phone' => 'sometimes|required|string|max:50',
            'email' => 'nullable|email',
            'website' => 'nullable|string',
            'logo' => 'nullable|string',
            'cover_image' => 'nullable|string',
            'gallery_images' => 'nullable|array',
            'price_range' => 'nullable|in:$,$$,$$$,$$$$',
            'opening_hours' => 'sometimes|string',
            'status' => 'sometimes|in:active,inactive',
            'gallery_files' => 'nullable|array',
            'gallery_files.*' => 'image|max:5120',
        ]);

        $galleryImages = $request->input('gallery_images', []);
        
        if ($request->hasFile('gallery_files')) {
            foreach ($request->file('gallery_files') as $file) {
                // Store in the database so uploads persist on serverless environments
                $galleryImages[] = \App\Support\DbStorage::putUploadedFile($file, 'businesses/gallery', 'biz');
            }
        }
        
        if (isset($validated['gallery_images']) || $request->hasFile('gallery_files') || $request->has('gallery_images')) {
            $validated['gallery_images'] = $galleryImages;
        }

        $business->update($validated);

        return response()->json([
            'message' => 'Business updated successfully',
            'business' => $business,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $business = Business::findOrFail($id);
        $user = $request->user();

        if ($business->owner_id !== $user->id && !$user->isAdmin()) {
            abort(403, 'Unauthorized to delete this business.');
        }

        // Delete related models manually if DB constraints aren't set to cascade.
        // For now, we'll use a hard delete on the business model. 
        // If there are foreign key constraints, we should ideally handle them here or in DB.
        $business->delete();

        return response()->json([
            'message' => 'Business deleted successfully',
        ]);
    }

    public function myBusinesses(Request $request)
    {
        $businesses = Business::where('owner_id', $request->user()->id)
            ->with(['category', 'services', 'promotions', 'activeSubscription'])
            ->withCount(['bookings', 'reviews'])
            ->get();

        return response()->json($businesses);
    }

    public function resolveMapLink(Request $request)
    {
        $url = $request->query('url');
        if (!$url) {
            return response()->json(['error' => 'URL required'], 400);
        }

        try {
            $finalUrl = $url;
            $extractedName = null;

            // Follow redirects using HTTP client or get_headers
            try {
                $response = Http::withHeaders([
                    'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                ])->timeout(6)->get($url);
                $finalUrl = (string) $response->effectiveUri() ?: $url;
            } catch (\Exception $e) {
                $headers = @get_headers($url, 1);
                if ($headers) {
                    $location = isset($headers['Location']) ? $headers['Location'] : (isset($headers['location']) ? $headers['location'] : '');
                    $finalUrl = is_array($location) ? end($location) : ($location ?: $url);
                }
            }

            // 1. Extract place name from URL path: /place/Name/@... or /search/Name/
            if (preg_match('/\/place\/([^\/@?]+)/', $finalUrl, $nameMatch)) {
                $raw = urldecode(str_replace('+', ' ', $nameMatch[1]));
                $extractedName = trim(preg_replace('/[^\p{L}\p{N}\s\-,.\'()]/u', '', $raw));
            } elseif (preg_match('/\/search\/([^\/@?]+)/', $finalUrl, $nameMatch)) {
                $raw = urldecode(str_replace('+', ' ', $nameMatch[1]));
                $extractedName = trim(preg_replace('/[^\p{L}\p{N}\s\-,.\'()]/u', '', $raw));
            } elseif (preg_match('/[?&]q=([^&@]+)/', $finalUrl, $nameMatch)) {
                $decoded = trim(urldecode(str_replace('+', ' ', $nameMatch[1])));
                if (!preg_match('/^-?\d+\.\d+,-?\d+\.\d+$/', $decoded)) {
                    $extractedName = $decoded;
                }
            }

            $lat = null;
            $lng = null;

            // Extract exact pin coordinates if present: !3d13.3448226!4d103.9199706
            if (preg_match('/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/', $finalUrl, $matches)) {
                $lat = $matches[1];
                $lng = $matches[2];
            } elseif (preg_match('/@(-?\d+\.\d+),(-?\d+\.\d+)/', $finalUrl, $matches)) {
                $lat = $matches[1];
                $lng = $matches[2];
            } elseif (preg_match('/(?:q|query)=(-?\d+\.\d+),(-?\d+\.\d+)/', $finalUrl, $matches)) {
                $lat = $matches[1];
                $lng = $matches[2];
            } elseif (preg_match('/ll=(-?\d+\.\d+),(-?\d+\.\d+)/', $finalUrl, $matches)) {
                $lat = $matches[1];
                $lng = $matches[2];
            }

            if (!$lat || !$lng) {
                return response()->json(['error' => 'Coordinates not found in URL'], 404);
            }

            // Reverse geocode to get actual details (Address, Suburb, Province, etc.)
            $geoInfo = $this->fetchReverseGeocodeData($lat, $lng);

            $resolvedName = $extractedName ?: ($geoInfo['name'] ?? '');

            return response()->json([
                'latitude' => (string) $lat,
                'longitude' => (string) $lng,
                'name' => $resolvedName,
                'khmer_name' => $geoInfo['khmer_name'] ?? '',
                'address' => $geoInfo['address'] ?? ($resolvedName ? "{$resolvedName}, Siem Reap" : 'Siem Reap, Cambodia'),
                'city' => $geoInfo['city'] ?? 'Siem Reap',
                'description_hint' => $geoInfo['description_hint'] ?? '',
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function reverseGeocode(Request $request)
    {
        $lat = $request->query('lat');
        $lng = $request->query('lng');

        if (!$lat || !$lng) {
            return response()->json(['error' => 'Latitude and Longitude required'], 400);
        }

        $geoInfo = $this->fetchReverseGeocodeData($lat, $lng);

        return response()->json([
            'latitude' => (string) $lat,
            'longitude' => (string) $lng,
            'name' => $geoInfo['name'] ?? '',
            'khmer_name' => $geoInfo['khmer_name'] ?? '',
            'address' => $geoInfo['address'] ?? 'Siem Reap, Cambodia',
            'city' => $geoInfo['city'] ?? 'Siem Reap',
            'description_hint' => $geoInfo['description_hint'] ?? '',
        ]);
    }

    private function fetchReverseGeocodeData($lat, $lng): array
    {
        try {
            $url = "https://nominatim.openstreetmap.org/reverse?format=json&lat={$lat}&lon={$lng}&addressdetails=1&accept-language=en,km";
            $res = Http::withHeaders([
                'User-Agent' => 'SRTesChor-TourismPlatform/1.0'
            ])->timeout(4)->get($url);

            if ($res->successful()) {
                $data = $res->json();
                $displayName = $data['display_name'] ?? '';
                $addressParts = $data['address'] ?? [];
                
                $road = $addressParts['road'] ?? $addressParts['pedestrian'] ?? '';
                $suburb = $addressParts['suburb'] ?? $addressParts['neighbourhood'] ?? $addressParts['village'] ?? '';
                $city = $addressParts['city'] ?? $addressParts['town'] ?? $addressParts['county'] ?? 'Siem Reap';
                $state = $addressParts['state'] ?? 'Siem Reap Province';

                $formattedAddress = collect([$road, $suburb, $city, $state])->filter()->join(', ');
                if (empty($formattedAddress)) {
                    $formattedAddress = $displayName ?: 'Siem Reap, Cambodia';
                }

                $placeName = $data['name'] ?? ($addressParts['tourism'] ?? $addressParts['historic'] ?? $addressParts['amenity'] ?? '');
                $type = $data['type'] ?? '';

                $hint = "Located in {$city}, {$state}. A popular and well-known spot in Siem Reap, Cambodia.";

                return [
                    'name' => $placeName,
                    'khmer_name' => $addressParts['name:km'] ?? '',
                    'address' => $formattedAddress,
                    'city' => $city,
                    'type' => $type,
                    'description_hint' => $hint,
                ];
            }
        } catch (\Exception $e) {
            // Silence network error
        }

        return [
            'name' => '',
            'khmer_name' => '',
            'address' => 'Siem Reap, Cambodia',
            'city' => 'Siem Reap',
            'description_hint' => 'Siem Reap destination',
        ];
    }
}
