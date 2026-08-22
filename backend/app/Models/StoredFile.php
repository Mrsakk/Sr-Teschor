<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoredFile extends Model
{
    protected $fillable = [
        'path',
        'mime',
        'data',
    ];
}
