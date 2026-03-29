<x-mail::message>
# Quote Request Received

Dear {{ $quoteRequest->contact_name }},

Thank you for your interest in Vilcom Networks! We have successfully received your quote request for **{{ $quoteRequest->getServiceTypeLabel() }}**.

**Quote Number:** {{ $quoteRequest->quote_number }}

Our team is currently reviewing your requirements and will get back to you within 24–48 hours with a detailed quotation and project overview.

If you have any urgent questions, please feel free to reply directly to this email.

Thanks,<br>
The {{ config('app.name') }} Team
</x-mail::message>
