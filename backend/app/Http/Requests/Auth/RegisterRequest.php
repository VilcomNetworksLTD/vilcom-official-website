<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Basic Information
            'name' => ['required', 'string', 'max:255', 'min:2'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                'unique:users,email',
                'regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/'
            ],
            'password' => [
                'required',
                'string',
                'confirmed',
                Password::min(8)
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
                    ->uncompromised(app()->environment('testing'))
            ],
            
            // Contact Information
            'phone' => [
                'required',
                'string',
                'unique:users,phone',
                'regex:/^(\+254|254|0)[17]\d{8}$/'
            ],
            'secondary_phone' => [
                'nullable',
                'string',
                'regex:/^(\+254|254|0)[17]\d{8}$/',
            ],
            
            // Address Information
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
            'county' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            
            // Customer Type
            'customer_type' => ['nullable', 'in:individual,business'],
            
            // Business Information (required if customer_type is business)
            'company_name' => ['required_if:customer_type,business', 'nullable', 'string', 'max:255'],
            'company_registration' => ['nullable', 'string', 'max:100'],
            'tax_pin' => [
                'nullable',
                'string',
                'max:11',
                'regex:/^[A-Z]\d{9}[A-Z]$/' // KRA PIN format
            ],
            
            // Preferences
            'timezone' => ['nullable', 'string', 'in:Africa/Nairobi'],
            'language' => ['nullable', 'string', 'in:en,sw'],
            'sms_notifications' => ['nullable', 'boolean'],
            'marketing_consent' => ['nullable', 'boolean'],
            
            // Terms & Conditions
            'terms_accepted' => ['required', 'accepted'],
            'privacy_accepted' => ['required', 'accepted'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            // Name
            'name.required' => 'Please enter your full name',
            'name.min' => 'Name must be at least 2 characters',
            
            // Email
            'email.required' => 'Please enter your email address',
            'email.email' => 'Please enter a valid email address',
            'email.unique' => 'This email is already registered. Please login or use a different email.',
            
            // Password
            'password.required' => 'Please enter a password',
            'password.confirmed' => 'Password confirmation does not match',
            
            // Phone
            'phone.required' => 'Please enter your phone number',
            'phone.unique' => 'This phone number is already registered',
            'phone.regex' => 'Please enter a valid Kenyan phone number (e.g., 0712345678 or +254712345678)',
            'secondary_phone.regex' => 'Please enter a valid Kenyan phone number for secondary phone',
            
            // Business fields
            'company_name.required_if' => 'Company name is required for business accounts',
            'tax_pin.regex' => 'Please enter a valid KRA PIN (e.g., A001234567B)',
            
            // Terms
            'terms_accepted.required' => 'You must accept the terms and conditions',
            'terms_accepted.accepted' => 'You must accept the terms and conditions',
            'privacy_accepted.required' => 'You must accept the privacy policy',
            'privacy_accepted.accepted' => 'You must accept the privacy policy',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     *
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'full name',
            'email' => 'email address',
            'phone' => 'phone number',
            'secondary_phone' => 'secondary phone number',
            'customer_type' => 'account type',
            'company_name' => 'company name',
            'company_registration' => 'company registration number',
            'tax_pin' => 'KRA PIN',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Format phone number to international format
        $phone = preg_replace('/[^0-9+]/', '', $this->phone ?? '');
        if (!empty($phone)) {
            // Convert to international format if starts with 0
            if (substr($phone, 0, 1) === '0') {
                $phone = '+254' . substr($phone, 1);
            }
            // Add +254 if not present
            if (substr($phone, 0, 1) !== '+') {
                $phone = '+254' . $phone;
            }
        }
        
        // Format secondary phone if provided
        $secondaryPhoneRaw = $this->secondary_phone ? preg_replace('/[^0-9+]/', '', $this->secondary_phone) : null;
        $secondaryPhoneData = null;
        if (!empty($secondaryPhoneRaw)) {
            // Convert to international format if starts with 0
            if (substr($secondaryPhoneRaw, 0, 1) === '0') {
                $secondaryPhoneData = '+254' . substr($secondaryPhoneRaw, 1);
            }
            // Add +254 if not present
            elseif (substr($secondaryPhoneRaw, 0, 1) !== '+') {
                $secondaryPhoneData = '+254' . $secondaryPhoneRaw;
            }
            else {
                $secondaryPhoneData = $secondaryPhoneRaw;
            }
        }

        // Trim whitespace from string inputs
        $mergeData = [
            'name' => trim($this->name ?? ''),
            'email' => strtolower(trim($this->email ?? '')),
            'phone' => $phone,
            'company_name' => trim($this->company_name ?? ''),
            'tax_pin' => strtoupper(trim($this->tax_pin ?? '')),
        ];
        
        // Only add secondary_phone if it has a valid value
        if ($secondaryPhoneData !== null) {
            $mergeData['secondary_phone'] = $secondaryPhoneData;
        }
        
        $this->merge($mergeData);
    }
}