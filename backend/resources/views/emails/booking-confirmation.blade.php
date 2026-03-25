<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Booking Confirmation – {{ $booking->reference }}</title>
  <style>
    body { font-family: Arial, sans-serif; background:#f4f6fb; margin:0; padding:0; }
    .wrapper { max-width:600px; margin:40px auto; background:#fff; border-radius:10px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,.08); }
    .header { background:linear-gradient(135deg,#1a3a6e,#2563eb); padding:36px 32px; color:#fff; text-align:center; }
    .header h1 { margin:0; font-size:24px; letter-spacing:.5px; }
    .header p  { margin:8px 0 0; font-size:14px; opacity:.85; }
    .badge { display:inline-block; background:rgba(255,255,255,.18); border:1px solid rgba(255,255,255,.35); border-radius:6px; padding:10px 24px; margin-top:18px; font-size:20px; font-weight:700; letter-spacing:2px; }
    .body { padding:32px; }
    .body h2 { font-size:17px; color:#1a3a6e; margin:0 0 16px; }
    .detail-row { display:flex; justify-content:space-between; border-bottom:1px solid #eef0f5; padding:10px 0; font-size:14px; }
    .detail-row:last-child { border-bottom:none; }
    .detail-label { color:#6b7280; }
    .detail-value { color:#111827; font-weight:600; }
    .vms-box { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:20px; margin:24px 0; text-align:center; }
    .vms-box p  { margin:0 0 6px; font-size:12px; color:#16a34a; font-weight:700; letter-spacing:1px; text-transform:uppercase; }
    .vms-box .code { font-family:monospace; font-size:28px; font-weight:900; color:#15803d; letter-spacing:4px; }
    .vms-box small { display:block; color:#6b7280; font-size:12px; margin-top:8px; }
    .footer { background:#f9fafb; text-align:center; padding:20px 32px; font-size:12px; color:#9ca3af; border-top:1px solid #e5e7eb; }
    .footer a { color:#2563eb; text-decoration:none; }
    .btn { display:inline-block; margin-top:20px; background:#2563eb; color:#fff; text-decoration:none; padding:12px 28px; border-radius:6px; font-size:14px; font-weight:700; }
  </style>
</head>
<body>
<div class="wrapper">

  {{-- Header --}}
  <div class="header">
    <h1>✅ Booking Confirmed!</h1>
    <p>Thank you for booking with Vilcom Networks</p>
    <div class="badge">{{ $booking->reference }}</div>
  </div>

  {{-- Body --}}
  <div class="body">
    <h2>Hi {{ $booking->first_name }},</h2>
    <p style="color:#374151;font-size:14px;">Your appointment has been received and is being processed. Here are your booking details:</p>

    {{-- Booking Details --}}
    <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:20px 0;">
      <div class="detail-row">
        <span class="detail-label">Reference</span>
        <span class="detail-value">{{ $booking->reference }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Service</span>
        <span class="detail-value">{{ $booking->product_snapshot['name'] ?? $booking->meeting_purpose }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Date</span>
        <span class="detail-value">{{ $booking->booking_date->format('l, F j, Y') }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Time</span>
        <span class="detail-value">{{ \Carbon\Carbon::parse($booking->booking_time)->format('h:i A') }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Type</span>
        <span class="detail-value">
          @if($booking->meeting_type === 'in_person') In Person (Visit our office)
          @elseif($booking->meeting_type === 'virtual') Virtual Meeting
          @else Phone Call
          @endif
        </span>
      </div>
      @if($booking->assignedStaff)
      <div class="detail-row">
        <span class="detail-label">Host</span>
        <span class="detail-value">{{ $booking->assignedStaff->name }}</span>
      </div>
      @endif
    </div>

    {{-- VMS Visitor Pass (if synced) --}}
    @if($booking->vms_check_in_code)
    <div class="vms-box">
      <p>🪪 Visitor Check-In Code</p>
      <div class="code">{{ $booking->vms_check_in_code }}</div>
      <small>Present this code at reception upon arrival</small>
      @if($booking->vms_qr_code_url)
      <br/>
      <img src="{{ $booking->vms_qr_code_url }}" alt="Check-in QR Code" style="width:120px;height:120px;margin-top:12px;border-radius:6px;"/>
      @endif
    </div>
    @endif

    {{-- What Happens Next --}}
    <h2 style="margin-top:24px;">What happens next?</h2>
    <ul style="font-size:14px;color:#374151;line-height:1.8;">
      <li>Our team will review your booking and confirm it shortly.</li>
      <li>You'll receive another email with any meeting link or final confirmation.</li>
      @if($booking->meeting_type === 'in_person')
      <li>For in-person visits: bring a valid ID and present your check-in code at reception.</li>
      @endif
    </ul>

    <div style="text-align:center;">
      <a href="{{ config('app.url') }}" class="btn">Visit Vilcom Networks</a>
    </div>
  </div>

  {{-- Footer --}}
  <div class="footer">
    <p>© {{ date('Y') }} Vilcom Networks. All rights reserved.</p>
    <p>Ramco Court, Block B, Mombasa Road &nbsp;·&nbsp;
       <a href="mailto:customercare@vilcom.co.ke">customercare@vilcom.co.ke</a></p>
    <p style="margin-top:8px;font-size:11px;color:#d1d5db;">
       You received this email because you booked an appointment with Vilcom Networks.
    </p>
  </div>

</div>
</body>
</html>
