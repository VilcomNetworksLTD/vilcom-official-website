<?php

// app/Http/Controllers/Api/Admin/CoverageZoneController.php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CoverageZone;
use App\Models\CoverageZonePackage;
use App\Models\CoverageInterestSignup;
use App\Models\AddressCheckLog;
use App\Models\Product;
use App\Http\Resources\CoverageZonePackageResource;
use App\Http\Resources\CoverageZoneProductResource;
use Illuminate\Http\Request;

class CoverageZoneController extends Controller
{
    // ============================================
    // ZONE CRUD OPERATIONS
    // ============================================

    public function index() {
        return CoverageZone::with('children', 'packages')->withCount('children')->paginate(50);
    }

    public function store(Request $request) {
        $data = $request->validate([
            'name'           => 'required|string|max:100',
            'type'           => 'required|in:county,town,estate,sub_location',
            'parent_id'      => 'nullable|exists:coverage_zones,id',
            'geojson'        => 'nullable|array',
            'center_lat'     => 'nullable|numeric',
            'center_lng'     => 'nullable|numeric',
            'radius_km'      => 'nullable|numeric|min:0',
            'status'         => 'required|in:active,coming_soon,inactive',
            'is_serviceable' => 'boolean',
            'notes'          => 'nullable|string',
        ]);
        $data['slug'] = \Str::slug($data['name']);
        return response()->json(CoverageZone::create($data), 201);
    }

    public function update(Request $request, CoverageZone $zone) {
        $zone->update($request->validated());
        return response()->json($zone);
    }

