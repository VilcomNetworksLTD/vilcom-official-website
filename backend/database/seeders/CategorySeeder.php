<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeders.
     */
    public function run(): void
    {
        // ============================================
        // MAIN SERVICE CATEGORIES
        // ============================================

        // 1. Internet Plans (Parent)
        $internetPlans = Category::create([
            'name' => 'Internet Plans',
            'slug' => 'internet-plans',
            'description' => 'High-speed fiber internet plans for homes and businesses',
            'short_description' => 'Choose the perfect internet plan for your needs',
            'type' => 'internet_plans',
            'icon' => 'fa-wifi',
            'color' => '#3b82f6',
            'is_featured' => true,
            'show_in_menu' => true,
            'sort_order' => 1,
        ]);

        // Internet Plan Subcategories
        Category::create([
            'name' => 'Home Fiber',
            'slug' => 'home-fiber',
            'description' => 'Affordable fiber internet for residential use',
            'type' => 'internet_plans',
            'parent_id' => $internetPlans->id,
            'icon' => 'fa-home',
            'color' => '#10b981',
            'sort_order' => 1,
        ]);

        Category::create([
            'name' => 'Business Fiber',
            'slug' => 'business-fiber',
            'description' => 'Reliable fiber internet for businesses of all sizes',
            'type' => 'internet_plans',
            'parent_id' => $internetPlans->id,
            'icon' => 'fa-building',
            'color' => '#6366f1',
            'sort_order' => 2,
        ]);

        // 2. Hosting Services (Parent)
        $hostingServices = Category::create([
            'name' => 'Hosting Services',
            'slug' => 'hosting-services',
            'description' => 'Professional web hosting solutions',
            'short_description' => 'Reliable hosting for your websites',
            'type' => 'hosting_packages',
            'icon' => 'fa-server',
            'color' => '#f59e0b',
            'is_featured' => true,
            'show_in_menu' => true,
            'sort_order' => 2,
        ]);

        // Hosting Subcategories
        Category::create([
            'name' => 'Web Hosting',
            'slug' => 'web-hosting',
            'description' => 'Shared hosting plans for small to medium websites',
            'type' => 'hosting_packages',
            'parent_id' => $hostingServices->id,
            'icon' => 'fa-globe',
            'color' => '#3b82f6',
            'sort_order' => 1,
        ]);

        Category::create([
            'name' => 'VPS Hosting',
            'slug' => 'vps-hosting',
            'description' => 'Virtual private servers with dedicated resources',
            'type' => 'hosting_packages',
            'parent_id' => $hostingServices->id,
            'icon' => 'fa-microchip',
            'color' => '#8b5cf6',
            'sort_order' => 2,
        ]);

        Category::create([
            'name' => 'Reseller Hosting',
            'slug' => 'reseller-hosting',
            'description' => 'Start your own hosting business with reseller plans',
            'type' => 'hosting_packages',
            'parent_id' => $hostingServices->id,
            'icon' => 'fa-handshake',
            'color' => '#ec4899',
            'sort_order' => 3,
        ]);

        Category::create([
            'name' => 'Dedicated Servers',
            'slug' => 'dedicated-servers',
            'description' => 'Enterprise-grade dedicated servers',
            'type' => 'hosting_packages',
            'parent_id' => $hostingServices->id,
            'icon' => 'fa-database',
            'color' => '#dc2626',
            'sort_order' => 4,
        ]);

        // 3. Domain Registration
        $domains = Category::create([
            'name' => 'Domain Registration',
            'slug' => 'domains',
            'description' => 'Register your perfect domain name',
            'short_description' => 'Find and register your domain',
            'type' => 'domains',
            'icon' => 'fa-globe',
            'color' => '#06b6d4',
            'is_featured' => true,
            'show_in_menu' => true,
            'sort_order' => 3,
        ]);

        // Domain Subcategories by TLD
        Category::create([
            'name' => 'Dot COM',
            'slug' => 'domain-com',
            'description' => '.com domain registration',
            'type' => 'domains',
            'parent_id' => $domains->id,
            'sort_order' => 1,
        ]);

        Category::create([
            'name' => 'Dot KE',
            'slug' => 'domain-ke',
            'description' => '.ke domain registration',
            'type' => 'domains',
            'parent_id' => $domains->id,
            'sort_order' => 2,
        ]);

        Category::create([
            'name' => 'Other TLDs',
            'slug' => 'domain-other',
            'description' => 'Other domain extensions (.net, .org, .io)',
            'type' => 'domains',
            'parent_id' => $domains->id,
            'sort_order' => 3,
        ]);

        // 4. Web Development
        $webDev = Category::create([
            'name' => 'Web Development',
            'slug' => 'web-development',
            'description' => 'Professional website design and development services',
            'short_description' => 'Custom websites for your business',
            'type' => 'web_development',
            'icon' => 'fa-code',
            'color' => '#7c3aed',
            'is_featured' => true,
            'show_in_menu' => true,
            'sort_order' => 4,
        ]);

        // Web Dev Subcategories
        Category::create([
            'name' => 'Static Websites',
            'slug' => 'static-websites',
            'description' => 'Fast, secure static website development',
            'type' => 'web_development',
            'parent_id' => $webDev->id,
            'sort_order' => 1,
        ]);

        Category::create([
            'name' => 'Dynamic Websites',
            'slug' => 'dynamic-websites',
            'description' => 'Content-managed dynamic websites',
            'type' => 'web_development',
            'parent_id' => $webDev->id,
            'sort_order' => 2,
        ]);

        Category::create([
            'name' => 'E-Commerce Websites',
            'slug' => 'ecommerce-websites',
            'description' => 'Online stores with payment integration',
            'type' => 'web_development',
            'parent_id' => $webDev->id,
            'sort_order' => 3,
        ]);

        // 5. Add-ons & Services
        Category::create([
            'name' => 'Add-ons & Services',
            'slug' => 'addons-services',
            'description' => 'Additional services to enhance your hosting',
            'type' => 'addons',
            'icon' => 'fa-plus-circle',
            'color' => '#6b7280',
            'show_in_menu' => false,
            'sort_order' => 5,
        ]);

        $this->command->info('Categories seeded successfully!');
    }
}

