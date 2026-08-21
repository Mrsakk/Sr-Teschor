<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_reference',
        'user_id',
        'business_id',
        'service_id',
        'booking_date',
        'booking_time',
        'guests',
        'total_amount',
        'commission_amount',
        'contact_name',
        'contact_phone',
        'contact_email',
        'notes',
        'business_response_notes',
        'status',
        'payment_status',
    ];

    protected $casts = [
        'booking_date' => 'date',
        'total_amount' => 'decimal:2',
        'commission_amount' => 'decimal:2',
        'guests' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function service()
    {
        return $this->belongsTo(BusinessService::class, 'service_id');
    }
}
