<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Business;
use App\Models\BusinessService;
use App\Models\Notification;
use App\Models\Payment;
use App\Models\Transaction;
use App\Models\TravelPackage;
use App\Models\User;
use App\Services\FinancialCalculationService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BookingController extends Controller
{
    protected FinancialCalculationService $calcService;

    public function __construct(FinancialCalculationService $calcService)
    {
        $this->calcService = $calcService;
    }

    /**
     * Preview calculation for checkout
     */
    public function calculateQuote(Request $request)
    {
        $validated = $request->validate([
            'service_id' => 'required|integer',
            'guests' => 'required|integer|min:1|max:50',
            'promo_code' => 'nullable|string|max:50',
            'is_package' => 'nullable|boolean',
        ]);

        $quote = $this->calcService->calculateBookingTotals(
            (int) $validated['service_id'],
            (int) $validated['guests'],
            $validated['promo_code'] ?? null,
            (bool) ($validated['is_package'] ?? false)
        );

        return response()->json($quote);
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $status = $request->query('status');

        $query = Booking::with(['business', 'service', 'user']);

        if ($user->isAdmin()) {
            // Admin sees all bookings
        } elseif ($user->isBusinessOwner() && $request->has('as_business')) {
            // Business owner views bookings for their businesses
            $businessIds = $user->businesses()->pluck('id');
            $query->whereIn('business_id', $businessIds);
        } else {
            // Regular customer view
            $query->where('user_id', $user->id);
        }

        if ($status) {
            $query->where('status', $status);
        }

        $bookings = $query->latest()->paginate(15);

        return response()->json($bookings);
    }

    /**
     * Production-grade Checkout & Instant Booking Payment
     */
    public function checkout(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'service_id' => 'required|integer',
            'booking_date' => 'required|date|after_or_equal:today',
            'booking_time' => 'nullable|string',
            'guests' => 'required|integer|min:1|max:50',
            'contact_name' => 'required|string|max:255',
            'contact_phone' => 'required|string|max:50',
            'contact_email' => 'required|email|max:255',
            'pickup_location' => 'nullable|string|max:255',
            'special_requests' => 'nullable|string|max:1000',
            'promo_code' => 'nullable|string|max:50',
            'payment_method' => 'required|string|in:khqr,bakong,card,cash',
            'is_package' => 'nullable|boolean',
        ]);

        $isPackage = (bool) ($validated['is_package'] ?? false);
        $quote = $this->calcService->calculateBookingTotals(
            (int) $validated['service_id'],
            (int) $validated['guests'],
            $validated['promo_code'] ?? null,
            $isPackage
        );

        $businessId = null;
        if ($isPackage) {
            $package = TravelPackage::findOrFail($validated['service_id']);
            // If package has no business_id, attach to first admin or default business
            $businessId = Business::first()?->id ?? 1;
        } else {
            $service = BusinessService::findOrFail($validated['service_id']);
            $businessId = $service->business_id;
        }

        $business = Business::find($businessId);

        // Generate Standard Booking Reference (e.g. TC-2026-000123)
        $refNumber = 'TC-' . date('Y') . '-' . strtoupper(Str::random(6));

        $bookingTime = $this->formatBookingTime($validated['booking_time'] ?? null);

        $booking = Booking::create([
            'booking_reference' => $refNumber,
            'user_id' => $user->id,
            'business_id' => $businessId,
            'service_id' => $isPackage ? null : $validated['service_id'],
            'booking_date' => $validated['booking_date'],
            'booking_time' => $bookingTime,
            'guests' => $validated['guests'],
            'total_amount' => $quote['total_amount'],
            'subtotal' => $quote['subtotal'],
            'service_fee' => $quote['service_fee'],
            'discount_amount' => $quote['discount_amount'],
            'platform_commission' => $quote['platform_commission'],
            'provider_payout' => $quote['provider_payout'],
            'promo_code' => $quote['promo_code'],
            'service_type' => $quote['service_type'],
            'contact_name' => $validated['contact_name'],
            'contact_phone' => $validated['contact_phone'],
            'contact_email' => $validated['contact_email'],
            'notes' => (!empty($validated['pickup_location']) ? "Pickup: {$validated['pickup_location']}. " : '') . ($validated['special_requests'] ?? ''),
            'status' => 'confirmed',
            'payment_status' => 'paid',
        ]);

        // Record Transaction
        $txNumber = 'TX-' . strtoupper(Str::random(10));
        $transaction = Transaction::create([
            'transaction_number' => $txNumber,
            'user_id' => $user->id,
            'booking_id' => $booking->id,
            'business_id' => $businessId,
            'type' => $isPackage ? 'package' : 'booking',
            'gross_amount' => $quote['total_amount'],
            'commission_amount' => $quote['platform_commission'],
            'service_fee' => $quote['service_fee'],
            'discount_amount' => $quote['discount_amount'],
            'platform_revenue' => $quote['platform_commission'] + $quote['service_fee'],
            'provider_amount' => $quote['provider_payout'],
            'currency' => 'USD',
            'payment_status' => 'paid',
        ]);

        // Record Payment
        Payment::create([
            'user_id' => $user->id,
            'business_id' => $businessId,
            'amount' => $quote['total_amount'],
            'payment_method' => strtoupper($validated['payment_method']),
            'transaction_id' => $txNumber,
            'type' => 'booking_commission',
            'status' => 'completed',
            'description' => "Booking Payment for #{$booking->booking_reference} ({$quote['service_name']})",
        ]);

        // Notify Business Owner if exists
        if ($business && $business->owner_id) {
            Notification::create([
                'user_id' => $business->owner_id,
                'title' => 'New Paid Booking Confirmed! 🎉',
                'message' => "{$validated['contact_name']} booked {$quote['service_name']} for {$validated['booking_date']}. Ref: #{$booking->booking_reference}. Net Payout: \${$quote['provider_payout']}",
                'type' => 'booking',
                'link' => '/business/dashboard',
            ]);
        }

        return response()->json([
            'message' => 'Payment successful and booking confirmed!',
            'booking' => $booking->load(['business', 'service']),
            'transaction' => $transaction,
            'quote' => $quote,
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $booking = Booking::with(['business', 'service', 'user'])->findOrFail($id);

        if ($booking->user_id !== $user->id && $booking->business?->owner_id !== $user->id && !$user->isAdmin()) {
            abort(403, 'Unauthorized');
        }

        return response()->json($booking);
    }

    /**
     * Digital E-Receipt & QR Code Data
     */
    public function receipt(Request $request, $id)
    {
        $user = $request->user();
        $booking = Booking::with(['business', 'service', 'user'])->findOrFail($id);

        if ($booking->user_id !== $user->id && $booking->business?->owner_id !== $user->id && !$user->isAdmin()) {
            abort(403, 'Unauthorized');
        }

        $qrData = json_encode([
            'app' => 'SR Tes Chor',
            'ref' => $booking->booking_reference,
            'guest' => $booking->contact_name,
            'date' => $booking->booking_date,
            'total' => '$' . number_format($booking->total_amount, 2),
            'status' => $booking->status,
        ]);

        return response()->json([
            'receipt_number' => 'RCP-' . str_replace('TC-', '', $booking->booking_reference),
            'booking' => $booking,
            'qr_payload' => $qrData,
            'issued_at' => $booking->created_at->format('Y-m-d H:i:s'),
            'platform' => [
                'name' => 'SR Tes Chor Platform',
                'location' => 'Siem Reap, Kingdom of Cambodia',
                'support_email' => 'support@srteschor.com',
                'telegram' => '@srteschor_support',
            ]
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $user = $request->user();
        $booking = Booking::with(['business', 'user'])->findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,rejected,cancelled,completed',
            'business_response_notes' => 'nullable|string|max:1000',
        ]);

        $newStatus = $validated['status'];

        // Customers can only cancel their bookings
        if ($user->id === $booking->user_id && !$user->isAdmin()) {
            if ($newStatus !== 'cancelled') {
                abort(403, 'Customers can only cancel bookings.');
            }
        } elseif ($user->id !== $booking->business?->owner_id && !$user->isAdmin()) {
            abort(403, 'Unauthorized');
        }

        $booking->update([
            'status' => $newStatus,
            'business_response_notes' => $validated['business_response_notes'] ?? $booking->business_response_notes,
            'payment_status' => ($newStatus === 'completed' || $newStatus === 'confirmed') ? 'paid' : $booking->payment_status,
        ]);

        // Notify customer about status change
        $statusMsg = match ($newStatus) {
            'confirmed' => 'Your booking has been confirmed by the business!',
            'rejected' => 'Your booking request could not be accepted.',
            'cancelled' => 'Your booking has been cancelled.',
            'completed' => 'Your booking has been marked as completed. We hope you had a great experience!',
            default => 'Your booking status has been updated.',
        };

        Notification::create([
            'user_id' => $booking->user_id,
            'title' => "Booking {$newStatus} (#{$booking->booking_reference})",
            'message' => ($booking->business?->name ?? 'SR Tes Chor') . ": {$statusMsg}",
            'type' => 'booking',
            'link' => '/bookings',
        ]);

        return response()->json([
            'message' => "Booking status updated to {$newStatus}",
            'booking' => $booking,
        ]);
    }

    /**
     * Parse any human-readable or 12/24-hour time string into MySQL valid H:i:s
     */
    private function formatBookingTime(?string $rawTime): string
    {
        if (empty($rawTime)) {
            return '09:00:00';
        }

        // Match 12-hour or 24-hour patterns like "08:30 AM", "5:00 AM", "14:30", "08:30"
        if (preg_match('/(\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)?)/i', $rawTime, $matches)) {
            $timestamp = strtotime($matches[1]);
            if ($timestamp !== false) {
                return date('H:i:s', $timestamp);
            }
        }

        $timestamp = strtotime($rawTime);
        if ($timestamp !== false) {
            return date('H:i:s', $timestamp);
        }

        return '09:00:00';
    }
}

