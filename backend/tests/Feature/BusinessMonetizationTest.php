<?php

namespace Tests\Feature;

use App\Models\Business;
use App\Models\BusinessService;
use App\Models\Category;
use App\Models\Promotion;
use App\Models\TravelPackage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BusinessMonetizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_can_fetch_subscription_pricing_plans(): void
    {
        $response = $this->getJson('/api/subscriptions/plans');
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'plans' => [
                '*' => ['id', 'name', 'price', 'period', 'description', 'features', 'popular']
            ]
        ]);
    }

    public function test_guest_cannot_upgrade_subscription_unauthorized(): void
    {
        $response = $this->postJson('/api/subscriptions/upgrade', [
            'business_id' => 1,
            'plan' => 'pro'
        ]);
        $response->assertStatus(401);
    }

    public function test_business_owner_can_upgrade_subscription(): void
    {
        $owner = User::factory()->create(['role' => 'business']);
        $category = Category::first() ?? Category::create(['name' => 'Hotels', 'slug' => 'hotels']);
        $business = Business::create([
            'owner_id' => $owner->id,
            'category_id' => $category->id,
            'name' => 'Angkor Test Resort',
            'slug' => 'angkor-test-resort-' . time(),
            'description' => 'A wonderful luxury resort in Siem Reap',
            'address' => 'Siem Reap Center',
            'phone' => '012345678',
            'status' => 'active',
            'subscription_plan' => 'free',
        ]);

        $response = $this->actingAs($owner)->postJson('/api/subscriptions/upgrade', [
            'business_id' => $business->id,
            'plan' => 'pro',
            'payment_method' => 'Bakong KHQR',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('businesses', [
            'id' => $business->id,
            'subscription_plan' => 'pro',
            'is_featured' => true,
        ]);
        $this->assertDatabaseHas('subscriptions', [
            'business_id' => $business->id,
            'plan' => 'pro',
            'status' => 'active',
        ]);
        $this->assertDatabaseHas('payments', [
            'business_id' => $business->id,
            'amount' => 10.00,
            'status' => 'completed',
        ]);
    }

    public function test_unauthorized_user_cannot_upgrade_another_user_business(): void
    {
        $owner1 = User::factory()->create(['role' => 'business']);
        $owner2 = User::factory()->create(['role' => 'business']);
        $category = Category::first() ?? Category::create(['name' => 'Tours', 'slug' => 'tours']);
        $business = Business::create([
            'owner_id' => $owner1->id,
            'category_id' => $category->id,
            'name' => 'Owner 1 Business',
            'slug' => 'owner-1-business-' . time(),
            'description' => 'Tour service provider in Siem Reap',
            'address' => 'Siem Reap',
            'phone' => '012345678',
            'status' => 'active',
        ]);

        $response = $this->actingAs($owner2)->postJson('/api/subscriptions/upgrade', [
            'business_id' => $business->id,
            'plan' => 'pro',
        ]);

        $response->assertStatus(403);
    }

    public function test_booking_quote_calculation_and_discount_accuracy(): void
    {
        $owner = User::factory()->create(['role' => 'business']);
        $category = Category::first() ?? Category::create(['name' => 'Dining', 'slug' => 'dining']);
        $business = Business::create([
            'owner_id' => $owner->id,
            'category_id' => $category->id,
            'name' => 'Khmer Cuisine Restaurant',
            'slug' => 'khmer-cuisine-' . time(),
            'description' => 'Authentic local dining experience',
            'address' => 'Pub Street',
            'phone' => '012345678',
            'status' => 'active',
        ]);

        $service = BusinessService::create([
            'business_id' => $business->id,
            'name' => 'Traditional Set Dinner',
            'price' => 20.00,
            'duration' => '1 hour',
        ]);

        $promotion = Promotion::create([
            'business_id' => $business->id,
            'promo_code' => 'TESTDISCOUNT10',
            'title' => '10% Off Dinner',
            'discount' => '10% OFF',
            'start_date' => now()->subDay()->format('Y-m-d'),
            'end_date' => now()->addDays(7)->format('Y-m-d'),
            'status' => 'active',
        ]);

        $response = $this->postJson('/api/bookings/calculate', [
            'service_id' => $service->id,
            'guests' => 2,
            'promo_code' => 'TESTDISCOUNT10',
        ]);

        $response->assertStatus(200);
        $data = $response->json();
        // 2 guests * $20 = $40 subtotal. 10% discount = $4. 
        $this->assertEquals(40.00, $data['subtotal']);
        $this->assertEquals(4.00, $data['discount_amount']);
    }

    public function test_customer_can_complete_checkout_and_generate_commission(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $owner = User::factory()->create(['role' => 'business']);
        $category = Category::first() ?? Category::create(['name' => 'Spa', 'slug' => 'spa']);
        $business = Business::create([
            'owner_id' => $owner->id,
            'category_id' => $category->id,
            'name' => 'Bodia Relax Spa',
            'slug' => 'bodia-relax-spa-' . time(),
            'description' => 'Relaxing massage and spa services in Siem Reap',
            'address' => 'Siem Reap Riverside',
            'phone' => '012345678',
            'status' => 'active',
        ]);

        $service = BusinessService::create([
            'business_id' => $business->id,
            'name' => '60min Herbal Massage',
            'price' => 30.00,
            'duration' => '60 mins',
        ]);

        $response = $this->actingAs($customer)->postJson('/api/bookings/checkout', [
            'service_id' => $service->id,
            'booking_date' => now()->addDays(2)->format('Y-m-d'),
            'booking_time' => '14:00',
            'guests' => 1,
            'contact_name' => 'Test Customer',
            'contact_phone' => '012345678',
            'contact_email' => 'customer@test.com',
            'payment_method' => 'khqr',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('bookings', [
            'user_id' => $customer->id,
            'business_id' => $business->id,
            'status' => 'confirmed',
            'payment_status' => 'paid',
        ]);
        $this->assertDatabaseHas('transactions', [
            'user_id' => $customer->id,
            'business_id' => $business->id,
            'type' => 'booking',
            'payment_status' => 'paid',
        ]);
    }
}

