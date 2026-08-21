<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TravelPackage;
use Illuminate\Http\Request;

class TravelPackageController extends Controller
{
    public function index()
    {
        $packages = TravelPackage::where('is_active', true)->orderBy('id')->get();
        return response()->json($packages);
    }

    public function show($id)
    {
        $package = TravelPackage::findOrFail($id);
        return response()->json($package);
    }
}
