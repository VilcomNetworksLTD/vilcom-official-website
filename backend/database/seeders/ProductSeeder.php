<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\Addon;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeders.
     * 
     * This seeder creates each distinct plan/package as its own product
     * rather than using variants. This provides maximum flexibility for:
     * - Individual pricing strategies
     * - Unique features per product
     * - Separate marketing (badges, promotions)
     * - Product-specific add-ons
     */
    public function run(): void
    {
        // ============================================
        // STEP 1: CREATE ADD-ONS FIRST
        // ============================================
        $this->createAddons();

        // ============================================
        // STEP 2: CREATE INTERNET PLANS
        // ============================================
        $this->createInternetPlans();

        // ============================================
        // STEP 3: CREATE HOSTING PACKAGES
        // ============================================
        $this->createHostingPackages();

        // ============================================
        // STEP 4: CREATE DOMAIN PRODUCTS
        // ============================================
        $this->createDomainProducts();

        // ============================================
        // STEP 5: CREATE WEB DEVELOPMENT SERVICES
        // ============================================
        $this->createWebDevelopmentServices();

        $this->command->info('✅ All products seeded successfully!');
    }

    /**
     * Create reusable add-ons
     */
    private function createAddons(): void
    {
        $this->command->info('Creating add-ons...');

        // Add-ons that apply to internet plans
        Addon::create([
            'name' => 'Static IP Address',
            'slug' => 'static-ip',
            'description' => 'Get a dedicated static IP address for your connection',
            'short_description' => 'Dedicated static IP',
            'sku' => 'ADDON-STATIC-IP',
            'type' => 'static_ip',
            'applicable_to' => ['internet_plan'],
            'price_monthly' => 500,
            'is_recurring' => true,
            'is_active' => true,
            'icon' => 'fa-network-wired',
        ]);

        Addon::create([
            'name' => 'Mesh WiFi System',
            'slug' => 'mesh-wifi',
            'description' => 'Upgrade to a mesh WiFi system for better coverage',
            'short_description' => 'Better WiFi coverage',
            'sku' => 'ADDON-MESH-WIFI',
            'type' => 'router_upgrade',
            'applicable_to' => ['internet_plan'],
            'price_one_time' => 5000,
            'is_recurring' => false,
            'is_active' => true,
            'icon' => 'fa-wifi',
        ]);

        Addon::create([
            'name' => 'Priority Installation',
            'slug' => 'priority-install',
            'description' => 'Get installed within 24 hours',
            'short_description' => 'Same-day installation',
            'sku' => 'ADDON-PRIORITY-INSTALL',
            'type' => 'installation',
            'applicable_to' => ['internet_plan'],
            'price_one_time' => 2000,
            'is_recurring' => false,
            'is_active' => true,
            'icon' => 'fa-clock',
        ]);

        // Add-ons for hosting
        Addon::create([
            'name' => 'SSL Certificate',
            'slug' => 'ssl-certificate',
            'description' => 'Premium SSL certificate for your website',
            'short_description' => 'Secure your website',
            'sku' => 'ADDON-SSL',
            'type' => 'ssl_certificate',
            'applicable_to' => ['hosting_package'],
            'price_annually' => 3000,
            'is_recurring' => true,
            'is_active' => true,
            'icon' => 'fa-lock',
        ]);

        Addon::create([
            'name' => 'Daily Backups',
            'slug' => 'daily-backups',
            'description' => 'Automated daily backups of your website',
            'short_description' => 'Automatic daily backups',
            'sku' => 'ADDON-BACKUP',
            'type' => 'backup_service',
            'applicable_to' => ['hosting_package'],
            'price_monthly' => 500,
            'is_recurring' => true,
            'is_active' => true,
            'icon' => 'fa-database',
        ]);

        Addon::create([
            'name' => 'Extra 50GB Storage',
            'slug' => 'extra-storage',
            'description' => 'Add 50GB of additional SSD storage',
            'short_description' => 'Expand your storage',
            'sku' => 'ADDON-STORAGE-50GB',
            'type' => 'extra_storage',
            'applicable_to' => ['hosting_package'],
            'price_monthly' => 1000,
            'is_recurring' => true,
            'is_active' => true,
            'icon' => 'fa-hdd',
        ]);

        Addon::create([
            'name' => 'Priority Support',
            'slug' => 'priority-support',
            'description' => '24/7 priority support with faster response times',
            'short_description' => 'Get help faster',
            'sku' => 'ADDON-PRIORITY-SUPPORT',
            'type' => 'priority_support',
            'applicable_to' => ['internet_plan', 'hosting_package'],
            'price_monthly' => 1500,
            'is_recurring' => true,
            'is_active' => true,
            'icon' => 'fa-headset',
        ]);
    }

    /**
     * Create Internet Plans (Each plan is a separate product)
     */
    private function createInternetPlans(): void
    {
        $this->command->info('Creating internet plans...');

        // Use correct category slugs from CategorySeeder
        $homeFiberCategory = Category::where('slug', 'home-fiber')->first();
        $businessFiberCategory = Category::where('slug', 'business-fiber')->first();

        // Validate categories exist
        if (!$homeFiberCategory || !$businessFiberCategory) {
            $this->command->error('Required categories not found!');
            $this->command->error('Available categories: ' . Category::pluck('slug')->implode(', '));
            return;
        }

        // Get add-ons for later attachment
        $staticIP = Addon::where('slug', 'static-ip')->first();
        $meshWifi = Addon::where('slug', 'mesh-wifi')->first();
        $priorityInstall = Addon::where('slug', 'priority-install')->first();
        $prioritySupport = Addon::where('slug', 'priority-support')->first();

        // ==================== HOME FIBER PLANS ====================

        $homeLite = Product::create([
            'category_id' => $homeFiberCategory->id,
            'name' => 'Lite 10 Mbps',
            'slug' => 'home-lite-10mbps',
            'description' => 'Perfect for light internet users who need basic connectivity for browsing, email, and standard definition streaming. Ideal for 1-2 users with basic internet needs.',
            'short_description' => 'Perfect for light browsing and email',
            'sku' => 'HOME-LITE-10',
            'type' => 'internet_plan',
            'speed_mbps' => 10,
            'connection_type' => 'fiber',
            'plan_category' => 'home',
            'price_monthly' => 999,
            'setup_fee' => 0,
            'features' => [
                'Unlimited internet access',
                '10 Mbps download speed',
                'SD Movie & Music Streaming',
                'Fast web browsing',
                'Email & social media',
                'Standard router included',
                'Free installation',
                'Email support',
            ],
            'technical_specs' => [
                'Technology' => 'Fiber to the Home (FTTH)',
                'Download Speed' => '10 Mbps',
                'Upload Speed' => '5 Mbps',
                'Data Cap' => 'Unlimited',
                'Contract' => '12 months',
                'Installation Time' => '48 hours',
                'Router' => 'Single-band WiFi',
            ],
            'coverage_areas' => ['Nairobi', 'Kiambu', 'Machakos'],
            'available_nationwide' => false,
            'is_active' => true,
            'is_featured' => false,
            'sort_order' => 1,
            'meta_title' => 'Home Lite 10Mbps - Affordable Fiber Internet',
            'meta_description' => 'Get affordable fiber internet at KES 999/month with unlimited data and free installation.',
        ]);

        // Attach add-ons to Home Lite
        $homeLite->addons()->attach([
            $staticIP->id => [
                'is_required' => false,
                'is_default' => false,
                'custom_price' => 500,
                'sort_order' => 1,
            ],
            $priorityInstall->id => [
                'is_required' => false,
                'is_default' => false,
                'custom_price' => 2000,
                'sort_order' => 2,
            ],
        ]);

        $homeStarter = Product::create([
            'category_id' => $homeFiberCategory->id,
            'name' => 'Starter 20 Mbps',
            'slug' => 'home-starter-20mbps',
            'description' => 'Great for families with multiple devices who enjoy HD streaming, casual gaming, and video calls. Perfect for 2-4 users with moderate internet usage.',
            'short_description' => 'Perfect for families with multiple devices',
            'sku' => 'HOME-STARTER-20',
            'type' => 'internet_plan',
            'speed_mbps' => 20,
            'connection_type' => 'fiber',
            'plan_category' => 'home',
            'price_monthly' => 1500,
            'setup_fee' => 0,
            'features' => [
                'Unlimited internet access',
                '20 Mbps download speed',
                'HD Movie & Music Streaming',
                'Online gaming support',
                'Video conferencing',
                'Multiple device connectivity',
                'Dual-band router included',
                '24/7 support',
                'Same-day installation',
            ],
            'technical_specs' => [
                'Technology' => 'Fiber to the Home (FTTH)',
                'Download Speed' => '20 Mbps',
                'Upload Speed' => '10 Mbps',
                'Data Cap' => 'Unlimited',
                'Contract' => '12 months',
                'Installation Time' => 'Same day',
                'Router' => 'Dual-band WiFi',
            ],
            'coverage_areas' => ['Nairobi', 'Kiambu', 'Machakos', 'Nakuru'],
            'available_nationwide' => false,
            'is_active' => true,
            'is_featured' => false,
            'sort_order' => 2,
        ]);

        $homeStarter->addons()->attach([
            $staticIP->id => [
                'is_required' => false,
                'is_default' => false,
                'custom_price' => 500,
                'sort_order' => 1,
            ],
            $meshWifi->id => [
                'is_required' => false,
                'is_default' => false,
                'custom_price' => 5000,
                'sort_order' => 2,
            ],
        ]);

        $homeFamily = Product::create([
            'category_id' => $homeFiberCategory->id,
            'name' => 'Family 50 Mbps',
            'slug' => 'home-family-50mbps',
            'description' => 'Our most popular home plan with blazing fast speeds for the whole family. Perfect for 4-6 users with heavy streaming, gaming, and work-from-home needs.',
            'short_description' => 'Most popular plan for connected homes',
            'sku' => 'HOME-FAMILY-50',
            'type' => 'internet_plan',
            'speed_mbps' => 50,
            'connection_type' => 'fiber',
            'plan_category' => 'home',
            'price_monthly' => 2500,
            'setup_fee' => 0,
            'promotional_price' => 1999,
            'promotional_start' => now(),
            'promotional_end' => now()->addMonths(3),
            'features' => [
                'Unlimited internet access',
                '50 Mbps download speed',
                '4K Ultra HD Streaming',
                'Online gaming with low latency',
                'Multiple video conferences',
                'Static IP address included',
                'Mesh WiFi system option',
                'Priority support',
                'Same-day installation',
            ],
            'technical_specs' => [
                'Technology' => 'Fiber to the Home (FTTH)',
                'Download Speed' => '50 Mbps',
                'Upload Speed' => '25 Mbps',
                'Data Cap' => 'Unlimited',
                'Contract' => '12 months',
                'Installation Time' => 'Same day',
                'Router' => 'Dual-band WiFi 5',
                'Static IP' => '1 included',
            ],
            'coverage_areas' => ['Nairobi', 'Kiambu', 'Machakos', 'Nakuru', 'Kisumu', 'Mombasa'],
            'available_nationwide' => false,
            'is_active' => true,
            'is_featured' => true,
            'badge' => 'Best Value',
            'sort_order' => 3,
        ]);

        $homeFamily->addons()->attach([
            $staticIP->id => [
                'is_required' => false,
                'is_default' => true, // Included by default
                'custom_price' => 0, // Free with this package
                'sort_order' => 1,
            ],
            $meshWifi->id => [
                'is_required' => false,
                'is_default' => false,
                'custom_price' => 4000, // Discounted for this plan
                'sort_order' => 2,
            ],
            $prioritySupport->id => [
                'is_required' => false,
                'is_default' => false,
                'custom_price' => 1000, // Discounted
                'sort_order' => 3,
            ],
        ]);

        $homePremium = Product::create([
            'category_id' => $homeFiberCategory->id,
            'name' => 'Premium 100 Mbps',
            'slug' => 'home-premium-100mbps',
            'description' => 'Ultimate home internet experience with gigabit speeds and premium support. Perfect for power users, streamers, and large families with 6+ devices.',
            'short_description' => 'Gigabit internet for power users',
            'sku' => 'HOME-PREMIUM-100',
            'type' => 'internet_plan',
            'speed_mbps' => 100,
            'connection_type' => 'fiber',
            'plan_category' => 'home',
            'price_monthly' => 4000,
            'setup_fee' => 0,
            'features' => [
                'Unlimited internet access',
                '100 Mbps download speed',
                '4K/8K Ultra HD Streaming',
                'Pro gaming support',
                'Smart home compatibility',
                'Static IP address included',
                'Premium WiFi 6 router',
                'VIP support 24/7',
                'Same-day installation',
                'Free .co.ke domain',
            ],
            'technical_specs' => [
                'Technology' => 'Fiber to the Home (FTTH)',
                'Download Speed' => '100 Mbps',
                'Upload Speed' => '50 Mbps',
                'Data Cap' => 'Unlimited',
                'Contract' => '12 months',
                'Installation Time' => 'Same day',
                'Router' => 'WiFi 6 AX3000',
                'Static IP' => '1 included',
            ],
            'coverage_areas' => ['Nairobi', 'Kiambu', 'Machakos', 'Nakuru', 'Kisumu', 'Mombasa', 'Eldoret'],
            'available_nationwide' => false,
            'is_active' => true,
            'is_featured' => true,
            'badge' => 'Premium',
            'sort_order' => 4,
        ]);

        $homePremium->addons()->attach([
            $staticIP->id => [
                'is_required' => false,
                'is_default' => true,
                'custom_price' => 0,
                'sort_order' => 1,
            ],
            $prioritySupport->id => [
                'is_required' => false,
                'is_default' => true,
                'custom_price' => 0,
                'sort_order' => 2,
            ],
        ]);

        // ==================== BUSINESS FIBER PLANS ====================

        $businessStartup = Product::create([
            'category_id' => $businessFiberCategory->id,
            'name' => 'Business Startup 50 Mbps',
            'slug' => 'business-startup-50mbps',
            'description' => 'Reliable internet for small businesses and startups with up to 10 employees. Includes SLA, priority support, and static IP.',
            'short_description' => 'Reliable connectivity for small businesses',
            'sku' => 'BIZ-STARTUP-50',
            'type' => 'internet_plan',
            'speed_mbps' => 50,
            'connection_type' => 'fiber',
            'plan_category' => 'business',
            'price_monthly' => 5999,
            'setup_fee' => 5000,
            'features' => [
                'Unlimited business data',
                '50 Mbps dedicated bandwidth',
                'Static IP address included',
                'SLA 99.5% uptime guarantee',
                'Priority installation (24hrs)',
                'Business hours support',
                'Email hosting (10 accounts)',
                'Cloud backup (10GB)',
            ],
            'technical_specs' => [
                'Technology' => 'Fiber to the Business (FTTB)',
                'Download Speed' => '50 Mbps dedicated',
                'Upload Speed' => '25 Mbps dedicated',
                'SLA' => '99.5% uptime',
                'Support' => '8AM-6PM Mon-Fri',
                'Static IPs' => '1 included',
                'Installation' => '24 hours',
            ],
            'requirements' => 'Business registration documents, ID/Passport, Lease/Ownership documents',
            'terms_conditions' => '24-month business contract required',
            'is_active' => true,
            'is_featured' => false,
            'sort_order' => 1,
        ]);

        $businessGrowth = Product::create([
            'category_id' => $businessFiberCategory->id,
            'name' => 'Business Growth 100 Mbps',
            'slug' => 'business-growth-100mbps',
            'description' => 'Scalable solution for growing businesses with 10-50 employees. Enhanced SLA, dedicated account manager, and DDoS protection.',
            'short_description' => 'Scale your business with dedicated connectivity',
            'sku' => 'BIZ-GROWTH-100',
            'type' => 'internet_plan',
            'speed_mbps' => 100,
            'connection_type' => 'fiber',
            'plan_category' => 'business',
            'price_monthly' => 9999,
            'setup_fee' => 7500,
            'features' => [
                'Unlimited business data',
                '100 Mbps dedicated bandwidth',
                'Multiple static IPs (5)',
                'SLA 99.9% uptime guarantee',
                'DDoS protection',
                'Dedicated account manager',
                '24/7 priority support',
                'Email hosting (50 accounts)',
                'Cloud backup (50GB)',
                'VPN support',
            ],
            'technical_specs' => [
                'Technology' => 'Fiber to the Business (FTTB)',
                'Download Speed' => '100 Mbps dedicated',
                'Upload Speed' => '50 Mbps dedicated',
                'SLA' => '99.9% uptime',
                'Support' => '24/7 priority',
                'Static IPs' => '5 included',
                'Installation' => '12-24 hours',
            ],
            'is_active' => true,
            'is_featured' => true,
            'badge' => 'Most Popular',
            'sort_order' => 2,
        ]);

        $businessEnterprise = Product::create([
            'category_id' => $businessFiberCategory->id,
            'name' => 'Business Enterprise 500 Mbps',
            'slug' => 'business-enterprise-500mbps',
            'description' => 'Enterprise-grade connectivity for mission-critical operations with 50+ employees. Maximum uptime, VIP support, and custom solutions.',
            'short_description' => 'Enterprise connectivity for mission-critical ops',
            'sku' => 'BIZ-ENTERPRISE-500',
            'type' => 'internet_plan',
            'speed_mbps' => 500,
            'connection_type' => 'fiber',
            'plan_category' => 'enterprise',
            'price_monthly' => 24999,
            'setup_fee' => 15000,
            'features' => [
                'Unlimited business data',
                '500 Mbps dedicated bandwidth',
                'Large IP block (/28 network)',
                'SLA 99.99% uptime guarantee',
                'Advanced DDoS protection',
                '24/7 VIP support',
                'On-site support available',
                'Redundant connections',
                'Cloud backup (200GB)',
                'Custom network solutions',
            ],
            'technical_specs' => [
                'Technology' => 'Fiber to the Business (FTTB)',
                'Download Speed' => '500 Mbps dedicated',
                'Upload Speed' => '250 Mbps dedicated',
                'SLA' => '99.99% uptime',
                'Support' => '24/7 VIP + on-site',
                'IP Block' => '/28 network (16 IPs)',
                'Installation' => 'Priority 6-12 hours',
            ],
            'is_active' => true,
            'is_featured' => false,
            'badge' => 'Enterprise',
            'sort_order' => 3,
        ]);
    }

    /**
     * Create Hosting Packages (Each package is a separate product)
     */
    private function createHostingPackages(): void
    {
        $this->command->info('Creating hosting packages...');

        $sharedHostingCategory = Category::where('slug', 'shared-hosting')->first();
        $vpsCategory = Category::where('slug', 'vps-hosting')->first();
        $resellerCategory = Category::where('slug', 'reseller-hosting')->first();

        // Validate categories exist
        if (!$sharedHostingCategory || !$vpsCategory || !$resellerCategory) {
            $this->command->error('Required hosting categories not found!');
            $this->command->error('Available categories: ' . Category::pluck('slug')->implode(', '));
            return;
        }

        // Get add-ons
        $ssl = Addon::where('slug', 'ssl-certificate')->first();
        $backup = Addon::where('slug', 'daily-backups')->first();
        $storage = Addon::where('slug', 'extra-storage')->first();

        // ==================== SHARED HOSTING ====================

        $webStarter = Product::create([
            'category_id' => $sharedHostingCategory->id,
            'name' => 'Starter',
            'slug' => 'web-hosting-starter',
            'description' => 'Perfect entry-level hosting for personal websites, blogs, and small portfolios. Includes everything you need to get started online.',
            'short_description' => 'Perfect for personal websites and blogs',
            'sku' => 'WEB-STARTER',
            'type' => 'hosting_package',
            'price_monthly' => 375,
            'price_annually' => 4500,
            'setup_fee' => 0,
            'storage_gb' => 35,
            'bandwidth_gb' => 999999, // Unlimited
            'email_accounts' => 10,
            'databases' => 5,
            'domains_allowed' => 1,
            'ssl_included' => true,
            'backup_included' => false,
            'features' => [
                '35GB NVMe SSD Storage',
                '2GB RAM allocated',
                'Free .co.ke domain (1 year)',
                'Unlimited Bandwidth',
                'Free SSL Certificate',
                'Softaculous (1-click installs)',
                'WordPress optimized',
                'Email support',
                '10 email accounts',
                '5 MySQL databases',
            ],
            'technical_specs' => [
                'Storage Type' => 'NVMe SSD',
                'RAM' => '2GB allocated',
                'Control Panel' => 'cPanel',
                'PHP Versions' => '7.4, 8.0, 8.1, 8.2',
                'MySQL' => '8.0',
                'Backups' => 'Weekly',
                'Uptime' => '99.9%',
            ],
            'is_active' => true,
            'is_featured' => false,
            'sort_order' => 1,
        ]);

        $webStarter->addons()->attach([
            $backup->id => [
                'custom_price' => 500,
                'is_required' => false,
                'sort_order' => 1,
            ],
        ]);

        $webStandard = Product::create([
            'category_id' => $sharedHostingCategory->id,
            'name' => 'Standard',
            'slug' => 'web-hosting-standard',
            'description' => 'Our most popular hosting plan for small businesses, e-commerce sites, and growing websites with moderate traffic.',
            'short_description' => 'Most popular for small business sites',
            'sku' => 'WEB-STANDARD',
            'type' => 'hosting_package',
            'price_monthly' => 458,
            'price_annually' => 5500,
            'setup_fee' => 0,
            'storage_gb' => 100,
            'bandwidth_gb' => 999999,
            'email_accounts' => 25,
            'databases' => 15,
            'domains_allowed' => 5,
            'ssl_included' => true,
            'backup_included' => true,
            'features' => [
                '100GB NVMe SSD Storage',
                '4GB RAM allocated',
                'Free .co.ke domain (1 year)',
                'Unlimited Bandwidth',
                'Free SSL Certificate',
                'Softaculous (1-click installs)',
                'WordPress optimized',
                'Priority support',
                '25 email accounts',
                '15 MySQL databases',
                'Daily backups included',
                'CDN integration',
            ],
            'technical_specs' => [
                'Storage Type' => 'NVMe SSD',
                'RAM' => '4GB allocated',
                'Control Panel' => 'cPanel',
                'PHP Versions' => '7.4, 8.0, 8.1, 8.2',
                'MySQL' => '8.0',
                'Backups' => 'Daily',
                'Uptime' => '99.9%',
            ],
            'is_active' => true,
            'is_featured' => true,
            'badge' => 'Best Value',
            'sort_order' => 2,
        ]);

        $webExecutive = Product::create([
            'category_id' => $sharedHostingCategory->id,
            'name' => 'Executive',
            'slug' => 'web-hosting-executive',
            'description' => 'Premium hosting for high-traffic websites, online stores, and businesses requiring maximum performance and resources.',
            'short_description' => 'Premium hosting for high-traffic sites',
            'sku' => 'WEB-EXECUTIVE',
            'type' => 'hosting_package',
            'price_monthly' => 1067,
            'price_annually' => 12800,
            'setup_fee' => 0,
            'storage_gb' => 999999, // Unlimited
            'bandwidth_gb' => 999999,
            'email_accounts' => 100,
            'databases' => 50,
            'domains_allowed' => 999999,
            'ssl_included' => true,
            'backup_included' => true,
            'features' => [
                'Unlimited NVMe SSD Storage',
                '8GB RAM allocated',
                'Free .co.ke domain (1 year)',
                'Unlimited Bandwidth',
                'Free SSL Certificate',
                'Softaculous (1-click installs)',
                'WordPress optimized',
                'Priority support 24/7',
                '100 email accounts',
                '50 MySQL databases',
                'Hourly backups included',
                'CDN integration',
                'Dedicated IP',
                'Staging environment',
            ],
            'technical_specs' => [
                'Storage Type' => 'NVMe SSD',
                'RAM' => '8GB allocated',
                'Control Panel' => 'cPanel',
                'PHP Versions' => '7.4, 8.0, 8.1, 8.2',
                'MySQL' => '8.0',
                'Backups' => 'Hourly',
                'Uptime' => '99.99%',
            ],
            'is_active' => true,
            'is_featured' => false,
            'sort_order' => 3,
        ]);

        $webHostingOnly = Product::create([
            'category_id' => $sharedHostingCategory->id,
            'name' => 'Hosting Only',
            'slug' => 'web-hosting-only',
            'description' => 'No-frills hosting plan for those who already have a domain. Same great features without the included domain.',
            'short_description' => 'Great hosting without a domain',
            'sku' => 'WEB-HOSTING-ONLY',
            'type' => 'hosting_package',
            'price_monthly' => 250,
            'price_annually' => 2999,
            'setup_fee' => 0,
            'storage_gb' => 35,
            'bandwidth_gb' => 999999,
            'email_accounts' => 10,
            'databases' => 5,
            'domains_allowed' => 1,
            'ssl_included' => true,
            'backup_included' => false,
            'features' => [
                '35GB NVMe SSD Storage',
                '2GB RAM allocated',
                'No free domain (BYO)',
                'Unlimited Bandwidth',
                'Free SSL Certificate',
                'Softaculous (1-click installs)',
                'WordPress optimized',
                'Email support',
            ],
            'technical_specs' => [
                'Storage Type' => 'NVMe SSD',
                'RAM' => '2GB allocated',
                'Control Panel' => 'cPanel',
                'PHP Versions' => '7.4, 8.0, 8.1, 8.2',
                'MySQL' => '8.0',
                'Backups' => 'Weekly',
                'Uptime' => '99.9%',
            ],
            'is_active' => true,
            'is_featured' => false,
            'sort_order' => 4,
        ]);

        // ==================== VPS HOSTING ====================

        $vpsStarter = Product::create([
            'category_id' => $vpsCategory->id,
            'name' => 'VPS Starter',
            'slug' => 'vps-starter',
            'description' => 'Perfect entry-level VPS for developers, small applications, and websites that have outgrown shared hosting.',
            'short_description' => 'Entry-level virtual private server',
            'sku' => 'VPS-STARTER',
            'type' => 'hosting_package',
            'price_monthly' => 2499,
            'price_quarterly' => 6999,
            'price_annually' => 24999,
            'setup_fee' => 0,
            'storage_gb' => 40,
            'bandwidth_gb' => 999999,
            'email_accounts' => 10,
            'databases' => 999999,
            'domains_allowed' => 999999,
            'ssl_included' => true,
            'backup_included' => true,
            'features' => [
                '1 Core CPU dedicated',
                '2 GB Guaranteed RAM',
                '40 GB 100% SSD Storage',
                'KVM Virtualization',
                'Unlimited Bandwidth',
                'Full Root Access',
                'DDoS Protection',
                '100 Mbit/s Port',
                'FREE cPanel License',
                '1 IPv4 Address',
                '64 IPv6 Addresses',
                'Weekly snapshots',
            ],
            'technical_specs' => [
                'Virtualization' => 'KVM',
                'CPU' => '1 Core Dedicated',
                'RAM' => '2 GB Guaranteed',
                'Storage' => '40 GB SSD',
                'Bandwidth' => 'Unlimited',
                'Port Speed' => '100 Mbit/s',
                'IPv4' => '1 Address',
                'IPv6' => '64 Addresses',
                'Control Panel' => 'cPanel (optional)',
            ],
            'is_active' => true,
            'is_featured' => false,
            'sort_order' => 1,
        ]);

        $vpsProfessional = Product::create([
            'category_id' => $vpsCategory->id,
            'name' => 'VPS Professional',
            'slug' => 'vps-professional',
            'description' => 'Balanced VPS package for growing websites, applications, and development environments requiring more resources.',
            'short_description' => 'Balanced performance for growing sites',
            'sku' => 'VPS-PRO',
            'type' => 'hosting_package',
            'price_monthly' => 3999,
            'price_quarterly' => 10999,
            'price_annually' => 39999,
            'setup_fee' => 0,
            'storage_gb' => 80,
            'bandwidth_gb' => 999999,
            'email_accounts' => 25,
            'databases' => 999999,
            'domains_allowed' => 999999,
            'ssl_included' => true,
            'backup_included' => true,
            'features' => [
                '2 Cores CPU dedicated',
                '4 GB Guaranteed RAM',
                '80 GB 100% SSD Storage',
                'KVM Virtualization',
                'Unlimited Bandwidth',
                'Full Root Access',
                'DDoS Protection',
                '200 Mbit/s Port',
                'FREE cPanel License (3 accounts)',
                '1 IPv4 Address',
                '64 IPv6 Addresses',
                'Daily snapshots',
                'Priority Support',
            ],
            'technical_specs' => [
                'Virtualization' => 'KVM',
                'CPU' => '2 Cores Dedicated',
                'RAM' => '4 GB Guaranteed',
                'Storage' => '80 GB SSD',
                'Bandwidth' => 'Unlimited',
                'Port Speed' => '200 Mbit/s',
                'IPv4' => '1 Address',
                'IPv6' => '64 Addresses',
                'cPanel Accounts' => '3 included',
            ],
            'is_active' => true,
            'is_featured' => true,
            'badge' => 'Popular',
            'sort_order' => 2,
        ]);

        $vpsUltimate = Product::create([
            'category_id' => $vpsCategory->id,
            'name' => 'VPS Ultimate',
            'slug' => 'vps-ultimate',
            'description' => 'High-performance VPS with premium resources for demanding applications, high-traffic websites, and production environments.',
            'short_description' => 'High-performance VPS for demanding applications',
            'sku' => 'VPS-ULTIMATE',
            'type' => 'hosting_package',
            'price_monthly' => 4999,
            'price_quarterly' => 13999,
            'price_annually' => 49999,
            'setup_fee' => 0,
            'storage_gb' => 80,
            'bandwidth_gb' => 999999,
            'email_accounts' => 50,
            'databases' => 999999,
            'domains_allowed' => 999999,
            'ssl_included' => true,
            'backup_included' => true,
            'features' => [
                'Ksh 4,000 / Month Incl. VAT',
                '2 Cores CPU dedicated',
                '8 GB Guaranteed RAM',
                '80 GB 100% SSD Disk Space',
                'KVM Virtualization',
                'Unlimited Bandwidth',
                'Full Root Access',
                'DDoS Protection',
                '400 Mbit/s Port',
                'FREE cPanel License (5 cPanel accounts)',
                '1 IPv4 Address',
                '64 Network IPv6 Address',
                'Daily automated backups',
                'Managed services available',
            ],
            'technical_specs' => [
                'Virtualization' => 'KVM',
                'CPU' => '2 Cores Dedicated',
                'RAM' => '8 GB Guaranteed',
                'Storage' => '80 GB SSD',
                'Bandwidth' => 'Unlimited',
                'Port Speed' => '400 Mbit/s',
                'IPv4' => '1 Address',
                'IPv6' => '64 Addresses',
                'cPanel Accounts' => '5 included',
                'OS Options' => 'Ubuntu, CentOS, Debian, AlmaLinux',
            ],
            'is_active' => true,
            'is_featured' => false,
            'badge' => 'Best Performance',
            'sort_order' => 3,
        ]);

        $vpsEnterprise = Product::create([
            'category_id' => $vpsCategory->id,
            'name' => 'VPS Enterprise',
            'slug' => 'vps-enterprise',
            'description' => 'Maximum performance VPS for large-scale applications, enterprise workloads, and mission-critical services.',
            'short_description' => 'Maximum performance for enterprise workloads',
            'sku' => 'VPS-ENTERPRISE',
            'type' => 'hosting_package',
            'price_monthly' => 8999,
            'price_quarterly' => 24999,
            'price_annually' => 89999,
            'setup_fee' => 0,
            'storage_gb' => 200,
            'bandwidth_gb' => 999999,
            'email_accounts' => 100,
            'databases' => 999999,
            'domains_allowed' => 999999,
            'ssl_included' => true,
            'backup_included' => true,
            'features' => [
                '4 Cores CPU dedicated',
                '16 GB Guaranteed RAM',
                '200 GB 100% SSD Storage',
                'KVM Virtualization',
                'Unlimited Bandwidth',
                'Full Root Access',
                'Advanced DDoS Protection',
                '1 Gbit/s Port',
                'FREE cPanel License (Unlimited)',
                '2 IPv4 Addresses',
                '64 IPv6 Addresses',
                'Hourly backups',
                'Priority Support 24/7',
                'Managed Services Available',
            ],
            'technical_specs' => [
                'Virtualization' => 'KVM',
                'CPU' => '4 Cores Dedicated',
                'RAM' => '16 GB Guaranteed',
                'Storage' => '200 GB SSD',
                'Bandwidth' => 'Unlimited',
                'Port Speed' => '1 Gbit/s',
                'IPv4' => '2 Addresses',
                'IPv6' => '64 Addresses',
                'cPanel Accounts' => 'Unlimited',
            ],
            'is_active' => true,
            'is_featured' => false,
            'sort_order' => 4,
        ]);

        // ==================== RESELLER HOSTING ====================

        $resellerStarter = Product::create([
            'category_id' => $resellerCategory->id,
            'name' => 'Reseller Starter',
            'slug' => 'reseller-starter',
            'description' => 'Start your own hosting business with our reseller hosting. Perfect for web designers, developers, and entrepreneurs.',
            'short_description' => 'Launch your hosting business',
            'sku' => 'RESELLER-STARTER',
            'type' => 'hosting_package',
            'price_monthly' => 2999,
            'price_annually' => 29999,
            'setup_fee' => 0,
            'storage_gb' => 50,
            'bandwidth_gb' => 500,
            'domains_allowed' => 10,
            'ssl_included' => true,
            'backup_included' => true,
            'features' => [
                '50 GB SSD Storage',
                '500 GB Monthly Bandwidth',
                'Resell cPanel Accounts',
                'WHM Access',
                'Free SSL for All Clients',
                'Daily Backups',
                'White-label Branding',
                'Support for 10 Clients',
                'Private nameservers',
            ],
            'technical_specs' => [
                'Max Accounts' => '10',
                'Storage' => '50 GB SSD',
                'Bandwidth' => '500 GB/month',
                'Control Panels' => 'WHM/cPanel',
                'White Label' => 'Yes',
                'Nameservers' => 'Private',
            ],
            'is_active' => true,
            'is_featured' => false,
            'sort_order' => 1,
        ]);

        $resellerPro = Product::create([
            'category_id' => $resellerCategory->id,
            'name' => 'Reseller Pro',
            'slug' => 'reseller-pro',
            'description' => 'Scale your hosting business with more resources, unlimited accounts, and priority support.',
            'short_description' => 'Scale your hosting business',
            'sku' => 'RESELLER-PRO',
            'type' => 'hosting_package',
            'price_monthly' => 5999,
            'price_annually' => 59999,
            'setup_fee' => 0,
            'storage_gb' => 150,
            'bandwidth_gb' => 2000,
            'domains_allowed' => 999999,
            'ssl_included' => true,
            'backup_included' => true,
            'features' => [
                '150 GB SSD Storage',
                '2 TB Monthly Bandwidth',
                'Unlimited cPanel Accounts',
                'WHM Access',
                'Free SSL for All Clients',
                'Daily Backups',
                'White-label Branding',
                'Unlimited Client Accounts',
                'Priority Support',
                'Private nameservers',
                'WHMCS License included',
            ],
            'technical_specs' => [
                'Max Accounts' => 'Unlimited',
                'Storage' => '150 GB SSD',
                'Bandwidth' => '2 TB/month',
                'Control Panels' => 'WHM/cPanel',
                'White Label' => 'Yes',
                'Nameservers' => 'Private',
                'WHMCS' => 'Included',
            ],
            'is_active' => true,
            'is_featured' => true,
            'badge' => 'Recommended',
            'sort_order' => 2,
        ]);
    }

    /**
     * Create Domain Products
     */
    private function createDomainProducts(): void
    {
        $this->command->info('Creating domain products...');

        // Use the main domain category for simplicity
        $domainCategory = Category::where('slug', 'domain-names')->first();

        if (!$domainCategory) {
            $this->command->error('Domain category not found!');
            return;
        }

        // .KE Domain
        Product::create([
            'category_id' => $domainCategory->id,
            'name' => '.co.ke Domain Registration',
            'slug' => 'domain-co-ke',
            'description' => 'Register your .co.ke domain name for your Kenyan business. Establish your local online presence.',
            'short_description' => 'Kenya\'s business domain',
            'sku' => 'DOMAIN-CO-KE',
            'type' => 'domain',
            'price_annually' => 1200,
            'features' => [
                '.co.ke Domain Registration',
                'Free DNS Management',
                'Domain Privacy Protection',
                'Easy Domain Transfer',
                'Renewal Reminders',
                '24/7 DNS Management',
                'Instant activation',
            ],
            'is_active' => true,
            'is_featured' => true,
            'sort_order' => 1,
        ]);

        // .COM Domain
        Product::create([
            'category_id' => $domainCategory->id,
            'name' => '.com Domain Registration',
            'slug' => 'domain-com',
            'description' => 'Register the world\'s most popular .com domain. Perfect for businesses going global.',
            'short_description' => 'World\'s most popular domain',
            'sku' => 'DOMAIN-COM',
            'type' => 'domain',
            'price_annually' => 1800,
            'features' => [
                '.com Domain Registration',
                'Free DNS Management',
                'Domain Privacy Protection',
                'Easy Domain Transfer',
                'Instant Registration',
                'Global recognition',
            ],
            'is_active' => true,
            'is_featured' => true,
            'sort_order' => 2,
        ]);

        // Other TLDs
        Product::create([
            'category_id' => $domainCategory->id,
            'name' => '.org Domain Registration',
            'slug' => 'domain-org',
            'description' => 'Register a .org domain for your organization, NGO, or non-profit.',
            'short_description' => 'For organizations and NGOs',
            'sku' => 'DOMAIN-ORG',
            'type' => 'domain',
            'price_annually' => 2000,
            'is_active' => true,
            'sort_order' => 3,
        ]);

        Product::create([
            'category_id' => $domainCategory->id,
            'name' => '.net Domain Registration',
            'slug' => 'domain-net',
            'description' => 'Register a professional .net domain for your network or technology business.',
            'short_description' => 'Professional .net domain',
            'sku' => 'DOMAIN-NET',
            'type' => 'domain',
            'price_annually' => 2200,
            'is_active' => true,
            'sort_order' => 4,
        ]);

        Product::create([
            'category_id' => $domainCategory->id,
            'name' => '.biz Domain Registration',
            'slug' => 'domain-biz',
            'description' => 'Register a .biz domain for your business venture.',
            'short_description' => 'Business domain',
            'sku' => 'DOMAIN-BIZ',
            'type' => 'domain',
            'price_annually' => 1500,
            'is_active' => true,
            'sort_order' => 5,
        ]);

        Product::create([
            'category_id' => $domainCategory->id,
            'name' => '.io Domain Registration',
            'slug' => 'domain-io',
            'description' => 'Register a trendy .io domain, perfect for tech startups and SaaS products.',
            'short_description' => 'Tech startup domain',
            'sku' => 'DOMAIN-IO',
            'type' => 'domain',
            'price_annually' => 4500,
            'is_active' => true,
            'is_featured' => true,
            'sort_order' => 6,
        ]);
    }

    /**
     * Create Web Development Services
     */
    private function createWebDevelopmentServices(): void
    {
        $this->command->info('Creating web development services...');

        // Use subcategories under Web Development
        $businessWebsitesCategory = Category::where('slug', 'business-websites')->first();
        $ecommerceCategory = Category::where('slug', 'ecommerce')->first();

        if (!$businessWebsitesCategory || !$ecommerceCategory) {
            $this->command->error('Web development categories not found!');
            $this->command->error('Available categories: ' . Category::pluck('slug')->implode(', '));
            return;
        }

        // Static/Business Websites
        Product::create([
            'category_id' => $businessWebsitesCategory->id,
            'name' => 'Basic Website Package',
            'slug' => 'basic-website',
            'description' => 'Professional static website perfect for small businesses, portfolios, and personal brands. Fast, secure, and SEO-friendly.',
            'short_description' => 'Professional static website',
            'sku' => 'WEBDEV-BASIC',
            'type' => 'web_development',
            'price_one_time' => 15000,
            'pages_included' => 5,
            'revisions_included' => 2,
            'delivery_days' => 7,
            'features' => [
                'Up to 5 Pages',
                'Responsive Design (Mobile-friendly)',
                'Contact Form',
                'Social Media Integration',
                'Basic SEO Setup',
                'Google Analytics',
                '2 Revision Rounds',
                '7 Days Delivery',
                '1 Month Support',
            ],
            'technical_specs' => [
                'Technology' => 'HTML5, CSS3, JavaScript',
                'Hosting' => 'Static hosting included (1 year)',
                'SSL' => 'Free SSL included',
                'Performance' => 'Lightning fast load times',
                'Support' => '1 month free support',
            ],
            'is_active' => true,
            'is_featured' => false,
            'sort_order' => 1,
        ]);

        Product::create([
            'category_id' => $businessWebsitesCategory->id,
            'name' => 'Business Website Package',
            'slug' => 'business-website',
            'description' => 'Comprehensive static website for established businesses. Includes more pages, custom design, and extended support.',
            'short_description' => 'Complete business website',
            'sku' => 'WEBDEV-BUSINESS',
            'type' => 'web_development',
            'price_one_time' => 25000,
            'pages_included' => 10,
            'revisions_included' => 3,
            'delivery_days' => 14,
            'features' => [
                'Up to 10 Pages',
                'Custom Responsive Design',
                'Contact & Booking Forms',
                'Social Media Integration',
                'Advanced SEO Package',
                'Google Analytics & Search Console',
                'Email Integration',
                '3 Revision Rounds',
                '14 Days Delivery',
                '3 Months Support',
            ],
            'is_active' => true,
            'is_featured' => true,
            'badge' => 'Popular',
            'sort_order' => 2,
        ]);

        Product::create([
            'category_id' => $businessWebsitesCategory->id,
            'name' => 'CMS Website Package',
            'slug' => 'cms-website',
            'description' => 'Dynamic website with content management system. Update your content anytime without technical knowledge.',
            'short_description' => 'Easy-to-update CMS website',
            'sku' => 'WEBDEV-CMS',
            'type' => 'web_development',
            'price_one_time' => 35000,
            'pages_included' => 15,
            'revisions_included' => 3,
            'delivery_days' => 14,
            'features' => [
                'Up to 15 Pages',
                'WordPress or Custom CMS',
                'Admin Dashboard',
                'Content Management System',
                'Blog Integration',
                'Contact & Booking Forms',
                'Basic SEO Package',
                'Training Session Included',
                '3 Revision Rounds',
                '14 Days Delivery',
                '3 Months Support',
            ],
            'technical_specs' => [
                'CMS Options' => 'WordPress, Laravel, Custom',
                'Hosting' => 'Shared hosting (1 year)',
                'Database' => 'MySQL',
                'Admin Panel' => 'Custom dashboard',
                'Training' => '2-hour training session',
            ],
            'is_active' => true,
            'is_featured' => true,
            'badge' => 'Best Value',
            'sort_order' => 3,
        ]);

        Product::create([
            'category_id' => $businessWebsitesCategory->id,
            'name' => 'Advanced CMS Package',
            'slug' => 'advanced-cms-website',
            'description' => 'Feature-rich CMS website with advanced functionality, custom modules, and integrations.',
            'short_description' => 'Advanced CMS with custom features',
            'sku' => 'WEBDEV-ADVANCED-CMS',
            'type' => 'web_development',
            'price_one_time' => 55000,
            'pages_included' => 25,
            'revisions_included' => 5,
            'delivery_days' => 21,
            'features' => [
                'Up to 25 Pages',
                'Custom CMS Development',
                'Advanced Admin Dashboard',
                'User Management System',
                'Blog & News Section',
                'Custom Forms & Workflows',
                'API Integrations',
                'Advanced SEO Package',
                '5 Revision Rounds',
                '21 Days Delivery',
                '6 Months Support',
            ],
            'is_active' => true,
            'is_featured' => false,
            'sort_order' => 4,
        ]);

        // E-Commerce Websites
        Product::create([
            'category_id' => $ecommerceCategory->id,
            'name' => 'Basic E-Commerce Package',
            'slug' => 'basic-ecommerce',
            'description' => 'Start selling online with a complete e-commerce website. Includes payment gateway and inventory management.',
            'short_description' => 'Complete online store',
            'sku' => 'WEBDEV-ECOMMERCE-BASIC',
            'type' => 'web_development',
            'price_one_time' => 75000,
            'pages_included' => 20,
            'revisions_included' => 4,
            'delivery_days' => 30,
            'features' => [
                'Up to 50 Products',
                'Shopping Cart System',
                'Payment Gateway (M-Pesa, Card)',
                'Order Management',
                'Basic Inventory System',
                'Customer Accounts',
                'Product Search & Filters',
                'Email Notifications',
                'Mobile Responsive',
                'Basic SEO',
                '4 Revision Rounds',
                '30 Days Delivery',
                '3 Months Support',
            ],
            'technical_specs' => [
                'Platform' => 'WooCommerce or Custom',
                'Payment Gateways' => 'M-Pesa, Visa, Mastercard',
                'Max Products' => '50 products',
                'Hosting' => 'Included (1 year)',
                'SSL' => 'Free SSL included',
            ],
            'is_active' => true,
            'is_featured' => false,
            'sort_order' => 1,
        ]);

        Product::create([
            'category_id' => $ecommerceCategory->id,
            'name' => 'Advanced E-Commerce Package',
            'slug' => 'advanced-ecommerce',
            'description' => 'Full-featured e-commerce platform for serious online businesses. Unlimited products and advanced features.',
            'short_description' => 'Enterprise e-commerce solution',
            'sku' => 'WEBDEV-ECOMMERCE-ADVANCED',
            'type' => 'web_development',
            'price_one_time' => 150000,
            'pages_included' => 50,
            'revisions_included' => 6,
            'delivery_days' => 45,
            'features' => [
                'Unlimited Products',
                'Advanced Shopping Cart',
                'Multiple Payment Gateways',
                'Order Management Dashboard',
                'Advanced Inventory System',
                'Customer Accounts & Wishlists',
                'Product Reviews & Ratings',
                'Coupon & Discount System',
                'Shipping Calculator',
                'Multi-currency Support',
                'Email & SMS Notifications',
                'Advanced SEO Package',
                'Analytics Dashboard',
                '6 Revision Rounds',
                '45 Days Delivery',
                '6 Months Premium Support',
            ],
            'technical_specs' => [
                'Platform' => 'Custom Laravel E-commerce',
                'Payment Gateways' => 'M-Pesa, Cards, PayPal, more',
                'Max Products' => 'Unlimited',
                'Hosting' => 'VPS hosting (1 year)',
                'SSL' => 'Premium SSL included',
                'API' => 'RESTful API included',
            ],
            'is_active' => true,
            'is_featured' => true,
            'badge' => 'Premium',
            'sort_order' => 2,
        ]);

        Product::create([
            'category_id' => $ecommerceCategory->id,
            'name' => 'Marketplace Platform',
            'slug' => 'marketplace-platform',
            'description' => 'Multi-vendor marketplace platform where multiple sellers can list products. Perfect for marketplaces like Jumia model.',
            'short_description' => 'Multi-vendor marketplace',
            'sku' => 'WEBDEV-MARKETPLACE',
            'type' => 'web_development',
            'price_one_time' => 300000,
            'pages_included' => 100,
            'revisions_included' => 10,
            'delivery_days' => 60,
            'features' => [
                'Multi-vendor System',
                'Vendor Registration & Approval',
                'Vendor Dashboards',
                'Commission Management',
                'Unlimited Products',
                'Advanced Search & Filters',
                'Payment Split System',
                'Rating & Review System',
                'Dispute Resolution System',
                'Analytics for Admin & Vendors',
                'Mobile App (iOS & Android)',
                'Advanced SEO',
                '10 Revision Rounds',
                '60 Days Delivery',
                '12 Months Premium Support',
            ],
            'technical_specs' => [
                'Platform' => 'Custom Laravel Platform',
                'Payment Gateways' => 'All major gateways',
                'Hosting' => 'Dedicated VPS (1 year)',
                'Mobile Apps' => 'iOS & Android included',
                'API' => 'Full REST API',
            ],
            'is_active' => true,
            'is_featured' => false,
            'badge' => 'Enterprise',
            'sort_order' => 3,
        ]);
    }
}