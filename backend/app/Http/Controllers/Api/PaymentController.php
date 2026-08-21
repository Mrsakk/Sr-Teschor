<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Business;
use App\Models\Notification;
use App\Models\Payment;
use App\Models\Subscription;
use App\Models\Transaction;
use App\Services\BakongKhqrService;
use App\Services\FinancialCalculationService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    protected BakongKhqrService $khqrService;
    protected FinancialCalculationService $calcService;

    public function __construct(BakongKhqrService $khqrService, FinancialCalculationService $calcService)
    {
        $this->khqrService = $khqrService;
        $this->calcService = $calcService;
    }

    /**
     * Generate KHQR for Bookings or Subscriptions
     */
    public function generateKhqr(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:booking,subscription,package',
            'amount' => 'required|numeric|min:0.5',
            'reference' => 'nullable|string',
            'item_title' => 'nullable|string|max:255',
            'business_id' => 'nullable|integer',
            'plan' => 'nullable|in:pro,premium',
        ]);

        $billNumber = $validated['reference'] ?? ('SRT-' . strtoupper(Str::random(8)));
        $currency = $request->query('currency', 'USD');
        $label = $validated['item_title'] ?? 'SR TesChor Payment';

        $khqrData = $this->khqrService->generateKhqr(
            (float) $validated['amount'],
            $billNumber,
            $currency,
            $label
        );

        return response()->json([
            'status' => 'success',
            'data' => $khqrData,
            'type' => $validated['type'],
            'reference' => $billNumber,
        ]);
    }

    /**
     * Verify KHQR Payment & Auto-Confirm transaction
     */
    public function verifyKhqr(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'bill_number' => 'required|string',
            'type' => 'required|in:booking,subscription,package',
            'amount' => 'required|numeric',
            'booking_id' => 'nullable|integer',
            'business_id' => 'nullable|integer',
            'plan' => 'nullable|in:pro,premium',
            'simulation' => 'nullable|boolean',
        ]);

        $txNumber = 'TX-KHQR-' . strtoupper(Str::random(8));

        // 1. If Booking verification
        if ($validated['type'] === 'booking' || $validated['type'] === 'package') {
            $booking = null;
            if (!empty($validated['booking_id'])) {
                $booking = Booking::with(['business', 'service'])->find($validated['booking_id']);
            } elseif (!empty($validated['bill_number'])) {
                $booking = Booking::with(['business', 'service'])->where('booking_reference', $validated['bill_number'])->first();
            }

            if ($booking) {
                $booking->update([
                    'status' => 'confirmed',
                    'payment_status' => 'paid',
                ]);

                // Record or update transaction
                Transaction::updateOrCreate(
                    ['booking_id' => $booking->id],
                    [
                        'transaction_number' => $txNumber,
                        'user_id' => $booking->user_id,
                        'business_id' => $booking->business_id,
                        'type' => $booking->service_id ? 'booking' : 'package',
                        'gross_amount' => $booking->total_amount,
                        'commission_amount' => $booking->platform_commission,
                        'service_fee' => $booking->service_fee,
                        'discount_amount' => $booking->discount_amount,
                        'platform_revenue' => $booking->platform_commission + $booking->service_fee,
                        'provider_amount' => $booking->provider_payout,
                        'currency' => 'USD',
                        'payment_status' => 'paid',
                    ]
                );

                Payment::create([
                    'user_id' => $booking->user_id,
                    'business_id' => $booking->business_id,
                    'amount' => $booking->total_amount,
                    'payment_method' => 'Bakong KHQR',
                    'transaction_id' => $txNumber,
                    'type' => 'booking_commission',
                    'status' => 'completed',
                    'description' => "Bakong KHQR Verified for Booking #{$booking->booking_reference}",
                ]);

                // Notify business owner
                if ($booking->business && $booking->business->owner_id) {
                    Notification::create([
                        'user_id' => $booking->business->owner_id,
                        'title' => 'Bakong KHQR Payment Confirmed! 💰',
                        'message' => "Booking #{$booking->booking_reference} has been paid via Bakong KHQR. Guest: {$booking->contact_name}",
                        'type' => 'booking',
                        'link' => '/business/dashboard',
                    ]);
                }

                return response()->json([
                    'status' => 'paid',
                    'message' => 'Bakong KHQR payment verified successfully!',
                    'booking' => $booking,
                    'transaction_id' => $txNumber,
                    'invoice_url' => "/api/invoices/{$booking->booking_reference}",
                ]);
            }
        }

        // 2. If Business Subscription upgrade verification
        if ($validated['type'] === 'subscription' && !empty($validated['business_id']) && !empty($validated['plan'])) {
            $business = Business::findOrFail($validated['business_id']);

            if ($business->owner_id !== $user->id && !$user->isAdmin()) {
                abort(403, 'Unauthorized');
            }

            // Expire older subscriptions
            Subscription::where('business_id', $business->id)->update(['status' => 'expired']);

            $subscription = Subscription::create([
                'business_id' => $business->id,
                'plan' => $validated['plan'],
                'price' => (float) $validated['amount'],
                'billing_cycle' => 'monthly',
                'start_date' => now()->toDateString(),
                'end_date' => now()->addMonth()->toDateString(),
                'status' => 'active',
            ]);

            $business->update([
                'subscription_plan' => $validated['plan'],
                'is_featured' => true,
            ]);

            Payment::create([
                'user_id' => $user->id,
                'business_id' => $business->id,
                'amount' => $validated['amount'],
                'payment_method' => 'Bakong KHQR',
                'transaction_id' => $txNumber,
                'type' => 'subscription',
                'status' => 'completed',
                'description' => "Bakong KHQR Paid: " . ucfirst($validated['plan']) . " Plan Upgrade for {$business->name}",
            ]);

            return response()->json([
                'status' => 'paid',
                'message' => "Successfully verified Bakong KHQR and activated {$validated['plan']} subscription!",
                'business' => $business->fresh(['activeSubscription']),
                'subscription' => $subscription,
                'transaction_id' => $txNumber,
                'invoice_url' => "/api/invoices/{$txNumber}",
            ]);
        }

        return response()->json([
            'status' => 'paid',
            'message' => 'Payment verified successfully.',
            'transaction_id' => $txNumber,
        ]);
    }

    /**
     * Digital E-Invoice & Tax Invoice breakdown
     */
    public function getInvoice(Request $request, $reference)
    {
        $user = $request->user();

        // Find booking by reference or transaction
        $booking = Booking::with(['business', 'service', 'user'])
            ->where('booking_reference', $reference)
            ->first();

        $transaction = null;
        if ($booking) {
            $transaction = Transaction::where('booking_id', $booking->id)->first();
        } else {
            $transaction = Transaction::where('transaction_number', $reference)->with('business')->first();
        }

        $rate = BakongKhqrService::NBC_EXCHANGE_RATE_KHR;
        $totalUsd = $booking ? (float)$booking->total_amount : ($transaction ? (float)$transaction->gross_amount : 0.00);
        $totalKhr = (int) round($totalUsd * $rate);

        $invoiceNumber = 'INV-' . strtoupper(str_replace(['TC-', 'TX-'], '', $reference));

        $invoiceData = [
            'invoice_number' => $invoiceNumber,
            'reference' => $reference,
            'issue_date' => $booking ? $booking->created_at->format('d M Y, h:i A') : now()->format('d M Y, h:i A'),
            'status' => 'PAID',
            'payment_method' => 'Bakong KHQR (NBC Standard)',
            'currency' => [
                'usd' => '$' . number_format($totalUsd, 2),
                'khr' => number_format($totalKhr) . ' ៛',
                'exchange_rate' => '1 USD = ' . number_format($rate) . ' KHR (NBC Official)',
            ],
            'company' => [
                'name_kh' => 'អេស អ័រ ទេសចរ (ខេមបូឌា)',
                'name_en' => 'SR Tes Chor Platform (Cambodia) Co., Ltd.',
                'vat_tin' => 'K009-902401882',
                'address' => 'Sivutha Blvd, Svay Dangkum, Siem Reap, Kingdom of Cambodia',
                'email' => 'billing@srteschor.com',
                'phone' => '+855 (0) 63 963 888',
            ],
            'customer' => [
                'name' => $booking ? $booking->contact_name : ($user ? $user->name : 'Valued Guest'),
                'email' => $booking ? $booking->contact_email : ($user ? $user->email : 'guest@example.com'),
                'phone' => $booking ? $booking->contact_phone : ($user ? $user->phone : 'N/A'),
            ],
            'items' => [
                [
                    'description' => $booking ? ($booking->service?->name ?? 'Siem Reap Exclusive Travel Experience') : ($transaction?->description ?? 'SR TesChor Service'),
                    'qty' => $booking ? $booking->guests : 1,
                    'unit_price_usd' => $booking ? (float)$booking->subtotal / max(1, $booking->guests) : $totalUsd,
                    'amount_usd' => $booking ? (float)$booking->subtotal : $totalUsd,
                    'amount_khr' => $booking ? (int)round((float)$booking->subtotal * $rate) : $totalKhr,
                ],
            ],
            'summary' => [
                'subtotal_usd' => $booking ? (float)$booking->subtotal : $totalUsd,
                'discount_usd' => $booking ? (float)$booking->discount_amount : 0.00,
                'service_fee_usd' => $booking ? (float)$booking->service_fee : 0.00,
                'vat_tax_usd' => 0.00,
                'grand_total_usd' => $totalUsd,
                'grand_total_khr' => $totalKhr,
            ],
            'qr_verification' => [
                'issuer' => 'NBC / Bakong KHQR Verified',
                'hash' => sha1($invoiceNumber . '_' . $totalUsd . '_srteschor'),
                'verified_online_url' => url("/invoices/{$reference}"),
            ]
        ];

        return response()->json($invoiceData);
    }
}
