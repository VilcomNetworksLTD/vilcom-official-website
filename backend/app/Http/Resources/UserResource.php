<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            
            // Basic Information
            'name' => $this->name,
            'display_name' => $this->display_name,
            'email' => $this->email,
            'phone' => $this->formatted_phone,
            'secondary_phone' => $this->secondary_phone,
            
            // Address
            'address' => $this->when($this->shouldShowDetails(), [
                'street' => $this->address,
                'city' => $this->city,
                'county' => $this->county,
                'postal_code' => $this->postal_code,
                'country' => $this->country,
            ]),
            
            // Business Information
            'customer_type' => $this->customer_type,
            'company_info' => $this->when($this->customer_type === 'business', [
                'name' => $this->company_name,
                'registration' => $this->company_registration,
                'tax_pin' => $this->when($this->shouldShowSensitiveData(), $this->tax_pin),
            ]),
            
            // Profile
            'avatar' => $this->avatar_url,
            'bio' => $this->bio,
            'date_of_birth' => $this->when($this->shouldShowDetails(), $this->date_of_birth?->format('Y-m-d')),
            'gender' => $this->when($this->shouldShowDetails(), $this->gender),
            
            // Account Status
            'status' => $this->status,
            'is_verified' => $this->is_verified,
            'verified_at' => $this->email_verified_at?->toIso8601String(),
            'emerald_mbr_id' => $this->emerald_mbr_id,
            
            // Roles & Permissions
            'roles' => $this->whenLoaded('roles', function () {
                return $this->roles->map(function ($role) {
                    return [
                        'id' => $role->id,
                        'name' => $role->name,
                        'guard_name' => $role->guard_name,
                    ];
                });
            }),
            'permissions' => $this->whenLoaded('permissions', function () {
                return $this->getAllPermissions()->map(function ($permission) {
                    return [
                        'id' => $permission->id,
                        'name' => $permission->name,
                        'guard_name' => $permission->guard_name,
                    ];
                });
            }),
            
            // Staff Information (only for staff/admin)
            'staff_info' => $this->when($this->isStaffOrAdmin(), [
                'employee_id' => $this->employee_id,
                'department' => $this->department,
                'is_team_leader' => $this->is_team_leader,
                'commission_rate' => $this->commission_rate,
                'supervisor' => $this->when($this->reports_to, function () {
                    return [
                        'id' => $this->supervisor?->id,
                        'name' => $this->supervisor?->name,
                        'email' => $this->supervisor?->email,
                    ];
                }),
            ]),
            
            // Preferences
            'preferences' => $this->when($this->shouldShowDetails(), [
                'timezone' => $this->timezone,
                'language' => $this->language,
                'notifications' => $this->getNotificationPreferences(),
            ]),
            
            // Security
            'security' => $this->when($this->shouldShowDetails(), [
                'two_factor_enabled' => $this->has_2fa_enabled,
                'last_login' => $this->last_login_at?->toIso8601String(),
                'last_login_ip' => $this->last_login_ip,
            ]),
            
            // Statistics (only for own profile or admin)
            'stats' => $this->when($this->shouldShowStats(), [
                'active_subscriptions' => $this->whenLoaded('activeSubscriptions', function () {
                    return $this->activeSubscriptions->count();
                }),
                'total_subscriptions' => $this->whenLoaded('subscriptions', function () {
                    return $this->subscriptions->count();
                }),
                'outstanding_balance' => $this->whenCounted('invoices', function () {
                    return $this->getTotalOutstandingBalance();
                }),
                'open_tickets' => $this->whenCounted('tickets', function () {
                    return $this->getOpenTicketsCount();
                }),
            ]),
            
            // Timestamps
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}

