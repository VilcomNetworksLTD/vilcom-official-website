<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JobVacancy extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'department',
        'location',
        'type',
        'description',
        'requirements',
        'status',
        'deadline',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'requirements' => 'array',
            'deadline'     => 'date',
        ];
    }

    const STATUSES = [
        'active'  => 'Active',
        'closed'  => 'Closed',
        'draft'   => 'Draft',
    ];

    const TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(CareerApplication::class, 'job_title', 'title');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
