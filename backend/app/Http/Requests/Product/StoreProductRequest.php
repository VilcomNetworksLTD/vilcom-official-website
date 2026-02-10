<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->hasRole(['admin', 'staff']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:products,slug',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string|max:500',
            'sku' => 'nullable|string|max:100|unique:products,sku',
            'type' => 'nullable|in:internet_plan,hosting_package,web_development,bulk_sms,domain,addon,service,other',
            
            // Internet Plan
            'speed_mbps' => 'nullable|integer|min:0',
            'connection_type' => 'nullable|in:fiber,wireless,both',
            'plan_category' => 'nullable|in:home,business,enterprise',
            
            // Hosting
            'storage_gb' => 'nullable|integer|min:0',
            'bandwidth_gb' => 'nullable|integer|min:0',
            'email_accounts' => 'nullable|integer|min:0',
            'databases' => 'nullable|integer|min:0',
            'domains_allowed' => 'nullable|integer|min:0',
            'ssl_included' => 'nullable|boolean',
            'backup_included' => 'nullable|boolean',
            
            // Web Development
            'pages_included' => 'nullable|integer|min:0',
            'revisions_included' => 'nullable|integer|min:0',
            'delivery_days' => 'nullable|integer|min:0',
            
            // Bulk SMS
            'sms_credits' => 'nullable|integer|min:0',
            'cost_per_sms' => 'nullable|numeric|min:0',
            
            // Pricing
            'price_monthly' => 'nullable|numeric|min:0',
            'price_quarterly' => 'nullable|numeric|min:0',
            'price_semi_annually' => 'nullable|numeric|min:0',
            'price_annually' => 'nullable|numeric|min:0',
            'price_one_time' => 'nullable|numeric|min:0',
            'setup_fee' => 'nullable|numeric|min:0',
            
            // Promotional
            'promotional_price' => 'nullable|numeric|min:0',
            'promotional_start' => 'nullable|date',
            'promotional_end' => 'nullable|date|after:promotional_start',
            
            // Features
            'features' => 'nullable|array',
            'technical_specs' => 'nullable|array',
            
            // Availability
            'coverage_areas' => 'nullable|array',
            'available_nationwide' => 'nullable|boolean',
            
            // Stock/Capacity
            'stock_quantity' => 'nullable|integer|min:0',
            'capacity_limit' => 'nullable|integer|min:0',
            'track_capacity' => 'nullable|boolean',
            
            // Display
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'gallery.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'icon' => 'nullable|string|max:100',
            'badge' => 'nullable|string|max:100',
            
            // Status
            'is_active' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',
            'requires_approval' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0',
            
            // Requirements
            'requirements' => 'nullable|string',
            'terms_conditions' => 'nullable|string',
            
            // SEO
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string|max:255',
            
            // Addons
            'addons' => 'nullable|array',
            'addons.*.id' => 'required_with:addons|exists:addons,id',
            'addons.*.custom_price' => 'nullable|numeric|min:0',
            'addons.*.discount_percent' => 'nullable|numeric|min:0|max:100',
            'addons.*.is_required' => 'nullable|boolean',
            'addons.*.is_default' => 'nullable|boolean',
            'addons.*.sort_order' => 'nullable|integer|min:0',
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Validation errors',
            'errors' => $validator->errors(),
        ], 422));
    }
}

