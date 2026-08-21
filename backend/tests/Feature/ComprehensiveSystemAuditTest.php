<?php

namespace Tests\Feature;

use App\Models\Advertisement;
use App\Models\Booking;
use App\Models\Business;
use App\Models\BusinessService;
use App\Models\Category;
use App\Models\Destination;
use App\Models\Favorite;
use App\Models\Promotion;
use App\Models\Review;
use App\Models\Subscription;
use App\Models\TravelPackage;
use App\Models\TripItem;
use App\Models\TripPlan;
use App\Models\User;
use App\Services\FinancialCalculationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ComprehensiveSystemAuditTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected User $businessUser;
    protected User $customerUser;
    protected Business $testBusiness;
    protected BusinessService $testService;
    protected Destination $testDestination;
    protected TravelPackage $testPackage;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Ensure Role Users Exist
        $this->adminUser = User::firstOrCreate(
            ['email' => 'admin_audit@sr-teschor.gov.kh'],
            [
                'name' => 'Super Admin Audit',
                'password' => bcrypt('Password123!'),
                'role' => 'admin',
                'phone' => '+85512000001'
            ]
        );
        $this->adminUser->update(['role' => 'admin']);

        $this->businessUser = User::firstOrCreate(
            ['email' => 'merchant_audit@sr-teschor.gov.kh'],
            [
                'name' => 'Merchant Owner Audit',
                'password' => bcrypt('Password123!'),
                'role' => 'business',
                'phone' => '+85512000002'
            ]
        );
        $this->businessUser->update(['role' => 'business']);

        $this->customerUser = User::firstOrCreate(
            ['email' => 'tourist_audit@sr-teschor.gov.kh'],
            [
                'name' => 'Alice Tourist Audit',
                'password' => bcrypt('Password123!'),
                'role' => 'customer',
                'phone' => '+85512000003'
            ]
        );
        $this->customerUser->update(['role' => 'customer']);

        // 2. Setup Category & Business
        $category = Category::firstOrCreate(
            ['slug' => 'heritage-tours-audit'],
            ['name' => 'Heritage Tours Audit', 'icon' => 'Compass', 'is_active' => true]
        );

        $this->testBusiness = Business::firstOrCreate(
            ['slug' => 'angkor-heritage-expeditions-audit'],
            [
                'name' => 'Angkor Heritage Expeditions Audit',
                'category_id' => $category->id,
                'owner_id' => $this->businessUser->id,
                'description' => 'Premier private guided temple tours in Siem Reap.',
                'address' => 'Wat Bo Road, Siem Reap',
                'phone' => '+855 63 963 000',
                'email' => 'info@heritageexpeditions.test',
                'status' => 'approved',
                'rating' => 4.95,
                'latitude' => 13.3610,
                'longitude' => 103.8590,
                'location_code' => 'LOC-AUDIT-001',
                'is_verified' => true,
            ]
        );

        $this->testService = BusinessService::firstOrCreate(
            ['name' => 'Sunrise VIP Angkor Tour Audit', 'business_id' => $this->testBusiness->id],
            [
                'description' => 'Full day guided tour with private transportation.',
                'price' => 60.00,
                'type' => 'tour',
                'duration' => '8 Hours',
                'is_available' => true,
            ]
        );

        $this->testDestination = Destination::firstOrCreate(
            ['slug' => 'angkor-wat-audit'],
            [
                'name' => 'Angkor Wat Main Complex Audit',
                'category_id' => $category->id,
                'description' => 'The crown jewel of Khmer architecture and 7th wonder.',
                'address' => 'Angkor Archaeological Park, Siem Reap',
                'latitude' => 13.4125,
                'longitude' => 103.8670,
                'ticket_price' => 37.00,
                'rating' => 4.98,
                'is_active' => true,
            ]
        );

        $this->testPackage = TravelPackage::firstOrCreate(
            ['name' => 'Kulen Mountain & Floating Village Audit Experience'],
            [
                'description' => 'Full day combined waterfalls and lake cruise.',
                'selling_price' => 75.00,
                'provider_cost' => 60.00,
                'platform_profit' => 15.00,
                'duration' => 'Full Day (8h)',
                'rating' => 4.90,
                'is_active' => true,
                'includes' => ['Park Entry', 'Boat Ticket', 'Lunch', 'Private Van'],
            ]
        );
    }

    // =========================================================================
    // 1. PUBLIC & GUEST ACCESS TESTS (UNAUTHENTICATED)
    // =========================================================================

    public function test_guest_can_access_all_public_marketplace_endpoints(): void
    {
        $endpoints = [
            '/api/destinations',
            "/api/destinations/{$this->testDestination->slug}",
            '/api/businesses',
            "/api/businesses/{$this->testBusiness->slug}",
            '/api/categories',
            '/api/packages',
            "/api/packages/{$this->testPackage->id}",
            '/api/advertisements?placement=hero_banner',
            '/api/map/locations',
            '/api/search?q=Angkor',
        ];

        foreach ($endpoints as $endpoint) {
            $response = $this->getJson($endpoint);
            $response->assertStatus(200, "Failed public access on {$endpoint}");
        }
    }

    public function test_guest_cannot_access_protected_routes_without_auth(): void
    {
        $protectedEndpoints = [
            ['GET', '/api/user'],
            ['GET', '/api/trips'],
            ['POST', '/api/trips'],
            ['GET', '/api/favorites'],
            ['POST', '/api/bookings/checkout'],
            ['GET', '/api/admin/dashboard'],
            ['GET', '/api/admin/users'],
            ['GET', '/api/admin/packages'],
            ['GET', '/api/business/dashboard'],
        ];

        foreach ($protectedEndpoints as [$method, $endpoint]) {
            $response = $this->json($method, $endpoint);
            $this->assertContains($response->getStatusCode(), [401, 403], "Endpoint {$endpoint} should reject guest access.");
        }
    }

    // =========================================================================
    // 2. CUSTOMER / TOURIST ROLE PROCESSING TESTS
    // =========================================================================

    public function test_customer_can_manage_trip_planner_flow(): void
    {
        Sanctum::actingAs($this->customerUser);

        // 1. Create Trip Plan
        $createRes = $this->postJson('/api/trips', [
            'name' => 'Siem Reap 3-Day Wonder Audit',
            'start_date' => date('Y-m-d', strtotime('+7 days')),
            'end_date' => date('Y-m-d', strtotime('+10 days')),
            'notes' => 'Visiting sunrise at Angkor Wat and Kulen waterfalls.'
        ]);
        $createRes->assertStatus(201);
        $tripId = $createRes->json('id');
        $this->assertNotNull($tripId);

        // 2. Add Destination Item to Trip
        $addItemRes = $this->postJson("/api/trips/{$tripId}/items", [
            'item_type' => 'destination',
            'item_id' => $this->testDestination->id,
            'day_number' => 1,
            'time_slot' => '05:30 AM',
            'notes' => 'Catch sunrise at reflection pond'
        ]);
        $addItemRes->assertStatus(201);
        $itemId = $addItemRes->json('id');

        // 3. Remove Item from Trip
        $delItemRes = $this->deleteJson("/api/trips/{$tripId}/items/{$itemId}");
        $delItemRes->assertStatus(200);

        // 4. Delete Trip Plan
        $delTripRes = $this->deleteJson("/api/trips/{$tripId}");
        $delTripRes->assertStatus(200);
    }

    public function test_user_can_authenticate_and_register_via_google_oauth(): void
    {
        // 1. Google Register New User
        $googleNewEmail = 'google_traveler_' . uniqid() . '@gmail.com';
        $googleSub = '1098234908123498' . rand(1000, 9999);

        $googleRes = $this->postJson('/api/auth/google', [
            'email' => $googleNewEmail,
            'name' => 'Sophia Google Traveler',
            'picture' => 'https://lh3.googleusercontent.com/a/sample-photo',
            'google_id' => $googleSub,
            'role' => 'customer',
        ]);

        $googleRes->assertStatus(200);
        $this->assertNotEmpty($googleRes->json('token'));
        $this->assertEquals($googleNewEmail, $googleRes->json('user.email'));
        $this->assertEquals('customer', $googleRes->json('user.role'));

        // 2. Google Login Existing User
        $loginRes = $this->postJson('/api/auth/google', [
            'email' => $googleNewEmail,
            'google_id' => $googleSub,
        ]);
        $loginRes->assertStatus(200);
        $this->assertNotEmpty($loginRes->json('token'));
        $this->assertEquals($googleNewEmail, $loginRes->json('user.email'));
    }

    public function test_customer_can_toggle_favorites(): void
    {
        Sanctum::actingAs($this->customerUser);

        // Toggle Favorite for Destination
        $favRes = $this->postJson('/api/favorites/toggle', [
            'type' => 'destination',
            'id' => $this->testDestination->id,
        ]);
        $favRes->assertStatus(200);
        $this->assertTrue($favRes->json('favorited'));

        // Get Favorites list
        $listRes = $this->getJson('/api/favorites');
        $listRes->assertStatus(200);
        $this->assertCount(1, $listRes->json('destinations'));
    }

    public function test_customer_can_quote_and_checkout_service_and_package(): void
    {
        Sanctum::actingAs($this->customerUser);

        // 1. Quote Calculation for Business Service
        $quoteRes = $this->postJson('/api/bookings/calculate', [
            'service_id' => $this->testService->id,
            'guests' => 3,
            'promo_code' => 'SIEMREAP20',
            'is_package' => false,
        ]);
        $quoteRes->assertStatus(200);
        $this->assertEquals(180.00, $quoteRes->json('subtotal')); // 3 * 60
        $this->assertEquals(36.00, $quoteRes->json('discount_amount')); // 20% of 180
        $this->assertEquals(2.00, $quoteRes->json('service_fee'));
        $this->assertEquals(146.00, $quoteRes->json('total_amount')); // 180 - 36 + 2

        // 2. Checkout Booking with Bakong KHQR
        $checkoutRes = $this->postJson('/api/bookings/checkout', [
            'service_id' => $this->testService->id,
            'booking_date' => date('Y-m-d', strtotime('+5 days')),
            'booking_time' => '08:00 AM',
            'guests' => 3,
            'contact_name' => 'Alice Tourist',
            'contact_phone' => '+855 12 345 678',
            'contact_email' => 'alice@tourist.test',
            'pickup_location' => 'Heritage Suites Hotel Room 102',
            'special_requests' => 'English speaking driver please.',
            'promo_code' => 'SIEMREAP20',
            'payment_method' => 'khqr',
            'is_package' => false,
        ]);
        $checkoutRes->assertStatus(201);
        $this->assertEquals('confirmed', $checkoutRes->json('booking.status'));
        $this->assertEquals('paid', $checkoutRes->json('booking.payment_status'));
        $this->assertEquals(146.00, $checkoutRes->json('booking.total_amount'));

        // 3. Package Checkout
        $pkgCheckoutRes = $this->postJson('/api/bookings/checkout', [
            'service_id' => $this->testPackage->id,
            'booking_date' => date('Y-m-d', strtotime('+6 days')),
            'booking_time' => '07:30 AM',
            'guests' => 2,
            'contact_name' => 'Alice Tourist',
            'contact_phone' => '+855 12 345 678',
            'contact_email' => 'alice@tourist.test',
            'payment_method' => 'khqr',
            'is_package' => true,
        ]);
        $pkgCheckoutRes->assertStatus(201);
        $this->assertEquals('confirmed', $pkgCheckoutRes->json('booking.status'));
    }

    // =========================================================================
    // 3. BUSINESS / MERCHANT ROLE PROCESSING TESTS
    // =========================================================================

    public function test_merchant_can_access_business_dashboard_and_operations(): void
    {
        Sanctum::actingAs($this->businessUser);

        // 1. Get Merchant Businesses
        $resBusinesses = $this->getJson('/api/my-businesses');
        $resBusinesses->assertStatus(200);

        // 2. Get Merchant Dashboard
        $dashRes = $this->getJson('/api/business/dashboard');
        $dashRes->assertStatus(200);

        // 3. Merchant Subscription Purchase / Upgrade to Pro
        $subRes = $this->postJson('/api/subscriptions/upgrade', [
            'business_id' => $this->testBusiness->id,
            'plan' => 'pro',
            'payment_method' => 'khqr',
        ]);
        $subRes->assertStatus(200);
        $this->assertEquals('active', $subRes->json('subscription.status'));
        $this->assertEquals('pro', $subRes->json('subscription.plan'));

        // 4. Merchant Self-Service Advertisement Purchase
        $adRes = $this->postJson('/api/advertisements/purchase', [
            'business_id' => $this->testBusiness->id,
            'title' => 'Special Sunset Champagne Tour Promo',
            'placement' => 'hero_banner',
            'duration_days' => 30,
            'price' => 35.00,
            'image' => 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800',
            'link_url' => '/businesses/' . $this->testBusiness->slug,
            'payment_method' => 'khqr',
        ]);
        if ($adRes->getStatusCode() !== 201) {
            echo "\nAd Purchase Error: " . $adRes->getContent() . "\n";
        }
        $adRes->assertStatus(201);
        $this->assertEquals('active', $adRes->json('data.status'));
    }

    public function test_merchant_cannot_access_admin_restricted_endpoints(): void
    {
        Sanctum::actingAs($this->businessUser);

        $adminEndpoints = [
            ['GET', '/api/admin/dashboard'],
            ['GET', '/api/admin/users'],
            ['GET', '/api/admin/revenue'],
            ['GET', '/api/admin/settings'],
            ['POST', '/api/admin/packages'],
        ];

        foreach ($adminEndpoints as [$method, $endpoint]) {
            $res = $this->json($method, $endpoint);
            $this->assertEquals(403, $res->getStatusCode(), "Merchant should be forbidden from {$endpoint}");
        }
    }

    // =========================================================================
    // 4. PLATFORM ADMIN ROLE PROCESSING TESTS
    // =========================================================================

    public function test_admin_can_perform_full_crud_on_packages_and_system(): void
    {
        Sanctum::actingAs($this->adminUser);

        // 1. Admin Dashboard & Metrics
        $dashRes = $this->getJson('/api/admin/dashboard');
        $dashRes->assertStatus(200);

        // 2. Admin Packages List
        $pkgListRes = $this->getJson('/api/admin/packages');
        $pkgListRes->assertStatus(200);
        $this->assertArrayHasKey('stats', $pkgListRes->json());

        // 3. Admin Create Package
        $createPkgRes = $this->postJson('/api/admin/packages', [
            'name' => 'Banteay Srei & Pink Sandstone Citadel VIP Tour Audit',
            'description' => 'Visit the Citadel of Women with intricate pink carvings and Phnom Bok temple.',
            'selling_price' => 80.00,
            'provider_cost' => 65.00,
            'duration' => 'Half Day (5h)',
            'rating' => 4.95,
            'is_active' => true,
            'includes' => ['Private AC Car', 'Licensed Tour Guide', 'Cold Refreshments'],
            'image' => 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=800'
        ]);
        $createPkgRes->assertStatus(201);
        $newPkgId = $createPkgRes->json('package.id');

        // 4. Admin Update Package
        $updatePkgRes = $this->putJson("/api/admin/packages/{$newPkgId}", [
            'selling_price' => 90.00,
            'provider_cost' => 70.00,
        ]);
        $updatePkgRes->assertStatus(200);
        $this->assertEquals(90.00, $updatePkgRes->json('package.selling_price'));

        // 5. Admin Toggle Package Status
        $toggleRes = $this->patchJson("/api/admin/packages/{$newPkgId}/toggle-status");
        $toggleRes->assertStatus(200);

        // 6. Admin Delete Package
        $delPkgRes = $this->deleteJson("/api/admin/packages/{$newPkgId}");
        $delPkgRes->assertStatus(200);

        // 7. Admin Revenue & Payments
        $revRes = $this->getJson('/api/admin/revenue');
        $revRes->assertStatus(200);

        $payRes = $this->getJson('/api/admin/payments');
        $payRes->assertStatus(200);

        // 8. Admin Activity Logs
        $logsRes = $this->getJson('/api/admin/activity-logs');
        $logsRes->assertStatus(200);
    }

    // =========================================================================
    // 5. FINANCIAL INTEGRITY & CALCULATION ENGINE TESTS
    // =========================================================================

    public function test_financial_calculation_service_integrity(): void
    {
        $calcService = app(FinancialCalculationService::class);

        // Test 1: Standard Service without Promo
        $quote1 = $calcService->calculateBookingTotals($this->testService->id, 2, null, false);
        $this->assertEquals(120.00, $quote1['subtotal']); // 2 * $60
        $this->assertEquals(0.00, $quote1['discount_amount']);
        $this->assertEquals(2.00, $quote1['service_fee']);
        $this->assertEquals(122.00, $quote1['total_amount']);
        $this->assertGreaterThan(0, $quote1['provider_payout']);

        // Test 2: Percentage Promo Code SIEMREAP20 (20% off)
        $quote2 = $calcService->calculateBookingTotals($this->testService->id, 1, 'SIEMREAP20', false);
        $this->assertEquals(60.00, $quote2['subtotal']);
        $this->assertEquals(12.00, $quote2['discount_amount']); // 20% of 60
        $this->assertEquals(50.00, $quote2['total_amount']); // (60 - 12) + 2

        // Test 3: Fixed Discount Promo Code TESCHOR5 ($5 off)
        $quote3 = $calcService->calculateBookingTotals($this->testService->id, 1, 'TESCHOR5', false);
        $this->assertEquals(5.00, $quote3['discount_amount']);
        $this->assertEquals(57.00, $quote3['total_amount']); // (60 - 5) + 2

        // Test 4: Package Calculation
        $quotePkg = $calcService->calculateBookingTotals($this->testPackage->id, 2, null, true);
        $this->assertEquals(150.00, $quotePkg['subtotal']); // 2 * $75
        $this->assertEquals(152.00, $quotePkg['total_amount']);
        $this->assertEquals('package', $quotePkg['service_type']);

        // Test 5: KHR Exchange Rate accuracy
        $this->assertEquals(round($quote1['total_amount'] * 4100, -2), $quote1['total_amount_khr']);
    }

    public function test_ai_chat_concierge_and_itinerary_generator(): void
    {
        // 1. AI Chat in Khmer
        $kmChatRes = $this->postJson('/api/ai/chat', [
            'message' => 'តើសំបុត្រអង្គរវត្តតម្លៃប៉ុន្មាន?',
            'lang' => 'km'
        ]);
        $kmChatRes->assertStatus(200);
        $kmChatRes->assertJsonStructure([
            'status',
            'query',
            'language',
            'answer',
            'suggestions',
            'destinations',
            'businesses'
        ]);
        $this->assertStringContainsString('37', $kmChatRes->json('answer'));

        // 2. AI Chat in English
        $enChatRes = $this->postJson('/api/ai/chat', [
            'message' => 'Where is the best sunrise spot?',
            'lang' => 'en'
        ]);
        $enChatRes->assertStatus(200);
        $this->assertStringContainsString('Angkor', $enChatRes->json('answer'));

        // 3. AI Multi-Day Itinerary Generation
        $itineraryRes = $this->postJson('/api/ai/generate-itinerary', [
            'days' => 3,
            'style' => 'heritage',
            'budget' => 'comfort',
            'lang' => 'km'
        ]);
        $itineraryRes->assertStatus(200);
        $itineraryRes->assertJsonStructure([
            'status',
            'plan_title',
            'days_count',
            'style',
            'budget_category',
            'estimated_total_usd',
            'cost_breakdown',
            'days',
            'travel_tips'
        ]);
        $this->assertEquals(3, count($itineraryRes->json('days')));
        $this->assertGreaterThan(0, $itineraryRes->json('estimated_total_usd'));

        // 4. AI Recommendations Endpoint
        $recRes = $this->getJson('/api/ai/recommendations?limit=3');
        $recRes->assertStatus(200);
        $this->assertEquals('success', $recRes->json('status'));
        $this->assertNotNull($recRes->json('destinations'));
        $this->assertNotNull($recRes->json('businesses'));
    }
}

