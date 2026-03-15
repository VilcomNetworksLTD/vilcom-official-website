<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CoverageZone;
use App\Models\CoverageZonePackage;
use App\Models\CoverageInterestSignup;
use App\Models\AddressCheckLog;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CoverageZoneController extends Controller
{
    // ============================================
    // ZONE CRUD
    // ============================================

    /**
     * GET /api/v1/coverage/admin/coverage/zones
     * Returns { data: [...], meta: { total, per_page, current_page, last_page } }
     */
    public function index(Request $request)
    {
        $query = CoverageZone::query();

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('parent_id')) {
            $query->where('parent_id', $request->parent_id);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name',  'LIKE', "%{$request->search}%")
                  ->orWhere('slug', 'LIKE', "%{$request->search}%");
            });
        }

        $query->withCount('children')->orderBy('type')->orderBy('name');

        $perPage = min((int) $request->get('per_page', 50), 500);
        $zones   = $query->paginate($perPage);

        return response()->json([
            'data' => $zones->items(),
            'meta' => [
                'total'        => $zones->total(),
                'per_page'     => $zones->perPage(),
                'current_page' => $zones->currentPage(),
                'last_page'    => $zones->lastPage(),
            ],
        ]);
    }

    /**
     * POST /api/v1/coverage/admin/coverage/zones
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name'           => 'required|string|max:255',
            'slug'           => 'nullable|string|max:255',
            'type'           => 'required|in:area,zone,region,county,sub-county',
            'parent_id'      => 'nullable|exists:coverage_zones,id',
            'geojson'        => 'nullable|array',
            'center_lat'     => 'nullable|numeric',
            'center_lng'     => 'nullable|numeric',
            'radius_km'      => 'nullable|numeric|min:0',
            // DB enum: active | inactive | planned
            'status'         => 'required|in:active,inactive,planned',
            'is_serviceable' => 'boolean',
            'notes'          => 'nullable|string',
        ]);

        // Generate unique slug
        $base = $data['slug'] ?? Str::slug($data['name']);
        $slug = $base;
        $i    = 1;
        while (CoverageZone::where('slug', $slug)->exists()) {
            $slug = "{$base}-{$i}";
            $i++;
        }
        $data['slug'] = $slug;

        $zone = CoverageZone::create($data);

        return response()->json(['data' => $zone], 201);
    }

    /**
     * GET /api/v1/coverage/admin/coverage/zones/{zone}
     */
    public function show(CoverageZone $zone)
    {
        $zone->load(['parent', 'children', 'packages']);

        return response()->json(['data' => $zone]);
    }

    /**
     * PUT /api/v1/coverage/admin/coverage/zones/{zone}
     */
    public function update(Request $request, CoverageZone $zone)
    {
        $data = $request->validate([
            'name'           => 'sometimes|string|max:255',
            'slug'           => "sometimes|string|unique:coverage_zones,slug,{$zone->id}",
            'type'           => 'sometimes|in:area,zone,region,county,sub-county',
            'parent_id'      => 'nullable|exists:coverage_zones,id',
            'geojson'        => 'nullable|array',
            'center_lat'     => 'nullable|numeric',
            'center_lng'     => 'nullable|numeric',
            'radius_km'      => 'nullable|numeric|min:0',
            'status'         => 'sometimes|in:active,inactive,planned',
            'is_serviceable' => 'boolean',
            'notes'          => 'nullable|string',
        ]);

        $zone->update($data);

        return response()->json(['data' => $zone->fresh()]);
    }

    /**
     * DELETE /api/v1/coverage/admin/coverage/zones/{zone}
     */
    public function destroy(CoverageZone $zone)
    {
        $zone->delete();

        return response()->json(['message' => 'Zone deleted successfully.']);
    }

    // ============================================
    // ZONE PRODUCTS
    // ============================================

    /**
     * GET /api/v1/coverage/admin/coverage/zones/{zone}/products
     */
    public function zoneProducts(CoverageZone $zone)
    {
        $attached = $zone->products()->with('category')->get();
        $all      = Product::where('status', 'active')->with('category')->get();

        $attachedIds     = $attached->pluck('id');
        $availableToAdd  = $all->whereNotIn('id', $attachedIds)->values();

        return response()->json([
            'data' => [
                'attached'        => $attached,
                'available_to_add'=> $availableToAdd,
            ],
        ]);
    }

    /**
     * POST /api/v1/coverage/admin/coverage/zones/{zone}/products
     */
    public function attachProduct(Request $request, CoverageZone $zone)
    {
        $data = $request->validate([
            'product_id'          => 'required|exists:products,id',
            'is_available'        => 'boolean',
            'price_monthly'       => 'nullable|numeric|min:0',
            'price_quarterly'     => 'nullable|numeric|min:0',
            'price_semi_annually' => 'nullable|numeric|min:0',
            'price_annually'      => 'nullable|numeric|min:0',
            'price_one_time'      => 'nullable|numeric|min:0',
            'setup_fee'           => 'nullable|numeric|min:0',
            'promotional_price'   => 'nullable|numeric|min:0',
            'promotional_start'   => 'nullable|date',
            'promotional_end'     => 'nullable|date|after:promotional_start',
            'capacity_limit'      => 'nullable|integer|min:1',
            'speed_mbps'          => 'nullable|integer|min:0',
            'connection_type'     => 'nullable|in:fiber,wireless,both',
            'notes'               => 'nullable|string',
        ]);

        $productId = $data['product_id'];
        unset($data['product_id']);

        $zone->products()->syncWithoutDetaching([$productId => $data]);

        return response()->json(['message' => 'Product attached to zone.'], 201);
    }

    /**
     * PUT /api/v1/coverage/admin/coverage/zones/{zone}/products/{product}
     */
    public function updateZoneProduct(Request $request, CoverageZone $zone, Product $product)
    {
        $data = $request->validate([
            'is_available'        => 'boolean',
            'price_monthly'       => 'nullable|numeric|min:0',
            'price_quarterly'     => 'nullable|numeric|min:0',
            'price_semi_annually' => 'nullable|numeric|min:0',
            'price_annually'      => 'nullable|numeric|min:0',
            'price_one_time'      => 'nullable|numeric|min:0',
            'setup_fee'           => 'nullable|numeric|min:0',
            'promotional_price'   => 'nullable|numeric|min:0',
            'promotional_start'   => 'nullable|date',
            'promotional_end'     => 'nullable|date|after:promotional_start',
            'capacity_limit'      => 'nullable|integer|min:1',
            'current_capacity'    => 'nullable|integer|min:0',
            'speed_mbps'          => 'nullable|integer|min:0',
            'connection_type'     => 'nullable|in:fiber,wireless,both',
            'notes'               => 'nullable|string',
        ]);

        $zone->products()->updateExistingPivot($product->id, $data);

        return response()->json(['message' => 'Zone product updated.']);
    }

    /**
     * DELETE /api/v1/coverage/admin/coverage/zones/{zone}/products/{product}
     */
    public function detachProduct(CoverageZone $zone, Product $product)
    {
        $zone->products()->detach($product->id);

        return response()->json(['message' => 'Product removed from zone.']);
    }

    // ============================================
    // ZONE PACKAGES
    // ============================================

    /**
     * GET /api/v1/coverage/admin/coverage/zones/{zone}/packages
     * Returns { data: [...] } — frontend uses extractArray() on this
     */
    public function zonePackages(CoverageZone $zone)
    {
        $packages = $zone->packages()
            ->orderBy('sort_order')
            ->orderBy('monthly_price')
            ->get()
            ->map(function (CoverageZonePackage $pkg) {
                return array_merge($pkg->toArray(), [
                    'formatted_speed' => $this->formatSpeed($pkg->speed_mbps_down, $pkg->speed_mbps_up),
                    'formatted_price' => $this->formatPrice($pkg->monthly_price, $pkg->currency),
                ]);
            });

        return response()->json(['data' => $packages]);
    }

    /**
     * POST /api/v1/coverage/admin/coverage/zones/{zone}/packages
     */
    public function storePackage(Request $request, CoverageZone $zone)
    {
        $data = $request->validate([
            'package_name'    => 'required|string|max:100',
            'speed_mbps_down' => 'nullable|numeric|min:0',
            'speed_mbps_up'   => 'nullable|numeric|min:0',
            'monthly_price'   => 'required|numeric|min:0',
            'currency'        => 'nullable|string|max:3',
            'is_available'    => 'boolean',
            'description'     => 'nullable|string',
            'features'        => 'nullable|array',
            'sort_order'      => 'nullable|integer|min:0',
        ]);

        $data['currency']   = $data['currency']   ?? 'KES';
        $data['is_available'] = $data['is_available'] ?? true;
        $data['sort_order'] = $data['sort_order']  ?? 0;

        $package = $zone->packages()->create($data);

        return response()->json([
            'data'    => array_merge($package->toArray(), [
                'formatted_speed' => $this->formatSpeed($package->speed_mbps_down, $package->speed_mbps_up),
                'formatted_price' => $this->formatPrice($package->monthly_price, $package->currency),
            ]),
            'message' => 'Package created successfully.',
        ], 201);
    }

    /**
     * PUT /api/v1/coverage/admin/coverage/zones/{zone}/packages/{package}
     */
    public function updatePackage(Request $request, CoverageZone $zone, CoverageZonePackage $package)
    {
        $data = $request->validate([
            'package_name'    => 'sometimes|string|max:100',
            'speed_mbps_down' => 'nullable|numeric|min:0',
            'speed_mbps_up'   => 'nullable|numeric|min:0',
            'monthly_price'   => 'sometimes|numeric|min:0',
            'currency'        => 'nullable|string|max:3',
            'is_available'    => 'boolean',
            'description'     => 'nullable|string',
            'features'        => 'nullable|array',
            'sort_order'      => 'nullable|integer|min:0',
        ]);

        $package->update($data);
        $package->refresh();

        return response()->json([
            'data'    => array_merge($package->toArray(), [
                'formatted_speed' => $this->formatSpeed($package->speed_mbps_down, $package->speed_mbps_up),
                'formatted_price' => $this->formatPrice($package->monthly_price, $package->currency),
            ]),
            'message' => 'Package updated successfully.',
        ]);
    }

    /**
     * DELETE /api/v1/coverage/admin/coverage/zones/{zone}/packages/{package}
     */
    public function destroyPackage(CoverageZone $zone, CoverageZonePackage $package)
    {
        $package->delete();

        return response()->json(['message' => 'Package deleted successfully.']);
    }

    // ============================================
    // INTEREST SIGNUPS
    // ============================================

    /**
     * GET /api/v1/coverage/admin/coverage/interest-signups
     * Returns { data: [...], meta: {...} }
     */
    public function interestSignups(Request $request)
    {
        $query = CoverageInterestSignup::query();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name',    'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%")
                  ->orWhere('address','LIKE', "%{$search}%");
            });
        }

        $signups = $query->latest()->paginate($request->get('per_page', 50));

        return response()->json([
            'data' => $signups->items(),
            'meta' => [
                'total'        => $signups->total(),
                'per_page'     => $signups->perPage(),
                'current_page' => $signups->currentPage(),
                'last_page'    => $signups->lastPage(),
            ],
        ]);
    }

    /**
     * PUT /api/v1/coverage/admin/coverage/interest-signups/{signup}/status
     */
    public function updateSignupStatus(Request $request, CoverageInterestSignup $signup)
    {
        $data = $request->validate([
            'status' => 'required|in:pending,contacted,covered,not_viable',
            'notes'  => 'nullable|string',
        ]);

        $signup->update($data);

        return response()->json([
            'data'    => $signup->fresh(),
            'message' => 'Status updated successfully.',
        ]);
    }

    // ============================================
    // ANALYTICS
    // ============================================

    /**
     * GET /api/v1/coverage/admin/coverage/analytics
     *
     * zones_summary uses the actual DB enum values (active|inactive|planned).
     * The 'coming_soon' key is kept for frontend compatibility — it maps to 'planned'.
     */
    public function analytics(Request $request)
    {
        $from = $request->filled('from') ? $request->from : now()->subDays(30)->toDateString();
        $to   = $request->filled('to')   ? $request->to   : now()->toDateString();

        $logQuery = AddressCheckLog::whereBetween('created_at', [
            $from . ' 00:00:00',
            $to   . ' 23:59:59',
        ]);

        $totalChecks    = (clone $logQuery)->count();
        $coveredChecks  = (clone $logQuery)->where('is_covered', true)->count();
        $uncoveredChecks = $totalChecks - $coveredChecks;

        return response()->json([
            'total_checks'     => $totalChecks,
            'covered_checks'   => $coveredChecks,
            'uncovered_checks' => $uncoveredChecks,
            'interest_signups' => CoverageInterestSignup::count(),
            'pending_signups'  => CoverageInterestSignup::where('status', 'pending')->count(),
            'zones_summary'    => [
                'total'       => CoverageZone::count(),
                'active'      => CoverageZone::where('status', 'active')->count(),
                // 'planned' in DB → 'coming_soon' key for frontend compatibility
                'coming_soon' => CoverageZone::where('status', 'planned')->count(),
                'inactive'    => CoverageZone::where('status', 'inactive')->count(),
            ],
            'top_covered'   => AddressCheckLog::where('is_covered', true)
                ->whereBetween('created_at', [$from . ' 00:00:00', $to . ' 23:59:59'])
                ->selectRaw('query_input, count(*) as count')
                ->groupBy('query_input')
                ->orderByDesc('count')
                ->limit(10)
                ->get(),
            'top_uncovered' => AddressCheckLog::where('is_covered', false)
                ->whereBetween('created_at', [$from . ' 00:00:00', $to . ' 23:59:59'])
                ->selectRaw('query_input, count(*) as count')
                ->groupBy('query_input')
                ->orderByDesc('count')
                ->limit(10)
                ->get(),
            'period' => ['from' => $from, 'to' => $to],
        ]);
    }

    // ============================================
    // ADDRESS CHECK LOGS
    // ============================================

    /**
     * GET /api/v1/coverage/admin/coverage/check-logs
     * Returns { data: [...], meta: {...} }
     */
    public function checkLogs(Request $request)
    {
        $query = AddressCheckLog::query();

        if ($request->filled('is_covered')) {
            $query->where('is_covered', filter_var($request->is_covered, FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('from') && $request->filled('to')) {
            $query->whereBetween('created_at', [
                $request->from . ' 00:00:00',
                $request->to   . ' 23:59:59',
            ]);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('query_input',  'LIKE', "%{$search}%")
                  ->orWhere('matched_zone','LIKE', "%{$search}%");
            });
        }

        $logs = $query->latest()->paginate($request->get('per_page', 50));

        return response()->json([
            'data' => $logs->items(),
            'meta' => [
                'total'        => $logs->total(),
                'per_page'     => $logs->perPage(),
                'current_page' => $logs->currentPage(),
                'last_page'    => $logs->lastPage(),
            ],
        ]);
    }

    // ============================================
    // PRIVATE HELPERS
    // ============================================

    private function formatSpeed(?float $down, ?float $up): string
    {
        if (!$down && !$up) return '—';
        if ($down >= 1000 || $up >= 1000) {
            $d = $down ? round($down / 1000, 1) . 'Gbps' : '—';
            $u = $up   ? round($up   / 1000, 1) . 'Gbps' : '—';
            return "{$d} ↓ / {$u} ↑";
        }
        $d = $down ? (int) $down . 'Mbps' : '—';
        $u = $up   ? (int) $up   . 'Mbps' : '—';
        return "{$d} ↓ / {$u} ↑";
    }

    private function formatPrice(float $price, string $currency = 'KES'): string
    {
        return $currency . ' ' . number_format($price, 0) . '/mo';
    }
}
