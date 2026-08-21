<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TravelPackage extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'includes' => 'array',
        'is_active' => 'boolean',
    ];
}
