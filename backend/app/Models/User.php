<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Spatie\Activitylog\LogOptions;

class User extends Authenticatable
{
    use HasApiTokens,
        HasFactory,
        Notifiable,
        HasRoles,
        SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        // Basic Info
        'name',
        'email',
        'password',
        'phone',
        'secondary_phone',

        // Address
        'address',
        'city',
        'county',
        'postal_code',
        'country',

        // Business Info
        'company_name',
        'company_registration',
        'tax_pin',
        'customer_type',

        // Profile
        'avatar',
        'bio',
        'date_of_birth',
        'gender',

        // Status
        'status',
        'suspended_at',
        'suspension_reason',

        // Security
        'two_factor_secret',
        'two_factor_recovery_codes',
        'two_factor_enabled',
        'two_factor_confirmed_at',

        // Preferences
        'preferences',
        'timezone',
        'language',

        // Staff fields
        'employee_id',
        'department',
        'commission_rate',
        'is_team_leader',
        'reports_to',

        // Tracking
        'last_login_at',
        'last_login_ip',
        'last_login_user_agent',

        // Verification
        'email_verified_at',
        'phone_verified_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'password_reset_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_enabled' => 'boolean',
            'two_factor_confirmed_at' => 'datetime',
            'suspended_at' => 'datetime',
            'last_login_at' => 'datetime',
            'date_of_birth' => 'date',
            'preferences' => 'array',
            'commission_rate' => 'decimal:2',
            'is_team_leader' => 'boolean',
            'password_reset_expires_at' => 'datetime',
        ];
    }

    /**
     * Activity log configuration
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'name',
                'email',
                'phone',
                'status',
                'address',
                'customer_type',
                'department',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    // ============================================
    // RELATIONSHIPS
    // ============================================

    /**
     * Get the user's subscriptions
     */
    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Get active subscriptions only
     */
    public function activeSubscriptions()
    {
        return $this->hasMany(Subscription::class)->where('status', 'active');
    }

    /**
     * Get the user's invoices
     */
    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    /**
     * Get the user's payments
     */
    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get the user's support tickets
     */
    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }


    
    /**
     * Get the user's login history
     */
    public function loginHistories()
    {
        return $this->hasMany(LoginHistory::class);
    }

    /**
     * Get the user's activities
     */
    public function activities()
    {
        return $this->hasMany(UserActivity::class);
    }

    /**
     * Get the staff members reporting to this user
     */
    public function subordinates()
    {
        return $this->hasMany(User::class, 'reports_to');
    }

    /**
     * Get the user's supervisor
     */
    public function supervisor()
    {
        return $this->belongsTo(User::class, 'reports_to');
    }

    /**
     * Get the user's hosting accounts
     */
    public function hostingAccounts()
    {
        return $this->hasMany(HostingAccount::class);
    }

    /**
     * Get the user's domains
     */
    public function domains()
    {
        return $this->hasMany(Domain::class);
    }

    /**
     * Get the user's bookings
     */
    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Get the user's staff availability (if staff member)
     */
    public function availabilities()
    {
        return $this->hasMany(StaffAvailability::class);
    }

    // ============================================
    // SCOPES
    // ============================================

    /**
     * Scope to get only active users
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope to get inactive users
     */
    public function scopeInactive($query)
    {
        return $query->where('status', 'inactive');
    }

    /**
     * Scope to get suspended users
     */
    public function scopeSuspended($query)
    {
        return $query->where('status', 'suspended');
    }

    /**
     * Scope to get pending verification users
     */
    public function scopePendingVerification($query)
    {
        return $query->where('status', 'pending_verification');
    }

    /**
     * Scope to get clients only
     */
    public function scopeClients($query)
    {
        return $query->role('client');
    }

    /**
     * Scope to get staff only
     */
    public function scopeStaff($query)
    {
        return $query->role('staff');
    }

    /**
     * Scope to get admins only
     */
    public function scopeAdmins($query)
    {
        return $query->role('admin');
    }

    /**
     * Scope to get individual customers
     */
    public function scopeIndividuals($query)
    {
        return $query->where('customer_type', 'individual');
    }

    /**
     * Scope to get business customers
     */
    public function scopeBusinesses($query)
    {
        return $query->where('customer_type', 'business');
    }

    /**
     * Scope to get verified users
     */
    public function scopeVerified($query)
    {
        return $query->whereNotNull('email_verified_at');
    }

    /**
     * Scope to filter by department
     */
    public function scopeByDepartment($query, $department)
    {
        return $query->where('department', $department);
    }

    // ============================================
    // ACCESSOR & MUTATORS
    // ============================================

    /**
     * Get the user's full name with title
     */
    public function getFullNameAttribute()
    {
        return $this->name;
    }

    /**
     * Get user's display name (company name for business, personal name for individual)
     */
    public function getDisplayNameAttribute()
    {
        if ($this->customer_type === 'business' && $this->company_name) {
            return $this->company_name;
        }
        return $this->name;
    }

    /**
     * Get formatted phone number
     */
    public function getFormattedPhoneAttribute()
    {
        if (!$this->phone) {
            return null;
        }

        // Convert to international format
        if (substr($this->phone, 0, 1) === '0') {
            return '+254' . substr($this->phone, 1);
        }

        return $this->phone;
    }

    /**
     * Get user's avatar URL
     */
    public function getAvatarUrlAttribute()
    {
        if ($this->avatar) {
            return url('storage/' . $this->avatar);
        }

        // Generate initials avatar
        $initials = $this->getInitials();
        return "https://ui-avatars.com/api/?name={$initials}&size=200&background=random";
    }

    /**
     * Check if user is verified
     */
    public function getIsVerifiedAttribute()
    {
        return !is_null($this->email_verified_at);
    }

    /**
     * Check if user has 2FA enabled
     */
    public function getHas2faEnabledAttribute()
    {
        return $this->two_factor_enabled && !is_null($this->two_factor_confirmed_at);
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    /**
     * Get user initials for avatar
     */
    public function getInitials()
    {
        $words = explode(' ', $this->name);
        if (count($words) >= 2) {
            return strtoupper(substr($words[0], 0, 1) . substr($words[1], 0, 1));
        }
        return strtoupper(substr($this->name, 0, 2));
    }

    /**
     * Check if user is a client
     */
    public function isClient()
    {
        return $this->hasRole('client');
    }

    /**
     * Check if user is staff
     */
    public function isStaff()
    {
        return $this->hasRole('staff');
    }

    /**
     * Check if user is admin
     */
    public function isAdmin()
    {
        return $this->hasRole('admin');
    }

    /**
     * Check if user is active
     */
    public function isActive()
    {
        return $this->status === 'active';
    }

    /**
     * Check if user is suspended
     */
    public function isSuspended()
    {
        return $this->status === 'suspended';
    }

    /**
     * Suspend the user
     */
    public function suspend($reason = null)
    {
        $this->update([
            'status' => 'suspended',
            'suspended_at' => now(),
            'suspension_reason' => $reason,
        ]);

        return $this;
    }

    /**
     * Activate/unsuspend the user
     */
    public function activate()
    {
        $this->update([
            'status' => 'active',
            'suspended_at' => null,
            'suspension_reason' => null,
        ]);

        return $this;
    }

    /**
     * Deactivate the user
     */
    public function deactivate()
    {
        $this->update(['status' => 'inactive']);

        return $this;
    }

    /**
     * Record login
     */
    public function recordLogin($request)
    {
        $this->update([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
            'last_login_user_agent' => $request->userAgent(),
        ]);

        // Create login history
        LoginHistory::create([
            'user_id' => $this->id,
            'email' => $this->email,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'device_type' => $this->detectDeviceType($request->userAgent()),
            'browser' => $this->detectBrowser($request->userAgent()),
            'platform' => $this->detectPlatform($request->userAgent()),
            'status' => 'success',
            'logged_in_at' => now(),
        ]);
    }

    /**
     * Detect device type from user agent
     */
    private function detectDeviceType($userAgent)
    {
        if (preg_match('/mobile/i', $userAgent)) {
            return 'mobile';
        } elseif (preg_match('/tablet/i', $userAgent)) {
            return 'tablet';
        }
        return 'desktop';
    }

    /**
     * Detect browser from user agent
     */
    private function detectBrowser($userAgent)
    {
        if (preg_match('/Firefox/i', $userAgent)) {
            return 'Firefox';
        } elseif (preg_match('/Chrome/i', $userAgent)) {
            return 'Chrome';
        } elseif (preg_match('/Safari/i', $userAgent)) {
            return 'Safari';
        } elseif (preg_match('/Edge/i', $userAgent)) {
            return 'Edge';
        }
        return 'Unknown';
    }

    /**
     * Detect platform from user agent
     */
    private function detectPlatform($userAgent)
    {
        if (preg_match('/Windows/i', $userAgent)) {
            return 'Windows';
        } elseif (preg_match('/Mac/i', $userAgent)) {
            return 'macOS';
        } elseif (preg_match('/Linux/i', $userAgent)) {
            return 'Linux';
        } elseif (preg_match('/Android/i', $userAgent)) {
            return 'Android';
        } elseif (preg_match('/iOS/i', $userAgent)) {
            return 'iOS';
        }
        return 'Unknown';
    }

    /**
     * Get user's notification preferences
     */
    public function getNotificationPreferences($key = null)
    {
        $preferences = $this->preferences ?? [];
        $notifications = $preferences['notifications'] ?? [
            'email' => true,
            'sms' => true,
            'in_app' => true,
            'marketing' => false,
        ];

        return $key ? ($notifications[$key] ?? null) : $notifications;
    }

    /**
     * Update notification preferences
     */
    public function updateNotificationPreferences(array $preferences)
    {
        $current = $this->preferences ?? [];
        $current['notifications'] = array_merge(
            $current['notifications'] ?? [],
            $preferences
        );

        $this->update(['preferences' => $current]);
    }

    /**
     * Get total outstanding balance
     */
    public function getTotalOutstandingBalance()
    {
        return $this->invoices()
            ->whereIn('status', ['pending', 'overdue'])
            ->sum('total_amount');
    }

    /**
     * Get active subscriptions count
     */
    public function getActiveSubscriptionsCount()
    {
        return $this->activeSubscriptions()->count();
    }

    /**
     * Get open tickets count
     */
    public function getOpenTicketsCount()
    {
        return $this->tickets()
            ->whereIn('status', ['open', 'in_progress'])
            ->count();
    }

    // ============================================
    // USER RESOURCE HELPER METHODS
    // These methods are used by UserResource for conditional data loading
    // ============================================

    /**
     * Determine if we should show detailed information
     *
     * @return bool
     */
    public function shouldShowDetails(): bool
    {
        if (!auth()->check()) {
            return false;
        }

        $currentUser = auth()->user();

        // Own profile
        if ($currentUser->id === $this->id) {
            return true;
        }

        // Admin can see all
        if ($currentUser->hasRole('admin')) {
            return true;
        }

        // Staff can see client details
        if ($currentUser->hasRole('staff') && $this->hasRole('client')) {
            return true;
        }

        return false;
    }

    /**
     * Determine if we should show sensitive data
     *
     * @return bool
     */
    public function shouldShowSensitiveData(): bool
    {
        if (!auth()->check()) {
            return false;
        }

        $currentUser = auth()->user();

        // Own profile
        if ($currentUser->id === $this->id) {
            return true;
        }

        // Admin only
        if ($currentUser->hasRole('admin')) {
            return true;
        }

        return false;
    }

    /**
     * Determine if we should show statistics
     *
     * @return bool
     */
    public function shouldShowStats(): bool
    {
        return $this->shouldShowDetails();
    }

    /**
     * Check if user is staff or admin or other privileged roles
     *
     * @return bool
     */
    public function isStaffOrAdmin(): bool
    {
        return $this->hasAnyRole(['staff', 'admin', 'sales', 'technical_support', 'web_developer', 'content_manager']);
    }

    // ============================================
    // PASSWORD RESET METHODS
    // ============================================

    /**
     * Determine if the user can reset their password.
     *
     * @return bool
     */
    public function canResetPassword(): bool
    {
        // Can only reset password if account is not banned
        return $this->status !== 'banned';
    }

    /**
     * Send the password reset notification.
     *
     * @param string $token
     * @return void
     */
    public function sendPasswordResetNotification($token): void
    {
        $url = config('app.frontend_url') . '/auth/reset-password?token=' . $token;

        $this->notify(new \App\Notifications\PasswordResetNotification($url));
    }

    /**
     * Send email verification notification.
     *
     * @return void
     */
    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new \App\Notifications\EmailVerificationNotification());
    }
}
