<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Payment;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SubscriptionController extends Controller
{
    public function plans()
    {
        return response()->json([
            'plans' => [
                [
                    'id' => 'free',
                    'name' => 'FREE',
                    'price' => 0,
                    'period' => 'Forever',
                    'description' => 'Essential presence for local businesses and emerging artisans in Siem Reap.',
                    'features' => [
                        'Basic Business Profile',
                        'Up to 5 Photos in Gallery',
                        'Listed in Business Directory',
                        'Customer Reviews & Ratings',
                        'Direct Customer Messaging',
                    ],
                    'popular' => false,
                ],
                [
                    'id' => 'pro',
                    'name' => 'PRO',
                    'price' => 10,
                    'period' => 'per month',
                    'description' => 'Boost bookings, create special discounts, and rank higher in search results.',
                    'features' => [
                        'Featured In Category Listings',
                        'Unlimited Photo Uploads',
                        'Promotions & Discount Creation',
                        'Business Performance Analytics',
                        'Priority Customer Support',
                        'Direct Booking Management',
                    ],
                    'popular' => true,
                ],
                [
                    'id' => 'premium',
                    'name' => 'PREMIUM',
                    'price' => 20,
                    'period' => 'per month',
                    'description' => 'Maximum exposure with Homepage Spotlight, Top Search badge, and VIP analytics.',
                    'features' => [
                        'Homepage Hero Feature Spotlight',
                        '#1 Placement in Top Search Results',
                        'Gold "Verified Partner" Badge',
                        'Unlimited Photos & Services',
                        'Advanced Customer Insights & Reports',
                        'Dedicated Account Manager',
                        'Zero Booking Commission Fee',
                    ],
                    'popular' => false,
                ],
            ]
        ]);
    }

    public function upgrade(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'business_id' => 'required|exists:businesses,id',
            'plan' => 'required|in:free,pro,premium',
            'payment_method' => 'nullable|string',
        ]);

        $business = Business::findOrFail($validated['business_id']);

        if ($business->owner_id !== $user->id && !$user->isAdmin()) {
            abort(403, 'Unauthorized');
        }

        $planPrices = [
            'free' => 0.00,
            'pro' => 10.00,
            'premium' => 20.00,
        ];

        $price = $planPrices[$validated['plan']];

        // Expire previous subscriptions
        Subscription::where('business_id', $business->id)->update(['status' => 'expired']);

        $subscription = Subscription::create([
            'business_id' => $business->id,
            'plan' => $validated['plan'],
            'price' => $price,
            'billing_cycle' => 'monthly',
            'start_date' => now()->toDateString(),
            'end_date' => $validated['plan'] === 'free' ? null : now()->addMonth()->toDateString(),
            'status' => 'active',
        ]);

        // Update business model
        $business->update([
            'subscription_plan' => $validated['plan'],
            'is_featured' => ($validated['plan'] === 'premium' || $validated['plan'] === 'pro'),
        ]);

        // Record revenue if paid
        if ($price > 0) {
            Payment::create([
                'user_id' => $user->id,
                'business_id' => $business->id,
                'amount' => $price,
                'payment_method' => $validated['payment_method'] ?? 'ABA Payway',
                'transaction_id' => 'SUB-' . strtoupper(Str::random(8)),
                'type' => 'subscription',
                'status' => 'completed',
                'description' => ucfirst($validated['plan']) . " Plan Subscription for {$business->name}",
            ]);
        }

        return response()->json([
            'message' => "Successfully upgraded {$business->name} to {$validated['plan']} plan!",
            'business' => $business->fresh(['activeSubscription']),
            'subscription' => $subscription,
        ]);
    }
}
