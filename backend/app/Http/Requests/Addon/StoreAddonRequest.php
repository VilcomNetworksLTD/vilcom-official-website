<?php

namespace App\Http\Requests\Addon;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreAddonRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:addons,slug',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string|max:500',
            'sku' => 'nullable|string|max:100|unique:addons,sku',
            'type' => 'nullable|in:static_ip,extra_bandwidth,extra_storage,router_upgrade,ssl_certificate,backup_service,domain_registration,email_accounts,priority_support,installation,other',
            'applicable_to' => 'nullable|array',
            'applicable_to.*' => 'nullable|string|in:internet_plan,hosting_package,web_development,bulk_sms,domain,addon,service,other',
            'price_monthly' => 'nullable|numeric|min:0',
            'price_quarterly' => 'nullable|numeric|min:0',
            'price_semi_annually' => 'nullable|numeric|min:0',
            'price_annually' => 'nullable|numeric|min:0',
            'price_one_time' => 'nullable|numeric|min:0',
            'is_recurring' => 'nullable|boolean',
            'min_quantity' => 'nullable|integer|min:1',
            'max_quantity' => 'nullable|integer|min:1',
            'stock_quantity' => 'nullable|integer|min:0',
            'bundle_rules' => 'nullable|array',
            'can_be_bundled' => 'nullable|boolean',
            'bundle_discount_percent' => 'nullable|numeric|min:0|max:100',
            'icon' => 'nullable|string|max:100',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'badge' => 'nullable|string|max:100',
            'is_active' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',
            'requires_approval' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
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

