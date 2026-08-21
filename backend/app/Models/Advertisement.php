<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Advertisement extends Model
{
    use HasFactory;

    protected $fillable = [
        'business_id',
        'title',
        'image',
        'link_url',
        'placement',
        'impressions',
        'clicks',
        'price',
        'start_date',
        'end_date',
        'status',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'price' => 'decimal:2',
    ];

    protected $appends = [
        'days_remaining',
        'ctr',
        'is_expiring_soon',
    ];

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    /**
     * Calculate remaining days until ad expiration.
     */
    public function getDaysRemainingAttribute()
    {
        if (!$this->end_date) return 0;
        $end = \Carbon\Carbon::parse($this->end_date)->endOfDay();
        $now = now();
        if ($now->greaterThan($end)) return 0;
        return (int) $now->diffInDays($end, false);
    }

    /**
     * Calculate Click-Through Rate (CTR) percentage.
     */
    public function getCtrAttribute()
    {
        if ($this->impressions == 0) return 0;
        return round(($this->clicks / $this->impressions) * 100, 2);
    }

    /**
     * Check if the ad is expiring within 2 days.
     */
    public function getIsExpiringSoonAttribute()
    {
        return $this->status === 'active' && $this->days_remaining > 0 && $this->days_remaining <= 2;
    }

    /**
     * Scope active advertisements.
     */
    public function scopeActive($query)
    {
        $today = now()->toDateString();
        return $query->where('status', 'active')
            ->where('start_date', '<=', $today)
            ->where('end_date', '>=', $today);
    }
}
