<?php

namespace App\Services;

use App\Models\BusinessService;
use App\Models\Commission;
use App\Models\Promotion;
use App\Models\Setting;
use App\Models\TravelPackage;
use Illuminate\Support\Facades\Log;

class FinancialCalculationService
{
    /**
     * Calculate the entire financial breakdown for a booking.
     * Guaranteed server-side financial integrity.
     */
    public function calculateBookingTotals(
        int $serviceId, 
        int $quantity, 
        ?string $promoCode = null,
        bool $isPackage = false
    ): array {
        $quantity = max(1, $quantity);
        $unitPrice = 0;
        $businessId = null;
        $serviceName = '';
        $serviceType = 'tour';

        if ($isPackage) {
            $package = TravelPackage::findOrFail($serviceId);
            $unitPrice = (float) $package->selling_price;
            $serviceName = $package->name;
            $serviceType = 'package';
        } else {
            $service = BusinessService::with('business')->findOrFail($serviceId);
            $unitPrice = (float) $service->price;
            $businessId = $service->business_id;
            $serviceName = $service->name;
            $serviceType = $service->type ?? 'tour';
        }

        // 1. Calculate Subtotal
        $subtotal = $unitPrice * $quantity;

        // 2. Apply Discounts from DB
        $discountAmount = 0;
        $appliedPromo = null;
        if (!empty($promoCode)) {
            $cleanCode = strtoupper(trim($promoCode));
            $promo = Promotion::where('promo_code', $cleanCode)
                ->where('status', 'active')
                ->whereDate('start_date', '<=', now())
                ->whereDate('end_date', '>=', now())
                ->first();

            if ($promo) {
                $appliedPromo = $promo->promo_code;
                $discountStr = strtoupper($promo->discount);
                if (str_contains($discountStr, '%')) {
                    $percent = (float) preg_replace('/[^0-9.]/', '', $discountStr);
                    $discountAmount = ($subtotal * ($percent / 100));
                } else {
                    $fixed = (float) preg_replace('/[^0-9.]/', '', $discountStr);
                    $discountAmount = $fixed;
                }
            } elseif ($cleanCode === 'SIEMREAP20' || $cleanCode === 'WELCOME20') {
                // Built-in welcome promo codes
                $appliedPromo = $cleanCode;
                $discountAmount = $subtotal * 0.20;
            } elseif ($cleanCode === 'TESCHOR5') {
                $appliedPromo = $cleanCode;
                $discountAmount = 5.00;
            }
        }

        // Ensure discount doesn't exceed subtotal
        $discountAmount = min($discountAmount, $subtotal);

        // 3. Service Fee (from global settings or default $2)
        $serviceFeeSetting = Setting::where('key', 'default_service_fee')->value('value');
        $serviceFee = $serviceFeeSetting !== null ? (float) $serviceFeeSetting : 2.00;

        // 4. Calculate Customer Total in USD
        $totalAmount = max(0, ($subtotal - $discountAmount) + $serviceFee);

        // 5. Calculate Platform Commission
        $commissionRate = $this->getCommissionRate($businessId, $serviceType);
        $platformCommission = round($subtotal * ($commissionRate / 100), 2);

        // 6. Calculate Provider Payout
        $providerPayout = max(0, round($subtotal - $platformCommission - $discountAmount, 2));

        // 7. Calculate KHR Equivalent
        $exchangeRateSetting = Setting::where('key', 'usd_to_khr_rate')->value('value');
        $exchangeRate = $exchangeRateSetting ? (int) $exchangeRateSetting : 4100;
        $totalAmountKhr = round($totalAmount * $exchangeRate, -2); // Round to nearest 100 Riels

        return [
            'service_id' => $serviceId,
            'service_name' => $serviceName,
            'service_type' => $serviceType,
            'unit_price' => $unitPrice,
            'quantity' => $quantity,
            'subtotal' => round($subtotal, 2),
            'promo_code' => $appliedPromo,
            'discount_amount' => round($discountAmount, 2),
            'service_fee' => round($serviceFee, 2),
            'total_amount' => round($totalAmount, 2),
            'exchange_rate' => $exchangeRate,
            'total_amount_khr' => $totalAmountKhr,
            'commission_rate' => $commissionRate,
            'platform_commission' => $platformCommission,
            'platform_revenue' => round($platformCommission + $serviceFee, 2),
            'provider_payout' => $providerPayout,
            'currency' => 'USD',
        ];
    }

    private function getCommissionRate(?int $businessId, string $type): float
    {
        if ($businessId) {
            $commission = Commission::where('business_id', $businessId)
                ->where('type', $type)
                ->where('is_active', true)
                ->first();

            if ($commission && $commission->rate_percentage > 0) {
                return (float) $commission->rate_percentage;
            }
        }

        // Fallback to default by type
        $defaultCommission = Commission::whereNull('business_id')
            ->where('type', $type)
            ->where('is_active', true)
            ->first();

        if ($defaultCommission && $defaultCommission->rate_percentage > 0) {
            return (float) $defaultCommission->rate_percentage;
        }

        // Standard category defaults
        return match (strtolower($type)) {
            'tour' => 10.0,
            'guide' => 10.0,
            'transport' => 8.0,
            'experience' => 10.0,
            'ticket' => 5.0,
            'package' => 15.0,
            default => 10.0,
        };
    }
}
