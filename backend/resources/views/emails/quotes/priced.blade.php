<x-mail::message>
# Your Vilcom Quote is Ready!

Dear {{ $quoteRequest->contact_name }},

Thank you for requesting a quote for **{{ $quoteRequest->getServiceTypeLabel() }}** (Quote Number: **{{ $quoteRequest->quote_number }}**). We have reviewed your requirements and are pleased to offer you the details of our service.

Please find the total authorized cost and technical notes below:

### Total Authorized Cost: **{{ $quoteRequest->getFormattedPriceAttribute() }}**

**Admin / Sales Notes:**
{{ $quoteRequest->admin_response ?? $quoteRequest->staff_notes ?? 'Please see the attached PDF for full quotation details.' }}

We have attached a detailed PDF quote outlining the services, costs, and timeline parameters requested for your project. Please review it at your convenience.

To proceed or request modifications, simply log into the client dashboard or reply to this email, and a representative will immediately assist you.

Thank you,<br>
The {{ config('app.name') }} Sales Team
</x-mail::message>
