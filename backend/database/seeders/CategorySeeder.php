<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        echo "Creating categories...\n";

        // Clear existing data properly
        $this->clearExistingData();

        // ============================================
        // MAIN CATEGORIES
        // ============================================

        // 1. Internet Plans
        $internetPlans = Category::create([
            'name' => 'Internet Plans',
            'slug' => 'internet-plans',
            'type' => 'internet_plans',
            'description' => 'High-speed fiber and wireless internet packages for homes and businesses',
            'short_description' => 'Reliable internet connectivity solutions',
            'icon' => 'fas fa-wifi',
            'color' => '#3B82F6',
            'is_featured' => true,
            'is_active' => true,
            'show_in_menu' => true,
            'sort_order' => 1,
            'meta_title' => 'Internet Plans - High-Speed Fiber & Wireless',
            'meta_description' => 'Affordable high-speed internet plans for homes and businesses in Kenya',
        ]);

        // Subcategories for Internet Plans
        $internetPlans->children()->create([
            'name' => 'Home Internet',
            'slug' => 'home-internet',
            'type' => 'internet_plans',
            'description' => 'Internet packages designed for residential use',
            'icon' => 'fas fa-home',
            'color' => '#10B981',
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $internetPlans->children()->create([
            'name' => 'Home Fiber',
            'slug' => 'home-fiber',
            'type' => 'internet_plans',
            'description' => 'Ultra-fast fiber optic internet for homes',
            'icon' => 'fas fa-fiber-optic',
            'color' => '#10B981',
            'is_active' => true,
            'sort_order' => 2,
        ]);

        $internetPlans->children()->create([
            'name' => 'Business Internet',
            'slug' => 'business-internet',
            'type' => 'internet_plans',
            'description' => 'Enterprise-grade internet solutions for businesses',
            'icon' => 'fas fa-building',
            'color' => '#8B5CF6',
            'is_active' => true,
            'sort_order' => 3,
        ]);

        $internetPlans->children()->create([
            'name' => 'Business Fiber',
            'slug' => 'business-fiber',
            'type' => 'internet_plans',
            'description' => 'Enterprise fiber optic connections for businesses',
            'icon' => 'fas fa-network-wired',
            'color' => '#8B5CF6',
            'is_active' => true,
            'sort_order' => 4,
        ]);

        $internetPlans->children()->create([
            'name' => 'Fiber Internet',
            'slug' => 'fiber-internet',
            'type' => 'internet_plans',
            'description' => 'Ultra-fast fiber optic internet connections',
            'icon' => 'fas fa-network-wired',
            'color' => '#F59E0B',
            'is_active' => true,
            'sort_order' => 5,
        ]);

        $internetPlans->children()->create([
            'name' => 'Wireless Internet',
            'slug' => 'wireless-internet',
            'type' => 'internet_plans',
            'description' => 'Flexible wireless broadband solutions',
            'icon' => 'fas fa-broadcast-tower',
            'color' => '#EC4899',
            'is_active' => true,
            'sort_order' => 6,
        ]);

        // 2. Web Hosting
        $webHosting = Category::create([
            'name' => 'Web Hosting',
            'slug' => 'web-hosting',
            'type' => 'hosting_packages',
            'description' => 'Reliable and secure web hosting solutions',
            'short_description' => 'Hosting packages for websites and applications',
            'icon' => 'fas fa-server',
            'color' => '#EF4444',
            'is_featured' => true,
            'is_active' => true,
            'show_in_menu' => true,
            'sort_order' => 2,
        ]);

        $webHosting->children()->create([
            'name' => 'Shared Hosting',
            'slug' => 'shared-hosting',
            'type' => 'hosting_packages',
            'description' => 'Affordable hosting for small websites',
            'icon' => 'fas fa-share-alt',
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $webHosting->children()->create([
            'name' => 'VPS Hosting',
            'slug' => 'vps-hosting',
            'type' => 'hosting_packages',
            'description' => 'Virtual private servers for growing businesses',
            'icon' => 'fas fa-hdd',
            'is_active' => true,
            'sort_order' => 2,
        ]);

        $webHosting->children()->create([
            'name' => 'Dedicated Hosting',
            'slug' => 'dedicated-hosting',
            'type' => 'hosting_packages',
            'description' => 'Powerful dedicated servers for high-traffic sites',
            'icon' => 'fas fa-server',
            'is_active' => true,
            'sort_order' => 3,
        ]);

        $webHosting->children()->create([
            'name' => 'Reseller Hosting',
            'slug' => 'reseller-hosting',
            'type' => 'hosting_packages',
            'description' => 'Start your own hosting business',
            'icon' => 'fas fa-handshake',
            'is_active' => true,
            'sort_order' => 4,
        ]);

        // 3. Web Development
        $webDev = Category::create([
            'name' => 'Web Development',
            'slug' => 'web-development',
            'type' => 'web_development',
            'description' => 'Professional website design and development services',
            'short_description' => 'Custom websites and web applications',
            'icon' => 'fas fa-code',
            'color' => '#6366F1',
            'is_featured' => true,
            'is_active' => true,
            'show_in_menu' => true,
            'sort_order' => 3,
        ]);

        $webDev->children()->create([
            'name' => 'Business Websites',
            'slug' => 'business-websites',
            'type' => 'web_development',
            'description' => 'Professional websites for businesses',
            'icon' => 'fas fa-briefcase',
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $webDev->children()->create([
            'name' => 'E-commerce',
            'slug' => 'ecommerce',
            'type' => 'web_development',
            'description' => 'Online store development',
            'icon' => 'fas fa-shopping-cart',
            'is_active' => true,
            'sort_order' => 2,
        ]);

        $webDev->children()->create([
            'name' => 'Custom Applications',
            'slug' => 'custom-applications',
            'type' => 'web_development',
            'description' => 'Tailored web applications',
            'icon' => 'fas fa-cogs',
            'is_active' => true,
            'sort_order' => 3,
        ]);

        // 4. Bulk SMS
        Category::create([
            'name' => 'Bulk SMS',
            'slug' => 'bulk-sms',
            'type' => 'bulk_sms',
            'description' => 'Bulk SMS services for marketing and notifications',
            'short_description' => 'SMS messaging solutions',
            'icon' => 'fas fa-sms',
            'color' => '#14B8A6',
            'is_featured' => false,
            'is_active' => true,
            'show_in_menu' => true,
            'sort_order' => 4,
        ]);

        // 5. Domain Names
        Category::create([
            'name' => 'Domain Names',
            'slug' => 'domain-names',
            'type' => 'domains',
            'description' => 'Domain registration and management services',
            'short_description' => 'Register your perfect domain name',
            'icon' => 'fas fa-globe',
            'color' => '#F97316',
            'is_featured' => false,
            'is_active' => true,
            'show_in_menu' => true,
            'sort_order' => 5,
        ]);

        // 6. Add-ons & Extras
        $addons = Category::create([
            'name' => 'Add-ons & Extras',
            'slug' => 'addons-extras',
            'type' => 'addons',
            'description' => 'Additional services and equipment',
            'short_description' => 'Enhance your services',
            'icon' => 'fas fa-plus-circle',
            'color' => '#64748B',
            'is_featured' => false,
            'is_active' => true,
            'show_in_menu' => false,
            'sort_order' => 6,
        ]);

        $addons->children()->create([
            'name' => 'Static IP Address',
            'slug' => 'static-ip',
            'type' => 'addons',
            'description' => 'Dedicated static IP address',
            'icon' => 'fas fa-network-wired',
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $addons->children()->create([
            'name' => 'Email Hosting',
            'slug' => 'email-hosting',
            'type' => 'addons',
            'description' => 'Professional email accounts',
            'icon' => 'fas fa-envelope',
            'is_active' => true,
            'sort_order' => 2,
        ]);

        $addons->children()->create([
            'name' => 'SSL Certificates',
            'slug' => 'ssl-certificates',
            'type' => 'addons',
            'description' => 'Secure your website with SSL',
            'icon' => 'fas fa-lock',
            'is_active' => true,
            'sort_order' => 3,
        ]);

        $addons->children()->create([
            'name' => 'Equipment',
            'slug' => 'equipment',
            'type' => 'addons',
            'description' => 'Routers, modems, and networking equipment',
            'icon' => 'fas fa-router',
            'is_active' => true,
            'sort_order' => 4,
        ]);

        echo "✓ Categories created successfully\n";
        echo "Total Categories: " . Category::count() . "\n";
        echo "Root Categories: " . Category::roots()->count() . "\n";
        
        // Rebuild the tree to ensure consistency
        Category::fixTree();
        echo "✓ Category tree rebuilt\n";
    }

    /**
     * Clear existing data before seeding
     */
    private function clearExistingData(): void
    {
        try {
            // Check if categories exist
            if (Category::count() > 0) {
                echo "⚠ Existing categories found. Clearing...\n";
                
                // Delete related data first
                DB::table('product_addon')->delete(); // Pivot table
                DB::table('product_variant')->delete(); // If exists
                DB::table('products')->delete();
                
                // Now delete categories
                DB::statement('SET FOREIGN_KEY_CHECKS=0;');
                DB::table('categories')->truncate();
                DB::statement('ALTER TABLE categories AUTO_INCREMENT = 1;');
                DB::statement('SET FOREIGN_KEY_CHECKS=1;');
                
                echo "✓ Existing data cleared\n";
            }
        } catch (\Exception $e) {
            echo "⚠ Warning during cleanup: " . $e->getMessage() . "\n";
            echo "Attempting alternative cleanup method...\n";
            
            // Fallback: Delete without truncate
            Category::query()->forceDelete();
        }
    }
}