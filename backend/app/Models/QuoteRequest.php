<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class QuoteRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'product_id',
        'quote_number',
        'service_type',
        'status',
        'general_info',
        'technical_requirements',
        'budget_range',
        'timeline',
        'preferred_start_date',
        'assigned_staff_id',
        'quoted_price',
        'staff_notes',
        'admin_response',
        'quoted_at',
        'responded_at',
        'customer_response',
        'customer_notes',
        'customer_responded_at',
        'subscription_id',
        'quote_valid_until',
        'contact_name',
        'contact_email',
        'contact_phone',
        'company_name',
        'additional_notes',
        'urgency',
        'source',
        'referral_source',
    ];

    protected function casts(): array
    {
        return [
            'general_info' => 'array',
            'technical_requirements' => 'array',
            'preferred_start_date' => 'date',
            'quoted_price' => 'decimal:2',
            'quoted_at' => 'datetime',
            'responded_at' => 'datetime',
            'customer_responded_at' => 'datetime',
            'quote_valid_until' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    // ============================================
    // CONSTANTS
    // ============================================

    const SERVICE_TYPES = [
        'internet_plan' => 'Internet Plan',
        'hosting_package' => 'Hosting Package',
        'web_development' => 'Web Development',
        'cloud_services' => 'Cloud Services',
        'cyber_security' => 'Cyber Security',
        'network_infrastructure' => 'Network Infrastructure',
        'isp_services' => 'ISP Services',
        'cpe_device' => 'CPE Device',
        'satellite_connectivity' => 'Satellite Connectivity',
        'media_services' => 'Media Services',
        'erp_services' => 'ERP Services',
        'smart_integration' => 'Smart Integration',
        'other' => 'Other',
    ];

    const STATUSES = [
        'pending' => 'Pending',
        'under_review' => 'Under Review',
        'quoted' => 'Quoted',
        'accepted' => 'Accepted',
        'rejected' => 'Rejected',
        'expired' => 'Expired',
        'converted_to_subscription' => 'Converted to Subscription',
    ];

    const URGENCY_LEVELS = [
        'low' => 'Low',
        'medium' => 'Medium',
        'high' => 'High',
        'critical' => 'Critical',
    ];

    const BUDGET_RANGES = [
        'under_10k' => 'Under KES 10,000',
        '10k_50k' => 'KES 10,000 - 50,000',
        '50k_100k' => 'KES 50,000 - 100,000',
        '100k_250k' => 'KES 100,000 - 250,000',
        '250k_500k' => 'KES 250,000 - 500,000',
        '500k_1m' => 'KES 500,000 - 1,000,000',
        '1m_5m' => 'KES 1,000,000 - 5,000,000',
        'over_5m' => 'Over KES 5,000,000',
        'flexible' => 'Flexible / Discuss',
    ];

    const TIMELINE_OPTIONS = [
        'asap' => 'As Soon As Possible',
        'within_1_month' => 'Within 1 Month',
        '1_3_months' => '1-3 Months',
        '3_6_months' => '3-6 Months',
        '6_12_months' => '6-12 Months',
        'flexible' => 'Flexible',
    ];

    // ============================================
    // RELATIONSHIPS
    // ============================================

    /**
     * Get the user who submitted the quote request
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the product associated with this quote request
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the staff member assigned to handle this quote
     */
    public function assignedStaff(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_staff_id');
    }

    /**
     * Get the subscription if this quote was converted
     */
    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    // ============================================
    // SCOPES
    // ============================================

    /**
     * Scope to get pending quotes
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope to get quotes under review
     */
    public function scopeUnderReview($query)
    {
        return $query->where('status', 'under_review');
    }

    /**
     * Scope to get quoted quotes
     */
    public function scopeQuoted($query)
    {
        return $query->where('status', 'quoted');
    }

    /**
     * Scope to get quotes by status
     */
    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to get quotes by service type
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('service_type', $type);
    }

    /**
     * Scope to filter by urgency
     */
    public function scopeUrgency($query, $urgency)
    {
        return $query->where('urgency', $urgency);
    }

    /**
     * Scope to get user's own quotes
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope to get recent quotes
     */
    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    // ============================================
    // ACCESSORS & MUTATORS
    // ============================================

    /**
     * Get the service type label
     */
    public function getServiceTypeLabelAttribute(): string
    {
        return self::SERVICE_TYPES[$this->service_type] ?? $this->service_type;
    }

    /**
     * Get the service type label (method version)
     */
    public function getServiceTypeLabel(): string
    {
        return self::SERVICE_TYPES[$this->service_type] ?? $this->service_type;
    }

    /**
     * Get the status label
     */
    public function getStatusLabelAttribute(): string
    {
        return self::STATUSES[$this->status] ?? $this->status;
    }

    /**
     * Get the urgency label
     */
    public function getUrgencyLabelAttribute(): string
    {
        return self::URGENCY_LEVELS[$this->urgency] ?? $this->urgency;
    }

    /**
     * Get formatted quoted price
     */
    public function getFormattedPriceAttribute(): string
    {
        if ($this->quoted_price) {
            return 'KES ' . number_format($this->quoted_price, 2);
        }
        return 'Pending';
    }

    /**
     * Check if quote can be edited
     */
    public function canEdit(): bool
    {
        return in_array($this->status, ['pending', 'under_review']);
    }

    /**
     * Check if quote can be quoted
     */
    public function canQuote(): bool
    {
        return in_array($this->status, ['pending', 'under_review']);
    }

    /**
     * Check if customer can respond
     */
    public function canCustomerRespond(): bool
    {
        return $this->status === 'quoted' && in_array($this->customer_response, ['pending', null]);
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    /**
     * Generate a unique quote number
     */
    public static function generateQuoteNumber(): string
    {
        $prefix = 'QUOTE';
        $date = now()->format('Ym');
        $random = strtoupper(Str::random(6));
        
        return "{$prefix}-{$date}-{$random}";
    }

    /**
     * Get general info as array with defaults
     */
    public function getGeneralInfoAttribute($value): array
    {
        return $value ? json_decode($value, true) : [];
    }

    /**
     * Get technical requirements as array with defaults
     */
    public function getTechnicalRequirementsAttribute($value): array
    {
        return $value ? json_decode($value, true) : [];
    }

    /**
     * Mark quote as under review
     */
    public function markAsUnderReview(int $staffId): void
    {
        $this->update([
            'status' => 'under_review',
            'assigned_staff_id' => $staffId,
        ]);
    }

    /**
     * Submit a quote
     */
    public function submitQuote(float $price, string $notes, string $response): void
    {
        $this->update([
            'status' => 'quoted',
            'quoted_price' => $price,
            'staff_notes' => $notes,
            'admin_response' => $response,
            'quoted_at' => now(),
            'responded_at' => now(),
            'quote_valid_until' => now()->addDays(30), // Quote valid for 30 days
        ]);
    }

    /**
     * Accept quote by customer
     */
    public function accept(string $notes = null): void
    {
        $this->update([
            'status' => 'accepted',
            'customer_response' => 'accepted',
            'customer_notes' => $notes,
            'customer_responded_at' => now(),
        ]);
    }

    /**
     * Reject quote by customer
     */
    public function reject(string $notes = null): void
    {
        $this->update([
            'status' => 'rejected',
            'customer_response' => 'rejected',
            'customer_notes' => $notes,
            'customer_responded_at' => now(),
        ]);
    }

    /**
     * Convert to subscription
     */
    public function convertToSubscription(int $subscriptionId): void
    {
        $this->update([
            'status' => 'converted_to_subscription',
            'subscription_id' => $subscriptionId,
        ]);
    }

    /**
     * Get technical fields based on service type
     */
    public static function getTechnicalFieldsForType(string $type): array
    {
        $fields = [
            'internet_plan' => [
                'required_bandwidth' => 'Required Bandwidth (Mbps)',
                'number_of_users' => 'Number of Users',
                'connection_type' => 'Connection Type',
                'coverage_area' => 'Coverage Area',
                'static_ip_required' => 'Static IP Required',
                'sla_requirement' => 'SLA Requirement',
                'additional_services' => 'Additional Services Needed',
            ],
            'hosting_package' => [
                'storage_needed' => 'Storage Needed (GB)',
                'bandwidth_needed' => 'Monthly Bandwidth (GB)',
                'domains_count' => 'Number of Domains',
                'email_accounts' => 'Email Accounts Required',
                'databases_needed' => 'Databases Required',
                'control_panel' => 'Preferred Control Panel',
                'backup_requirements' => 'Backup Requirements',
            ],
            'web_development' => [
                'project_type' => 'Project Type',
                'target_platforms' => 'Target Platforms',
                'desired_features' => 'Desired Features',
                'existing_system_integration' => 'Existing System Integration',
                'design_preferences' => 'Design Preferences',
                'content_ready' => 'Is Content Ready',
                'domain_ready' => 'Is Domain Ready',
            ],
            'cloud_services' => [
                'cloud_type' => 'Cloud Type (Public/Private/Hybrid)',
                'compute_resources' => 'Compute Resources (CPU/RAM)',
                'storage_requirements' => 'Storage Requirements',
                'expected_users' => 'Expected Number of Users',
                'data_residency' => 'Data Residency Requirements',
                'sla_requirement' => 'SLA Requirement',
                'scalability_needs' => 'Scalability Needs',
            ],
            'cyber_security' => [
                'security_type' => 'Type of Security Solution',
                'number_of_devices' => 'Number of Devices',
                'users_to_protect' => 'Number of Users',
                'current_setup' => 'Current Security Setup',
                'compliance_requirements' => 'Compliance Requirements',
                'monitoring_needs' => '24/7 Monitoring Needed',
                'incident_response' => 'Incident Response Required',
            ],
            'network_infrastructure' => [
                'network_size' => 'Network Size',
                'number_of_locations' => 'Number of Locations',
                'current_infrastructure' => 'Current Infrastructure Details',
                'required_features' => 'Required Network Features',
                'equipment_preferences' => 'Equipment Preferences',
                'wiring_needed' => 'Wiring/Cabling Required',
            ],
            'isp_services' => [
                'bandwidth_requirement' => 'Bandwidth Requirement',
                'number_of_locations' => 'Number of Locations',
                'service_level' => 'Service Level Required',
                'static_ips_needed' => 'Number of Static IPs',
                'redundancy_required' => 'Redundancy Required',
                'coverage_location' => 'Coverage Location',
            ],
            'cpe_device' => [
                'device_type' => 'Type of CPE Device',
                'quantity' => 'Quantity Needed',
                'compatibility_requirements' => 'Compatibility Requirements',
                'management_needs' => 'Management/Monitoring Needs',
                'installation_support' => 'Installation Support Required',
            ],
            'satellite_connectivity' => [
                'location_type' => 'Location Type',
                'bandwidth_requirement' => 'Bandwidth Requirement',
                'uptime_requirement' => 'Uptime Requirement',
                'data_usage_estimation' => 'Estimated Data Usage',
                'equipment_preferences' => 'Equipment Preferences',
            ],
            'media_services' => [
                'service_type' => 'Type of Media Service',
                'content_type' => 'Content Type',
                'delivery_requirements' => 'Delivery Requirements',
                'encoding_needs' => 'Encoding Needs',
                'storage_requirements' => 'Storage Requirements',
            ],
            'erp_services' => [
                'erp_module' => 'ERP Module Needed',
                'number_of_users' => 'Number of Users',
                'current_systems' => 'Current Systems in Use',
                'integration_needs' => 'Integration Requirements',
                'customization_level' => 'Customization Level',
                'training_needed' => 'Training Required',
            ],
            'smart_integration' => [
                'integration_type' => 'Type of Integration',
                'systems_to_integrate' => 'Systems to Integrate',
                'automation_goals' => 'Automation Goals',
                'existing_hardware' => 'Existing Hardware',
                'iot_requirements' => 'IoT Requirements',
            ],
            'other' => [
                'project_description' => 'Project Description',
                'specific_requirements' => 'Specific Requirements',
                'additional_info' => 'Additional Information',
            ],
        ];

        return $fields[$type] ?? $fields['other'];
    }
}

