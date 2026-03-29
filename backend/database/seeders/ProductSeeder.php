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
        $this->createEnterpriseServices();

        $this->command->info('✅ All products seeded successfully!');
    }

    /**
     * Create Enterprise Quote-Based Services
     */
    private function createEnterpriseServices(): void
    {
        $this->command->info('Creating enterprise services...');

        $category = Category::where('slug', 'enterprise-services')->first();

        if (!$category) {
            $this->command->error('No enterprise-services category found! Make sure CategorySeeder is run first.');
            return;
        }

        $services = [
            [
                'name' => 'Internet Connectivity',
                'slug' => 'internet-connectivity',
                'sku' => 'SERVICE-INTERNET-CONNECTIVITY',
                'short_description' => 'High-speed fiber internet for homes and businesses with reliable, blazing-fast connections.',
                'description' => 'High-speed fiber internet for homes and businesses with reliable, blazing-fast connections. Available in various packages including Home and Business plans.',
                'sort_order' => 1,
            ],
            [
                'name' => 'Enterprise Connectivity',
                'slug' => 'enterprise-connectivity',
                'sku' => 'SERVICE-ENTERPRISE-CONNECTIVITY',
                'short_description' => 'Secure, reliable, and scalable network solutions that keep your business seamlessly connected.',
                'description' => 'Secure, reliable, and scalable network solutions that keep your business seamlessly connected.',
                'sort_order' => 2,
            ],
            [
                'name' => 'Cloud Solutions',
                'slug' => 'cloud-solutions',
                'sku' => 'SERVICE-CLOUD-SOLUTIONS',
                'short_description' => 'Vilcom Drive/Photos services for storage, collaboration, and flexible digital growth.',
                'description' => 'Vilcom Drive/Photos services for storage, collaboration, and flexible digital growth.',
                'sort_order' => 3,
            ],
            [
                'name' => 'Cyber Security',
                'slug' => 'cyber-security',
                'sku' => 'SERVICE-CYBER-SECURITY',
                'short_description' => 'Safeguard your data, people, and business against digital threats.',
                'description' => 'Safeguard your data, people, and business against digital threats.',
                'sort_order' => 4,
            ],
            [
                'name' => 'Smart Integration',
                'slug' => 'smart-integration',
                'sku' => 'SERVICE-SMART-INTEGRATION',
                'short_description' => 'IoT and digital tools to streamline and transform business operations.',
                'description' => 'IoT and digital tools to streamline and transform business operations.',
                'sort_order' => 5,
            ],
            [
                'name' => 'Web Development',
                'slug' => 'web-development-enterprise',
                'sku' => 'SERVICE-WEB-DEV',
                'short_description' => 'Android, iOS, & Web Development - Custom app and web solutions tailored for your business needs.',
                'description' => 'Android, iOS, & Web Development - Custom app and web solutions tailored for your business needs.',
                'sort_order' => 6,
            ],
            [
                'name' => 'ERP As A Service',
                'slug' => 'erp-service',
                'sku' => 'SERVICE-ERP',
                'short_description' => 'Streamline. Simplify. Succeed. Integrated enterprise management tools for efficient business processes.',
                'description' => 'Streamline. Simplify. Succeed. Integrated enterprise management tools for efficient business processes.',
                'sort_order' => 7,
            ],
            [
                'name' => 'ISP Billing As A Service',
                'slug' => 'isp-billing',
                'sku' => 'SERVICE-ISP-BILLING',
                'short_description' => 'Smart billing, seamless growth. Simplified, automated billing solutions for Internet Service Providers.',
                'description' => 'Smart billing, seamless growth. Simplified, automated billing solutions for Internet Service Providers.',
                'sort_order' => 8,
            ],
            [
                'name' => 'ISP CPE As A Service',
                'slug' => 'isp-cpe',
                'sku' => 'SERVICE-ISP-CPE',
                'short_description' => 'Plug in. Power up. Provisioned. Automated customer device setup for smooth ISP operations.',
                'description' => 'Plug in. Power up. Provisioned. Automated customer device setup for smooth ISP operations.',
                'sort_order' => 9,
            ],
            [
                'name' => 'ISP Device Management',
                'slug' => 'isp-device-management',
                'sku' => 'SERVICE-ISP-DEVICE-MGMT',
                'short_description' => 'Control every device, anywhere. Centralized control and monitoring of ISP devices.',
                'description' => 'Control every device, anywhere. Centralized control and monitoring of ISP devices.',
                'sort_order' => 10,
            ],
            [
                'name' => 'Firewall Solutions',
                'slug' => 'firewall-solutions',
                'sku' => 'SERVICE-FIREWALL',
                'short_description' => 'Your digital shield, always on. Advanced protection against network threats for businesses and homes.',
                'description' => 'Your digital shield, always on. Advanced protection against network threats for businesses and homes.',
                'sort_order' => 11,
            ],
            [
                'name' => 'Deep Packet Inspection',
                'slug' => 'deep-packet-inspection',
                'sku' => 'SERVICE-DPI',
                'short_description' => 'See deeper. Secure smarter. Real-time traffic analysis for optimized network performance and security.',
                'description' => 'See deeper. Secure smarter. Real-time traffic analysis for optimized network performance and security.',
                'sort_order' => 12,
            ],
            [
                'name' => 'Satellite Connectivity',
                'slug' => 'satellite-connectivity',
                'sku' => 'SERVICE-SATELLITE',
                'short_description' => 'Connecting the unserved, everywhere. Remote area satellite connectivity delivering reliable internet.',
                'description' => 'Connecting the unserved, everywhere. Remote area satellite connectivity delivering reliable internet.',
                'sort_order' => 13,
            ],
        ];

        foreach ($services as $service) {
            Product::create([
                'category_id' => $category->id,
                'name' => $service['name'],
                'slug' => $service['slug'],
                'description' => $service['description'],
                'short_description' => $service['short_description'],
                'sku' => $service['sku'],
                'type' => 'service',
                'price_one_time' => null,
                'is_quote_based' => true,
                'features' => [],
                'is_active' => true,
                'is_featured' => true,
                'badge' => 'Learn More',
                'sort_order' => $service['sort_order'],
                'meta_title' => $service['name'] . ' | Vilcom Networks',
                'meta_description' => $service['short_description'],
            ]);
        }

        $this->command->info('Enterprise services seeded successfully!');
    }

    /**
     * Create reusable add-ons
     */
    private function createAddons(): void
    {
        $this->command->info('Creating add-ons...');

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
     * Create Internet Plans
     */
    private function createInternetPlans(): void
    {
        $this->command->info('Creating internet plans...');

        $homeFiberCategory = Category::where('slug', 'home-fiber')->first();
        $businessFiberCategory = Category::where('slug', 'business-fiber')->first();

        if (!$homeFiberCategory || !$businessFiberCategory) {
            $this->command->error('Required categories not found!');
            $this->command->error('Available categories: ' . Category::pluck('slug')->implode(', '));
            return;
        }

        $staticIP = Addon::where('slug', 'static-ip')->first();
        $meshWifi = Addon::where('slug', 'mesh-wifi')->first();
        $priorityInstall = Addon::where('slug', 'priority-install')->first();
        $prioritySupport = Addon::where('slug', 'priority-support')->first();

        // ==================== HOME FIBER PLANS ====================

        // Starter 8 Mbps — KES 1,999/Month
        $homeStarter8 = Product::create([
            'category_id' => $homeFiberCategory->id,
            'name' => 'Starter 8 Mbps',
            'slug' => 'home-starter-8mbps',
            'description' => 'Perfect for light internet users who need basic connectivity for browsing, email, and standard definition streaming. Ideal for 1-2 users.',
            'short_description' => 'Perfect for light browsing and email',
            'sku' => 'HOME-STARTER-8',
            'type' => 'internet_plan',
            'speed_mbps' => 8,
            'connection_type' => 'fiber',
            'plan_category' => 'home',
            'price_monthly' => 1999,
            'setup_fee' => 0,
            'features' => [
                'Unlimited internet access',
                'Moderate internet speed',
                'SD Movie & Music Streaming',
                'Fast web browsing',
                'SD TV programming',
                'E-learning & Online meetings',
            ],
            'technical_specs' => [
                'Technology' => 'Fiber to the Home (FTTH)',
                'Download Speed' => '8 Mbps',
                'Upload Speed' => '4 Mbps',
                'Data Cap' => 'Unlimited',
                'Contract' => '12 months',
            ],
            'coverage_areas' => ['Nairobi', 'Kiambu', 'Machakos'],
            'available_nationwide' => false,
            'is_active' => true,
            'is_featured' => false,
            'sort_order' => 1,
            'meta_title' => 'Home Starter 8Mbps - Affordable Fiber Internet | Vilcom Networks',
            'meta_description' => 'Get affordable fiber internet at KES 1,999/month with unlimited data. Perfect for light browsing, SD streaming, and e-learning.',
        ]);

        $homeStarter8->addons()->attach([
            $staticIP->id => ['is_required' => false, 'is_default' => false, 'custom_price' => 500, 'sort_order' => 1],
            $priorityInstall->id => ['is_required' => false, 'is_default' => false, 'custom_price' => 2000, 'sort_order' => 2],
        ]);

        // Starter 18 Mbps — KES 2,799/Month
        $homeStarter18 = Product::create([
            'category_id' => $homeFiberCategory->id,
            'name' => 'Starter 18 Mbps',
            'slug' => 'home-starter-18mbps',
            'description' => 'A step up for households needing slightly more speed for comfortable SD streaming, browsing, and online meetings on multiple devices.',
            'short_description' => 'Reliable speed for everyday internet use',
            'sku' => 'HOME-STARTER-18',
            'type' => 'internet_plan',
            'speed_mbps' => 18,
            'connection_type' => 'fiber',
            'plan_category' => 'home',
            'price_monthly' => 2799,
            'setup_fee' => 0,
            'features' => [
                'Unlimited internet access',
                'Moderate internet speed',
                'SD Movie & Music Streaming',
                'Fast web browsing',
                'SD TV programming',
                'E-learning & Online meetings',
            ],
            'technical_specs' => [
                'Technology' => 'Fiber to the Home (FTTH)',
                'Download Speed' => '18 Mbps',
                'Upload Speed' => '9 Mbps',
                'Data Cap' => 'Unlimited',
                'Contract' => '12 months',
            ],
            'coverage_areas' => ['Nairobi', 'Kiambu', 'Machakos'],
            'available_nationwide' => false,
            'is_active' => true,
            'is_featured' => false,
            'sort_order' => 2,
            'meta_title' => 'Home Starter 18Mbps - Fiber Internet | Vilcom Networks',
            'meta_description' => 'Enjoy reliable fiber internet at KES 2,799/month. Great for SD streaming, browsing, and online meetings.',
        ]);

        $homeStarter18->addons()->attach([
            $staticIP->id => ['is_required' => false, 'is_default' => false, 'custom_price' => 500, 'sort_order' => 1],
            $priorityInstall->id => ['is_required' => false, 'is_default' => false, 'custom_price' => 2000, 'sort_order' => 2],
        ]);

        // Basic 30 Mbps — KES 3,799/Month
        $homeBasic30 = Product::create([
            'category_id' => $homeFiberCategory->id,
            'name' => 'Basic 30 Mbps',
            'slug' => 'home-basic-30mbps',
            'description' => 'High-speed internet for families who enjoy HD streaming, e-learning, and online meetings simultaneously on multiple devices.',
            'short_description' => 'High speed for HD streaming and e-learning',
            'sku' => 'HOME-BASIC-30',
            'type' => 'internet_plan',
            'speed_mbps' => 30,
            'connection_type' => 'fiber',
            'plan_category' => 'home',
            'price_monthly' => 3799,
            'setup_fee' => 0,
            'features' => [
                'High speed internet',
                'Fast web browsing',
                'SD Movie and Music streaming',
                'HD TV Programming',
                'E-Learning',
                'Online meetings',
            ],
            'technical_specs' => [
                'Technology' => 'Fiber to the Home (FTTH)',
                'Download Speed' => '30 Mbps',
                'Upload Speed' => '15 Mbps',
                'Data Cap' => 'Unlimited',
                'Contract' => '12 months',
            ],
            'coverage_areas' => ['Nairobi', 'Kiambu', 'Machakos', 'Nakuru'],
            'available_nationwide' => false,
            'is_active' => true,
            'is_featured' => false,
            'sort_order' => 3,
            'meta_title' => 'Home Basic 30Mbps - High Speed Fiber | Vilcom Networks',
            'meta_description' => 'High-speed fiber internet at KES 3,799/month. Perfect for HD TV programming, e-learning, and online meetings.',
        ]);

        $homeBasic30->addons()->attach([
            $staticIP->id => ['is_required' => false, 'is_default' => false, 'custom_price' => 500, 'sort_order' => 1],
            $meshWifi->id => ['is_required' => false, 'is_default' => false, 'custom_price' => 5000, 'sort_order' => 2],
        ]);

        // Basic 60 Mbps — KES 4,999/Month
        $homeBasic60 = Product::create([
            'category_id' => $homeFiberCategory->id,
            'name' => 'Basic 60 Mbps',
            'slug' => 'home-basic-60mbps',
            'description' => 'Great for connected families with multiple devices enjoying HD content, online meetings, and e-learning all at once.',
            'short_description' => 'High speed for the whole family',
            'sku' => 'HOME-BASIC-60',
            'type' => 'internet_plan',
            'speed_mbps' => 60,
            'connection_type' => 'fiber',
            'plan_category' => 'home',
            'price_monthly' => 4999,
            'setup_fee' => 0,
            'features' => [
                'High speed internet',
                'Fast web browsing',
                'SD Movie and Music streaming',
                'HD TV Programming',
                'E-Learning',
                'Online meetings',
            ],
            'technical_specs' => [
                'Technology' => 'Fiber to the Home (FTTH)',
                'Download Speed' => '60 Mbps',
                'Upload Speed' => '30 Mbps',
                'Data Cap' => 'Unlimited',
                'Contract' => '12 months',
            ],
            'coverage_areas' => ['Nairobi', 'Kiambu', 'Machakos', 'Nakuru', 'Kisumu', 'Mombasa'],
            'available_nationwide' => false,
            'is_active' => true,
            'is_featured' => true,
            'badge' => 'Best Value',
            'sort_order' => 4,
            'meta_title' => 'Home Basic 60Mbps - High Speed Fiber | Vilcom Networks',
            'meta_description' => 'High-speed fiber internet at KES 4,999/month. HD TV, e-learning and online meetings for the whole family.',
        ]);

        $homeBasic60->addons()->attach([
            $staticIP->id => ['is_required' => false, 'is_default' => false, 'custom_price' => 500, 'sort_order' => 1],
            $meshWifi->id => ['is_required' => false, 'is_default' => false, 'custom_price' => 4500, 'sort_order' => 2],
            $prioritySupport->id => ['is_required' => false, 'is_default' => false, 'custom_price' => 1500, 'sort_order' => 3],
        ]);

        // Standard 100 Mbps — KES 7,999/Month
        $homeStandard100 = Product::create([
            'category_id' => $homeFiberCategory->id,
            'name' => 'Standard 100 Mbps',
            'slug' => 'home-standard-100mbps',
            'description' => 'Our premium home plan with blazing speeds for power users, streamers, and large families. Perfect for 4K streaming, live gaming, and superfast downloads.',
            'short_description' => 'Ultimate speed for power users and gamers',
            'sku' => 'HOME-STANDARD-100',
            'type' => 'internet_plan',
            'speed_mbps' => 100,
            'connection_type' => 'fiber',
            'plan_category' => 'home',
            'price_monthly' => 7999,
            'setup_fee' => 0,
            'features' => [
                'SD Movie & Music streaming',
                'HD TV Programming',
                'Multiple Device Streaming',
                'Superfast Video Downloads',
                'Live Video Coverage',
                'Online Gaming',
            ],
            'technical_specs' => [
                'Technology' => 'Fiber to the Home (FTTH)',
                'Download Speed' => '100 Mbps',
                'Upload Speed' => '50 Mbps',
                'Data Cap' => 'Unlimited',
                'Contract' => '12 months',
            ],
            'coverage_areas' => ['Nairobi', 'Kiambu', 'Machakos', 'Nakuru', 'Kisumu', 'Mombasa', 'Eldoret'],
            'available_nationwide' => false,
            'is_active' => true,
            'is_featured' => true,
            'badge' => 'Premium',
            'sort_order' => 5,
            'meta_title' => 'Home Standard 100Mbps - Premium Fiber Internet | Vilcom Networks',
            'meta_description' => 'Premium fiber internet at KES 7,999/month. HD streaming, online gaming, live video and superfast downloads.',
        ]);

        $homeStandard100->addons()->attach([
            $staticIP->id => ['is_required' => false, 'is_default' => true, 'custom_price' => 0, 'sort_order' => 1],
            $meshWifi->id => ['is_required' => false, 'is_default' => false, 'custom_price' => 4000, 'sort_order' => 2],
            $prioritySupport->id => ['is_required' => false, 'is_default' => true, 'custom_price' => 0, 'sort_order' => 3],
        ]);

        // ==================== BUSINESS FIBER PLANS ====================

        // Business Fiber 40 Mbps — KES 4,999/Month (Dedicated)
        Product::create([
            'category_id' => $businessFiberCategory->id,
            'name' => 'Business Fiber 40 Mbps',
            'slug' => 'business-fiber-40mbps',
            'description' => 'Dedicated fiber connectivity for small businesses. Enjoy consistent 40 Mbps speeds with guaranteed uptime and business-grade support.',
            'short_description' => 'Dedicated connectivity for small businesses',
            'sku' => 'BIZ-FIBER-40',
            'type' => 'internet_plan',
            'speed_mbps' => 40,
            'connection_type' => 'fiber',
            'plan_category' => 'business',
            'price_monthly' => 4999,
            'setup_fee' => 5000,
            'features' => [
                'Dedicated 40 Mbps bandwidth',
                'Unlimited business data',
                'Static IP address included',
                'SLA uptime guarantee',
                'Business hours support',
                'Priority installation',
            ],
            'technical_specs' => [
                'Technology' => 'Fiber to the Business (FTTB)',
                'Download Speed' => '40 Mbps dedicated',
                'Upload Speed' => '20 Mbps dedicated',
                'Contention Ratio' => '1:1 dedicated',
                'SLA' => '99.5% uptime',
                'Installation' => '24 hours',
            ],
            'requirements' => 'Business registration documents, ID/Passport, Lease/Ownership documents',
            'terms_conditions' => '24-month business contract required',
            'is_active' => true,
            'is_featured' => false,
            'sort_order' => 1,
        ]);

        // Business Fiber 80 Mbps — KES 6,999/Month (Dedicated)
        Product::create([
            'category_id' => $businessFiberCategory->id,
            'name' => 'Business Fiber 80 Mbps',
            'slug' => 'business-fiber-80mbps',
            'description' => 'Dedicated 80 Mbps fiber for growing businesses. Reliable, high-performance connectivity for teams of up to 20 employees.',
            'short_description' => 'Dedicated speed for growing teams',
            'sku' => 'BIZ-FIBER-80',
            'type' => 'internet_plan',
            'speed_mbps' => 80,
            'connection_type' => 'fiber',
            'plan_category' => 'business',
            'price_monthly' => 6999,
            'setup_fee' => 5000,
            'features' => [
                'Dedicated 80 Mbps bandwidth',
                'Unlimited business data',
                'Static IP address included',
                'SLA uptime guarantee',
                'Priority business support',
                'Priority installation',
            ],
            'technical_specs' => [
                'Technology' => 'Fiber to the Business (FTTB)',
                'Download Speed' => '80 Mbps dedicated',
                'Upload Speed' => '40 Mbps dedicated',
                'Contention Ratio' => '1:1 dedicated',
                'SLA' => '99.5% uptime',
                'Installation' => '24 hours',
            ],
            'requirements' => 'Business registration documents, ID/Passport, Lease/Ownership documents',
            'terms_conditions' => '24-month business contract required',
            'is_active' => true,
            'is_featured' => false,
            'sort_order' => 2,
        ]);

        // Business Fiber 120 Mbps — KES 12,999/Month (Dedicated)
        Product::create([
            'category_id' => $businessFiberCategory->id,
            'name' => 'Business Fiber 120 Mbps',
            'slug' => 'business-fiber-120mbps',
            'description' => 'High-performance dedicated fiber for established businesses. Supports cloud operations, video conferencing, and multiple simultaneous users.',
            'short_description' => 'High performance for established businesses',
            'sku' => 'BIZ-FIBER-120',
            'type' => 'internet_plan',
            'speed_mbps' => 120,
            'connection_type' => 'fiber',
            'plan_category' => 'business',
            'price_monthly' => 12999,
            'setup_fee' => 7500,
            'features' => [
                'Dedicated 120 Mbps bandwidth',
                'Unlimited business data',
                'Multiple static IPs',
                'SLA 99.9% uptime guarantee',
                '24/7 priority support',
                'Dedicated account manager',
                'DDoS protection',
            ],
            'technical_specs' => [
                'Technology' => 'Fiber to the Business (FTTB)',
                'Download Speed' => '120 Mbps dedicated',
                'Upload Speed' => '60 Mbps dedicated',
                'Contention Ratio' => '1:1 dedicated',
                'SLA' => '99.9% uptime',
                'Support' => '24/7 priority',
                'Installation' => '12-24 hours',
            ],
            'requirements' => 'Business registration documents, ID/Passport, Lease/Ownership documents',
            'terms_conditions' => '24-month business contract required',
            'is_active' => true,
            'is_featured' => true,
            'badge' => 'Most Popular',
            'sort_order' => 3,
        ]);

        // Business Fiber 200 Mbps — KES 20,999/Month (Dedicated)
        Product::create([
            'category_id' => $businessFiberCategory->id,
            'name' => 'Business Fiber 200 Mbps',
            'slug' => 'business-fiber-200mbps',
            'description' => 'Dedicated 200 Mbps fiber for large businesses and organisations with high bandwidth demands and mission-critical operations.',
            'short_description' => 'Dedicated bandwidth for large organisations',
            'sku' => 'BIZ-FIBER-200',
            'type' => 'internet_plan',
            'speed_mbps' => 200,
            'connection_type' => 'fiber',
            'plan_category' => 'business',
            'price_monthly' => 20999,
            'setup_fee' => 10000,
            'features' => [
                'Dedicated 200 Mbps bandwidth',
                'Unlimited business data',
                'IP block included',
                'SLA 99.9% uptime guarantee',
                '24/7 VIP support',
                'Dedicated account manager',
                'Advanced DDoS protection',
                'Redundant connectivity option',
            ],
            'technical_specs' => [
                'Technology' => 'Fiber to the Business (FTTB)',
                'Download Speed' => '200 Mbps dedicated',
                'Upload Speed' => '100 Mbps dedicated',
                'Contention Ratio' => '1:1 dedicated',
                'SLA' => '99.9% uptime',
                'Support' => '24/7 VIP',
                'Installation' => '12-24 hours',
            ],
            'requirements' => 'Business registration documents, ID/Passport, Lease/Ownership documents',
            'terms_conditions' => '24-month business contract required',
            'is_active' => true,
            'is_featured' => false,
            'sort_order' => 4,
        ]);

        // Business Fiber 300 Mbps — KES 29,999/Month (Dedicated)
        Product::create([
            'category_id' => $businessFiberCategory->id,
            'name' => 'Business Fiber 300 Mbps',
            'slug' => 'business-fiber-300mbps',
            'description' => 'Enterprise-grade dedicated 300 Mbps fiber for organisations with intensive bandwidth requirements and zero tolerance for downtime.',
            'short_description' => 'Enterprise-grade dedicated connectivity',
            'sku' => 'BIZ-FIBER-300',
            'type' => 'internet_plan',
            'speed_mbps' => 300,
            'connection_type' => 'fiber',
            'plan_category' => 'enterprise',
            'price_monthly' => 29999,
            'setup_fee' => 12500,
            'features' => [
                'Dedicated 300 Mbps bandwidth',
                'Unlimited business data',
                'Large IP block included',
                'SLA 99.99% uptime guarantee',
                '24/7 VIP support with on-site option',
                'Advanced DDoS protection',
                'Redundant connections available',
                'Custom network solutions',
            ],
            'technical_specs' => [
                'Technology' => 'Fiber to the Business (FTTB)',
                'Download Speed' => '300 Mbps dedicated',
                'Upload Speed' => '150 Mbps dedicated',
                'Contention Ratio' => '1:1 dedicated',
                'SLA' => '99.99% uptime',
                'Support' => '24/7 VIP + on-site',
                'Installation' => 'Priority 6-12 hours',
            ],
            'requirements' => 'Business registration documents, ID/Passport, Lease/Ownership documents',
            'terms_conditions' => '24-month business contract required',
            'is_active' => true,
            'is_featured' => false,
            'badge' => 'Enterprise',
            'sort_order' => 5,
        ]);

        // Business Fiber 500 Mbps — KES 38,999/Month (Dedicated)
        Product::create([
            'category_id' => $businessFiberCategory->id,
            'name' => 'Business Fiber 500 Mbps',
            'slug' => 'business-fiber-500mbps',
            'description' => 'Maximum-performance dedicated 500 Mbps fiber for the most demanding enterprise environments requiring top-tier bandwidth and reliability.',
            'short_description' => 'Maximum dedicated bandwidth for enterprise',
            'sku' => 'BIZ-FIBER-500',
            'type' => 'internet_plan',
            'speed_mbps' => 500,
            'connection_type' => 'fiber',
            'plan_category' => 'enterprise',
            'price_monthly' => 38999,
            'setup_fee' => 15000,
            'features' => [
                'Dedicated 500 Mbps bandwidth',
                'Unlimited business data',
                'Large IP block (/28 network)',
                'SLA 99.99% uptime guarantee',
                '24/7 VIP support with on-site',
                'Advanced DDoS protection',
                'Redundant connections included',
                'Custom network solutions',
                'On-site support available',
            ],
            'technical_specs' => [
                'Technology' => 'Fiber to the Business (FTTB)',
                'Download Speed' => '500 Mbps dedicated',
                'Upload Speed' => '250 Mbps dedicated',
                'Contention Ratio' => '1:1 dedicated',
                'SLA' => '99.99% uptime',
                'Support' => '24/7 VIP + on-site',
                'IP Block' => '/28 network (16 IPs)',
                'Installation' => 'Priority 6-12 hours',
            ],
            'requirements' => 'Business registration documents, ID/Passport, Lease/Ownership documents',
            'terms_conditions' => '24-month business contract required',
            'is_active' => true,
            'is_featured' => false,
            'badge' => 'Enterprise',
            'sort_order' => 6,
        ]);
    }

    /**
     * Create Hosting Packages
     */
    private function createHostingPackages(): void
    {
        $this->command->info('Creating hosting packages...');

        $sharedHostingCategory = Category::where('slug', 'shared-hosting')->first();
        $vpsCategory = Category::where('slug', 'vps-hosting')->first();
        $resellerCategory = Category::where('slug', 'reseller-hosting')->first();

        if (!$sharedHostingCategory || !$vpsCategory || !$resellerCategory) {
            $this->command->error('Required hosting categories not found!');
            $this->command->error('Available categories: ' . Category::pluck('slug')->implode(', '));
            return;
        }

        $backup = Addon::where('slug', 'daily-backups')->first();
        $storage = Addon::where('slug', 'extra-storage')->first();

        // ==================== SHARED HOSTING ====================

        // Starter Plan — KES 4,500/Year
        $webStarter = Product::create([
            'category_id' => $sharedHostingCategory->id,
            'name' => 'Starter Plan',
            'slug' => 'web-hosting-starter',
            'description' => 'Perfect entry-level hosting for personal websites, blogs, and small portfolios. Includes everything you need to get started online including a free .co.ke domain.',
            'short_description' => 'Perfect for personal websites and blogs',
            'sku' => 'WEB-STARTER',
            'type' => 'hosting_package',
            'price_monthly' => 375,       // 4500 / 12
            'price_annually' => 4500,
            'setup_fee' => 0,
            'storage_gb' => 35,
            'bandwidth_gb' => 999999,     // Unlimited
            'email_accounts' => 999999,   // Unlimited
            'databases' => 999999,
            'domains_allowed' => 1,
            'ssl_included' => true,
            'backup_included' => false,
            'features' => [
                '35GB NVMe SSD Disk Space',
                '2GB RAM',
                'Suitable for Starters',
                'Free .co.ke domain',
                'Free Site Building Tools',
                'SEO-Friendly Hosting',
                'Unlimited Email Accounts',
                'Unlimited Monthly Bandwidth',
                'Unlimited Sub-Domains',
                'FREE SSL Certificate',
                'FREE Site Transfer',
                'Softaculous WordPress Manager',
                'DISCOUNTED Web Development',
                'FREE DirectAdmin',
                'PHP 8.x support',
                'FREE Instant setup',
            ],
            'technical_specs' => [
                'Storage Type' => 'NVMe SSD',
                'Storage Size' => '35 GB',
                'RAM' => '2 GB allocated',
                'Control Panel' => 'DirectAdmin',
                'PHP Versions' => '7.4, 8.0, 8.1, 8.2, 8.3',
                'MySQL' => '8.0',
                'Backups' => 'Weekly',
                'Uptime' => '99.9%',
            ],
            'is_active' => true,
            'is_featured' => false,
            'sort_order' => 1,
            'meta_title' => 'Starter Hosting Plan - KES 4,500/Year | Vilcom Networks',
            'meta_description' => 'Affordable hosting at KES 4,500/year with 35GB NVMe SSD, free .co.ke domain, free SSL and instant setup.',
        ]);

        $webStarter->addons()->attach([
            $backup->id => ['custom_price' => 500, 'is_required' => false, 'sort_order' => 1],
            $storage->id => ['custom_price' => 1000, 'is_required' => false, 'sort_order' => 2],
        ]);

        // Standard Plan — KES 5,500/Year
        $webStandard = Product::create([
            'category_id' => $sharedHostingCategory->id,
            'name' => 'Standard Plan',
            'slug' => 'web-hosting-standard',
            'description' => 'Our most popular hosting plan for SAAS websites and small businesses. 100GB NVMe SSD, 4GB RAM, and all the tools you need.',
            'short_description' => 'Most popular for SAAS and small business sites',
            'sku' => 'WEB-STANDARD',
            'type' => 'hosting_package',
            'price_monthly' => 458,       // ~5500 / 12
            'price_annually' => 5500,
            'setup_fee' => 0,
            'storage_gb' => 100,
            'bandwidth_gb' => 999999,
            'email_accounts' => 999999,
            'databases' => 999999,
            'domains_allowed' => 5,
            'ssl_included' => true,
            'backup_included' => true,
            'features' => [
                '100GB NVMe SSD Disk Space',
                '4GB RAM',
                'Suitable for SAAS Websites',
                'Free Site Building Tools',
                'SEO-Friendly Hosting',
                'Unlimited Email Accounts',
                'Unlimited Monthly Bandwidth',
                'Unlimited Sub-Domains',
                'FREE SSL Certificate',
                'FREE Site Transfer',
                'Softaculous WordPress Manager',
                'DISCOUNTED Web Development',
                'FREE DirectAdmin',
                'PHP 8.x support',
                'FREE Instant setup',
            ],
            'technical_specs' => [
                'Storage Type' => 'NVMe SSD',
                'Storage Size' => '100 GB',
                'RAM' => '4 GB allocated',
                'Control Panel' => 'DirectAdmin',
                'PHP Versions' => '7.4, 8.0, 8.1, 8.2, 8.3',
                'MySQL' => '8.0',
                'Backups' => 'Daily',
                'Uptime' => '99.9%',
            ],
            'is_active' => true,
            'is_featured' => true,
            'badge' => 'Best Value',
            'sort_order' => 2,
            'meta_title' => 'Standard Hosting Plan - KES 5,500/Year | Vilcom Networks',
            'meta_description' => 'Popular hosting at KES 5,500/year with 100GB NVMe SSD, 4GB RAM, free SSL, and daily backups.',
        ]);

        // Executive Plan — KES 12,800/Year
        $webExecutive = Product::create([
            'category_id' => $sharedHostingCategory->id,
            'name' => 'Executive Plan',
            'slug' => 'web-hosting-executive',
            'description' => 'Premium hosting for mission-critical websites requiring maximum performance. Unlimited NVMe SSD storage and 8GB RAM.',
            'short_description' => 'Premium hosting for mission-critical websites',
            'sku' => 'WEB-EXECUTIVE',
            'type' => 'hosting_package',
            'price_monthly' => 1067,      // ~12800 / 12
            'price_annually' => 12800,
            'setup_fee' => 0,
            'storage_gb' => 999999,       // Unlimited
            'bandwidth_gb' => 999999,
            'email_accounts' => 999999,
            'databases' => 999999,
            'domains_allowed' => 999999,
            'ssl_included' => true,
            'backup_included' => true,
            'features' => [
                'Unlimited NVMe SSD Disk Space',
                '8GB RAM',
                'Suitable for Mission Critical Websites',
                'Free Site Building Tools',
                'SEO-Friendly Hosting',
                'Unlimited Email Accounts',
                'Unlimited Monthly Bandwidth',
                'Unlimited Sub-Domains',
                'FREE SSL Certificate',
                'FREE Site Transfer',
                'Softaculous WordPress Manager',
                'DISCOUNTED Web Development',
                'FREE DirectAdmin',
                'PHP 8.x support',
                'FREE Instant setup',
            ],
            'technical_specs' => [
                'Storage Type' => 'NVMe SSD',
                'Storage Size' => 'Unlimited',
                'RAM' => '8 GB allocated',
                'Control Panel' => 'DirectAdmin',
                'PHP Versions' => '7.4, 8.0, 8.1, 8.2, 8.3',
                'MySQL' => '8.0',
                'Backups' => 'Daily',
                'Uptime' => '99.99%',
            ],
            'is_active' => true,
            'is_featured' => false,
            'sort_order' => 3,
            'meta_title' => 'Executive Hosting Plan - KES 12,800/Year | Vilcom Networks',
            'meta_description' => 'Mission-critical hosting at KES 12,800/year with unlimited NVMe SSD, 8GB RAM, and free SSL.',
        ]);

        // Hosting Only Plan — KES 2,999/Year
        $webHostingOnly = Product::create([
            'category_id' => $sharedHostingCategory->id,
            'name' => 'Hosting Only Plan',
            'slug' => 'web-hosting-only',
            'description' => 'No-frills hosting for those who already have a domain. Same great NVMe SSD hosting and tools without the included domain.',
            'short_description' => 'Great hosting without a free domain',
            'sku' => 'WEB-HOSTING-ONLY',
            'type' => 'hosting_package',
            'price_monthly' => 250,       // ~2999 / 12
            'price_annually' => 2999,
            'setup_fee' => 0,
            'storage_gb' => 35,
            'bandwidth_gb' => 999999,
            'email_accounts' => 999999,
            'databases' => 999999,
            'domains_allowed' => 1,
            'ssl_included' => true,
            'backup_included' => false,
            'features' => [
                '35GB NVMe SSD Disk Space',
                '2GB RAM',
                'Suitable for Starters',
                'SEO-Friendly Hosting',
                'Unlimited Email Accounts',
                'Unlimited Monthly Bandwidth',
                'Unlimited Sub-Domains',
                'FREE SSL Certificate',
                'FREE Site Transfer',
                'Softaculous WordPress Manager',
                'DISCOUNTED Web Development',
                'FREE DirectAdmin',
                'PHP 8.x support',
                'FREE Instant setup',
            ],
            'technical_specs' => [
                'Storage Type' => 'NVMe SSD',
                'Storage Size' => '35 GB',
                'RAM' => '2 GB allocated',
                'Control Panel' => 'DirectAdmin',
                'PHP Versions' => '7.4, 8.0, 8.1, 8.2, 8.3',
                'MySQL' => '8.0',
                'Backups' => 'Weekly',
                'Uptime' => '99.9%',
                'Domain' => 'Bring your own (not included)',
            ],
            'is_active' => true,
            'is_featured' => false,
            'sort_order' => 4,
            'meta_title' => 'Hosting Only Plan - KES 2,999/Year | Vilcom Networks',
            'meta_description' => 'Budget hosting at KES 2,999/year with 35GB NVMe SSD, free SSL. Bring your own domain.',
        ]);

        $webHostingOnly->addons()->attach([
            $backup->id => ['custom_price' => 500, 'is_required' => false, 'sort_order' => 1],
        ]);

        // ==================== VPS HOSTING ====================

        // Basic VPS — KES 2,000/Month
        Product::create([
            'category_id' => $vpsCategory->id,
            'name' => 'Basic VPS',
            'slug' => 'vps-basic',
            'description' => 'Entry-level VPS for developers, small applications, and websites that have outgrown shared hosting. Full root access with 1 core and 2GB RAM.',
            'short_description' => 'Entry-level virtual private server',
            'sku' => 'VPS-BASIC',
            'type' => 'hosting_package',
            'price_monthly' => 2000,
            'setup_fee' => 0,
            'storage_gb' => 20,
            'bandwidth_gb' => 999999,
            'email_accounts' => 999999,
            'databases' => 999999,
            'domains_allowed' => 999999,
            'ssl_included' => true,
            'backup_included' => false,
            'features' => [
                '1 Core CPU',
                '2 GB Guaranteed RAM',
                '20GB 100% SSD Disk Space',
                'KVM Virtualization',
                'Unlimited Bandwidth',
                'Full Root Access',
                'DDoS Protection',
                '200 Mbit/s Port',
                'FREE cPanel License (5 cPanel accounts)',
                '1 IPv4 Address',
                '64 Network IPv6 Address',
            ],
            'technical_specs' => [
                'Virtualization' => 'KVM',
                'CPU' => '1 Core Dedicated',
                'RAM' => '2 GB Guaranteed',
                'Storage' => '20 GB SSD',
                'Bandwidth' => 'Unlimited',
                'Port Speed' => '200 Mbit/s',
                'IPv4' => '1 Address',
                'IPv6' => '64 Addresses',
                'Control Panel' => 'cPanel (5 accounts)',
            ],
            'is_active' => true,
            'is_featured' => false,
            'sort_order' => 1,
            'meta_title' => 'Basic VPS - KES 2,000/Month | Vilcom Networks',
            'meta_description' => 'Entry-level VPS hosting at KES 2,000/month. 1 Core, 2GB RAM, 20GB SSD, full root access and DDoS protection.',
        ]);

        // Advanced VPS — KES 4,000/Month
        Product::create([
            'category_id' => $vpsCategory->id,
            'name' => 'Advanced VPS',
            'slug' => 'vps-advanced',
            'description' => 'Balanced VPS for growing applications and development environments. 2 cores and 8GB RAM for smooth, reliable performance.',
            'short_description' => 'Balanced performance for growing applications',
            'sku' => 'VPS-ADVANCED',
            'type' => 'hosting_package',
            'price_monthly' => 4000,
            'setup_fee' => 0,
            'storage_gb' => 80,
            'bandwidth_gb' => 999999,
            'email_accounts' => 999999,
            'databases' => 999999,
            'domains_allowed' => 999999,
            'ssl_included' => true,
            'backup_included' => true,
            'features' => [
                '2 Cores CPU',
                '8 GB Guaranteed RAM',
                '80GB 100% SSD Disk Space',
                'KVM Virtualization',
                'Unlimited Bandwidth',
                'Full Root Access',
                'DDoS Protection',
                '400 Mbit/s Port',
                'FREE cPanel License (5 cPanel accounts)',
                '1 IPv4 Address',
                '64 Network IPv6 Address',
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
                'Control Panel' => 'cPanel (5 accounts)',
            ],
            'is_active' => true,
            'is_featured' => true,
            'badge' => 'Popular',
            'sort_order' => 2,
            'meta_title' => 'Advanced VPS - KES 4,000/Month | Vilcom Networks',
            'meta_description' => 'Advanced VPS hosting at KES 4,000/month. 2 Cores, 8GB RAM, 80GB SSD, full root access.',
        ]);

        // Business VPS — KES 6,000/Month
        Product::create([
            'category_id' => $vpsCategory->id,
            'name' => 'Business VPS',
            'slug' => 'vps-business',
            'description' => 'High-performance VPS with premium resources for demanding applications and high-traffic production environments. 4 cores and 16GB RAM.',
            'short_description' => 'High-performance VPS for demanding workloads',
            'sku' => 'VPS-BUSINESS',
            'type' => 'hosting_package',
            'price_monthly' => 6000,
            'setup_fee' => 0,
            'storage_gb' => 160,
            'bandwidth_gb' => 999999,
            'email_accounts' => 999999,
            'databases' => 999999,
            'domains_allowed' => 999999,
            'ssl_included' => true,
            'backup_included' => true,
            'features' => [
                '4 Cores CPU',
                '16 GB Guaranteed RAM',
                '160GB 100% SSD Disk Space',
                'KVM Virtualization',
                'Unlimited Bandwidth',
                'Full Root Access',
                'DDoS Protection',
                '600 Mbit/s Port',
                'FREE cPanel License (5 cPanel accounts)',
                '1 IPv4 Address',
                '64 Network IPv6 Address',
            ],
            'technical_specs' => [
                'Virtualization' => 'KVM',
                'CPU' => '4 Cores Dedicated',
                'RAM' => '16 GB Guaranteed',
                'Storage' => '160 GB SSD',
                'Bandwidth' => 'Unlimited',
                'Port Speed' => '600 Mbit/s',
                'IPv4' => '1 Address',
                'IPv6' => '64 Addresses',
                'Control Panel' => 'cPanel (5 accounts)',
                'OS Options' => 'Ubuntu, CentOS, Debian, AlmaLinux',
            ],
            'is_active' => true,
            'is_featured' => false,
            'badge' => 'Best Performance',
            'sort_order' => 3,
            'meta_title' => 'Business VPS - KES 6,000/Month | Vilcom Networks',
            'meta_description' => 'Business VPS hosting at KES 6,000/month. 4 Cores, 16GB RAM, 160GB SSD, 600Mbit/s port.',
        ]);

        // Enterprise VPS — KES 8,000/Month
        Product::create([
            'category_id' => $vpsCategory->id,
            'name' => 'Enterprise VPS',
            'slug' => 'vps-enterprise',
            'description' => 'Maximum performance VPS for large-scale applications, enterprise workloads, and mission-critical services. 8 cores and 32GB RAM.',
            'short_description' => 'Maximum performance for enterprise workloads',
            'sku' => 'VPS-ENTERPRISE',
            'type' => 'hosting_package',
            'price_monthly' => 8000,
            'setup_fee' => 0,
            'storage_gb' => 240,
            'bandwidth_gb' => 999999,
            'email_accounts' => 999999,
            'databases' => 999999,
            'domains_allowed' => 999999,
            'ssl_included' => true,
            'backup_included' => true,
            'features' => [
                '8 Cores CPU',
                '32 GB Guaranteed RAM',
                '240GB 100% SSD Disk Space',
                'KVM Virtualization',
                'Unlimited Bandwidth',
                'Full Root Access',
                'DDoS Protection',
                '1000 Mbit/s Port',
                'FREE cPanel License (5 cPanel accounts)',
                '1 IPv4 Address',
                '64 Network IPv6 Address',
            ],
            'technical_specs' => [
                'Virtualization' => 'KVM',
                'CPU' => '8 Cores Dedicated',
                'RAM' => '32 GB Guaranteed',
                'Storage' => '240 GB SSD',
                'Bandwidth' => 'Unlimited',
                'Port Speed' => '1000 Mbit/s (1 Gbit/s)',
                'IPv4' => '1 Address',
                'IPv6' => '64 Addresses',
                'Control Panel' => 'cPanel (5 accounts)',
                'OS Options' => 'Ubuntu, CentOS, Debian, AlmaLinux',
            ],
            'is_active' => true,
            'is_featured' => false,
            'sort_order' => 4,
            'meta_title' => 'Enterprise VPS - KES 8,000/Month | Vilcom Networks',
            'meta_description' => 'Enterprise VPS hosting at KES 8,000/month. 8 Cores, 32GB RAM, 240GB SSD, 1Gbit/s port.',
        ]);
    }

    /**
     * Create Domain Products
     */
    private function createDomainProducts(): void
    {
        $this->command->info('Creating domain products...');

        $domainCategory = Category::where('slug', 'domain-names')->first();

        if (!$domainCategory) {
            $this->command->error('Domain category not found!');
            return;
        }

        $domains = [
            // Extension, Name, SKU, Price (annual), Featured, Sort
            ['.com',     '.com Domain Registration',      'DOMAIN-COM',      1999, true,  1],
            ['.net',     '.net Domain Registration',      'DOMAIN-NET',      1999, false, 2],
            ['.org',     '.org Domain Registration',      'DOMAIN-ORG',      1999, false, 3],
            ['.biz',     '.biz Domain Registration',      'DOMAIN-BIZ',      1999, false, 4],
            ['.info',    '.info Domain Registration',     'DOMAIN-INFO',     1999, false, 5],
            ['.co.ke',   '.co.ke Domain Registration',    'DOMAIN-CO-KE',    1299, true,  6],
            ['.ac.ke',   '.ac.ke Domain Registration',    'DOMAIN-AC-KE',    1999, false, 7],
            ['.or.ke',   '.or.ke Domain Registration',    'DOMAIN-OR-KE',    1999, false, 8],
            ['.ne.ke',   '.ne.ke Domain Registration',    'DOMAIN-NE-KE',    1999, false, 9],
            ['.mobi.ke', '.mobi.ke Domain Registration',  'DOMAIN-MOBI-KE',  1999, false, 10],
            ['.info.ke', '.info.ke Domain Registration',  'DOMAIN-INFO-KE',  1999, false, 11],
            ['.me.ke',   '.me.ke Domain Registration',    'DOMAIN-ME-KE',    1999, false, 12],
            ['.sc.ke',   '.sc.ke Domain Registration',    'DOMAIN-SC-KE',    1999, false, 13],
            ['.ke',      '.ke Domain Registration',       'DOMAIN-KE',       3500, true,  14],
        ];

        $descriptions = [
            '.com'     => "Register the world's most popular .com domain. Perfect for businesses going global.",
            '.net'     => 'Register a professional .net domain for your network or technology business.',
            '.org'     => 'Register a .org domain for your organisation, NGO, or non-profit.',
            '.biz'     => 'Register a .biz domain for your business venture.',
            '.info'    => 'Register a .info domain to share information and build your knowledge portal.',
            '.co.ke'   => "Register your .co.ke domain for your Kenyan business. Establish your local online presence.",
            '.ac.ke'   => 'Register a .ac.ke domain for Kenyan academic and educational institutions.',
            '.or.ke'   => 'Register a .or.ke domain for Kenyan organisations and associations.',
            '.ne.ke'   => 'Register a .ne.ke domain for Kenyan network service providers.',
            '.mobi.ke' => 'Register a .mobi.ke domain for Kenyan mobile-focused services.',
            '.info.ke' => 'Register a .info.ke domain for Kenyan information portals.',
            '.me.ke'   => 'Register a .me.ke domain for your personal Kenyan web presence.',
            '.sc.ke'   => 'Register a .sc.ke domain for Kenyan schools and education.',
            '.ke'      => "Register a premium .ke domain — Kenya's top-level domain for maximum local authority.",
        ];

        $shortDescriptions = [
            '.com'     => "World's most popular domain",
            '.net'     => 'Professional network domain',
            '.org'     => 'For organisations and NGOs',
            '.biz'     => 'Business domain',
            '.info'    => 'Information domain',
            '.co.ke'   => "Kenya's business domain",
            '.ac.ke'   => 'Kenyan academic domain',
            '.or.ke'   => 'Kenyan organisation domain',
            '.ne.ke'   => 'Kenyan network domain',
            '.mobi.ke' => 'Kenyan mobile domain',
            '.info.ke' => 'Kenyan info domain',
            '.me.ke'   => 'Kenyan personal domain',
            '.sc.ke'   => 'Kenyan school domain',
            '.ke'      => "Kenya's premium TLD",
        ];

        foreach ($domains as [$ext, $name, $sku, $price, $featured, $sort]) {
            $slug = 'domain-' . ltrim(str_replace('.', '-', $ext), '-');

            Product::create([
                'category_id'      => $domainCategory->id,
                'name'             => $name,
                'slug'             => $slug,
                'description'      => $descriptions[$ext],
                'short_description' => $shortDescriptions[$ext],
                'sku'              => $sku,
                'type'             => 'domain',
                'price_annually'   => $price,
                'features' => [
                    $ext . ' Domain Registration',
                    'Free DNS Management',
                    'Domain Privacy Protection',
                    'Easy Domain Transfer',
                    'Renewal Reminders',
                    '24/7 DNS Management',
                    'Instant activation',
                ],
                'is_active'   => true,
                'is_featured' => $featured,
                'sort_order'  => $sort,
                'meta_title'  => $name . ' | Vilcom Networks',
                'meta_description' => $descriptions[$ext] . ' Registration KES ' . number_format($price) . '/year.',
            ]);
        }
    }

    /**
     * Create Web Development Services
     */
    private function createWebDevelopmentServices(): void
    {
        $this->command->info('Creating web development services...');

        $businessWebsitesCategory = Category::where('slug', 'business-websites')->first();
        $ecommerceCategory = Category::where('slug', 'ecommerce')->first();

        if (!$businessWebsitesCategory || !$ecommerceCategory) {
            $this->command->error('Web development categories not found!');
            $this->command->error('Available categories: ' . Category::pluck('slug')->implode(', '));
            return;
        }

        // ==================== WEB DESIGN & DEVELOPMENT SERVICES ====================
        // These are quote-based services — no fixed price_one_time set

        $webServices = [
            [
                'name'              => 'Web Design',
                'slug'              => 'web-design',
                'sku'               => 'WEBDEV-DESIGN',
                'short_description' => 'Transforming ideas into digital masterpieces',
                'description'       => 'Vilcom Networks pioneers web design excellence, crafting visually stunning and intuitive experiences that captivate and engage. Elevate your online presence with our visionary designs.',
                'sort_order'        => 1,
            ],
            [
                'name'              => 'Web Redesign',
                'slug'              => 'web-redesign',
                'sku'               => 'WEBDEV-REDESIGN',
                'short_description' => 'Revitalize your online identity',
                'description'       => 'Vilcom Networks specializes in web redesign, breathing new life into outdated websites with modern aesthetics and enhanced functionality. Elevate your digital presence with our transformative redesign solutions.',
                'sort_order'        => 2,
            ],
            [
                'name'              => 'E-Commerce Development',
                'slug'              => 'ecommerce-development',
                'sku'               => 'WEBDEV-ECOMMERCE',
                'short_description' => 'Empower your online store',
                'description'       => 'Vilcom Networks ecommerce design and development service harnesses cutting-edge technology and intuitive design to create seamless shopping experiences. Elevate your digital storefront and drive sales with our tailored ecommerce solutions.',
                'sort_order'        => 3,
                'category_override' => 'ecommerce',
            ],
            [
                'name'              => 'SaaS Development',
                'slug'              => 'saas-development',
                'sku'               => 'WEBDEV-SAAS',
                'short_description' => 'Experience the future of software',
                'description'       => 'Vilcom Networks Software as a Service development service delivers innovative solutions tailored to your needs, revolutionizing the way you do business. Empower your organization with scalable, cloud-based software that drives efficiency and accelerates growth.',
                'sort_order'        => 4,
            ],
            [
                'name'              => 'Page Speed Optimization',
                'slug'              => 'page-speed-optimization',
                'sku'               => 'WEBDEV-SPEED',
                'short_description' => 'Maximize your online potential',
                'description'       => "Vilcom Networks page speed optimization service turbocharges your website, ensuring lightning-fast load times that captivate users and boost search engine rankings. Accelerate your online success with our expert optimization solutions.",
                'sort_order'        => 5,
            ],
            [
                'name'              => 'Web Development',
                'slug'              => 'web-development',
                'sku'               => 'WEBDEV-GENERAL',
                'short_description' => 'Unlock digital excellence',
                'description'       => 'Vilcom Networks web development service pioneers innovation, crafting bespoke solutions that elevate your online presence. From sleek designs to powerful functionality, we redefine the digital landscape, empowering your business for success.',
                'sort_order'        => 6,
            ],
            [
                'name'              => 'Web Maintenance',
                'slug'              => 'web-maintenance',
                'sku'               => 'WEBDEV-MAINTENANCE',
                'short_description' => 'Ensure your online success',
                'description'       => "Vilcom Networks expert web maintenance service keeps your digital presence running smoothly, ensuring security, performance, and functionality. Trust us to safeguard your online investment and keep your business ahead of the curve.",
                'sort_order'        => 7,
            ],
            [
                'name'              => 'Payment Gateway Integration',
                'slug'              => 'payment-gateway-integration',
                'sku'               => 'WEBDEV-PAYMENT',
                'short_description' => 'Effortless transactions, unparalleled convenience',
                'description'       => 'Vilcom Networks seamlessly integrates payment gateways into your online platform, ensuring secure and seamless transactions for your customers. Elevate your ecommerce experience with our expert integration solutions.',
                'sort_order'        => 8,
            ],
        ];

        foreach ($webServices as $service) {
            $useEcommerceCategory = isset($service['category_override']) && $service['category_override'] === 'ecommerce';
            $categoryId = $useEcommerceCategory ? $ecommerceCategory->id : $businessWebsitesCategory->id;

            Product::create([
                'category_id'       => $categoryId,
                'name'              => $service['name'],
                'slug'              => $service['slug'],
                'description'       => $service['description'],
                'short_description' => $service['short_description'],
                'sku'               => $service['sku'],
                'type'              => 'web_development',
                'price_one_time'    => null, // Quote-based — price obtained via GET QUOTE
                'is_quote_based'    => true,
                'features'          => [],
                'is_active'         => true,
                'is_featured'       => false,
                'sort_order'        => $service['sort_order'],
                'meta_title'        => $service['name'] . ' | Vilcom Networks',
                'meta_description'  => $service['description'],
            ]);
        }
    }
}
