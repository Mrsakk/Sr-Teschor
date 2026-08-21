<?php

namespace App\Services;

use Illuminate\Support\Str;

class BakongKhqrService
{
    const NBC_EXCHANGE_RATE_KHR = 4100; // 1 USD = 4,100 KHR

    // Bakong Merchant Information for SR Tes Chor
    const MERCHANT_NAME = 'SR TES CHOR PLATFORM';
    const MERCHANT_CITY = 'SIEM REAP';
    const BAKONG_ACCOUNT_ID = 'srteschor@aclb';
    const MERCHANT_ID = 'SRT-009852';

    /**
     * Generate standard EMVCo-compliant Bakong KHQR QR string
     * 
     * @param float $amount Amount in USD
     * @param string $billNumber Reference Bill / Transaction number
     * @param string $currency 'USD' (840) or 'KHR' (116)
     * @param string|null $storeLabel Store or service label
     * @return array
     */
    public function generateKhqr(float $amount, string $billNumber, string $currency = 'USD', ?string $storeLabel = 'SR TesChor Booking'): array
    {
        $amountFormatted = number_format($amount, 2, '.', '');
        $amountKhr = (int) round($amount * self::NBC_EXCHANGE_RATE_KHR);

        $currencyCode = ($currency === 'KHR') ? '116' : '840';
        $transactionAmount = ($currency === 'KHR') ? (string)$amountKhr : $amountFormatted;

        // Build EMVCo TLV (Tag-Length-Value) string
        $rawPayload = '';

        // Tag 00: Payload Format Indicator
        $rawPayload .= $this->formatTlv('00', '01');

        // Tag 01: Point of Initiation Method (12 = Dynamic QR)
        $rawPayload .= $this->formatTlv('01', '12');

        // Tag 29: Merchant Account Information (Bakong Individual / Merchant Account)
        $bakongSub = $this->formatTlv('00', self::BAKONG_ACCOUNT_ID);
        $bakongSub .= $this->formatTlv('01', self::MERCHANT_ID);
        $rawPayload .= $this->formatTlv('29', $bakongSub);

        // Tag 52: Merchant Category Code (5999 = Miscellaneous General Merchandise / Tourism Services)
        $rawPayload .= $this->formatTlv('52', '5999');

        // Tag 53: Transaction Currency (840 = USD, 116 = KHR)
        $rawPayload .= $this->formatTlv('53', $currencyCode);

        // Tag 54: Transaction Amount
        $rawPayload .= $this->formatTlv('54', $transactionAmount);

        // Tag 58: Country Code (KH)
        $rawPayload .= $this->formatTlv('58', 'KH');

        // Tag 59: Merchant Name
        $rawPayload .= $this->formatTlv('59', self::MERCHANT_NAME);

        // Tag 60: Merchant City
        $rawPayload .= $this->formatTlv('60', self::MERCHANT_CITY);

        // Tag 62: Additional Data Field Template (Bill Number, Store Label, Reference)
        $additionalData = $this->formatTlv('01', $billNumber);
        if ($storeLabel) {
            $additionalData .= $this->formatTlv('03', substr($storeLabel, 0, 25));
        }
        $additionalData .= $this->formatTlv('07', 'SRT-' . strtoupper(Str::random(6)));
        $rawPayload .= $this->formatTlv('62', $additionalData);

        // Tag 63: CRC (Cyclic Redundancy Check) - 4 Hex characters
        $rawPayloadWithCrcTag = $rawPayload . '6304';
        $crcChecksum = $this->calculateCrc16($rawPayloadWithCrcTag);
        $finalQrString = $rawPayloadWithCrcTag . $crcChecksum;

        // Generate Deep Link & Web Redirect
        $md5Hash = md5($billNumber . '_' . $amountFormatted . '_' . config('app.key', 'srteschor'));
        $bakongDeepLink = "bakong://qr?data=" . urlencode($finalQrString);
        $checkoutWebUrl = "https://bakong.nbc.gov.kh/pay?qr=" . urlencode($finalQrString);

        return [
            'qr_string' => $finalQrString,
            'md5' => $md5Hash,
            'bill_number' => $billNumber,
            'amount_usd' => (float)$amountFormatted,
            'amount_khr' => $amountKhr,
            'exchange_rate' => self::NBC_EXCHANGE_RATE_KHR,
            'currency' => $currency,
            'merchant_name' => self::MERCHANT_NAME,
            'merchant_city' => self::MERCHANT_CITY,
            'bakong_account' => self::BAKONG_ACCOUNT_ID,
            'deep_link' => $bakongDeepLink,
            'checkout_url' => $checkoutWebUrl,
            'expires_at' => now()->addMinutes(10)->toIso8601String(),
            'created_at' => now()->toIso8601String(),
        ];
    }

    /**
     * Format Tag-Length-Value for EMVCo
     */
    private function formatTlv(string $tag, string $value): string
    {
        $length = str_pad((string)strlen($value), 2, '0', STR_PAD_LEFT);
        return $tag . $length . $value;
    }

    /**
     * Calculate CRC-16-CCITT (0xFFFF polynomial) standard used by EMVCo & Bakong KHQR
     */
    public function calculateCrc16(string $data): string
    {
        $crc = 0xFFFF;
        for ($i = 0; $i < strlen($data); $i++) {
            $crc ^= (ord($data[$i]) << 8);
            for ($j = 0; $j < 8; $j++) {
                if (($crc & 0x8000) !== 0) {
                    $crc = (($crc << 1) ^ 0x1021) & 0xFFFF;
                } else {
                    $crc = ($crc << 1) & 0xFFFF;
                }
            }
        }
        return strtoupper(str_pad(dechex($crc), 4, '0', STR_PAD_LEFT));
    }
}
