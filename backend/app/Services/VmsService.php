<?php

namespace App\Services;

use App\Models\Booking;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class VmsService
{
    public function getBookingUrl(): string
    {
        $base = rtrim(config('services.vms.base_url', 'https://vms.vilcom.co.ke/api/organizations'), '/');
        $slug = config('services.vms.org_slug', 'vilcom-networks-limited');
        return "{$base}/{$slug}/bookings";
    }

    /**
     * Sync booking to VMS and update the database.
     */
    public function syncBooking(Booking $booking, string $idType, string $idNumber): ?array
    {
        // ─── 1. Map "Location" ────────────────────────────────────────
        // VMS needs a physical or virtual location.
        // We derive this from your internal 'meeting_type'.
        $location = match ($booking->meeting_type) {
            'in_person' => 'Main Reception', // Default for physical visits
            'virtual'   => 'Virtual / Online', // For Zoom/Teams
            'phone'     => 'Phone Call',
            default     => 'Main Reception',
        };

        // ─── 2. Map "Host Name" ─────────────────────────────────────────
        // VMS requires a host. We use the assigned staff member.
        $hostName = optional($booking->assignedStaff)->name ?? 'Reception';

        // ─── 3. Map "Visit Type" & "Purpose" ───────────────────────────────
        // Since VMS does not have a "Service Type", we use:
        // - visit_type: A generic category (Meeting)
        // - purpose: The specific reason (Your Product Name)

        $visitType = 'Meeting'; // Standard VMS category

        // Use the Product Name as the purpose so the host knows why they are coming
        $productName = $booking->product_snapshot['name'] ?? 'Consultation';
        $purpose = $productName;

        // Append internal notes to the purpose if they exist
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
            'id_type'          => $idType,
            'id_number'        => $idNumber,
            'host_name'        => $hostName,
            'location'         => $location,
            'additional_notes' => $additionalNotes,
        ], fn($v) => $v !== null && $v !== '');

        try {
            $response = Http::timeout(10)
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
