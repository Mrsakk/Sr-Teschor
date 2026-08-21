<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdminActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'action',
        'module',
        'target',
        'ip_address',
        'details',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public static function log($action, $module, $target = null, $details = null)
    {
        return self::create([
            'user_id' => auth()->id() ?? 1,
            'action' => $action,
            'module' => $module,
            'target' => $target,
            'ip_address' => request()->ip() ?? '127.0.0.1',
            'details' => is_array($details) ? json_encode($details) : $details,
        ]);
    }
}
