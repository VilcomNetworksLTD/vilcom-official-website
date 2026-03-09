<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\StaffAvailability;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StaffController extends Controller
{
    /**
     * GET /api/v1/staff/consultants
     *
     * Returns list of staff members available for booking consultations.
     * Can be filtered by department or availability.
     */
    public function consultants(Request $request): JsonResponse
    {
        $query = User::where('status', 'active')
            ->whereHas('roles', function ($q) {
                $q->whereIn('name', ['staff', 'admin', 'sales', 'technical_support', 'consultant']);
            })
            ->with(['availabilities' => function ($q) {
                $q->where('is_available', true);
            }]);

        // Filter by department
        if ($request->has('department')) {
            $query->where('department', $request->department);
        }

        // Filter available today
        if ($request->boolean('available_today')) {
            $dayOfWeek = date('w');
            $query->whereHas('availabilities', function ($q) use ($dayOfWeek) {
                $q->where('day_of_week', $dayOfWeek)
                  ->where('is_available', true);
            });
        }

        $staff = $query->orderBy('name')->get();

        $consultants = $staff->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar' => $user->avatar_url,
                'department' => $user->department,
                'bio' => $user->bio,
                'availabilities' => $user->availabilities->map(fn($a) => [
                    'day_of_week' => $a->day_of_week,
                    'day_name' => StaffAvailability::DAYS[$a->day_of_week],
                    'start_time' => $a->start_time,
                    'end_time' => $a->end_time,
                ]),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $consultants,
        ]);
    }

    /**
     * GET /api/v1/staff/{user}/availability
     *
     * Get specific staff member's availability for a date range
     */
    public function availability(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'date_from' => 'required|date',
            'date_to' => 'required|date|after_or_equal:date_from',
        ]);

        $availabilities = StaffAvailability::where('user_id', $user->id)
            ->where('is_available', true)
            ->get()
            ->keyBy('day_of_week');

        $bookedSlots = \App\Models\Booking::where('assigned_to', $user->id)
            ->whereBetween('booking_date', [$request->date_from, $request->date_to])
            ->whereNotIn('status', ['cancelled'])
            ->get()
            ->groupBy(fn($b) => $b->booking_date->format('Y-m-d'));

        $availability = [];
        $current = strtotime($request->date_from);
        $end = strtotime($request->date_to);

        while ($current <= $end) {
            $date = date('Y-m-d', $current);
            $dayOfWeek = date('w', $current);

            $dayAvailability = $availabilities->get($dayOfWeek);

            if ($dayAvailability) {
                $slots = $this->generateTimeSlots(
                    $dayAvailability->start_time,
                    $dayAvailability->end_time,
                    30
                );

                $booked = $bookedSlots->get($date, collect())->map(fn($b) => $b->booking_time)->toArray();

                $available = array_values(array_filter($slots, fn($slot) => !in_array($slot, $booked)));

                $availability[] = [
                    'date' => $date,
                    'day_name' => date('l', $current),
                    'available' => $available,
                    'booked' => $booked,
                ];
            } else {
                $availability[] = [
                    'date' => $date,
                    'day_name' => date('l', $current),
                    'available' => [],
                    'booked' => [],
                    'message' => 'Not available',
                ];
            }

            $current = strtotime('+1 day', $current);
        }

        return response()->json([
            'success' => true,
            'data' => $availability,
        ]);
    }

    /**
     * POST /api/v1/staff/{user}/availability
     *
     * Update staff member's availability (for admin or self)
     */
    public function updateAvailability(Request $request, User $user): JsonResponse
    {
        $userId = auth()->id();

        // Allow admin to update any, or user to update themselves
        if (!auth()->user()->hasRole('admin') && $userId !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'availability' => 'required|array',
            'availability.*.day_of_week' => 'required|integer|between:0,6',
            'availability.*.start_time' => 'required|date_format:H:i',
            'availability.*.end_time' => 'required|date_format:H:i|after:start_time',
            'availability.*.is_available' => 'boolean',
        ]);

        // Delete existing and create new
        StaffAvailability::where('user_id', $user->id)->delete();

        foreach ($validated['availability'] as $item) {
            StaffAvailability::create([
                'user_id' => $user->id,
                'day_of_week' => $item['day_of_week'],
                'start_time' => $item['start_time'],
                'end_time' => $item['end_time'],
                'is_available' => $item['is_available'] ?? true,
                'notes' => $item['notes'] ?? null,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Availability updated successfully',
        ]);
    }

    private function generateTimeSlots(string $start, string $end, int $interval): array
    {
        $slots = [];
        $cur   = strtotime($start);
        $endTs = strtotime($end);
        while ($cur < $endTs) {
            $slots[] = date('H:i', $cur);
            $cur += $interval * 60;
        }
        return $slots;
    }
}

