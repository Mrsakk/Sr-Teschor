<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TripItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'trip_plan_id',
        'destination_id',
        'business_id',
        'custom_title',
        'visit_date',
        'day_number',
        'visit_order',
        'notes',
        'estimated_time',
        'estimated_distance',
    ];

    protected $casts = [
        'visit_date' => 'date',
        'day_number' => 'integer',
        'visit_order' => 'integer',
    ];

    public function tripPlan()
    {
        return $this->belongsTo(TripPlan::class);
    }

    public function destination()
    {
        return $this->belongsTo(Destination::class);
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
    }
}
