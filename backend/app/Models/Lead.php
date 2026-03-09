<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Lead extends Model
{
    use HasFactory;

    protected $fillable = [
        'vlc_vid',
        'user_id',
        'product_id',
        'name',
        'email',
        'phone',
        'company_name',
        'source',
        'status',
        'score',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_content',
        'utm_term',
        'page_views',
        'time_on_site',
        'scroll_depth',
        'device_type',
        'is_business',
        'message',
        'assigned_staff_id',
        'converted_at',
        'last_contacted_at',
    ];

    protected function casts(): array
    {
        return [
            'is_business' => 'boolean',
            'converted_at' => 'datetime',
            'last_contacted_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    // ============================================
    // CONSTANTS
    // ============================================

    const STATUSES = [
        'new' => 'New',
        'contacted' => 'Contacted',
        'qualified' => 'Qualified',
        'proposal' => 'Proposal',
        'converted' => 'Converted',
        'lost' => 'Lost',
        'spam' => 'Spam',
    ];

    const SOURCES = [
        'plan_cta' => 'Plan CTA Button',
        'coverage_checker' => 'Coverage Checker',
        'quote_form' => 'Quote Form',
        'newsletter' => 'Newsletter',
        'booking_partial' => 'Booking - Partial',
        'contact_form' => 'Contact Form',
        'whatsapp' => 'WhatsApp',
        'phone_call' => 'Phone Call',
        'referral' => 'Referral',
        'organic' => 'Organic',
        'paid_ad' => 'Paid Advertisement',
        'social_media' => 'Social Media',
        'other' => 'Other',
    ];

    // ============================================
    // LEAD SCORING POINTS
    // ============================================

    const SCORE_POINTS = [
        'has_email' => 10,
        'has_phone' => 10,
        'source_booking_partial' => 25,
        'source_quote_form' => 20,
        'source_plan_cta' => 15,
        'has_product_interest' => 10,
        'is_business' => 5,
        'has_message' => 5,
        'utm_paid_traffic' => 5,
        'page_views_max' => 10, // 2 points per page view, max 10
    ];

    // ============================================
    // RELATIONSHIPS
    // ============================================

    /**
     * Get the user associated with this lead
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the product associated with this lead
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the staff member assigned to this lead
     */
    public function assignedStaff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_staff_id');
    }

    /**
     * Get all visits for this lead
     */
    public function visits(): HasMany
    {
        return $this->hasMany(LeadVisit::class);
    }

    // ============================================
    // SCOPES
    // ============================================

    /**
     * Scope to get new leads
     */
    public function scopeNew($query)
    {
        return $query->where('status', 'new');
    }

    /**
     * Scope to get leads by status
     */
    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to get leads by source
     */
    public function scopeSource($query, $source)
    {
        return $query->where('source', $source);
    }

    /**
     * Scope to get hot leads (score >= 50)
     */
    public function scopeHot($query)
    {
        return $query->where('score', '>=', 50);
    }

    /**
     * Scope to get leads assigned to a specific staff
     */
    public function scopeAssignedTo($query, $staffId)
    {
        return $query->where('assigned_staff_id', $staffId);
    }

    /**
     * Scope to get unassigned leads
     */
    public function scopeUnassigned($query)
    {
        return $query->whereNull('assigned_staff_id');
    }

    /**
     * Scope to filter by date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Scope to search by name, email, or phone
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%")
              ->orWhere('phone', 'like', "%{$search}%")
              ->orWhere('company_name', 'like', "%{$search}%");
        });
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
     * Get the source label
     */
    public function getSourceLabelAttribute(): string
    {
        return self::SOURCES[$this->source] ?? $this->source;
    }

    /**
     * Get score level based on score value
     */
    public function getScoreLevelAttribute(): string
    {
        if ($this->score >= 75) return 'Hot';
        if ($this->score >= 50) return 'Warm';
        if ($this->score >= 25) return 'Cool';
        return 'Cold';
    }

    /**
     * Get score color based on score value
     */
    public function getScoreColorAttribute(): string
    {
        if ($this->score >= 75) return '#ef4444'; // red
        if ($this->score >= 50) return '#f59e0b'; // orange
        if ($this->score >= 25) return '#3b82f6'; // blue
        return '#6b7280'; // gray
    }

    // ============================================
    // LEAD SCORING METHODS
    // ============================================

    /**
     * Calculate and update lead score
     */
    public function calculateScore(): int
    {
        $score = 0;

        // Has email: +10
        if (!empty($this->email)) {
            $score += self::SCORE_POINTS['has_email'];
        }

        // Has phone: +10
        if (!empty($this->phone)) {
            $score += self::SCORE_POINTS['has_phone'];
        }

        // Source-based scoring
        switch ($this->source) {
            case 'booking_partial':
                $score += self::SCORE_POINTS['source_booking_partial'];
                break;
            case 'quote_form':
                $score += self::SCORE_POINTS['source_quote_form'];
                break;
            case 'plan_cta':
                $score += self::SCORE_POINTS['source_plan_cta'];
                break;
        }

        // Has product interest: +10
        if (!empty($this->product_id)) {
            $score += self::SCORE_POINTS['has_product_interest'];
        }

        // Is business: +5
        if ($this->is_business) {
            $score += self::SCORE_POINTS['is_business'];
        }

        // Has message: +5
        if (!empty($this->message)) {
            $score += self::SCORE_POINTS['has_message'];
        }

        // UTM tracked (paid traffic): +5
        if ($this->isPaidTraffic()) {
            $score += self::SCORE_POINTS['utm_paid_traffic'];
        }

        // Page views: 2 points per page view (max 10)
        $pageViewsScore = min($this->page_views * 2, self::SCORE_POINTS['page_views_max']);
        $score += $pageViewsScore;

        // Update the score
        $this->score = $score;
        $this->save();

        return $score;
    }

    /**
     * Check if the lead came from paid traffic
     */
    public function isPaidTraffic(): bool
    {
        $paidSources = ['paid_ad', 'google', 'bing', 'facebook', 'instagram', 'linkedin'];
        $paidMediums = ['cpc', 'ppc', 'paid', 'banner', 'display'];

        $utmSource = strtolower($this->utm_source ?? '');
        $utmMedium = strtolower($this->utm_medium ?? '');

        foreach ($paidSources as $source) {
            if (str_contains($utmSource, $source)) {
                return true;
            }
        }

        foreach ($paidMediums as $medium) {
            if (str_contains($utmMedium, $medium)) {
                return true;
            }
        }

        return false;
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    /**
     * Mark lead as contacted
     */
    public function markAsContacted(): void
    {
        $this->update([
            'status' => 'contacted',
            'last_contacted_at' => now(),
        ]);
    }

    /**
     * Mark lead as qualified
     */
    public function markAsQualified(): void
    {
        $this->update(['status' => 'qualified']);
    }

    /**
     * Mark lead as proposal
     */
    public function markAsProposal(): void
    {
        $this->update(['status' => 'proposal']);
    }

    /**
     * Mark lead as converted
     */
    public function markAsConverted(): void
    {
        $this->update([
            'status' => 'converted',
            'converted_at' => now(),
        ]);
    }

    /**
     * Mark lead as lost
     */
    public function markAsLost(string $reason = null): void
    {
        $this->update(['status' => 'lost']);
    }

    /**
     * Assign lead to a staff member
     */
    public function assignTo(int $staffId): void
    {
        $this->update(['assigned_staff_id' => $staffId]);
    }

    /**
     * Find duplicate leads by email or phone
     */
    public static function findDuplicates(string $email = null, string $phone = null): \Illuminate\Database\Eloquent\Collection
    {
        return self::where(function ($query) use ($email, $phone) {
            if ($email) {
                $query->orWhere('email', $email);
            }
            if ($phone) {
                $query->orWhere('phone', $phone);
            }
        })->where('status', '!=', 'spam')->get();
    }

    /**
     * Merge duplicate leads into this one
     */
    public function mergeWith(Lead $otherLead): void
    {
        // Update visits to point to this lead
        $otherLead->visits()->update(['lead_id' => $this->id]);

        // Merge data if this lead doesn't have it
        $updates = [];
        if (empty($this->name) && !empty($otherLead->name)) {
            $updates['name'] = $otherLead->name;
        }
        if (empty($this->phone) && !empty($otherLead->phone)) {
            $updates['phone'] = $otherLead->phone;
        }
        if (empty($this->company_name) && !empty($otherLead->company_name)) {
            $updates['company_name'] = $otherLead->company_name;
        }

        // Add page views and time on site
        $updates['page_views'] = $this->page_views + $otherLead->page_views;
        $updates['time_on_site'] = $this->time_on_site + $otherLead->time_on_site;

        // Keep the highest score
        $updates['score'] = max($this->score, $otherLead->score);

        if (!empty($updates)) {
            $this->update($updates);
        }

        // Delete the other lead
        $otherLead->delete();
    }

    /**
     * Get the next available staff member for lead assignment
     * (Staff with the least number of active leads)
     */
    public static function getNextAvailableStaff(): ?User
    {
        return User::role(['admin', 'staff', 'sales'])
            ->where('is_active', true)
            ->withCount(['leads' => function ($query) {
                $query->whereIn('status', ['new', 'contacted', 'qualified', 'proposal']);
            }])
            ->orderBy('leads_count', 'asc')
            ->first();
    }

    /**
     * Auto-assign this lead to the least busy staff member
     */
    public function autoAssign(): bool
    {
        $staff = self::getNextAvailableStaff();

        if ($staff) {
            $this->assignTo($staff->id);
            return true;
        }

        return false;
    }

    /**
     * Generate unique visitor ID
     */
    public static function generateVisitorId(): string
    {
        return 'vlc_' . Str::uuid()->toString();
    }
}

