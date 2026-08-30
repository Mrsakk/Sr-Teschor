<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AdvertisementController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\BusinessController;
use App\Http\Controllers\Api\BusinessDashboardController;
use App\Http\Controllers\Api\BusinessServiceController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\DestinationController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PromotionController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\TripPlanController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Bakong KHQR Payment & Digital Invoice (Public generator & verification check)
Route::post('/payments/khqr/generate', [PaymentController::class, 'generateKhqr']);
Route::get('/invoices/{reference}', [PaymentController::class, 'getInvoice']);

Route::get('/storage/{path}', function ($path) {
    // 1. Serve from database (persistent on serverless environments)
    if ($stored = \App\Models\StoredFile::where('path', $path)->first()) {
        return response(base64_decode($stored->data))
            ->header('Content-Type', $stored->mime)
            ->header('Cache-Control', 'public, max-age=31536000, immutable')
            ->header('Access-Control-Allow-Origin', '*');
    }

    // 2. Fall back to local public/storage disk
    $filePath = public_path('storage/' . $path);
    if (!file_exists($filePath)) {
        $filePath = storage_path('app/public/' . $path);
    }
    if (file_exists($filePath) && !is_dir($filePath)) {
        $mime = mime_content_type($filePath) ?: 'image/jpeg';
        return response()->file($filePath, [
            'Content-Type' => $mime,
            'Cache-Control' => 'public, max-age=31536000, immutable',
            'Access-Control-Allow-Origin' => '*',
        ]);
    }
    return redirect('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80');
})->where('path', '.*');

// Authentication
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/auth/google', [AuthController::class, 'googleLogin']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Global Search & Map API
Route::get('/search', [SearchController::class, 'suggestions']);
Route::get('/map/locations', [SearchController::class, 'mapLocations']);

// AI Travel Concierge & Planner Endpoints
Route::post('/ai/chat', [\App\Http\Controllers\Api\AIController::class, 'chat']);
Route::post('/ai/generate-itinerary', [\App\Http\Controllers\Api\AIController::class, 'generateItinerary']);
Route::get('/ai/recommendations', [\App\Http\Controllers\Api\AIController::class, 'recommendations']);

// Public System Settings
Route::get('/settings', function () {
    return response()->json(\App\Models\Setting::pluck('value', 'key'));
});

// Categories
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{slug}', [CategoryController::class, 'show']);

// Destinations
Route::get('/destinations', [DestinationController::class, 'index']);
Route::get('/destinations/resolve-map-link', [BusinessController::class, 'resolveMapLink']);
Route::get('/destinations/{slug}', [DestinationController::class, 'show']);

// Businesses
Route::get('/businesses', [BusinessController::class, 'index']);
Route::get('/businesses/resolve-map-link', [BusinessController::class, 'resolveMapLink']);
Route::get('/businesses/reverse-geocode', [BusinessController::class, 'reverseGeocode']);
Route::get('/businesses/{slug}', [BusinessController::class, 'show']);

// Promotions
Route::get('/promotions', [PromotionController::class, 'index']);

// Advertisements (Public Banners & Click Tracking)
Route::get('/advertisements', [AdvertisementController::class, 'index']);
Route::get('/promoted-banners', [AdvertisementController::class, 'index']);
Route::get('/sponsored-highlights', [AdvertisementController::class, 'index']);
Route::get('/featured-placements', [AdvertisementController::class, 'index']);
Route::post('/featured-placements/{id}/click', [AdvertisementController::class, 'trackClick']);
Route::post('/promoted-banners/{id}/click', [AdvertisementController::class, 'trackClick']);

// Reviews
Route::get('/reviews', [ReviewController::class, 'index']);

// Subscriptions Plans (Public)
Route::get('/subscriptions/plans', [SubscriptionController::class, 'plans']);

// Packages (Travel Packages)
Route::get('/packages', [\App\Http\Controllers\Api\TravelPackageController::class, 'index']);
Route::get('/packages/{id}', [\App\Http\Controllers\Api\TravelPackageController::class, 'show']);

// Booking Pricing Quote Calculation (Public / Instant Quote)
Route::post('/bookings/calculate', [BookingController::class, 'calculateQuote']);

