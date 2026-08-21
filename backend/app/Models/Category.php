<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'image',
        'icon',
        'type',
        'status',
        'display_order',
    ];

    public function destinations()
    {
        return $this->hasMany(Destination::class);
    }

    public function businesses()
    {
        return $this->hasMany(Business::class);
    }
}
