<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payout extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'payout_date' => 'datetime',
    ];

    public function business()
    {
        return $this->belongsTo(Business::class);
    }
}
