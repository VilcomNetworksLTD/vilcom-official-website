<?php
// database/seeders/SafetikaProductMappingSeeder.php
//
// Maps every internet/fibre product → Safetika account_type, customer_type,
// and service_category so the provisioning chain knows what to send
// to apisafetika.vilcom.co.ke.

namespace Database\Seeders;

use App\Models\Product;
use App\Models\SafetikaProductMapping;
use Illuminate\Database\Seeder;

class SafetikaProductMappingSeeder extends Seeder
{
    /**
     * SKU → Safetika mapping.
     *
     * account_type  — sent to create-mbr  (Safetika field: account_type)
     * customer_type — sent to create-mbr  (Safetika field: customer_type)
     * service_category — sent to add-service (Safetika field: service_category)
     */
    private array $mappings = [

        // ── HOME FIBER PLANS ─────────────────────────────────────────────
        'HOME-STARTER-8'    => [
            'account_type'     => 'FTTH Home',
            'customer_type'    => 'Residential',
            'service_category' => 'Internet',
            'label'            => 'Home Starter 8 Mbps',
        ],
        'HOME-STARTER-18'   => [
            'account_type'     => 'FTTH Home',
            'customer_type'    => 'Residential',
            'service_category' => 'Internet',
            'label'            => 'Home Starter 18 Mbps',
        ],
        'HOME-BASIC-30'     => [
            'account_type'     => 'FTTH Home',
            'customer_type'    => 'Residential',
            'service_category' => 'Internet',
            'label'            => 'Home Basic 30 Mbps',
        ],
        'HOME-BASIC-60'     => [
            'account_type'     => 'FTTH Home',
            'customer_type'    => 'Residential',
            'service_category' => 'Internet',
            'label'            => 'Home Basic 60 Mbps',
        ],
        'HOME-STANDARD-100' => [
            'account_type'     => 'FTTH Home',
            'customer_type'    => 'Residential',
            'service_category' => 'Internet',
            'label'            => 'Home Standard 100 Mbps',
        ],

        // ── BUSINESS FIBER PLANS ─────────────────────────────────────────
        'BIZ-FIBER-40'  => [
            'account_type'     => 'FTTH Business',
            'customer_type'    => 'Business',
            'service_category' => 'Internet',
            'label'            => 'Business Fiber 40 Mbps',
        ],
        'BIZ-FIBER-80'  => [
            'account_type'     => 'FTTH Business',
            'customer_type'    => 'Business',
            'service_category' => 'Internet',
            'label'            => 'Business Fiber 80 Mbps',
        ],
        'BIZ-FIBER-120' => [
            'account_type'     => 'FTTH Business',
            'customer_type'    => 'Business',
            'service_category' => 'Internet',
            'label'            => 'Business Fiber 120 Mbps',
        ],
        'BIZ-FIBER-200' => [
            'account_type'     => 'FTTH Business',
            'customer_type'    => 'Business',
            'service_category' => 'Internet',
            'label'            => 'Business Fiber 200 Mbps',
        ],
        'BIZ-FIBER-300' => [
            'account_type'     => 'FTTH Business',
            'customer_type'    => 'Enterprise',
            'service_category' => 'Internet',
            'label'            => 'Business Fiber 300 Mbps',
        ],
        'BIZ-FIBER-500' => [
            'account_type'     => 'FTTH Business',
            'customer_type'    => 'Enterprise',
            'service_category' => 'Internet',
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

            $this->command->info("  ✅  Mapped [{$sku}] → {$map['account_type']} / {$map['customer_type']}");
            $created++;
        }

        $this->command->info("\n✅ SafetikaProductMapping: {$created} mapped, {$skipped} skipped.");
    }
}
