<?php

// app/Http/Controllers/Api/CoverageCheckerController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CoverageZone;
use App\Models\AddressCheckLog;
use App\Models\CoverageInterestSignup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class CoverageCheckerController extends Controller
{
    public function check(Request $request)
    {
        $request->validate([
            'address' => 'nullable|string|max:255',
            'lat'     => 'nullable|numeric|between:-90,90',
            'lng'     => 'nullable|numeric|between:-180,180',
        ]);

        $lat = $request->lat;
        $lng = $request->lng;
        $addressInput = $request->address;
        $matchedZone = null;
        $isCovered = false;

        // 1. If lat/lng provided directly, skip geocoding
        if ($lat && $lng) {
            [$isCovered, $matchedZone] = $this->checkCoordinates($lat, $lng);
        }

        // 2. If address string, try matching against zone names first (fast path)
        elseif ($addressInput) {
            [$isCovered, $matchedZone] = $this->checkByAddressString($addressInput);

            // 3. If no match, geocode via Google Maps / OpenStreetMap Nominatim
            if (!$isCovered && !$matchedZone) {
                $geocoded = $this->geocodeAddress($addressInput);
                if ($geocoded) {
                    $lat = $geocoded['lat'];
                    $lng = $geocoded['lng'];
                    [$isCovered, $matchedZone] = $this->checkCoordinates($lat, $lng);
                }
            }
        }

        // Log the check
        AddressCheckLog::create([
            'query_input'  => $addressInput ?? "lat:{$lat},lng:{$lng}",
            'matched_zone' => $matchedZone?->name,
            'is_covered'   => $isCovered,
            'query_lat'    => $lat,
            'query_lng'    => $lng,
            'ip_address'   => $request->ip(),
            'user_id'      => auth()->id(),
            'raw_result'   => $matchedZone ? $matchedZone->toArray() : null,
        ]);

        return response()->json([
            'is_covered'  => $isCovered,
            'zone'        => $matchedZone ? [
                'id'     => $matchedZone->id,
                'name'   => $matchedZone->name,
                'type'   => $matchedZone->type,
                'status' => $matchedZone->status,
                'packages' => $matchedZone->packages->where('is_available', true)->values(),
            ] : null,
            'coordinates' => $lat && $lng ? ['lat' => $lat, 'lng' => $lng] : null,
            'message'     => $isCovered
                ? "Great news! We cover {$matchedZone->name}. Check available packages below."
                : "We don't cover this area yet, but you can register your interest!",
        ]);
    }

    private function checkByAddressString(string $address): array
    {
        // Fuzzy match zone names — search children first (most specific)
        $zone = CoverageZone::where('status', 'active')
            ->where('is_serviceable', true)
            ->where(function ($q) use ($address) {
                $q->where('name', 'LIKE', "%{$address}%")
                  ->orWhereRaw('? LIKE CONCAT("%", name, "%")', [$address]);
            })
            ->orderByRaw("FIELD(type, 'estate', 'sub_location', 'town', 'county')") // most specific first
            ->first();

        return $zone ? [true, $zone] : [false, null];
    }

    private function checkCoordinates(float $lat, float $lng): array
    {
        $zones = CoverageZone::where('status', 'active')
            ->where('is_serviceable', true)
            ->whereNotNull('center_lat')
            ->with('packages')
            ->get();

        foreach ($zones as $zone) {
            if ($zone->containsPoint($lat, $lng)) {
                return [true, $zone];
            }
        }

        return [false, null];
    }

    private function geocodeAddress(string $address): ?array
    {
        // Using OpenStreetMap Nominatim (free, no key needed)
        $response = Http::withHeaders(['User-Agent' => config('app.name') . ' ISP Coverage Checker'])
            ->get('https://nominatim.openstreetmap.org/search', [
                'q'              => $address . ', Kenya',
                'format'         => 'json',
                'limit'          => 1,
                'countrycodes'   => 'ke',
            ]);

        if ($response->ok() && count($response->json()) > 0) {
            $result = $response->json()[0];
            return ['lat' => (float) $result['lat'], 'lng' => (float) $result['lon']];
        }

        // Fallback: Google Maps Geocoding API
        if (config('services.google_maps.key')) {
            $response = Http::get('https://maps.googleapis.com/maps/api/geocode/json', [
                'address' => $address . ', Kenya',
                'key'     => config('services.google_maps.key'),
            ]);

            if ($response->ok() && $response->json('status') === 'OK') {
                $loc = $response->json('results.0.geometry.location');
                return ['lat' => $loc['lat'], 'lng' => $loc['lng']];
            }
        }

        return null;
    }

    public function publicAreas()
    {
        $areas = CoverageZone::with('children', 'packages')
            ->whereNull('parent_id') // top-level
            ->where('status', 'active')
            ->get()
            ->map(fn($z) => [
                'id'       => $z->id,
                'name'     => $z->name,
                'type'     => $z->type,
                'children' => $z->children->where('status', 'active')->values(),
            ]);

        return response()->json(['areas' => $areas]);
    }

    public function geojson()
    {
        $zones = CoverageZone::where('status', 'active')
            ->whereNotNull('geojson')
            ->get();

        $features = $zones->map(fn($z) => [
            'type'       => 'Feature',
            'geometry'   => $z->geojson,
            'properties' => [
                'id'     => $z->id,
                'name'   => $z->name,
                'type'   => $z->type,
                'status' => $z->status,
            ],
        ]);

        return response()->json([
            'type'     => 'FeatureCollection',
            'features' => $features,
        ]);
    }

    public function registerInterest(Request $request)
    {
        $validated = $request->validate([
            'name'             => 'required|string|max:100',
            'email'            => 'required|email',
            'phone'            => 'nullable|string|max:20',
            'address'          => 'required|string|max:255',
            'area_description' => 'nullable|string|max:500',
            'lat'              => 'nullable|numeric',
            'lng'              => 'nullable|numeric',
        ]);

        CoverageInterestSignup::create($validated);

        return response()->json([
            'message' => "Thanks {$validated['name']}! We've noted your interest. We'll notify you when we expand to your area.",
        ], 201);
    }

    /**
     * GET /api/v1/coverage/zones
     * Public paginated list of active coverage zones for map (with coordinates)
     */
    public function publicZones(Request $request)
    {
        $query = \App\Models\CoverageZone::query()
            ->where('status', 'active')
            ->where('is_serviceable', true)
            ->whereNotNull('center_lat')
            ->whereNotNull('center_lng')
            ->with('products')
            ->withCount('children')
            ->orderBy('type')
            ->orderBy('name');

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'LIKE', "%{$request->search}%")
                  ->orWhere('slug', 'LIKE', "%{$request->search}%");
            });
        }

        $perPage = min((int) $request->get('per_page', 50), 500);
        $zones = $query->paginate($perPage);

        // Transform for frontend CoverageZone type
        $data = $zones->getCollection()->map(function ($zone) {
            return [
                'id' => $zone->id,
                'name' => $zone->name,
                'slug' => $zone->slug,
                'type' => $zone->type,
                'center_lat' => (float) $zone->center_lat,
                'center_lng' => (float) $zone->center_lng,
                'radius_km' => $zone->radius_km ?? 0,
                'status' => $zone->status,
                'county' => $this->extractCounty($zone->name), // derive from name
                'coverage_type' => $zone->products->isNotEmpty() ? 'Both' : 'Home', // simple logic
                'connectivity_index' => $this->computeConnectivityIndex($zone),
                'is_serviceable' => (bool) $zone->is_serviceable,
                'notes' => $zone->notes,
                'children_count' => $zone->children_count,
            ];
        });

        return response()->json([
            'data' => $data,
            'meta' => [
                'total' => $zones->total(),
                'per_page' => $zones->perPage(),
                'current_page' => $zones->currentPage(),
                'last_page' => $zones->lastPage(),
            ],
        ]);
    }

    private function extractCounty($name)
    {
        $counties = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Kiambu']; // top ones
        foreach ($counties as $county) {
            if (stripos($name, $county) !== false) return $county;
        }
        return null;
    }

    private function computeConnectivityIndex($zone)
    {
        // Placeholder: based on children + type order
        $base = $zone->children_count * 5;
        $typeWeight = match($zone->type) {
            'county' => 20, 'region' => 15, 'zone' => 10, 'area' => 8, default => 5
        };
        return min(100, $base + $typeWeight + rand(1,10));
    }
}
