<?php

namespace Database\Seeders;

use App\Models\CoverageZone;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CoverageZoneSeeder extends Seeder
{
    /**
     * Coverage type → connection type mapping
     * Business = fiber, Home = wireless, Both = both
     */
    private const COUNTY_COVERAGE = [
        'Nairobi'          => ['type' => 'both',     'service' => 'Both'],
        'Mombasa'          => ['type' => 'fiber',    'service' => 'Business'],
        'Kisumu'           => ['type' => 'fiber',    'service' => 'Business'],
        'Nakuru'           => ['type' => 'both',     'service' => 'Both'],
        'Kiambu'           => ['type' => 'fiber',    'service' => 'Business'],
        'Uasin Gishu'      => ['type' => 'wireless', 'service' => 'Home'],
        'Kakamega'         => ['type' => 'fiber',    'service' => 'Business'],
        'Bungoma'          => ['type' => 'fiber',    'service' => 'Business'],
        'Meru'             => ['type' => 'wireless', 'service' => 'Home'],
        'Isiolo'           => ['type' => 'wireless', 'service' => 'Home'],
        'Trans Nzoia'      => ['type' => 'wireless', 'service' => 'Home'],
        'Turkana'          => ['type' => 'wireless', 'service' => 'Home'],
        'Machakos'         => ['type' => 'wireless', 'service' => 'Home'],
        'Laikipia'         => ['type' => 'wireless', 'service' => 'Home'],
        'Kisii'            => ['type' => 'wireless', 'service' => 'Home'],
        'Nyandarua'        => ['type' => 'wireless', 'service' => 'Home'],
        'Nyeri'            => ['type' => 'fiber',    'service' => 'Business'],
        'Kirinyaga'        => ['type' => 'wireless', 'service' => 'Home'],
        "Murang'a"         => ['type' => 'wireless', 'service' => 'Home'],
        'Kilifi'           => ['type' => 'fiber',    'service' => 'Business'],
        'West Pokot'       => ['type' => 'wireless', 'service' => 'Home'],
        'Baringo'          => ['type' => 'wireless', 'service' => 'Home'],
        'Elgeyo-Marakwet'  => ['type' => 'wireless', 'service' => 'Home'],
        'Nandi'            => ['type' => 'wireless', 'service' => 'Home'],
        'Bomet'            => ['type' => 'wireless', 'service' => 'Home'],
        'Narok'            => ['type' => 'wireless', 'service' => 'Home'],
        'Kajiado'          => ['type' => 'wireless', 'service' => 'Home'],
        'Siaya'            => ['type' => 'wireless', 'service' => 'Home'],
        'Busia'            => ['type' => 'wireless', 'service' => 'Home'],
        'Vihiga'           => ['type' => 'wireless', 'service' => 'Home'],
        'Homa Bay'         => ['type' => 'wireless', 'service' => 'Home'],
        'Migori'           => ['type' => 'wireless', 'service' => 'Home'],
        'Nyamira'          => ['type' => 'wireless', 'service' => 'Home'],
        'Tharaka-Nithi'    => ['type' => null,       'service' => 'None'],
        'Embu'             => ['type' => 'wireless', 'service' => 'Home'],
        'Kitui'            => ['type' => null,       'service' => 'None'],
        'Makueni'          => ['type' => null,       'service' => 'None'],
        'Kwale'            => ['type' => null,       'service' => 'None'],
        'Lamu'             => ['type' => null,       'service' => 'None'],
        'Tana River'       => ['type' => null,       'service' => 'None'],
        'Taita Taveta'     => ['type' => null,       'service' => 'None'],
        'Garissa'          => ['type' => null,       'service' => 'None'],
        'Wajir'            => ['type' => null,       'service' => 'None'],
        'Mandera'          => ['type' => null,       'service' => 'None'],
        'Marsabit'         => ['type' => null,       'service' => 'None'],
        'Samburu'          => ['type' => null,       'service' => 'None'],
    ];

    /**
     * Region → parent county mapping
     */
    private const REGION_TO_COUNTY = [
        'Lodwar'   => 'Turkana',
        'Kitale'   => 'Trans Nzoia',
        'Kakamega' => 'Kakamega',
        'Bungoma'  => 'Bungoma',
        'Ruiru'    => 'Kiambu',
        'Meru'     => 'Meru',
        'Isiolo'   => 'Isiolo',
        'Mombasa'  => 'Mombasa',
        'Rongai'   => 'Nakuru',
        'Eldoret'  => 'Uasin Gishu',
        'Nairobi'  => 'Nairobi',
        'Nakuru'   => 'Nakuru',
    ];

    /**
     * All surveyed field coordinates grouped by region.
     * These are stored securely in the DB — never in public JSON files.
     */
    private const SURVEY_POINTS = [
        'Lodwar' => [
            ['label' => 'Point A', 'lng' => 35.59274684, 'lat' => 3.09186277],
            ['label' => 'Point B', 'lng' => 35.59998476, 'lat' => 3.12151052],
            ['label' => 'Point C', 'lng' => 35.62401899, 'lat' => 3.12502691],
            ['label' => 'Point D', 'lng' => 35.62684550, 'lat' => 3.10346122],
        ],
        'Kitale' => [
            ['label' => 'Point A', 'lng' => 35.02056144, 'lat' => 1.02036158],
            ['label' => 'Point B', 'lng' => 35.03828882, 'lat' => 1.00664515],
            ['label' => 'Point C', 'lng' => 35.04728721, 'lat' => 1.02050113],
            ['label' => 'Point D', 'lng' => 35.03210441, 'lat' => 1.02875723],
            ['label' => 'Point E', 'lng' => 35.03989293, 'lat' => 1.04435006],
            ['label' => 'Point F', 'lng' => 35.02555074, 'lat' => 1.03242138],
        ],
        'Kakamega' => [
            ['label' => 'Point A', 'lng' => 34.72171394, 'lat' => 0.27971818],
            ['label' => 'Point B', 'lng' => 34.75275523, 'lat' => 0.26544000],
            ['label' => 'Point C', 'lng' => 34.76210487, 'lat' => 0.28226735],
            ['label' => 'Point D', 'lng' => 34.76095952, 'lat' => 0.30287216],
            ['label' => 'Point E', 'lng' => 34.75337417, 'lat' => 0.28736771],
        ],
        'Bungoma' => [
            ['label' => 'Point A', 'lng' => 34.55815342, 'lat' => 0.55233153],
            ['label' => 'Point B', 'lng' => 34.54979757, 'lat' => 0.58193350],
            ['label' => 'Point C', 'lng' => 34.56618133, 'lat' => 0.59080325],
            ['label' => 'Point D', 'lng' => 34.54567691, 'lat' => 0.60605016],
        ],
        'Ruiru' => [
            ['label' => 'Point A', 'lng' => 36.96356350, 'lat' => -1.14794833],
            ['label' => 'Point B', 'lng' => 36.95799119, 'lat' => -1.16999819],
            ['label' => 'Point C', 'lng' => 37.00732933, 'lat' => -1.19404482],
            ['label' => 'Point D', 'lng' => 37.00733993, 'lat' => -1.17413486],
        ],
        'Meru' => [
            ['label' => 'Point A', 'lng' => 37.63861654, 'lat' => 0.04570897],
            ['label' => 'Point B', 'lng' => 37.62558879, 'lat' => 0.05256800],
            ['label' => 'Point C', 'lng' => 37.63882508, 'lat' => 0.05880349],
            ['label' => 'Point D', 'lng' => 37.64625184, 'lat' => 0.07669771],
            ['label' => 'Point E', 'lng' => 37.62547489, 'lat' => 0.06419080],
        ],
        'Isiolo' => [
            ['label' => 'Point A', 'lng' => 37.60162628, 'lat' => 0.34826821],
            ['label' => 'Point B', 'lng' => 37.58023162, 'lat' => 0.34768193],
            ['label' => 'Point C', 'lng' => 37.59723180, 'lat' => 0.38313102],
        ],
        'Mombasa' => [
            ['label' => 'Point A', 'lng' => 39.66502332, 'lat' => -4.03123734],
            ['label' => 'Point B', 'lng' => 39.67678850, 'lat' => -4.06594191],
            ['label' => 'Point C', 'lng' => 39.63694288, 'lat' => -4.09644165],
            ['label' => 'Point D', 'lng' => 39.63421256, 'lat' => -4.04149454],
            ['label' => 'Point E', 'lng' => 39.59039258, 'lat' => -4.00848619],
        ],
        'Rongai' => [
            ['label' => 'Point A', 'lng' => 36.74203768, 'lat' => -1.42183481],
            ['label' => 'Point B', 'lng' => 36.69486284, 'lat' => -1.40542885],
            ['label' => 'Point C', 'lng' => 36.72810029, 'lat' => -1.38622635],
            ['label' => 'Point D', 'lng' => 36.75572052, 'lat' => -1.38487537],
            ['label' => 'Point E', 'lng' => 36.76836270, 'lat' => -1.40774371],
            ['label' => 'Point F', 'lng' => 36.79469262, 'lat' => -1.39103182],
        ],
        'Eldoret' => [
            ['label' => 'Point A', 'lng' => 35.24002436, 'lat' => 0.56073967],
            ['label' => 'Point B', 'lng' => 35.23586320, 'lat' => 0.54399802],
            ['label' => 'Point C', 'lng' => 35.24895253, 'lat' => 0.55514886],
            ['label' => 'Point D', 'lng' => 35.30470539, 'lat' => 0.51732197],
            ['label' => 'Point E', 'lng' => 35.31263053, 'lat' => 0.55371874],
            ['label' => 'Point F', 'lng' => 35.28974518, 'lat' => 0.54406761],
            ['label' => 'Point G', 'lng' => 35.30155962, 'lat' => 0.48548576],
            ['label' => 'Point H', 'lng' => 35.30321170, 'lat' => 0.45756595],
            ['label' => 'Point I', 'lng' => 35.23980290, 'lat' => 0.45656999],
            ['label' => 'Point J', 'lng' => 35.23112494, 'lat' => 0.45022552],
            ['label' => 'Point K', 'lng' => 35.21697308, 'lat' => 0.45538427],
            ['label' => 'Point L', 'lng' => 35.24023546, 'lat' => 0.43813039],
            ['label' => 'Point M', 'lng' => 35.30676917, 'lat' => 0.45345837],
            ['label' => 'Point N', 'lng' => 35.25930190, 'lat' => 0.46912885],
            ['label' => 'Point O', 'lng' => 35.26598083, 'lat' => 0.51053186],
            ['label' => 'Point P', 'lng' => 35.27301132, 'lat' => 0.53118053],
        ],
        'Nairobi' => [
            ['label' => 'Point A', 'lng' => 36.78768272, 'lat' => -1.29968328],
            ['label' => 'Point B', 'lng' => 36.79305692, 'lat' => -1.28208113],
            ['label' => 'Point C', 'lng' => 36.77221269, 'lat' => -1.28843776],
            ['label' => 'Point D', 'lng' => 36.76291600, 'lat' => -1.27717382],
            ['label' => 'Point E', 'lng' => 36.77466143, 'lat' => -1.25995102],
            ['label' => 'Point F', 'lng' => 36.75648748, 'lat' => -1.26440708],
            ['label' => 'Point G', 'lng' => 36.86821400, 'lat' => -1.29803906],
            ['label' => 'Point H', 'lng' => 36.83463338, 'lat' => -1.32910749],
            ['label' => 'Point I', 'lng' => 36.84438189, 'lat' => -1.32437959],
            ['label' => 'Point J', 'lng' => 36.83381882, 'lat' => -1.32232258],
        ],
        'Nakuru' => [
            ['label' => 'Point A', 'lng' => 35.94203310, 'lat' => -0.24469046],
            ['label' => 'Point B', 'lng' => 35.97493420, 'lat' => -0.26226955],
            ['label' => 'Point C', 'lng' => 36.00727250, 'lat' => -0.27091788],
            ['label' => 'Point D', 'lng' => 36.01823842, 'lat' => -0.25474461],
            ['label' => 'Point E', 'lng' => 36.04404834, 'lat' => -0.27319472],
            ['label' => 'Point F', 'lng' => 36.06529679, 'lat' => -0.29381305],
            ['label' => 'Point G', 'lng' => 36.06402257, 'lat' => -0.27359164],
            ['label' => 'Point H', 'lng' => 36.09221296, 'lat' => -0.26902340],
            ['label' => 'Point I', 'lng' => 36.07513608, 'lat' => -0.28172801],
            ['label' => 'Point J', 'lng' => 36.10444745, 'lat' => -0.26750232],
            ['label' => 'Point K', 'lng' => 36.11452135, 'lat' => -0.27677983],
            ['label' => 'Point L', 'lng' => 36.09913128, 'lat' => -0.29117554],
            ['label' => 'Point M', 'lng' => 36.13163896, 'lat' => -0.31313398],
            ['label' => 'Point N', 'lng' => 36.16166295, 'lat' => -0.33161088],
            ['label' => 'Point O', 'lng' => 36.14292566, 'lat' => -0.35366480],
            ['label' => 'Point P', 'lng' => 36.14869168, 'lat' => -0.39206568],
            ['label' => 'Point Q', 'lng' => 36.17556238, 'lat' => -0.34712837],
        ],
    ];

    /**
     * 3D globe locations (from KenyaGlobe3D) — major hub/node sites
     */
    private const GLOBE_LOCATIONS = [
        ['name' => 'Westlands',   'county' => 'Nairobi',     'status' => 'active',      'lat' => -1.2637, 'lng' => 36.8063, 'speed' => '10Gbps',  'connection_type' => 'fiber',    'tier' => 'hub'],
        ['name' => 'Kilimani',    'county' => 'Nairobi',     'status' => 'active',      'lat' => -1.2915, 'lng' => 36.7823, 'speed' => '1Gbps',   'connection_type' => 'fiber',    'tier' => 'node'],
        ['name' => 'Karen',       'county' => 'Nairobi',     'status' => 'active',      'lat' => -1.3197, 'lng' => 36.7073, 'speed' => '1Gbps',   'connection_type' => 'fiber',    'tier' => 'node'],
        ['name' => 'Lavington',   'county' => 'Nairobi',     'status' => 'active',      'lat' => -1.2769, 'lng' => 36.7693, 'speed' => '1Gbps',   'connection_type' => 'fiber',    'tier' => 'node'],
        ['name' => 'Kileleshwa',  'county' => 'Nairobi',     'status' => 'active',      'lat' => -1.2838, 'lng' => 36.7876, 'speed' => '500Mbps', 'connection_type' => 'wireless', 'tier' => 'micro'],
        ['name' => 'Parklands',   'county' => 'Nairobi',     'status' => 'active',      'lat' => -1.2606, 'lng' => 36.8219, 'speed' => '1Gbps',   'connection_type' => 'fiber',    'tier' => 'node'],
        ['name' => 'Upper Hill',  'county' => 'Nairobi',     'status' => 'active',      'lat' => -1.2983, 'lng' => 36.8146, 'speed' => '10Gbps',  'connection_type' => 'fiber',    'tier' => 'hub'],
        ['name' => 'CBD Nairobi', 'county' => 'Nairobi',     'status' => 'active',      'lat' => -1.2833, 'lng' => 36.8167, 'speed' => '10Gbps',  'connection_type' => 'fiber',    'tier' => 'hub'],
        ['name' => 'Runda',       'county' => 'Nairobi',     'status' => 'coming_soon', 'lat' => -1.2189, 'lng' => 36.8156, 'speed' => '1Gbps',   'connection_type' => 'fiber',    'tier' => 'node'],
        ['name' => 'Langata',     'county' => 'Nairobi',     'status' => 'coming_soon', 'lat' => -1.3614, 'lng' => 36.7422, 'speed' => '500Mbps', 'connection_type' => 'wireless', 'tier' => 'micro'],
        ['name' => 'Nyali',       'county' => 'Mombasa',     'status' => 'active',      'lat' => -4.0375, 'lng' => 39.7208, 'speed' => '1Gbps',   'connection_type' => 'fiber',    'tier' => 'hub'],
        ['name' => 'Mombasa CBD', 'county' => 'Mombasa',     'status' => 'active',      'lat' => -4.0435, 'lng' => 39.6682, 'speed' => '10Gbps',  'connection_type' => 'fiber',    'tier' => 'hub'],
        ['name' => 'Bamburi',     'county' => 'Mombasa',     'status' => 'coming_soon', 'lat' => -3.9833, 'lng' => 39.7333, 'speed' => '500Mbps', 'connection_type' => 'wireless', 'tier' => 'micro'],
        ['name' => 'Kisumu CBD',  'county' => 'Kisumu',      'status' => 'active',      'lat' => -0.0917, 'lng' => 34.7680, 'speed' => '1Gbps',   'connection_type' => 'fiber',    'tier' => 'hub'],
        ['name' => 'Eldoret CBD', 'county' => 'Uasin Gishu', 'status' => 'coming_soon', 'lat' =>  0.5143, 'lng' => 35.2698, 'speed' => '1Gbps',   'connection_type' => 'fiber',    'tier' => 'hub'],
        ['name' => 'Nakuru CBD',  'county' => 'Nakuru',      'status' => 'active',      'lat' => -0.3031, 'lng' => 36.0800, 'speed' => '1Gbps',   'connection_type' => 'fiber',    'tier' => 'hub'],
        ['name' => 'Thika',       'county' => 'Kiambu',      'status' => 'active',      'lat' => -1.0332, 'lng' => 37.0693, 'speed' => '500Mbps', 'connection_type' => 'fiber',    'tier' => 'node'],
    ];

    public function run(): void
    {
        $this->command->info('🌍 Seeding coverage zones…');

        // ── 1. Seed county-level parent zones ─────────────────────────────────
        $countyZones = [];
        foreach (self::COUNTY_COVERAGE as $countyName => $meta) {
            $isServiceable = $meta['service'] !== 'None';
            $status        = $isServiceable ? 'active' : 'inactive';

            $zone = CoverageZone::updateOrCreate(
                ['slug' => Str::slug($countyName)],
                [
                    'name'          => $countyName,
                    'type'          => 'county',
                    'parent_id'     => null,
                    'status'        => $status,
                    'is_serviceable'=> $isServiceable,
                    'notes'         => "Coverage type: {$meta['service']}",
                ]
            );

            $countyZones[$countyName] = $zone;
            $this->command->line("  ✓ County: {$countyName} ({$meta['service']})");
        }

        // ── 2. Seed surveyed region zones (sub-county level) ─────────────────
        // Compute centroid + radius_km from the survey points cluster
        $regionZones = [];
        foreach (self::SURVEY_POINTS as $regionName => $points) {
            $countyName = self::REGION_TO_COUNTY[$regionName] ?? null;
            if (!$countyName) {
                $this->command->warn("  ⚠ No county mapping for region: {$regionName}");
                continue;
            }

            $parentZone = $countyZones[$countyName] ?? null;

            // Compute centroid
            $lats = array_column($points, 'lat');
            $lngs = array_column($points, 'lng');
            $centerLat = array_sum($lats) / count($lats);
            $centerLng = array_sum($lngs) / count($lngs);

            // Compute bounding radius (furthest point from centroid)
            $maxDistKm = 0;
            foreach ($points as $pt) {
                $d = $this->haversineKm($centerLat, $centerLng, $pt['lat'], $pt['lng']);
                if ($d > $maxDistKm) $maxDistKm = $d;
            }
            // Add 20% buffer so edge addresses are captured
            $radiusKm = round($maxDistKm * 1.2, 2);

            $countyMeta = self::COUNTY_COVERAGE[$countyName] ?? ['service' => 'None'];

            $zone = CoverageZone::updateOrCreate(
                ['slug' => Str::slug($regionName)],
                [
                    'name'           => $regionName,
                    'type'           => 'zone',
                    'parent_id'      => $parentZone?->id,
                    'center_lat'     => $centerLat,
                    'center_lng'     => $centerLng,
                    'radius_km'      => $radiusKm,
                    'status'         => 'active',
                    'is_serviceable' => true,
                    'notes'          => sprintf(
                        '%d survey points · centroid (%.6f, %.6f) · radius %.2fkm · %s',
                        count($points),
                        $centerLat,
                        $centerLng,
                        $radiusKm,
                        $countyMeta['service']
                    ),
                ]
            );

            $regionZones[$regionName] = $zone;
            $this->command->line(
                "  ✓ Region: {$regionName} → {$countyName} | {$radiusKm}km radius | " . count($points) . " pts"
            );
        }

        // ── 3. Seed individual survey points as area-level child zones ────────
        $pointCount = 0;
        foreach (self::SURVEY_POINTS as $regionName => $points) {
            $parentZone = $regionZones[$regionName] ?? null;
            $countyName = self::REGION_TO_COUNTY[$regionName] ?? null;
            $countyMeta = self::COUNTY_COVERAGE[$countyName ?? ''] ?? ['service' => 'None'];

            foreach ($points as $pt) {
                $name = "{$regionName} — {$pt['label']}";
                $slug = Str::slug("{$regionName}-{$pt['label']}");

                CoverageZone::updateOrCreate(
                    ['slug' => $slug],
                    [
                        'name'           => $name,
                        'type'           => 'area',
                        'parent_id'      => $parentZone?->id,
                        'center_lat'     => $pt['lat'],
                        'center_lng'     => $pt['lng'],
                        'radius_km'      => 0.5, // 500m micro-zone per survey point
                        'status'         => 'active',
                        'is_serviceable' => true,
                        'notes'          => "Survey coordinate · {$countyMeta['service']} service",
                    ]
                );
                $pointCount++;
            }
        }
        $this->command->line("  ✓ Seeded {$pointCount} individual survey point zones");

        // ── 4. Seed globe/hub locations ───────────────────────────────────────
        $hubCount = 0;
        foreach (self::GLOBE_LOCATIONS as $loc) {
            // Find the parent region zone if it exists, else fall back to county zone
            $parentZone = $regionZones[$loc['name']] ??
                          $countyZones[$loc['county']] ??
                          null;

            // Migration enum: ['active', 'inactive', 'planned']
            // coming_soon → planned
            $status = match($loc['status']) {
                'active'      => 'active',
                'coming_soon' => 'planned',
                default       => 'inactive',
            };

            CoverageZone::updateOrCreate(
                ['slug' => Str::slug($loc['name'] . '-hub')],
                [
                    'name'           => $loc['name'],
                    'type'           => 'zone',
                    'parent_id'      => $parentZone?->id,
                    'center_lat'     => $loc['lat'],
                    'center_lng'     => $loc['lng'],
                    'radius_km'      => match($loc['tier']) {
                        'hub'   => 5.0,
                        'node'  => 2.0,
                        'micro' => 0.8,
                        default => 1.0,
                    },
                    'status'         => $status,
                    'is_serviceable' => ($status === 'active'),
                    'notes'          => "Tier: {$loc['tier']} · Speed: {$loc['speed']} · {$loc['connection_type']}",
                ]
            );
            $hubCount++;
        }
        $this->command->line("  ✓ Seeded {$hubCount} hub/node locations");

        $total = CoverageZone::count();
        $this->command->info("✅ Coverage seeding complete — {$total} total zones in database.");
        $this->command->newLine();
        $this->command->info('📌 Next steps:');
        $this->command->line('  1. Remove SURVEY_POINTS array from KenyaCoverageMap2D.tsx');
        $this->command->line('  2. Fetch survey data from /api/v1/coverage/admin/coverage/zones (admin only)');
        $this->command->line('  3. Public map uses /api/v1/coverage/geojson (rounded to 3dp)');
    }

    /**
     * Haversine distance in kilometres between two lat/lng pairs.
     */
    private function haversineKm(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $R    = 6371.0;
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a    = sin($dLat / 2) ** 2
              + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) ** 2;
        return $R * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }
}
