<?php

namespace App\Http\Controllers\Api;

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
use Illuminate\Validation\Rule;

class BookingController extends Controller
{
    // ─────────────────────────────────────────────────────────────────────────
    // PUBLIC: Products available for booking
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/v1/bookings/services
     *
     * Returns bookable products from your existing products table.
     * Grouped by category for UI, plus a flat list for simple <select>.
     *
     * Supports filters:
     *   ?type=internet_plan
     *   ?plan_category=home|business|enterprise
     *   ?category=internet           (category slug)
     *   ?quote_based_only=true
     */
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

        // Grouped by category — for a sectioned dropdown/accordion in the UI
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
            'data'    => $grouped,                                                    // Grouped
            'flat'    => $products->map(fn($p) => $this->formatBookableProduct($p)), // Flat list
        ]);
    }

    /**
     * Normalize a Product into a consistent booking-form shape.
     */
    private function formatBookableProduct(Product $product): array
    {
        return [
            'id'             => $product->id,
            'name'           => $product->name,
            'slug'           => $product->slug,
            'type'           => $product->type,

            // Human-readable meeting purpose label shown in the booking form
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

            // Pricing shown to the client for context
            'price_monthly'  => $product->price_monthly,
            'price_one_time' => $product->price_one_time,
            'setup_fee'      => $product->setup_fee,

            // Type-specific details so staff can prepare for the meeting
            'details'        => $this->getTypeSpecificDetails($product),

            // Dynamically derived consultation length
            'consultation_duration_minutes' => $this->deriveConsultationDuration($product),
        ];
    }

    /**
     * Human-readable "meeting purpose" based on product type.
     */
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

    /**
     * Derive a sensible consultation duration from product attributes.
     */
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

    /**
     * Type-specific product details surfaced to the staff in the admin panel.
     */
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
                'sms_credits'     => $product->sms_credits,
                'cost_per_sms'    => $product->cost_per_sms,
            ],
            default => [],
        };
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PUBLIC: Available time slots
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/v1/bookings/available-slots
     * ?date=2026-03-15&product_id=3&staff_id=5 (staff optional)
     */
    public function availableSlots(Request $request): JsonResponse
    {
        $request->validate([
            'date'       => 'required|date|after_or_equal:today',
            'product_id' => 'required|exists:products,id',
            'staff_id'   => 'nullable|exists:users,id',
        ]);

        $product   = Product::findOrFail($request->product_id);
        $duration  = $this->deriveConsultationDuration($product);
        $date      = $request->date;
        $dayOfWeek = date('w', strtotime($date));
        $allSlots  = $this->generateTimeSlots('09:00', '17:00', 30);

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
        $validated = $request->validate([
            'first_name'    => 'required|string|max:100',
            'last_name'     => 'required|string|max:100',
            'email'         => 'required|email',
            'phone'         => 'required|string|max:20',
            'company_name'  => 'nullable|string|max:255',
            'customer_type' => 'required|in:individual,business',
            'product_id'    => 'required|exists:products,id',
            'assigned_to'   => 'nullable|exists:users,id',
            'booking_date'  => 'required|date|after:today',
            'booking_time'  => 'required|date_format:H:i',
            'meeting_type'  => 'required|in:in_person,virtual,phone',
            'notes'         => 'nullable|string|max:1000',
        ]);

        $product = Product::active()->findOrFail($validated['product_id']);

        // Slot conflict check
        $conflict = Booking::where('booking_date', $validated['booking_date'])
            ->where('booking_time', $validated['booking_time'])
            ->where('assigned_to', $validated['assigned_to'] ?? null)
            ->whereNotIn('status', ['cancelled'])
            ->exists();

        if ($conflict) {
            return response()->json([
                'success' => false,
                'message' => 'This slot was just taken. Please choose another.',
            ], 422);
        }

        if ($request->user()) {
            $validated['user_id'] = $request->user()->id;
        }

        $validated['duration_minutes'] = $this->deriveConsultationDuration($product);
        $validated['reference']        = Booking::generateReference();

        // Snapshot the product so booking history stays accurate even if product changes later
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

        DB::beginTransaction();
        try {
            $booking = Booking::create($validated);
            $booking->load(['product', 'assignedStaff']);

            // Broadcast event for real-time updates
            broadcast(new BookingCreated($booking));

            // Send email notification to client
            \Mail::to($booking->email)
                 ->queue(new \App\Mail\BookingConfirmationMail($booking));

            // Notify admins
            User::role('admin')->each(
                fn($admin) => $admin->notify(new BookingReceivedNotification($booking))
            );

            // Notify assigned staff
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

        return response()->json([
            'success'   => true,
            'message'   => 'Booking submitted! Check your email for confirmation.',
            'data'      => new BookingResource($booking),
            'reference' => $booking->reference,
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
            if ($request->product_type) {
                $query->whereHas('product', fn($q) => $q->ofType($request->product_type));
            }
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

    public function track(string $reference): JsonResponse
    {
        $booking = Booking::with(['product', 'assignedStaff'])
            ->where('reference', $reference)
            ->firstOrFail();

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

                // Send notification to client for status changes
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

    public function cancel(Request $request, Booking $booking): JsonResponse
    {
        $user    = $request->user();
        $isOwner = $booking->user_id === $user->id || $booking->email === $user->email;

        if (!$isOwner && !$user->hasAnyRole(['admin', 'staff'])) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        if ($booking->isCancelled()) {
            return response()->json(['success' => false, 'message' => 'Already cancelled'], 422);
        }

        $validated = $request->validate(['reason' => 'required|string|max:500']);
        $booking->cancel($validated['reason']);
        broadcast(new BookingStatusUpdated($booking, 'cancelled'));

        return response()->json(['success' => true, 'message' => 'Booking cancelled']);
    }

    public function statistics(Request $request): JsonResponse
    {
        $user  = $request->user();
        $query = Booking::query();

        if ($user->hasAnyRole(['staff', 'technical_support'])) {
            $query->where('assigned_to', $user->id);
        }

        $byType = (clone $query)
            ->join('products', 'bookings.product_id', '=', 'products.id')
            ->selectRaw('products.type, count(*) as total')
            ->groupBy('products.type')
            ->pluck('total', 'products.type');

        return response()->json([
            'success' => true,
            'data'    => [
                'total'           => (clone $query)->count(),
                'pending'         => (clone $query)->where('status', 'pending')->count(),
                'confirmed'       => (clone $query)->where('status', 'confirmed')->count(),
                'today'           => (clone $query)->whereDate('booking_date', today())->count(),
                'this_week'       => (clone $query)->whereBetween('booking_date', [now()->startOfWeek(), now()->endOfWeek()])->count(),
                'completed'       => (clone $query)->where('status', 'completed')->count(),
                'cancelled'       => (clone $query)->where('status', 'cancelled')->count(),
                'upcoming'        => (clone $query)->upcoming()->count(),
                'by_product_type' => $byType,
            ],
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────────

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

