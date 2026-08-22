<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Destination;
use App\Models\DestinationImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class DestinationController extends Controller
{
    public function index(Request $request)
    {
        $query = Destination::query()
            ->where('status', 'published')
            ->with(['category', 'images']);

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

        // Price Filter (e.g. free, paid, max_price)
        if ($request->filled('price_type')) {
            if ($request->input('price_type') === 'free') {
                $query->where('entrance_fee', 0);
            } elseif ($request->input('price_type') === 'paid') {
                $query->where('entrance_fee', '>', 0);
            }
        }
        if ($request->filled('max_price')) {
            $query->where('entrance_fee', '<=', (float) $request->input('max_price'));
        }

        // Rating Filter
        if ($request->filled('min_rating')) {
            $query->where('rating', '>=', (float) $request->input('min_rating'));
        }

        // Flags (is_featured, is_hidden_gem)
        if ($request->boolean('featured')) {
            $query->where('is_featured', true);
        }
        if ($request->boolean('hidden_gems')) {
            $query->where('is_hidden_gem', true);
        }

        // Sorting
        $sortBy = $request->input('sort', 'popular');
        switch ($sortBy) {
            case 'rating':
                $query->orderBy('rating', 'desc');
                break;
            case 'price_low':
                $query->orderBy('entrance_fee', 'asc');
                break;
            case 'price_high':
                $query->orderBy('entrance_fee', 'desc');
                break;
            case 'newest':
                $query->latest();
                break;
            case 'popular':
            default:
                $query->orderBy('views_count', 'desc')->orderBy('rating', 'desc');
                break;
        }

        $perPage = (int) $request->input('per_page', 18);
        $cacheKey = 'destinations_list_' . md5(json_encode($request->all()));

        $destinations = Cache::remember($cacheKey, 120, function () use ($query, $perPage) {
            return $query->paginate($perPage);
        });

        return response()->json($destinations);
    }

    public function show($slug)
    {
        $destination = Destination::where('slug', $slug)
            ->with([
                'category',
                'images',
                'reviews' => function ($q) {
                    $q->where('status', 'approved')->with('user')->latest();
                },
            ])
            ->firstOrFail();

        // Increment view count
        $destination->increment('views_count');

        // Nearby and similar destinations
        $similarDestinations = Destination::where('category_id', $destination->category_id)
            ->where('id', '!=', $destination->id)
            ->where('status', 'published')
            ->with(['images', 'category'])
            ->take(4)
            ->get();

        return response()->json([
            'destination' => $destination,
            'similar' => $similarDestinations,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'khmer_name' => 'nullable|string|max:255',
            'description' => 'required|string',
            'short_description' => 'nullable|string',
            'address' => 'required|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'entrance_fee' => 'nullable|numeric|min:0',
            'fee_notes' => 'nullable|string',
            'opening_time' => 'nullable',
            'closing_time' => 'nullable',
            'best_time' => 'nullable|string',
            'phone' => 'nullable|string',
            'website' => 'nullable|string',
            'facilities' => 'nullable|array',
            'is_featured' => 'boolean',
            'is_hidden_gem' => 'boolean',
            'status' => 'required|in:draft,pending,published,rejected',
            'images' => 'nullable|array',
        ]);

        $validated['slug'] = Str::slug($validated['name']) . '-' . Str::random(4);
        $validated['created_by'] = $request->user()->id;

        $images = $validated['images'] ?? [];
        unset($validated['images']);

        $destination = Destination::create($validated);

        foreach ($images as $index => $img) {
            DestinationImage::create([
                'destination_id' => $destination->id,
                'image' => is_array($img) ? $img['image'] : $img,
                'alt_text' => $destination->name,
                'is_primary' => $index === 0,
                'display_order' => $index,
            ]);
        }

        return response()->json($destination->load('images'), 201);
    }

    public function update(Request $request, $id)
    {
        $this->authorizeAdmin($request);

        $destination = Destination::findOrFail($id);

        $validated = $request->validate([
            'category_id' => 'sometimes|required|exists:categories,id',
            'name' => 'sometimes|required|string|max:255',
            'khmer_name' => 'nullable|string|max:255',
            'description' => 'sometimes|required|string',
            'short_description' => 'nullable|string',
            'address' => 'sometimes|required|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'entrance_fee' => 'nullable|numeric|min:0',
            'fee_notes' => 'nullable|string',
            'opening_time' => 'nullable',
            'closing_time' => 'nullable',
            'best_time' => 'nullable|string',
            'phone' => 'nullable|string',
            'website' => 'nullable|string',
            'facilities' => 'nullable|array',
            'is_featured' => 'boolean',
            'is_hidden_gem' => 'boolean',
            'status' => 'sometimes|required|in:draft,pending,published,rejected',
            'images' => 'nullable|array',
        ]);

        $images = $validated['images'] ?? null;
        unset($validated['images']);

        $destination->update($validated);

        if ($images !== null) {
            $destination->images()->delete();
            foreach ($images as $index => $img) {
                DestinationImage::create([
                    'destination_id' => $destination->id,
                    'image' => is_array($img) ? $img['image'] : $img,
                    'alt_text' => $destination->name,
                    'is_primary' => $index === 0,
                    'display_order' => $index,
                ]);
            }
        }

        return response()->json($destination->load('images'));
    }

    public function destroy(Request $request, $id)
    {
        $this->authorizeAdmin($request);

        $destination = Destination::findOrFail($id);
        $destination->delete();

        return response()->json(['message' => 'Destination deleted successfully']);
    }

    private function authorizeAdmin(Request $request)
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            abort(403, 'Unauthorized access');
        }
    }
}