// Single Service lookup
Route::get('/services/{id}', function ($id) {
    $service = \App\Models\BusinessService::with('business')->findOrFail($id);
    return response()->json($service);
});

/*
|--------------------------------------------------------------------------
| Protected Routes (Authenticated via Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    // Current User Profile & Customer Dashboard
    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/user/dashboard', [AuthController::class, 'dashboardSummary']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    Route::put('/user/settings', [AuthController::class, 'updateSettings']);
    Route::put('/user/password', [AuthController::class, 'updatePassword']);

    // Favorites
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites/toggle', [FavoriteController::class, 'toggle']);

    // Reviews (Post review, reply, my reviews, update, delete)
    Route::get('/my-reviews', [ReviewController::class, 'myReviews']);
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::put('/reviews/{id}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);
    Route::post('/reviews/{id}/reply', [ReviewController::class, 'reply']);

    // Bookings & Checkout Engine
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::post('/bookings/checkout', [BookingController::class, 'checkout']);  // MUST be before {id}
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
    Route::get('/bookings/{id}/receipt', [BookingController::class, 'receipt']);
    Route::put('/bookings/{id}/status', [BookingController::class, 'updateStatus']);

    // Bakong KHQR Verification
    Route::post('/payments/khqr/verify', [PaymentController::class, 'verifyKhqr']);

    // Customer Transactions
    Route::get('/my-transactions', function (Request $request) {
        $txs = \App\Models\Transaction::with(['booking', 'business'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(15);
        return response()->json($txs);
    });

    // Trip Planner
    Route::get('/trips', [TripPlanController::class, 'index']);
    Route::post('/trips', [TripPlanController::class, 'store']);
    Route::get('/trips/{id}', [TripPlanController::class, 'show']);
    Route::put('/trips/{id}', [TripPlanController::class, 'update']);
    Route::delete('/trips/{id}', [TripPlanController::class, 'destroy']);
    Route::post('/trips/{id}/items', [TripPlanController::class, 'addItem']);
    Route::delete('/trips/{id}/items/{itemId}', [TripPlanController::class, 'removeItem']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    // Business Owner Features
    Route::get('/my-businesses', [BusinessController::class, 'myBusinesses']);
    Route::get('/businesses/my-businesses', [BusinessController::class, 'myBusinesses']);
    Route::post('/businesses', [BusinessController::class, 'store']);
    Route::match(['put', 'post'], '/businesses/{id}', [BusinessController::class, 'update']);
    Route::delete('/businesses/{id}', [BusinessController::class, 'destroy']);
    Route::get('/business/dashboard', [BusinessDashboardController::class, 'stats']);

    // Business Services
    Route::post('/services', [BusinessServiceController::class, 'store']);
    Route::put('/services/{id}', [BusinessServiceController::class, 'update']);
    Route::delete('/services/{id}', [BusinessServiceController::class, 'destroy']);

    // Promotions management
    Route::post('/promotions', [PromotionController::class, 'store']);
    Route::put('/promotions/{id}', [PromotionController::class, 'update']);
    Route::delete('/promotions/{id}', [PromotionController::class, 'destroy']);

    // Subscriptions
    Route::post('/subscriptions/upgrade', [SubscriptionController::class, 'upgrade']);

    // Self-Service Advertisements & Marketing Engine
    Route::get('/my-advertisements', [AdvertisementController::class, 'myAdvertisements']);
    Route::post('/advertisements/purchase', [AdvertisementController::class, 'purchase']);
    Route::post('/advertisements/{id}/renew', [AdvertisementController::class, 'renew']);
    Route::post('/advertisements/check-expiry', [AdvertisementController::class, 'checkAndExpireAds']);

    // Complete Admin Endpoints Group
    Route::prefix('admin')->group(function () {
        // 1. Dashboard
        Route::get('/dashboard', [AdminController::class, 'dashboard']);

        // 2. Users Management
        Route::get('/users', [AdminController::class, 'users']);
        Route::post('/users', [AdminController::class, 'createUser']);
        Route::get('/users/{id}', [AdminController::class, 'getUserDetails']);
        Route::put('/users/{id}', [AdminController::class, 'updateUser']);
        Route::put('/users/{id}/status', [AdminController::class, 'toggleUserStatus']);
        Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);

        // 3. Businesses Management & Verification
        Route::get('/businesses', [AdminController::class, 'businesses']);
        Route::get('/businesses/pending', [AdminController::class, 'getPendingBusinesses']);
        Route::put('/businesses/{id}/approve', [AdminController::class, 'approveBusiness']);
        Route::put('/businesses/{id}/reject', [AdminController::class, 'rejectBusiness']);
        Route::put('/businesses/{id}/suspend', [AdminController::class, 'suspendBusiness']);
        Route::delete('/businesses/{id}', [AdminController::class, 'deleteBusiness']);

        // 4. Destinations Management
        Route::get('/destinations', [AdminController::class, 'destinations']);
        Route::post('/destinations', [AdminController::class, 'createDestination']);
        Route::put('/destinations/{id}', [AdminController::class, 'updateDestination']);
        Route::delete('/destinations/{id}', [AdminController::class, 'deleteDestination']);

        // 5. Categories Management
        Route::get('/categories', [AdminController::class, 'categories']);
        Route::post('/categories', [AdminController::class, 'createCategory']);
        Route::put('/categories/{id}', [AdminController::class, 'updateCategory']);
        Route::delete('/categories/{id}', [AdminController::class, 'deleteCategory']);

        // 6. Reviews Moderation
        Route::get('/reviews', [AdminController::class, 'reviews']);
        Route::put('/reviews/{id}/approve', [AdminController::class, 'approveReview']);
        Route::put('/reviews/{id}/hide', [AdminController::class, 'hideReview']);
        Route::delete('/reviews/{id}', [AdminController::class, 'deleteReview']);

        // 7. Bookings Management
        Route::get('/bookings', [AdminController::class, 'bookings']);
        Route::get('/bookings/{id}', [AdminController::class, 'getBookingDetails']);
        Route::put('/bookings/{id}/status', [AdminController::class, 'updateBookingStatus']);

        // 8. Promotions Management
        Route::get('/promotions', [AdminController::class, 'promotions']);
        Route::put('/promotions/{id}/toggle', [AdminController::class, 'togglePromotion']);
        Route::delete('/promotions/{id}', [AdminController::class, 'deletePromotion']);

        // 9. Advertisements Management
        Route::get('/advertisements', [AdminController::class, 'advertisements']);
        Route::post('/advertisements', [AdminController::class, 'createAdvertisement']);
        Route::delete('/advertisements/{id}', [AdminController::class, 'deleteAdvertisement']);

        // 9.1 Travel Packages Management
        Route::get('/packages', [AdminController::class, 'packages']);
        Route::post('/packages', [AdminController::class, 'createPackage']);
        Route::put('/packages/{id}', [AdminController::class, 'updatePackage']);
        Route::delete('/packages/{id}', [AdminController::class, 'deletePackage']);
        Route::patch('/packages/{id}/toggle-status', [AdminController::class, 'togglePackageStatus']);

        // 10. Subscriptions Management
        Route::get('/subscriptions', [AdminController::class, 'subscriptions']);

        // 11. Revenue & Payments
        Route::get('/revenue', [AdminController::class, 'revenue']);
        Route::get('/payments', [AdminController::class, 'payments']);

        // 12. Analytics
        Route::get('/analytics', [AdminController::class, 'analytics']);

        // 13. Reports Management
        Route::get('/reports', [AdminController::class, 'reports']);
        Route::put('/reports/{id}/status', [AdminController::class, 'updateReportStatus']);

        // 14. Notifications Broadcast
        Route::get('/notifications', [AdminController::class, 'notifications']);
        Route::post('/notifications/broadcast', [AdminController::class, 'broadcastNotification']);

        // 15. Media Asset Library
        Route::get('/media', [AdminController::class, 'media']);
        Route::post('/media', [AdminController::class, 'createMedia']);
        Route::delete('/media/{id}', [AdminController::class, 'deleteMedia']);

        // 16. System Settings
        Route::get('/settings', [AdminController::class, 'settings']);
        Route::put('/settings', [AdminController::class, 'updateSettings']);

        // 17. Admin Management & Permissions
        Route::get('/admins', [AdminController::class, 'admins']);
        Route::post('/admins', [AdminController::class, 'createAdmin']);

        // 18. Audit Activity Logs
        Route::get('/activity-logs', [AdminController::class, 'activityLogs']);
    });
});