    public function destroy(CoverageZone $zone) {
        $zone->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function show(CoverageZone $zone) {
        return response()->json(
            $zone->load(['children', 'packages', 'products'])
        );
    }

    // ============================================
    // ZONE PRODUCTS MANAGEMENT
    // ============================================

    /**
     * GET /api/admin/coverage/zones/{zone}/products
     * Get all products attached to a zone
     */
    public function zoneProducts(CoverageZone $zone)
    {
        $attached = $zone->products()->with('category')->get();
        $all = Product::active()->with('category')->get();

        // Get IDs of already attached products
        $attachedIds = $attached->pluck('id');
        
        // Filter available products (not yet attached)
        $availableToAdd = $all->whereNotIn('id', $attachedIds)->values();

        return response()->json([
            'attached' => CoverageZoneProductResource::collection($attached),
            'available_to_add' => $availableToAdd,
        ]);
    }

    /**
     * POST /api/admin/coverage/zones/{zone}/products
     * Attach a product to a zone
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
            'speed_mbps'          => 'nullable|integer',
            'connection_type'     => 'nullable|in:fiber,wireless,both',
            'notes'               => 'nullable|string',
        ]);

        $productId = $data['product_id'];
        unset($data['product_id']);

        $zone->products()->syncWithoutDetaching([$productId => $data]);

        return response()->json(['message' => 'Product attached to zone.']);
    }

    /**
     * PUT /api/admin/coverage/zones/{zone}/products/{product}
     * Update a product's zone-specific settings
     */
    public function updateZoneProduct(Request $request, CoverageZone $zone, Product $product)
    {
        $data = $request->validate([
            'is_available'        => 'boolean',
            'price_monthly'       => 'nullable|numeric|min:0',
            'price_quarterly'      => 'nullable|numeric|min:0',
            'price_semi_annually' => 'nullable|numeric|min:0',
            'price_annually'       => 'nullable|numeric|min:0',
            'price_one_time'       => 'nullable|numeric|min:0',
            'setup_fee'            => 'nullable|numeric|min:0',
            'promotional_price'    => 'nullable|numeric|min:0',
            'promotional_start'    => 'nullable|date',
            'promotional_end'      => 'nullable|date|after:promotional_start',
            'capacity_limit'       => 'nullable|integer|min:1',
            'current_capacity'     => 'nullable|integer|min:0',
            'speed_mbps'           => 'nullable|integer',
            'connection_type'      => 'nullable|in:fiber,wireless,both',
            'notes'                => 'nullable|string',
        ]);

        $zone->products()->updateExistingPivot($product->id, $data);

        return response()->json(['message' => 'Zone product updated.']);
    }

    /**
     * DELETE /api/admin/coverage/zones/{zone}/products/{product}
     * Detach a product from a zone
     */
    public function detachProduct(CoverageZone $zone, Product $product)
    {
        $zone->products()->detach($product->id);
        return response()->json(['message' => 'Product removed from zone.']);
    }

    // ============================================
    // ZONE PACKAGES MANAGEMENT
    // ============================================

    /**
     * GET /api/admin/coverage/zones/{zone}/packages
     * Get all packages for a zone
     */
    public function zonePackages(CoverageZone $zone)
    {
        $packages = $zone->packages()->orderBy('sort_order')->get();
        return response()->json([
            'packages' => CoverageZonePackageResource::collection($packages),
        ]);
    }

    /**
     * POST /api/admin/coverage/zones/{zone}/packages
     * Create a new package for a zone
     */
    public function storePackage(Request $request, CoverageZone $zone)
    {
        $data = $request->validate([
            'package_name'      => 'required|string|max:100',
            'speed_mbps_down'    => 'nullable|numeric|min:0',
            'speed_mbps_up'      => 'nullable|numeric|min:0',
            'monthly_price'      => 'required|numeric|min:0',
            'currency'           => 'string|max:3|default:KES',
            'is_available'       => 'boolean|default:true',
            'description'        => 'nullable|string',
            'features'           => 'nullable|array',
            'sort_order'         => 'integer|min:0|default:0',
        ]);

        $package = $zone->packages()->create($data);

        return response()->json([
            'message' => 'Package created successfully.',
            'package' => new CoverageZonePackageResource($package),
        ], 201);
    }

    /**
     * PUT /api/admin/coverage/zones/{zone}/packages/{package}
     * Update a zone package
     */
    public function updatePackage(Request $request, CoverageZone $zone, CoverageZonePackage $package)
    {
        $data = $request->validate([
            'package_name'      => 'sometimes|string|max:100',
            'speed_mbps_down'   => 'nullable|numeric|min:0',
            'speed_mbps_up'     => 'nullable|numeric|min:0',
            'monthly_price'     => 'sometimes|numeric|min:0',
            'currency'          => 'string|max:3',
            'is_available'      => 'boolean',
            'description'       => 'nullable|string',
            'features'          => 'nullable|array',
            'sort_order'        => 'integer|min:0',
        ]);

        $package->update($data);

        return response()->json([
            'message' => 'Package updated successfully.',
            'package' => new CoverageZonePackageResource($package),
        ]);
    }

    /**
     * DELETE /api/admin/coverage/zones/{zone}/packages/{package}
     * Delete a zone package
     */
    public function destroyPackage(CoverageZone $zone, CoverageZonePackage $package)
    {
        $package->delete();
        return response()->json(['message' => 'Package deleted successfully.']);
    }

    // ============================================
    // INTEREST SIGNUPS
    // ============================================

    public function interestSignups(Request $request)
    {
        $query = CoverageInterestSignup::query();

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search by name, email, or address
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%")
                  ->orWhere('address', 'LIKE', "%{$search}%");
            });
        }

        return $query->latest()->paginate($request->get('per_page', 50));
    }

    /**
     * PUT /api/admin/coverage/interest-signups/{signup}/status
     * Update interest signup status
     */
    public function updateSignupStatus(Request $request, CoverageInterestSignup $signup)
    {
        $data = $request->validate([
            'status' => 'required|in:pending,contacted,covered,not_viable',
            'notes'  => 'nullable|string',
        ]);

        $signup->update($data);

        return response()->json([
            'message' => 'Status updated successfully.',
            'signup' => $signup,
        ]);
    }

    // ============================================
    // ANALYTICS
    // ============================================

    public function analytics(Request $request)
    {
        $from = $request->get('from', now()->subDays(30));
        $to = $request->get('to', now());

        return response()->json([
            'total_checks'      => AddressCheckLog::count(),
            'covered_checks'    => AddressCheckLog::where('is_covered', true)->count(),
            'uncovered_checks'  => AddressCheckLog::where('is_covered', false)->count(),
            'period_checks'     => AddressCheckLog::whereBetween('created_at', [$from, $to])->count(),
            'top_covered'        => AddressCheckLog::where('is_covered', true)
                ->selectRaw('query_input, count(*) as count')
                ->groupBy('query_input')
                ->orderByDesc('count')
                ->limit(10)
                ->get(),
            'top_uncovered'     => AddressCheckLog::where('is_covered', false)
                ->selectRaw('query_input, count(*) as count')
                ->groupBy('query_input')
                ->orderByDesc('count')
                ->limit(10)
                ->get(),
            'interest_signups'   => CoverageInterestSignup::count(),
            'pending_signups'    => CoverageInterestSignup::where('status', 'pending')->count(),
            'zones_summary'     => [
                'total'       => CoverageZone::count(),
                'active'      => CoverageZone::where('status', 'active')->count(),
                'coming_soon' => CoverageZone::where('status', 'coming_soon')->count(),
                'inactive'    => CoverageZone::where('status', 'inactive')->count(),
            ],
        ]);
    }

    // ============================================
    // ADDRESS CHECK LOGS
    // ============================================

    /**
     * GET /api/admin/coverage/check-logs
     * Get address check logs
     */
    public function checkLogs(Request $request)
    {
        $query = AddressCheckLog::query();

        // Filter by coverage status
        if ($request->has('is_covered')) {
            $query->where('is_covered', $request->boolean('is_covered'));
        }

        // Filter by date range
        if ($request->has('from') && $request->has('to')) {
            $query->whereBetween('created_at', [$request->from, $request->to]);
        }

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('query_input', 'LIKE', "%{$search}%")
                  ->orWhere('matched_zone', 'LIKE', "%{$search}%");
            });
        }

        return $query->latest()->paginate($request->get('per_page', 50));
    }
}
