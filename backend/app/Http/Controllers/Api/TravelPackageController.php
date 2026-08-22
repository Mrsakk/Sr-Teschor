<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TravelPackage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class TravelPackageController extends Controller
{
    public function index()
    {
        $packages = Cache::remember('travel_packages_active', 180, function () {
            return TravelPackage::where('is_active', true)->orderBy('id')->get();
        });
        return response()->json($packages);
    }

    public function show($id)
    {
        $package = Cache::remember('travel_package_' . $id, 180, function () use ($id) {
            return TravelPackage::findOrFail($id);
        });
        return response()->json($package);
    }
}
