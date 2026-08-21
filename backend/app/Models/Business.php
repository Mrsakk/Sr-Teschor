<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Business extends Model
{
    use HasFactory;

    protected $fillable = [
        'owner_id',
        'category_id',
        'name',
        'khmer_name',
        'slug',
        'description',
        'short_description',
        'address',
        'location_code',
        'map_link',
        'latitude',
        'longitude',
        'phone',
        'email',
        'website',
        'logo',
        'cover_image',
        'gallery_images',
        'price_range',
        'opening_hours',
        'rating',
        'review_count',
        'views_count',
        'is_featured',
        'subscription_plan',
        'verification_status',
        'admin_notes',
        'status',
    ];

    protected $casts = [
        'gallery_images' => 'array',
        'rating' => 'decimal:2',
        'is_featured' => 'boolean',
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function services()
    {
        return $this->hasMany(BusinessService::class);
    }

    public function reviews()
    {
        return $this->morphMany(Review::class, 'reviewable');
    }

    public function favorites()
    {
        return $this->morphMany(Favorite::class, 'favoritable');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function promotions()
    {
        return $this->hasMany(Promotion::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function activeSubscription()
    {
        return $this->hasOne(Subscription::class)->where('status', 'active')->latestOfMany();
    }

    public function advertisements()
    {
        return $this->hasMany(Advertisement::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function tripItems()
    {
        return $this->hasMany(TripItem::class);
    }
}
