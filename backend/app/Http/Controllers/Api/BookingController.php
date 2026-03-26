<?php

namespace App\Http\Controllers\Api;

use App\Services\VmsService; // Import the service we just created
use App\Events\BookingCreated;
use App\Events\BookingStatusUpdated;
use App\Http\Controllers\Controller;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Models\Product;
use App\Models\Category;
use App\Models\User;
use App\Models\StaffAvailability;
use App\Notifications\BookingConfirmedNotification;
use App\Notifications\BookingReceivedNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;

class BookingController extends Controller
{
    protected VmsService $vmsService;

    public function __construct(VmsService $vmsService)
    {
        $this->vmsService = $vmsService;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PUBLIC: Products available for booking
    // ─────────────────────────────────────────────────────────────────────────

    public function bookableServices(Request $request): JsonResponse
    {
        $query = Product::with('category')
            ->active()
            ->orderBy('sort_order');

        if ($request->has('type')) {
            $query->ofType($request->type);
        }

        if ($request->has('plan_category')) {
            $query->planCategory($request->plan_category);
        }

        if ($request->boolean('quote_based_only')) {
            $query->where('is_quote_based', true);
        }

        if ($request->has('category')) {
            $category = Category::where('slug', $request->category)->first();
            if ($category) {
                $query->where('category_id', $category->id);
            }
        }

        $products = $query->get();

        $grouped = $products
            ->groupBy(fn($p) => $p->category->name ?? 'Other')
            ->map(fn($items, $categoryName) => [
                'category'      => $categoryName,
                'category_slug' => $items->first()?->category?->slug,
                'products'      => $items->map(fn($p) => $this->formatBookableProduct($p)),
            ])
            ->values();

        return response()->json([
            'success' => true,
            'data'    => $grouped,
            'flat'    => $products->map(fn($p) => $this->formatBookableProduct($p)),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PUBLIC: Available time slots
    // ─────────────────────────────────────────────────────────────────────────

    public function availableSlots(Request $request): JsonResponse
    {
        $request->validate([
            'date'       => 'required|date|after_or_equal:today',
            'product_id' => 'nullable|exists:products,id', // Made nullable
            'staff_id'   => 'nullable|exists:users,id',
        ]);

        $duration = 30; // Default duration
        $product = null;

        if ($request->filled('product_id')) {
            $product = Product::findOrFail($request->product_id);
            $duration = $this->deriveConsultationDuration($product);
        }

        $date = $request->date;
        $dayOfWeek = date('w', strtotime($date));

        // Generate slots based on standard business hours (09:00 - 17:00)
        $allSlots = $this->generateTimeSlots('09:00', '17:00', 30);

        // Find booked slots
        $query = Booking::whereDate('booking_date', $date)
            ->whereNotIn('status', ['cancelled'])
            ->selectRaw('booking_time, duration_minutes');

        if ($request->staff_id) {
            $query->where('assigned_to', $request->staff_id);
        }

        $bookedSlots = $query->get()->flatMap(function ($b) {
            $start   = strtotime($b->booking_time);
            $blocked = [];
            for ($i = 0; $i < $b->duration_minutes; $i += 30) {
                $blocked[] = date('H:i', $start + ($i * 60));
            }
            return $blocked;
        })->unique()->values()->toArray();

        $availabilitySlots = $allSlots;

        // Check staff specific availability if provided
        if ($request->staff_id) {
            $availability = StaffAvailability::where('user_id', $request->staff_id)
                ->where('day_of_week', $dayOfWeek)
                ->where('is_available', true)
                ->first();

            if ($availability) {
                $availabilitySlots = $this->generateTimeSlots(
                    $availability->start_time,
                    $availability->end_time,
                    30
                );
            } else {
                return response()->json([
                    'success'       => true,
                    'available'     => [],
                    'booked'        => [],
                    'duration'      => $duration,
                    'staff_message' => 'This staff member is not available on this day.',
                ]);
            }
        }

        $available = array_values(array_filter(
            $availabilitySlots,
            fn($slot) => !in_array($slot, $bookedSlots)
        ));

        return response()->json([
            'success'   => true,
            'date'      => $date,
            'available' => $available,
            'booked'    => $bookedSlots,
            'duration'  => $duration,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PUBLIC: Create booking
    // ─────────────────────────────────────────────────────────────────────────

    public function store(Request $request): JsonResponse
    {
        // UPDATED VALIDATION
        $validated = $request->validate([
            'first_name'    => 'required|string|max:100',
            'last_name'     => 'required|string|max:100',
            'email'         => 'required|email',
            'phone'         => 'required|string|max:20',
            'company_name'  => 'nullable|string|max:255',

            // UPDATED: New vs Existing
            'customer_type' => 'required|in:new,existing',

            // UPDATED: Optional Product ID (Interviews don't need products)
            'product_id'    => 'nullable|exists:products,id',
            'assigned_to'   => 'nullable|exists:users,id',

            'booking_date'  => 'required|date|after_or_equal:today',
            'booking_time'  => 'required|date_format:H:i',

            // UPDATED: Activity & Mode
            'activity_type' => 'required|in:meeting,interview,consultancy,training',
            'meeting_mode'  => 'required|in:in_person,virtual,phone',

            'meeting_link'  => 'nullable|url',
            'notes'         => 'nullable|string|max:1000',

            // ID fields for VMS
            'id_type'       => ['required', Rule::in(['national_id', 'passport', 'drivers_license', 'other'])],
            'id_number'     => 'required|string|max:50',
        ]);

        // ── 30-minute buffer check ──
        $bookingDateTime = \Carbon\Carbon::parse(
            $validated['booking_date'] . ' ' . $validated['booking_time'],
            config('app.timezone', 'Africa/Nairobi')
        );

        if ($bookingDateTime->isBefore(now()->addMinutes(30))) {
            return response()->json([
                'success' => false,
                'message' => 'Bookings must be at least 30 minutes in the future.',
            ], 422);
        }

        // ── Product & Duration Logic (Handle Nullable Product) ──
        $product = null;
        if (!empty($validated['product_id'])) {
            $product = Product::active()->findOrFail($validated['product_id']);
            $validated['duration_minutes'] = $this->deriveConsultationDuration($product);
        } else {
            // Default duration for non-product bookings (Interviews, etc)
            $validated['duration_minutes'] = 30;
        }

        // ── Slot Conflict Check ──
        $conflict = Booking::where('booking_date', $validated['booking_date'])
            ->where('booking_time', $validated['booking_time'])
            ->where('assigned_to', $validated['assigned_to'] ?? null)
            ->whereNotIn('status', ['cancelled'])
            ->exists();

        if ($conflict) {
            return response()->json([
                'success' => false,
                'message' => 'This slot was just taken. Please choose another time.',
            ], 422);
        }

        if ($request->user()) {
            $validated['user_id'] = $request->user()->id;
        }

        $validated['reference'] = Booking::generateReference();

        // ── Product Snapshot (Handle Nullable Product) ──
        if ($product) {
            $validated['product_snapshot'] = [
                'id'            => $product->id,
                'name'          => $product->name,
                'type'          => $product->type,
                'purpose_label' => $this->derivePurposeLabel($product),
                'price_monthly' => $product->price_monthly,
                'price_one_time'=> $product->price_one_time,
                'category'      => $product->category?->name,
                'details'       => $this->getTypeSpecificDetails($product),
            ];
        } else {
            $validated['product_snapshot'] = null;
        }

        // Extract ID details before saving (they aren't fillable in the model usually, or handled separately)
        $idType   = $validated['id_type'];
        $idNumber = $validated['id_number'];

        $vmsData = null;

        DB::beginTransaction();
        try {
            $booking = Booking::create($validated);
            $booking->load(['product', 'assignedStaff']);

            broadcast(new BookingCreated($booking));

            // Send Confirmation Email
            \Mail::to($booking->email)
                 ->send(new \App\Mail\BookingConfirmationMail($booking));

            // Notify Admin
            User::role('admin')->each(
                fn($admin) => $admin->notify(new BookingReceivedNotification($booking))
            );

            // Notify Assigned Staff
            if ($booking->assignedStaff) {
                $booking->assignedStaff->notify(new BookingReceivedNotification($booking));
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create booking. Please try again.',
                'error'   => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }

        // ── SYNC TO VMS (Using the injected Service) ──────────────────────────
        // This is now clean and delegated to the VmsService class
        $vmsData = $this->vmsService->syncBooking($booking, $idType, $idNumber);

        // Build visitor pass summary for the frontend
        $vmsPayload = null;
        if ($vmsData) {
            $vmsPayload = [
                'reference'     => $vmsData['booking']['reference']     ?? null,
                'check_in_code' => $vmsData['booking']['check_in_code'] ?? null,
                'qr_code_url'   => $vmsData['booking']['qr_code_url']   ?? null,
                'status'        => $vmsData['booking']['status']         ?? null,
            ];
        }

        return response()->json([
            'success'   => true,
            'message'   => 'Booking submitted! Check your email for confirmation.',
            'data'      => new BookingResource($booking),
            'reference' => $booking->reference,
            'vms'       => $vmsPayload, // Returns VMS pass data if successful
        ], 201);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AUTHENTICATED: List / Show / Status update / Cancel / Stats
    // ─────────────────────────────────────────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        $user  = $request->user();
        $query = Booking::with(['product', 'assignedStaff', 'user']);

        if ($user->hasRole('admin')) {
            if ($request->status)       $query->where('status', $request->status);
            if ($request->staff_id)     $query->where('assigned_to', $request->staff_id);
            if ($request->product_id)   $query->where('product_id', $request->product_id);
            if ($request->activity_type) $query->where('activity_type', $request->activity_type); // Updated filter
            if ($request->date_from)    $query->whereDate('booking_date', '>=', $request->date_from);
            if ($request->date_to)      $query->whereDate('booking_date', '<=', $request->date_to);
            if ($request->search) {
                $s = $request->search;
                $query->where(fn($q) => $q
                    ->where('reference', 'like', "%{$s}%")
                    ->orWhere('first_name', 'like', "%{$s}%")
                    ->orWhere('last_name', 'like', "%{$s}%")
                    ->orWhere('email', 'like', "%{$s}%")
                    ->orWhere('phone', 'like', "%{$s}%")
                );
            }
        } elseif ($user->hasAnyRole(['staff', 'technical_support'])) {
            $query->where('assigned_to', $user->id);
            if ($request->status) $query->where('status', $request->status);
        } else {
            $query->where(fn($q) => $q
                ->where('user_id', $user->id)
                ->orWhere('email', $user->email)
            );
        }

        $bookings = $query
            ->orderBy('booking_date', 'desc')
            ->orderBy('booking_time', 'desc')
            ->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data'    => BookingResource::collection($bookings),
            'meta'    => [
                'current_page' => $bookings->currentPage(),
                'last_page'    => $bookings->lastPage(),
                'per_page'     => $bookings->perPage(),
                'total'        => $bookings->total(),
            ],
        ]);
    }

    public function show(Request $request, Booking $booking): JsonResponse
    {
        $user       = $request->user();
        $isOwner    = $booking->user_id === $user->id || $booking->email === $user->email;
        $isStaff    = $user->hasAnyRole(['admin', 'staff', 'technical_support']);
        $isAssigned = $booking->assigned_to === $user->id;

        if (!$isOwner && !$isStaff && !$isAssigned) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $booking->load(['product', 'assignedStaff', 'user', 'confirmedBy']);

        return response()->json(['success' => true, 'data' => new BookingResource($booking)]);
    }

    public function updateStatus(Request $request, Booking $booking): JsonResponse
    {
        if (!$request->user()->hasAnyRole(['admin', 'staff', 'technical_support'])) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'status'              => ['required', Rule::in(['confirmed', 'cancelled', 'completed', 'no_show', 'rescheduled'])],
            'cancellation_reason' => 'required_if:status,cancelled|nullable|string',
            'internal_notes'      => 'nullable|string',
            'new_date'            => 'required_if:status,rescheduled|nullable|date|after:today',
            'new_time'            => 'required_if:status,rescheduled|nullable|date_format:H:i',
            'assigned_to'         => 'nullable|exists:users,id',
            'meeting_link'        => 'nullable|url',
        ]);

        DB::beginTransaction();
        try {
            if ($validated['status'] === 'rescheduled') {
                $newBooking = $booking->replicate([
                    'status', 'confirmed_at', 'cancelled_at',
                    'cancellation_reason', 'rescheduled_from',
                    'original_date', 'original_time',
                ]);
                $newBooking->reference        = Booking::generateReference();
                $newBooking->booking_date     = $validated['new_date'];
                $newBooking->booking_time     = $validated['new_time'];
                $newBooking->rescheduled_from = $booking->id;
                $newBooking->original_date    = $booking->booking_date;
                $newBooking->original_time    = $booking->booking_time;
                $newBooking->status           = 'confirmed';
                $newBooking->confirmed_at     = now();
                $newBooking->confirmed_by     = $request->user()->id;
                if (isset($validated['assigned_to']))  $newBooking->assigned_to  = $validated['assigned_to'];
                if (isset($validated['meeting_link'])) $newBooking->meeting_link = $validated['meeting_link'];
                $newBooking->save();
                $booking->update(['status' => 'rescheduled']);
                broadcast(new BookingStatusUpdated($newBooking, 'rescheduled'));
            } else {
                $update = ['status' => $validated['status']];
                if ($validated['status'] === 'confirmed') {
                    $update['confirmed_at'] = now();
                    $update['confirmed_by'] = $request->user()->id;
                    if (isset($validated['meeting_link'])) $update['meeting_link'] = $validated['meeting_link'];
                }
                if ($validated['status'] === 'cancelled') {
                    $update['cancelled_at']        = now();
                    $update['cancellation_reason'] = $validated['cancellation_reason'];
                }
                if (isset($validated['internal_notes'])) $update['internal_notes'] = $validated['internal_notes'];
                $booking->update($update);
                $booking->load(['product', 'assignedStaff']);
                broadcast(new BookingStatusUpdated($booking, $booking->status));

                if (in_array($validated['status'], ['confirmed', 'cancelled'])) {
                    $booking->notify(new BookingConfirmedNotification($booking));
                }
            }
            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Update failed.'], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Booking updated',
            'data'    => new BookingResource($booking->fresh(['product', 'assignedStaff'])),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS (Product Logic)
    // ─────────────────────────────────────────────────────────────────────────

    private function formatBookableProduct(Product $product): array
    {
        return [
            'id'             => $product->id,
            'name'           => $product->name,
            'slug'           => $product->slug,
            'type'           => $product->type,
            'purpose_label'  => $this->derivePurposeLabel($product),
            'category'       => $product->category?->name,
            'category_slug'  => $product->category?->slug,
            'plan_category'  => $product->plan_category,
            'description'    => $product->short_description ?? $product->description,
            'is_quote_based' => (bool) $product->is_quote_based,
            'requires_approval' => (bool) $product->requires_approval,
            'badge'          => $product->badge,
            'icon'           => $product->icon,
            'image'          => $product->image,
            'price_monthly'  => $product->price_monthly,
            'price_one_time' => $product->price_one_time,
            'setup_fee'      => $product->setup_fee,
            'details'        => $this->getTypeSpecificDetails($product),
            'consultation_duration_minutes' => $this->deriveConsultationDuration($product),
        ];
    }

    private function derivePurposeLabel(Product $product): string
    {
        $name = $product->name;
        return match($product->type) {
            'internet_plan'   => "Internet Plan Consultation — {$name}",
            'hosting_package' => "Hosting Package Enquiry — {$name}",
            'web_development' => "Web Development Briefing — {$name}",
            'bulk_sms'        => "Bulk SMS Setup — {$name}",
            'domain'          => "Domain Registration Help — {$name}",
            'addon'           => "Add-on Service Query — {$name}",
            'service'         => "Service Consultation — {$name}",
            default           => "Consultation — {$name}",
        };
    }

    private function deriveConsultationDuration(Product $product): int
    {
        return match(true) {
            $product->type === 'internet_plan' && !$product->is_quote_based => 30,
            $product->type === 'hosting_package'                            => 30,
            $product->type === 'web_development'                            => 60,
            $product->type === 'service'                                    => 45,
            $product->plan_category === 'enterprise'                        => 60,
            $product->plan_category === 'business'                          => 45,
            $product->is_quote_based                                        => 60,
            default                                                         => 30,
        };
    }

    private function getTypeSpecificDetails(Product $product): array
    {
        return match($product->type) {
            'internet_plan' => [
                'speed_mbps'      => $product->speed_mbps,
                'connection_type' => $product->connection_type,
                'plan_category'   => $product->plan_category,
                'coverage_areas'  => $product->coverage_areas,
            ],
            'hosting_package' => [
                'storage_gb'      => $product->storage_gb,
                'bandwidth_gb'    => $product->bandwidth_gb,
                'email_accounts'  => $product->email_accounts,
                'ssl_included'    => $product->ssl_included,
                'backup_included' => $product->backup_included,
            ],
            'web_development' => [
                'pages_included'  => $product->pages_included,
                'revisions'       => $product->revisions_included,
                'delivery_days'   => $product->delivery_days,
            ],
            'bulk_sms' => [
                'sms_credits'  => $product->sms_credits,
                'cost_per_sms' => $product->cost_per_sms,
            ],
            default => [],
        };
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
