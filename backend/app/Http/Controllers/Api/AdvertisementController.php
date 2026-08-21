<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Advertisement;
use App\Models\Business;
use App\Models\Notification;
use App\Models\Payment;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdvertisementController extends Controller
{
    /**
     * Get active advertisements for public display.
     */
    public function index(Request $request)
    {
        // Run light auto-expiry sweep on fetch
        $this->processExpiredAdsInternal();

        $today = now()->toDateString();

        $query = Advertisement::with('business')
            ->where('status', 'active')
            ->where('start_date', '<=', $today)
            ->where('end_date', '>=', $today);

        if ($request->filled('placement')) {
            $placements = explode(',', $request->input('placement'));
            $query->whereIn('placement', $placements);
        }

        if ($request->filled('business_id')) {
            $query->where('business_id', $request->input('business_id'));
        }

        $limit = min((int)$request->input('limit', 10), 50);
        $ads = $query->inRandomOrder()->take($limit)->get();

        // Increment impressions for fetched active ads
        if ($ads->isNotEmpty() && $request->boolean('track_impressions', true)) {
            Advertisement::whereIn('id', $ads->pluck('id'))->increment('impressions');
        }

        return response()->json([
            'status' => 'success',
            'data' => $ads,
        ]);
    }

    /**
     * Get all advertisements owned by the authenticated merchant's businesses (or all for admins).
     */
    public function myAdvertisements(Request $request)
    {
        $user = $request->user();
        $businessIds = Business::where('owner_id', $user->id)->pluck('id');

        // Run auto-expiry check
        $this->processExpiredAdsInternal();

        $query = Advertisement::with('business');
        if ($businessIds->isNotEmpty()) {
            $query->whereIn('business_id', $businessIds);
        }

        $ads = $query->latest()->get();

        $summary = [
            'total_ads' => $ads->count(),
            'active_ads' => $ads->where('status', 'active')->count(),
            'expired_ads' => $ads->where('status', 'expired')->count(),
            'total_impressions' => (int) $ads->sum('impressions'),
            'total_clicks' => (int) $ads->sum('clicks'),
            'avg_ctr' => $ads->sum('impressions') > 0
                ? round(($ads->sum('clicks') / $ads->sum('impressions')) * 100, 2)
                : 0,
        ];

        return response()->json([
            'status' => 'success',
            'summary' => $summary,
            'data' => $ads,
        ]);
    }

    /**
     * Self-service Ad Purchase via Bakong KHQR.
     */
    public function purchase(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'business_id' => 'required|exists:businesses,id',
            'title' => 'required|string|max:255',
            'image' => 'required|string',
            'link_url' => 'nullable|string',
            'placement' => 'required|in:hero_banner,search_top,destination_sidebar,business_sidebar',
            'duration_days' => 'required|integer|in:7,15,30,60,90',
            'price' => 'required|numeric|min:1',
            'payment_reference' => 'nullable|string',
        ]);

        $business = Business::findOrFail($validated['business_id']);

        $startDate = Carbon::today();
        $endDate = Carbon::today()->addDays((int) $validated['duration_days']);

        $linkUrl = $validated['link_url'] ?: "/businesses/{$business->slug}";

        DB::beginTransaction();
        try {
            // Process base64 image or URL
            $imagePath = $this->processImageValue($validated['image']);

            // 1. Create and instantly activate Advertisement
            $ad = Advertisement::create([
                'business_id' => $business->id,
                'title' => $validated['title'],
                'image' => $imagePath,
                'link_url' => $linkUrl,
                'placement' => $validated['placement'],
                'price' => $validated['price'],
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
                'impressions' => 0,
                'clicks' => 0,
                'status' => 'active',
            ]);

            $reference = (!empty($validated['payment_reference'])) ? $validated['payment_reference'] : ('KHQR-AD-' . strtoupper(Str::random(8)));

            // 2. Log Payment
            Payment::create([
                'user_id' => $user->id,
                'business_id' => $business->id,
                'amount' => $validated['price'],
                'payment_method' => 'khqr',
                'transaction_id' => $reference,
                'type' => 'advertisement',
                'status' => 'completed',
                'description' => "Advertisement Campaign: {$ad->placement} ({$validated['duration_days']} days)",
            ]);

            // 3. Create In-App Notification for User
            Notification::create([
                'user_id' => $user->id,
                'title' => '🎉 ផ្ទាំងពាណិជ្ជកម្មត្រូវបានដាក់ដំណើរការជោគជ័យ!',
                'message' => "យុទ្ធនាការ '{$ad->title}' លើទីតាំង {$ad->placement} ត្រូវបានដាក់ដំណើរការចាប់ពីថ្ងៃនេះរហូតដល់ {$endDate->format('d-M-Y')}។",
                'type' => 'promotion',
                'link' => '/business/dashboard',
            ]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'យុទ្ធនាការផ្សព្វផ្សាយពាណិជ្ជកម្មត្រូវបានដាក់ដំណើរការដោយស្វ័យប្រវត្តិ!',
                'data' => $ad->load('business'),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'ការដំណើរការយុទ្ធនាការមានបញ្ហា៖ ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Renew an existing advertisement campaign.
     */
    public function renew(Request $request, $id)
    {
        $user = $request->user();

        $validated = $request->validate([
            'duration_days' => 'required|integer|in:7,15,30,60,90',
            'price' => 'required|numeric|min:1',
            'payment_reference' => 'nullable|string',
        ]);

        $ad = Advertisement::findOrFail($id);

        $currentEnd = Carbon::parse($ad->end_date);
        $today = Carbon::today();

        // If already expired, start from today; otherwise extend current end_date
        $baseDate = ($currentEnd->isPast() || $ad->status !== 'active') ? $today : $currentEnd;
        $newEndDate = $baseDate->copy()->addDays((int) $validated['duration_days']);

        DB::beginTransaction();
        try {
            $ad->update([
                'start_date' => $today->toDateString(),
                'end_date' => $newEndDate->toDateString(),
                'status' => 'active',
                'price' => (float)$ad->price + (float)$validated['price'],
            ]);

            $reference = (!empty($validated['payment_reference'])) ? $validated['payment_reference'] : ('KHQR-RENEW-' . strtoupper(Str::random(8)));

            // Log Payment
            Payment::create([
                'user_id' => $user->id,
                'business_id' => $ad->business_id,
                'amount' => $validated['price'],
                'payment_method' => 'khqr',
                'transaction_id' => $reference,
                'type' => 'advertisement',
                'status' => 'completed',
                'description' => "Renewal: {$ad->title} (+{$validated['duration_days']} days)",
            ]);

            // Notification
            Notification::create([
                'user_id' => $user->id,
                'title' => '✅ ការបន្តកុងត្រាផ្សព្វផ្សាយជោគជ័យ!',
                'message' => "ផ្ទាំងពាណិជ្ជកម្ម '{$ad->title}' ត្រូវបានពន្យារហូតដល់ {$newEndDate->format('d-M-Y')}។",
                'type' => 'promotion',
                'link' => '/business/dashboard',
            ]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'បានបន្តកុងត្រាផ្សព្វផ្សាយជោគជ័យ!',
                'data' => $ad->fresh()->load('business'),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'បរាជ័យក្នុងការបន្តកុងត្រា៖ ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Track a click on an advertisement.
     */
    public function trackClick($id)
    {
        $ad = Advertisement::findOrFail($id);
        $ad->increment('clicks');

        return response()->json([
            'status' => 'success',
            'message' => 'Click tracked successfully',
            'clicks' => $ad->fresh()->clicks,
            'link_url' => $ad->link_url,
        ]);
    }

    /**
     * Check and expire ads, and send smart renewal reminders.
     */
    public function checkAndExpireAds()
    {
        $result = $this->processExpiredAdsInternal(true);

        return response()->json([
            'status' => 'success',
            'message' => 'Ads auto-expiry scan completed.',
            'results' => $result,
        ]);
    }

    /**
     * Internal processor for expired and expiring-soon advertisements.
     */
    protected function processExpiredAdsInternal($sendNotifications = true)
    {
        $today = Carbon::today()->toDateString();
        $expiringDate = Carbon::today()->addDays(2)->toDateString();

        $expiredCount = 0;
        $reminderCount = 0;

        // 1. Process Expired Ads (end_date < today and status = 'active')
        $expiredAds = Advertisement::with('business.owner')
            ->where('status', 'active')
            ->where('end_date', '<', $today)
            ->get();

        foreach ($expiredAds as $ad) {
            $ad->update(['status' => 'expired']);
            $expiredCount++;

            if ($sendNotifications && $ad->business && $ad->business->owner) {
                // Check if notification already sent today to avoid spam
                $alreadySent = Notification::where('user_id', $ad->business->owner_id)
                    ->where('title', 'LIKE', '%ផុតកំណត់%')
                    ->whereDate('created_at', $today)
                    ->exists();

                if (!$alreadySent) {
                    Notification::create([
                        'user_id' => $ad->business->owner_id,
                        'title' => "⏰ ផ្ទាំងពាណិជ្ជកម្ម '{$ad->title}' បានផុតកំណត់ហើយ",
                        'message' => "ផ្ទាំងពាណិជ្ជកម្មរបស់អ្នកបានបញ្ចប់កាលបរិច្ឆេទបង្ហាញហើយ។ សូមចុច 'បន្តកុងត្រា (Renew)' ឥឡូវនេះ ដើម្បីបន្តទាក់ទាញភ្ញៀវទេសចរ!",
                        'type' => 'alert',
                        'link' => '/business/dashboard',
                    ]);
                }
            }
        }

        // 2. Process Expiring-Soon Ads (end_date <= 2 days from now)
        $expiringAds = Advertisement::with('business.owner')
            ->where('status', 'active')
            ->where('end_date', '=', $expiringDate)
            ->get();

        foreach ($expiringAds as $ad) {
            $reminderCount++;

            if ($sendNotifications && $ad->business && $ad->business->owner) {
                $alreadySent = Notification::where('user_id', $ad->business->owner_id)
                    ->where('title', 'LIKE', '%ជិតផុតកំណត់%')
                    ->whereDate('created_at', $today)
                    ->exists();

                if (!$alreadySent) {
                    Notification::create([
                        'user_id' => $ad->business->owner_id,
                        'title' => "⚠️ រំលឹក៖ ផ្ទាំងពាណិជ្ជកម្ម '{$ad->title}' នឹងផុតកំណត់ក្នុង ២ ថ្ងៃទៀត",
                        'message' => "ដើម្បីកុំឱ្យដាច់ការផ្សព្វផ្សាយនៅលើវេបសាយ SR TesChor សូមបន្តកុងត្រាជាមុនឥឡូវនេះ។",
                        'type' => 'alert',
                        'link' => '/business/dashboard',
                    ]);
                }
            }
        }

        return [
            'expired_count' => $expiredCount,
            'reminder_count' => $reminderCount,
        ];
    }

    /**
     * Process base64 data URLs or standard image URLs and store in public storage.
     */
    private function processImageValue($imageInput)
    {
        if (is_string($imageInput) && preg_match('/^data:image\/(\w+);base64,/', $imageInput, $type)) {
            $imageBytes = substr($imageInput, strpos($imageInput, ',') + 1);
            $ext = strtolower($type[1]);

            if (!in_array($ext, ['jpg', 'jpeg', 'gif', 'png', 'webp'])) {
                $ext = 'jpg';
            }
            $decoded = base64_decode($imageBytes);

            if ($decoded !== false) {
                $fileName = 'ad_' . Str::random(16) . '.' . $ext;
                $path = 'uploads/advertisements/' . $fileName;
                Storage::disk('public')->put($path, $decoded);
                return url('storage/' . $path);
            }
        }

        return $imageInput;
    }
}

