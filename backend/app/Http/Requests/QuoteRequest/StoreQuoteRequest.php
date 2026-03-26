<?php

namespace App\Http\Requests\QuoteRequest;

use App\Models\QuoteRequest;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreQuoteRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Public endpoint
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'service_type' => [
                'required',
                'string',
                Rule::in(array_keys(QuoteRequest::SERVICE_TYPES))
            ],
            'contact_name' => 'required|string|max:255',
            'contact_email' => 'required|email|max:255',
            'contact_phone' => 'nullable|string|max:20',
            'company_name' => 'nullable|string|max:255',
            'product_id' => 'nullable|exists:products,id',
            'general_info' => 'nullable|array',
            'general_info.*' => 'nullable|string',
            'technical_requirements' => 'nullable|array',
            'technical_requirements.*' => 'nullable|string',
            'budget_range' => 'nullable|string',
            'timeline' => 'nullable|string',
            'preferred_start_date' => 'nullable|date',
            'urgency' => 'nullable|in:low,medium,high,critical',
            'additional_notes' => 'nullable|string',
            'source' => 'nullable|string',
            'referral_source' => 'nullable|string',
        ];
    }

    /**
     * Get custom validation messages.
     */
    public function messages(): array
    {
        return [
            'service_type.required' => 'Please select a service type.',
            'service_type.in' => 'Please select a valid service type from the list.',
            'contact_name.required' => 'Contact name is required.',
            'contact_email.required' => 'Email address is required.',
            'contact_email.email' => 'Please enter a valid email address.',
        ];
    }

    /**
     * Prepare data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Ensure arrays are properly cast
        $this->merge([
            'general_info' => $this->input('general_info', []),
            'technical_requirements' => $this->input('technical_requirements', []),
        ]);
    }
}

