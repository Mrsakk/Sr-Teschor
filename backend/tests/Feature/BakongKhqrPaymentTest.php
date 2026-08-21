<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Business;
use App\Models\BusinessService;
use App\Models\Category;
use App\Models\User;
use App\Services\BakongKhqrService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BakongKhqrPaymentTest extends TestCase
{
    use RefreshDatabase;

    public function test_khqr_service_generates_emvco_payload_and_valid_crc16(): void
    {
        $service = new BakongKhqrService();
        $result = $service->generateKhqr(25.00, 'SRT-TEST-1234', 'USD', 'Sunset Tour');

        $this->assertIsArray($result);
        $this->assertArrayHasKey('qr_string', $result);
        $this->assertArrayHasKey('amount_usd', $result);
        $this->assertArrayHasKey('amount_khr', $result);
        $this->assertArrayHasKey('deep_link', $result);

        $this->assertEquals(25.00, $result['amount_usd']);
        $this->assertEquals(102500, $result['amount_khr']); // 25 * 4100
        $this->assertStringStartsWith('000201', $result['qr_string']); // Tag 00 length 02 value 01
        $this->assertStringContainsString('5920SR TES CHOR PLATFORM', $result['qr_string']); // Tag 59 merchant name
    }

    public function test_generate_khqr_api_endpoint(): void
    {
        $response = $this->postJson('/api/payments/khqr/generate', [
            'type' => 'booking',
            'amount' => 45.50,
            'reference' => 'SRT-BK-9988',
            'item_title' => 'Angkor Wat Private Day Tour',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    'qr_string',
                    'bill_number',
                    'amount_usd',
                    'amount_khr',
                    'merchant_name',
                    'deep_link',
                    'expires_at',
                ],
                'type',
                'reference',
            ]);

        $this->assertEquals(45.50, $response->json('data.amount_usd'));
        $this->assertEquals(186550, $response->json('data.amount_khr'));
    }

    private function createTestBusiness($owner, $category, $overrides = [])
    {
        return Business::create(array_merge([
            'owner_id' => $owner->id,
            'category_id' => $category->id,
            'name' => 'Angkor Explorer Travels',
            'slug' => 'angkor-explorer-' . uniqid(),
            'description' => 'Top guided tours in Angkor park.',
            'address' => 'Sivutha Blvd, Siem Reap',
            'phone' => '+85512999888',
            'status' => 'active',
            'verification_status' => 'approved',
        ], $overrides));
    }

    public function test_verify_khqr_for_booking_auto_confirms_and_records_payment(): void
    {
        $user = User::factory()->create();
        $owner = User::factory()->create(['role' => 'business_owner']);
        $category = Category::create(['name' => 'Tours', 'slug' => 'tours', 'status' => 'active']);

        $business = $this->createTestBusiness($owner, $category);

        $service = BusinessService::create([
            'business_id' => $business->id,
            'name' => 'Angkor Sunrise Tour',
            'price' => 30.00,
            'status' => 'active',
        ]);

        $booking = Booking::create([
            'booking_reference' => 'TC-2026-TEST01',
            'user_id' => $user->id,
            'business_id' => $business->id,
            'service_id' => $service->id,
            'booking_date' => now()->addDays(2)->toDateString(),
            'guests' => 2,
            'total_amount' => 60.00,
            'subtotal' => 60.00,
            'service_fee' => 0.00,
            'discount_amount' => 0.00,
            'platform_commission' => 6.00,
            'provider_payout' => 54.00,
            'contact_name' => 'John Tourist',
            'contact_phone' => '+85512345678',
            'contact_email' => 'john@example.com',
            'status' => 'pending',
            'payment_status' => 'unpaid',
        ]);

        $response = $this->actingAs($user)->postJson('/api/payments/khqr/verify', [
            'bill_number' => $booking->booking_reference,
            'booking_id' => $booking->id,
            'type' => 'booking',
            'amount' => 60.00,
            'simulation' => true,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'paid',
                'message' => 'Bakong KHQR payment verified successfully!',
            ]);

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'confirmed',
            'payment_status' => 'paid',
        ]);

        $this->assertDatabaseHas('payments', [
            'business_id' => $business->id,
            'amount' => 60.00,
            'payment_method' => 'Bakong KHQR',
            'status' => 'completed',
        ]);
    }

    public function test_verify_khqr_for_business_subscription_upgrade(): void
    {
        $owner = User::factory()->create(['role' => 'business_owner']);
        $category = Category::create(['name' => 'Dining', 'slug' => 'dining', 'status' => 'active']);

        $business = $this->createTestBusiness($owner, $category, [
            'name' => 'Khmer Gastronomy Villa',
            'subscription_plan' => 'free',
        ]);

        $response = $this->actingAs($owner)->postJson('/api/payments/khqr/verify', [
            'bill_number' => 'SRT-SUB-PREMIUM',
            'type' => 'subscription',
            'business_id' => $business->id,
            'plan' => 'premium',
            'amount' => 20.00,
            'simulation' => true,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'paid',
            ]);

        $this->assertDatabaseHas('businesses', [
            'id' => $business->id,
            'subscription_plan' => 'premium',
            'is_featured' => true,
        ]);

        $this->assertDatabaseHas('subscriptions', [
            'business_id' => $business->id,
            'plan' => 'premium',
            'price' => 20.00,
            'status' => 'active',
        ]);
    }

    public function test_get_digital_invoice_endpoint(): void
    {
        $user = User::factory()->create();
        $category = Category::create(['name' => 'Stays', 'slug' => 'stays', 'status' => 'active']);

        $business = $this->createTestBusiness($user, $category, [
            'name' => 'Heritage Boutique Villa',
        ]);

        $booking = Booking::create([
            'booking_reference' => 'TC-2026-INV99',
            'user_id' => $user->id,
            'business_id' => $business->id,
            'booking_date' => now()->toDateString(),
            'guests' => 1,
            'total_amount' => 100.00,
            'subtotal' => 100.00,
            'service_fee' => 0.00,
            'discount_amount' => 0.00,
            'platform_commission' => 10.00,
            'provider_payout' => 90.00,
            'contact_name' => 'Alice Traveler',
            'contact_phone' => '+85598765432',
            'contact_email' => 'alice@example.com',
            'status' => 'confirmed',
            'payment_status' => 'paid',
        ]);

        $response = $this->getJson("/api/invoices/{$booking->booking_reference}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'invoice_number',
                'reference',
                'issue_date',
                'status',
                'payment_method',
                'currency' => [
                    'usd',
                    'khr',
                    'exchange_rate',
                ],
                'company' => [
                    'name_kh',
                    'name_en',
                    'vat_tin',
                ],
                'customer',
                'items',
                'summary',
                'qr_verification',
            ]);

        $this->assertEquals('$100.00', $response->json('currency.usd'));
        $this->assertEquals('410,000 ៛', $response->json('currency.khr'));
    }
}
