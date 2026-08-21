<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Media extends Model
{
    use HasFactory;

    protected $table = 'media';

    protected $fillable = [
        'user_id',
        'title',
        'file_path',
        'file_type',
        'file_size',
        'category',
        'alt_text',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
