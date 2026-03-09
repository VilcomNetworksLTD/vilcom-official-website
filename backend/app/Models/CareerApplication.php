<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class CareerApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_number',
        'job_title',
        'full_name',
        'email',
        'phone',
        'linkedin_url',
        'portfolio_url',
        'cover_letter',
        'cv_path',
        'certificates_path',
        'additional_documents_path',
        'status',
        'hr_notes',
        'reviewed_by',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'reviewed_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    // ============================================
    // CONSTANTS
    // ============================================

    const STATUSES = [
        'pending' => 'Pending',
        'under_review' => 'Under Review',
        'shortlisted' => 'Shortlisted',
        'interviewed' => 'Interviewed',
        'rejected' => 'Rejected',
        'hired' => 'Hired',
        'withdrawn' => 'Withdrawn',
    ];

    const ALLOWED_FILE_TYPES = [
        'cv' => ['pdf', 'doc', 'docx'],
        'certificates' => ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
        'additional' => ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'zip'],
    ];

    const MAX_FILE_SIZES = [
        'cv' => 10 * 1024 * 1024, // 10MB
        'certificates' => 10 * 1024 * 1024, // 10MB
        'additional' => 20 * 1024 * 1024, // 20MB
    ];

    // ============================================
    // RELATIONSHIPS
    // ============================================

    /**
     * Get the user who reviewed this application
     */
    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    // ============================================
    // SCOPES
    // ============================================

    /**
     * Scope to get pending applications
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope to get applications by status
     */
    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to get applications by job title
     */
    public function scopeJobTitle($query, $jobTitle)
    {
        return $query->where('job_title', 'like', "%{$jobTitle}%");
    }

    /**
     * Scope to get recent applications
     */
    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    // ============================================
    // ACCESSORS & MUTATORS
    // ============================================

    /**
     * Get the status label
     */
    public function getStatusLabelAttribute(): string
    {
        return self::STATUSES[$this->status] ?? $this->status;
    }

    /**
     * Check if application can be reviewed
     */
    public function canReview(): bool
    {
        return in_array($this->status, ['pending', 'under_review', 'shortlisted', 'interviewed']);
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    /**
     * Generate a unique application number
     */
    public static function generateApplicationNumber(): string
    {
        $prefix = 'APP';
        $date = now()->format('Ym');
        $random = strtoupper(Str::random(6));
        
        return "{$prefix}-{$date}-{$random}";
    }

    /**
     * Mark application as under review
     */
    public function markAsUnderReview(int $reviewerId): void
    {
        $this->update([
            'status' => 'under_review',
            'reviewed_by' => $reviewerId,
            'reviewed_at' => now(),
        ]);
    }

    /**
     * Shortlist the applicant
     */
    public function shortlist(int $reviewerId, string $notes = null): void
    {
        $this->update([
            'status' => 'shortlisted',
            'reviewed_by' => $reviewerId,
            'reviewed_at' => now(),
            'hr_notes' => $notes,
        ]);
    }

    /**
     * Schedule interview
     */
    public function markInterviewed(int $reviewerId, string $notes = null): void
    {
        $this->update([
            'status' => 'interviewed',
            'reviewed_by' => $reviewerId,
            'reviewed_at' => now(),
            'hr_notes' => $notes,
        ]);
    }

    /**
     * Reject the applicant
     */
    public function reject(int $reviewerId, string $notes = null): void
    {
        $this->update([
            'status' => 'rejected',
            'reviewed_by' => $reviewerId,
            'reviewed_at' => now(),
            'hr_notes' => $notes,
        ]);
    }

    /**
     * Mark as hired
     */
    public function markHired(int $reviewerId, string $notes = null): void
    {
        $this->update([
            'status' => 'hired',
            'reviewed_by' => $reviewerId,
            'reviewed_at' => now(),
            'hr_notes' => $notes,
        ]);
    }

    /**
     * Get the CV file URL
     */
    public function getCvUrlAttribute(): ?string
    {
        return $this->cv_path ? asset('storage/' . $this->cv_path) : null;
    }

    /**
     * Get the certificates file URL
     */
    public function getCertificatesUrlAttribute(): ?string
    {
        return $this->certificates_path ? asset('storage/' . $this->certificates_path) : null;
    }

    /**
     * Get the additional documents URL
     */
    public function getAdditionalDocumentsUrlAttribute(): ?string
    {
        return $this->additional_documents_path ? asset('storage/' . $this->additional_documents_path) : null;
    }

    /**
     * Check if files are allowed for given type
     */
    public static function isFileTypeAllowed(string $fileType, string $extension): bool
    {
        return in_array(strtolower($extension), self::ALLOWED_FILE_TYPES[$fileType] ?? []);
    }

    /**
     * Check if file size is allowed for given type
     */
    public static function isFileSizeAllowed(string $fileType, int $size): bool
    {
        return $size <= (self::MAX_FILE_SIZES[$fileType] ?? 0);
    }
}

