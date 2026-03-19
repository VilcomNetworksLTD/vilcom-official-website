<?php
// database/seeders/EmeraldMappingSeeder.php

namespace Database\Seeders;

use App\Models\EmeraldProductMapping;
use App\Models\Product;
use Illuminate\Database\Seeder;

class EmeraldMappingSeeder extends Seeder
{
    public function run(): void
    {
        // Map of product slug → Emerald IDs
        $mappings = [
            // ── Home Fibre (ServiceCategoryID = 1) ──────────────
            'home-starter-8mbps'    => [1025, 1, 'Fibre 8Mbps'],
            'home-starter-18mbps'   => [1017, 1, 'Fibre 18Mbps'],
            'home-basic-30mbps'     => [1018, 1, 'Fibre 30Mbps'],
            'home-basic-60mbps'     => [1010, 1, 'Fibre 60Mbps'],
            'home-standard-100mbps' => [1006, 1, 'Fibre 100Mbps'],

            // ── Business Fibre (ServiceCategoryID = 3) ──────────
            'business-fiber-40mbps'  => [1052, 3, 'MSME Fibre 40Mbps'],
            'business-fiber-80mbps'  => [1053, 3, 'MSME Fibre 80Mbps'],
            'business-fiber-120mbps' => [1054, 3, 'MSME Fibre 120Mbps'],
            'business-fiber-200mbps' => [1055, 3, 'MSME Fibre 200Mbps'],
            'business-fiber-300mbps' => [1056, 3, 'MSME Fibre 300Mbps'],
            'business-fiber-500mbps' => [1057, 3, 'MSME Fibre 500Mbps'],
        ];

        foreach ($mappings as $slug => [$serviceTypeId, $categoryId, $name]) {
            $product = Product::where('slug', $slug)->first();

            if (!$product) {
                $this->command->warn("Product not found: {$slug}");
                continue;
            }

            EmeraldProductMapping::updateOrCreate(
                ['product_id' => $product->id],
                [
                    'emerald_service_type_id'     => $serviceTypeId,
                    'emerald_service_category_id' => $categoryId,
                    'emerald_service_type_name'   => $name,
                    'auto_provision'              => true,
                    'sync_price'                  => false,
                    'is_active'                   => true,
                ]
            );

            $this->command->info("Mapped: {$slug} → ServiceType {$serviceTypeId}");
        }

        $this->command->info('✅ Emerald mappings seeded successfully');
    }
}
