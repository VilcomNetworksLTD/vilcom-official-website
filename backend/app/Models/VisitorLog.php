<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VisitorLog extends Model
{
    protected $fillable = [
        'session_id',
        'ip_address',
        'url',
        'referrer',
        'user_agent',
        'country',
    ];
}
