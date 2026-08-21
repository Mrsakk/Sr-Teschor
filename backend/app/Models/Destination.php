<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Destination extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'created_by',
        'name',
        'khmer_name',
        'slug',
        'description',
        'short_description',
        'address',
        'latitude',
        'longitude',
        'entrance_fee',
        'fee_notes',
        'opening_time',
        'closing_time',
        'best_time',
        'phone',
        'website',
        'facilities',
        'rating',
        'review_count',
        'views_count',
        'is_featured',
        'is_hidden_gem',
        'status',
    ];

    protected $casts = [
        'facilities' => 'array',
        'entrance_fee' => 'decimal:2',
        'rating' => 'decimal:2',
        'is_featured' => 'boolean',
        'is_hidden_gem' => 'boolean',
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function images()
    {
        return $this->hasMany(DestinationImage::class)->orderBy('display_order');
    }

    public function primaryImage()
    {
        return $this->hasOne(DestinationImage::class)->where('is_primary', true);
    }

    public function reviews()
    {
        return $this->morphMany(Review::class, 'reviewable');
    }

    public function favorites()
    {
        return $this->morphMany(Favorite::class, 'favoritable');
    }

    public function tripItems()
    {
        return $this->hasMany(TripItem::class);
    }
}
