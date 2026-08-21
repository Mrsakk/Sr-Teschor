<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\Category;
use App\Models\Destination;
use App\Models\DestinationImage;
use App\Models\User;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Subscription;
use App\Models\Advertisement;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProductionDeploymentAuditTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $businessOwner;
    protected User $customer;
    protected Category $category;
    protected Destination $destination;
    protected Business $business;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::create([
            'name' => 'Admin Tester',
            'email' => 'admin@teschor.test',
            'password' => bcrypt('password123'),
            'role' => 'admin',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        $this->businessOwner = User::create([
            'name' => 'Owner Tester',
            'email' => 'owner@teschor.test',
            'password' => bcrypt('password123'),
            'role' => 'business',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        $this->customer = User::create([
            'name' => 'Customer Tester',
            'email' => 'customer@teschor.test',
            'password' => bcrypt('password123'),
            'role' => 'customer',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        $this->category = Category::create([
            'name' => 'Historical Temples',
            'slug' => 'historical-temples',
            'description' => 'Ancient Temples',
            'type' => 'all',
        ]);

        $this->destination = Destination::create([
            'category_id' => $this->category->id,
            'created_by' => $this->admin->id,
            'name' => 'Phnom Kulen Sacred Park',
            'khmer_name' => 'ឧទ្យានជាតិភ្នំគូលែន',
            'slug' => 'phnom-kulen',
            'description' => 'Sacred mountain in Siem Reap',
            'address' => 'Svay Leu, Siem Reap',
            'status' => 'published',
            'entrance_fee' => 20.00,
            'rating' => 4.9,
            'views_count' => 120,
        ]);

        DestinationImage::create([
            'destination_id' => $this->destination->id,
            'image' => 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800',
            'alt_text' => 'Phnom Kulen photo',
            'is_primary' => true,
            'display_order' => 0,
        ]);

        $this->business = Business::create([
            'owner_id' => $this->businessOwner->id,
            'category_id' => $this->category->id,
            'name' => 'Angkor Sunrise Safari',
            'khmer_name' => 'សេវាកម្មទេសចរណ៍ថ្ងៃរះ',
            'slug' => 'angkor-sunrise-safari',
            'description' => 'Tour guide service',
            'address' => 'Sivatha Road, Siem Reap',
            'phone' => '+855 12 345 678',
            'status' => 'active',
            'rating' => 4.9,
            'views_count' => 300,
        ]);
    }

    /**
     * Test 1: Public Destination APIs
     */
    public function test_destinations_api_returns_paginated_list_and_detail(): void
    {
        $res = $this->getJson('/api/destinations');
        $res->assertStatus(200)
            ->assertJsonStructure(['data', 'current_page', 'total']);

        $detailRes = $this->getJson('/api/destinations/phnom-kulen');
        $detailRes->assertStatus(200)
            ->assertJsonStructure([
                'destination' => [
                    'id',
                    'name',
                    'slug',
                    'category',
                    'images',
                ],
                'similar',
            ]);

        $notFoundRes = $this->getJson('/api/destinations/non-existent-slug-xyz');
        $notFoundRes->assertStatus(404);
    }

    /**
     * Test 2: Public Business APIs
     */
    public function test_businesses_api_returns_list_and_detail(): void
    {
        $res = $this->getJson('/api/businesses');
        $res->assertStatus(200);

        $detailRes = $this->getJson('/api/businesses/angkor-sunrise-safari');
        $detailRes->assertStatus(200)
            ->assertJsonStructure([
                'business' => [
                    'id',
                    'name',
                    'slug',
                    'category',
                ],
                'similar',
            ]);

        $notFoundRes = $this->getJson('/api/businesses/non-existent-business-xyz');
        $notFoundRes->assertStatus(404);
    }

    /**
     * Test 3: AI Chat Concierge & Recommendations
     */
    public function test_ai_chat_returns_valid_string_images_and_response(): void
    {
        $response = $this->postJson('/api/ai/chat', [
            'message' => 'តើសំបុត្រ Angkor Pass តម្លៃប៉ុន្មាន?',
            'lang' => 'km',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'query',
                'language',
                'answer',
                'suggestions',
                'destinations',
                'businesses',
            ]);

        $destinations = $response->json('destinations');
        $this->assertIsArray($destinations);
        foreach ($destinations as $d) {
            $this->assertIsString($d['image'], 'Destination image in AI Chat must be a string URL');
            $this->assertNotEmpty($d['image']);
            $this->assertIsString($d['link']);
        }
    }

    /**
     * Test 4: AI Itinerary Generator
     */
    public function test_ai_generate_itinerary_returns_structured_days(): void
    {
        $res = $this->postJson('/api/ai/generate-itinerary', [
            'days' => 3,
            'style' => 'heritage',
            'budget' => 'comfort',
            'lang' => 'km',
        ]);

        $res->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'plan_title',
                'days_count',
                'days' => [
                    '*' => [
                        'day',
                        'title',
                        'activities' => [
                            '*' => ['time', 'place', 'description']
                        ]
                    ]
                ]
            ]);

        $this->assertEquals(3, $res->json('days_count'));
        $this->assertCount(3, $res->json('days'));
    }

    /**
     * Test 5: Admin Dashboard API Integrity
     */
    public function test_admin_dashboard_returns_real_time_stats_and_valid_charts(): void
    {
        Sanctum::actingAs($this->admin);

        $res = $this->getJson('/api/admin/dashboard');
        $res->assertStatus(200)
            ->assertJsonStructure([
                'stats' => [
                    'total_users',
                    'total_businesses',
                    'total_destinations',
                    'total_bookings',
                    'total_revenue',
                    'pending_approvals',
                    'reviews_count',
                    'active_promotions',
                ],
                'charts' => [
                    'user_growth',
                    'business_growth',
                    'revenue_trend',
                    'bookings_trend',
                    'categories_distribution',
                    'popular_destinations',
                ],
                'recent_activities',
            ]);

        $userGrowth = $res->json('charts.user_growth');
        $this->assertCount(8, $userGrowth);
        foreach ($userGrowth as $ug) {
            $this->assertArrayHasKey('month', $ug);
            $this->assertArrayHasKey('users', $ug);
            $this->assertGreaterThanOrEqual(0, $ug['users']);
        }

        $revenueTrend = $res->json('charts.revenue_trend');
        $this->assertCount(8, $revenueTrend);
        foreach ($revenueTrend as $rt) {
            $this->assertArrayHasKey('month', $rt);
            $this->assertArrayHasKey('revenue', $rt);
            $this->assertArrayHasKey('subscriptions', $rt);
            $this->assertArrayHasKey('ads', $rt);
            $this->assertArrayHasKey('commission', $rt);
            $this->assertGreaterThanOrEqual(0, $rt['revenue']);
        }
    }

    /**
     * Test 6: Business Dashboard API Integrity
     */
    public function test_business_dashboard_returns_merchant_metrics(): void
    {
        Sanctum::actingAs($this->businessOwner);

        $res = $this->getJson('/api/business/dashboard');
        $res->assertStatus(200)
            ->assertJsonStructure([
                'businesses',
                'summary' => [
                    'total_views',
                    'total_bookings',
                    'pending_bookings',
                    'confirmed_bookings',
                    'completed_bookings',
                    'total_revenue',
                    'total_reviews',
                    'average_rating',
                ],
                'recent_bookings',
                'recent_reviews',
                'monthly_trends',
            ]);

        $this->assertCount(6, $res->json('monthly_trends'));
    }

    /**
     * Test 7: Customer Dashboard API Integrity
     */
    public function test_customer_dashboard_returns_traveler_hub_data(): void
    {
        Sanctum::actingAs($this->customer);

        $res = $this->getJson('/api/user/dashboard');
        $res->assertStatus(200)
            ->assertJsonStructure([
                'stats' => [
                    'saved_count',
                    'trips_count',
                    'bookings_count',
                    'reviews_count',
                ],
                'upcoming_trips',
                'upcoming_bookings',
                'recommendations',
                'nearby_places',
                'promotions',
            ]);
    }

    /**
     * Test 8: Security and RBAC Access Control
     */
    public function test_unauthenticated_and_unauthorized_access_are_properly_blocked(): void
    {
        // Unauthenticated access to admin dashboard should be 401
        $guestRes = $this->getJson('/api/admin/dashboard');
        $guestRes->assertStatus(401);

        // Customer trying to access Admin dashboard should be 403
        Sanctum::actingAs($this->customer);
        $forbiddenRes = $this->getJson('/api/admin/dashboard');
        $forbiddenRes->assertStatus(403);
    }
}
