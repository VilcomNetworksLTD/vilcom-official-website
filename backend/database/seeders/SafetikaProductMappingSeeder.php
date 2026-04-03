<?php
// database/seeders/SafetikaProductMappingSeeder.php
//
// Maps Vilcom portal products → Safetika API (apisafetika.vilcom.co.ke) values.
//
// IMPORTANT — account_type and service_category MUST match the live dropdown
// values from:
//   GET /dropdowns/account-types
//   GET /dropdowns/service-categories
//
// Last synced against API: 2026-04-01

namespace Database\Seeders;

use App\Models\Product;
use App\Models\SafetikaProductMapping;
use Illuminate\Database\Seeder;

class SafetikaProductMappingSeeder extends Seeder
{
    /**
     * SKU → Safetika mapping.
     *
     * account_type     — must match /dropdowns/account-types  (name field)
     * customer_type    — must match /dropdowns/customer-types (name field)
     * service_category — must match /dropdowns/service-categories (name field)
     */
    private array $mappings = [

        // ── HOME FIBER PLANS ─────────────────────────────────────────────
        // Service category = "Home Fibre" (from /dropdowns/service-categories)
        // Account types    = real package names (from /dropdowns/account-types)
        'HOME-STARTER-8'    => [
            'account_type'     => 'Fibre 8Mbps',
            'customer_type'    => 'Residential',
            'service_category' => 'Home Fibre',
            'label'            => 'Home Starter 8 Mbps',
        ],
        'HOME-STARTER-18'   => [
            'account_type'     => 'Fibre 18Mbps',
            'customer_type'    => 'Residential',
            'service_category' => 'Home Fibre',
            'label'            => 'Home Starter 18 Mbps',
        ],
        'HOME-BASIC-30'     => [
            'account_type'     => 'Fibre 30Mbps',
            'customer_type'    => 'Residential',
            'service_category' => 'Home Fibre',
            'label'            => 'Home Basic 30 Mbps',
        ],
        'HOME-BASIC-60'     => [
            'account_type'     => 'Fibre 60Mbps',
            'customer_type'    => 'Residential',
            'service_category' => 'Home Fibre',
            'label'            => 'Home Basic 60 Mbps',
        ],
        'HOME-STANDARD-100' => [
            'account_type'     => 'Fibre 100Mbps',
            'customer_type'    => 'Residential',
            'service_category' => 'Home Fibre',
            'label'            => 'Home Standard 100 Mbps',
        ],

        // ── BUSINESS FIBER PLANS ─────────────────────────────────────────
        // Service category = "Micro, Small & Medium Enterprises Packages"
        //   (or "Business Fibre(Inc. Tax)" for larger tiers)
        'BIZ-FIBER-40'  => [
            'account_type'     => 'MSME Fibre 40Mbps',
            'customer_type'    => 'Business',
            'service_category' => 'Micro, Small & Medium Enterprises Packages',
            'label'            => 'Business Fiber 40 Mbps',
        ],
        'BIZ-FIBER-80'  => [
            'account_type'     => 'MSME Fibre 80Mbps',
            'customer_type'    => 'Business',
            'service_category' => 'Micro, Small & Medium Enterprises Packages',
            'label'            => 'Business Fiber 80 Mbps',
        ],
        'BIZ-FIBER-120' => [
            'account_type'     => 'MSME Fibre 120Mbps',
            'customer_type'    => 'Business',
            'service_category' => 'Micro, Small & Medium Enterprises Packages',
            'label'            => 'Business Fiber 120 Mbps',
        ],
        'BIZ-FIBER-200' => [
            'account_type'     => 'MSME Fibre 200Mbps',
            'customer_type'    => 'Business',
            'service_category' => 'Micro, Small & Medium Enterprises Packages',
            'label'            => 'Business Fiber 200 Mbps',
        ],
        'BIZ-FIBER-300' => [
            'account_type'     => 'MSME Fibre 300Mbps',
            'customer_type'    => 'Enterprise',
            'service_category' => 'Micro, Small & Medium Enterprises Packages',
            'label'            => 'Business Fiber 300 Mbps',
        ],
        'BIZ-FIBER-500' => [
            'account_type'     => 'MSME Fibre 500Mbps',
            'customer_type'    => 'Enterprise',
            'service_category' => 'Micro, Small & Medium Enterprises Packages',
            'label'            => 'Business Fiber 500 Mbps',
        ],
    ];

    public function run(): void
    {
        $created = 0;
        $skipped = 0;

        foreach ($this->mappings as $sku => $map) {
            $product = Product::where('sku', $sku)->first();

            if (!$product) {
                $this->command->warn("  ⚠  Product not found for SKU: {$sku} — skipping");
                $skipped++;
                continue;
            }

            SafetikaProductMapping::updateOrCreate(
                ['product_id' => $product->id],
                [
                    'account_type'     => $map['account_type'],
                    'customer_type'    => $map['customer_type'],
                    'service_category' => $map['service_category'],
                    'label'            => $map['label'],
                    'auto_provision'   => true,
                    'is_active'        => true,
                ]
            );

            $this->command->info("  ✅  [{$sku}] → {$map['account_type']} / {$map['service_category']}");
            $created++;
        }

        $this->command->info("\n✅ SafetikaProductMapping: {$created} mapped, {$skipped} skipped.");
    }
}
