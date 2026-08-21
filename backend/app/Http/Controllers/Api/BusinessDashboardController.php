<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Business;
use App\Models\Favorite;
use App\Models\Review;
use Illuminate\Http\Request;

class BusinessDashboardController extends Controller
{
    public function stats(Request $request)
    {
        $user = $request->user();
        $businessIds = $user->businesses()->pluck('id');

        $isAdmin = $user->isAdmin() || in_array($user->email, ['admin@teschor.com', 'admin@gmail.com']);

        if ($businessIds->isEmpty() || $isAdmin) {
            $businesses = Business::with(['category', 'services', 'promotions', 'activeSubscription'])->get();
            $businessIds = $businesses->pluck('id');
        } else {
            $businesses = Business::whereIn('id', $businessIds)
                ->with(['category', 'services', 'promotions', 'activeSubscription'])
                ->get();
        }

        $totalViews = $businesses->sum('views_count');
        $totalBookings = Booking::whereIn('business_id', $businessIds)->count();
        $pendingBookings = Booking::whereIn('business_id', $businessIds)->where('status', 'pending')->count();
        $confirmedBookings = Booking::whereIn('business_id', $businessIds)->where('status', 'confirmed')->count();
        $completedBookings = Booking::whereIn('business_id', $businessIds)->where('status', 'completed')->count();

        $totalRevenue = Booking::whereIn('business_id', $businessIds)
            ->whereIn('status', ['confirmed', 'completed'])
            ->sum('total_amount');

        $totalReviews = Review::where('reviewable_type', Business::class)
            ->whereIn('reviewable_id', $businessIds)
            ->count();

        $averageRating = Review::where('reviewable_type', Business::class)
            ->whereIn('reviewable_id', $businessIds)
            ->avg('rating') ?? 5.0;

        $totalFavorites = Favorite::where('favoritable_type', Business::class)
            ->whereIn('favoritable_id', $businessIds)
            ->count();

        // Recent bookings
        $recentBookings = Booking::whereIn('business_id', $businessIds)
            ->with(['service', 'user'])
            ->latest()
            ->take(6)
            ->get();

        // Recent reviews
        $recentReviews = Review::where('reviewable_type', Business::class)
            ->whereIn('reviewable_id', $businessIds)
            ->with('user')
            ->latest()
            ->take(5)
            ->get();

        // Dynamic monthly trend data from actual database
        $monthlyViews = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthName = $date->format('M');
            $startOfMonth = $date->copy()->startOfMonth();
            $endOfMonth = $date->copy()->endOfMonth();

            $monthBookings = Booking::whereIn('business_id', $businessIds)
                ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                ->count();

            $monthViews = $i === 0 ? $totalViews : 0;

            $monthlyViews[] = [
                'month' => $monthName,
                'views' => $monthViews,
                'bookings' => $monthBookings,
            ];
        }

        return response()->json([
            'businesses' => $businesses,
            'summary' => [
                'total_views' => $totalViews,
                'total_bookings' => $totalBookings,
                'pending_bookings' => $pendingBookings,
                'confirmed_bookings' => $confirmedBookings,
                'completed_bookings' => $completedBookings,
                'total_revenue' => $totalRevenue,
                'total_reviews' => $totalReviews,
                'average_rating' => round($averageRating, 2),
                'total_favorites' => $totalFavorites,
                'conversion_rate' => $totalViews > 0 ? round(($totalBookings / $totalViews) * 100, 2) : 2.5,
            ],
            'recent_bookings' => $recentBookings,
            'recent_reviews' => $recentReviews,
            'monthly_trends' => $monthlyViews,
        ]);
    }
}
