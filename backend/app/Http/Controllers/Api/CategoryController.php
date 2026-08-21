<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->query('type', 'all');
        $cacheKey = 'categories_list_' . $type;

        $categories = Cache::remember($cacheKey, 300, function () use ($type) {
            $query = Category::query()->where('status', 'active');

            if ($type && $type !== 'all') {
                $query->where(function ($q) use ($type) {
                    $q->where('type', $type)->orWhere('type', 'all');
                });
            }

            return $query->withCount([
                'destinations' => function ($q) {
                    $q->where('status', 'published');
                },
                'businesses' => function ($q) {
                    $q->where('status', 'active')->where('verification_status', 'approved');
                }
            ])->orderBy('display_order')->get()->toArray();
        });

        return response()->json($categories);
    }

    public function show($slug)
    {
        $category = Category::where('slug', $slug)
            ->withCount(['destinations', 'businesses'])
            ->firstOrFail();

        $destinations = $category->destinations()
            ->where('status', 'published')
            ->with(['images', 'category'])
            ->latest()
            ->paginate(12);

        $businesses = $category->businesses()
            ->where('status', 'active')
            ->where('verification_status', 'approved')
            ->with(['category', 'promotions' => function ($q) {
                $q->where('status', 'active');
            }])
            ->latest()
            ->paginate(12);

        return response()->json([
            'category' => $category,
            'destinations' => $destinations,
            'businesses' => $businesses,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizeAdmin($request);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'icon' => 'nullable|string',
            'type' => 'required|in:destination,business,all',
            'display_order' => 'nullable|integer',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        $category = Category::create($validated);
        Cache::forget('categories_list_all');
        Cache::forget('categories_list_destination');
        Cache::forget('categories_list_business');

        return response()->json($category, 201);
    }

    public function update(Request $request, $id)
    {
        $this->authorizeAdmin($request);

        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'icon' => 'nullable|string',
            'type' => 'sometimes|required|in:destination,business,all',
            'status' => 'sometimes|in:active,inactive',
            'display_order' => 'nullable|integer',
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category->update($validated);
        Cache::forget('categories_list_all');
        Cache::forget('categories_list_destination');
        Cache::forget('categories_list_business');

        return response()->json($category);
    }

    public function destroy(Request $request, $id)
    {
        $this->authorizeAdmin($request);

        $category = Category::findOrFail($id);
        $category->delete();
        Cache::forget('categories_list_all');
        Cache::forget('categories_list_destination');
        Cache::forget('categories_list_business');

        return response()->json(['message' => 'Category deleted successfully']);
    }

    private function authorizeAdmin(Request $request)
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            abort(403, 'Unauthorized access');
        }
    }
}
