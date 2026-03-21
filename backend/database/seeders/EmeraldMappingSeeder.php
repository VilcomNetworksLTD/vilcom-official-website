<?php
// database/seeders/EmeraldMappingSeeder.php

namespace Database\Seeders;

use App\Models\EmeraldProductMapping;
use App\Models\Product;
use App\Services\EmeraldService;
use Illuminate\Database\Seeder;

class EmeraldMappingSeeder extends Seeder
{
    /**
     * Seed Emerald product mappings.
     *
     * Structure: slug → [serviceTypeId, serviceCategoryId, name, payPeriodId]
     *
     * Pay Period IDs (confirmed from Emerald):
     *   1 = Monthly
     *   2 = Quarterly
     *   3 = Six Months
     *   4 = Yearly
     *   5 = Two Weeks
     *   6 = Weekly
     *
     * Service Category IDs (confirmed from Emerald):
     *   1  = Home Fibre
     *   3  = Business Fibre (MSME)
     *   14 = MSME Fibre
     */
    public function run(): void
    {
        $monthly = EmeraldService::PAY_PERIODS['monthly']; // 1

        $mappings = [
            // ── Home Fibre (ServiceCategoryID = 1) ────────────────────────
            // All on Monthly billing
            'home-starter-8mbps'    => [1025, 1,  'Fibre 8Mbps',   $monthly],
            'home-starter-18mbps'   => [1017, 1,  'Fibre 18Mbps',  $monthly],
            'home-basic-30mbps'     => [1018, 1,  'Fibre 30Mbps',  $monthly],
            'home-basic-60mbps'     => [1010, 1,  'Fibre 60Mbps',  $monthly],
            'home-standard-100mbps' => [1006, 1,  'Fibre 100Mbps', $monthly],

            // ── Business / MSME Fibre (ServiceCategoryID = 3) ─────────────
            // Also Monthly — change pay_period_id to 2 for Quarterly if needed
            'business-fiber-40mbps'  => [1052, 3, 'MSME Fibre 40Mbps',  $monthly],
            'business-fiber-80mbps'  => [1053, 3, 'MSME Fibre 80Mbps',  $monthly],
            'business-fiber-120mbps' => [1054, 3, 'MSME Fibre 120Mbps', $monthly],
            'business-fiber-200mbps' => [1055, 3, 'MSME Fibre 200Mbps', $monthly],
            'business-fiber-300mbps' => [1056, 3, 'MSME Fibre 300Mbps', $monthly],
            'business-fiber-500mbps' => [1057, 3, 'MSME Fibre 500Mbps', $monthly],
        ];

        $created = 0;
        $updated = 0;
        $skipped = 0;

        foreach ($mappings as $slug => [$serviceTypeId, $categoryId, $name, $payPeriodId]) {
            $product = Product::where('slug', $slug)->first();

            if (!$product) {
                $this->command->warn("  ⚠ Product not found: {$slug}");
                $skipped++;
                continue;
            }

            $existed = EmeraldProductMapping::where('product_id', $product->id)->exists();

            EmeraldProductMapping::updateOrCreate(
                ['product_id' => $product->id],
                [
                    'emerald_service_type_id'     => $serviceTypeId,
                    'emerald_service_category_id' => $categoryId,
                    'emerald_service_type_name'   => $name,
                    'billing_cycle_name'          => config('emerald.billing_cycle_name', 'Vilcom Billing Cycle'),
                    'pay_period_id'               => $payPeriodId,
                    'auto_provision'              => true,
                    'sync_price'                  => false,
                    'is_active'                   => true,
                ]
            );

            $existed ? $updated++ : $created++;
            $this->command->line("  ✓ {$slug} → ServiceType {$serviceTypeId} | Category {$categoryId} | PayPeriod {$payPeriodId}");
        }

        $this->command->newLine();
        $this->command->info("✅ Emerald mappings done: {$created} created, {$updated} updated, {$skipped} skipped");
    }
}
