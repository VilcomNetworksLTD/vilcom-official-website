<?php

namespace App\Services;

use App\Models\Booking;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class VmsService
{
    public function getBookingUrl(): string
    {
        //
        // Priority 1: Use the ENV variable if set (Recommended)
        // Ensure your .env has: VMS_BASE_URL=https://vmsapi.vilcom.co.ke/api/organizations
        $base = config('services.vms.base_url', 'https://vmsapi.vilcom.co.ke/api/organizations');

        $slug = config('services.vms.org_slug', 'vilcom-networks-limited');

        return "{$base}/{$slug}/bookings";
    }

    /**
     * Sync booking to VMS and update the database.
     */
    public function syncBooking(Booking $booking, string $idType, string $idNumber): ?array
    {
        // ─── 1. Map "Location" ────────────────────────────────────────
        $location = match ($booking->meeting_type) {
            'in_person' => 'Main Reception',
            'virtual'   => 'Virtual / Online',
            'phone'     => 'Phone Call',
            default     => 'Main Reception',
        };

        // ─── 2. Map "Host Name" ─────────────────────────────────────────
        $hostName = optional($booking->assignedStaff)->name ?? 'Reception';

        // ─── 3. Map "Visit Type" & "Purpose" ───────────────────────────────
        $visitType = 'Meeting';

        $productName = $booking->product_snapshot['name'] ?? 'Consultation';
        $purpose = $productName;

        if ($booking->notes) {
            $purpose .= ": {$booking->notes}";
        }

        // ─── 4. Additional Notes (Company Context) ───────────────────────
        $additionalNotes = null;
        if ($booking->customer_type === 'business' && $booking->company_name) {
            $additionalNotes = "Company: {$booking->company_name}";
        }

        // ─── 5. Build Payload for VMS API ──────────────────────────────────
        $payload = array_filter([
            'visitor_name'     => trim("{$booking->first_name} {$booking->last_name}"),
            'visitor_email'    => $booking->email,
            'visitor_phone'    => $booking->phone,
            'visit_date'       => $booking->booking_date->format('Y-m-d'),
            'visit_time'       => $booking->booking_time,
            'visit_type'       => $visitType,
            'purpose'          => $purpose,
            'id_type'          => $idType, // e.g. "national_id" (lowercase as per successful curl)
            'id_number'        => $idNumber,
            'host_name'        => $hostName,
            'location'         => $location,
            'additional_notes' => $additionalNotes,
        ], fn($v) => $v !== null && $v !== '');

        try {
            // Define Headers to mimic a browser request (prevents 401 errors)
            $headers = [
                'Accept'       => 'application/json',
                'Content-Type'  => 'application/json',
                'User-Agent'   => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer'      => 'https://vms.vilcom.co.ke', // Allowlist your own domain
                'Origin'       => 'https://vms.vilcom.co.ke',
            ];

            // OPTIONAL: If you ever need to add an API Key (e.g. if VMS changes policy)
            // $apiKey = config('services.vms.api_key');
            // if ($apiKey) {
            //     $headers['Authorization'] = 'Bearer ' . $apiKey;
            // }

            $response = Http::timeout(10)
                ->withHeaders($headers)
                ->acceptJson()
                ->post($this->getBookingUrl(), $payload);

            if ($response->successful() && $response->json('success')) {
                $vmsData = $response->json('data');

                // Update the booking record with the VMS response
                $booking->update([
                    'vms_reference'    => $vmsData['booking']['reference']     ?? null,
                    'vms_check_in_code'=> $vmsData['booking']['check_in_code'] ?? null,
                    'vms_qr_code_url'  => $vmsData['booking']['qr_code_url']   ?? null,
                    'vms_synced_at'    => now(),
                ]);

                Log::info('VMS booking synced', [
                    'booking_ref' => $booking->reference,
                    'vms_ref'     => $booking->vms_reference,
                    'host'       => $hostName,
                    'location'   => $location,
                ]);

                return $vmsData;
            }

            Log::warning('VMS booking sync failed (Non-Success)', [
                'booking_ref' => $booking->reference,
                'status'      => $response->status(),
                'body'        => $response->body(),
            ]);

        } catch (\Throwable $e) {
            Log::error('VMS booking sync failed (Exception)', [
                'booking_ref' => $booking->reference,
                'error'       => $e->getMessage(),
            ]);
        }

        return null;
    }
}
