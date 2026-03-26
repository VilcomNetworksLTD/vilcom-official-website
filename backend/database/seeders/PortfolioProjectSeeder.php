<?php

namespace Database\Seeders;

use App\Models\PortfolioProject;
use App\Models\User;
use Illuminate\Database\Seeder;

class PortfolioProjectSeeder extends Seeder
{
    public function run(): void
    {
        // Get the Admin User (created in DatabaseSeeder)
        $user = User::first();

        if (!$user) {
            $this->command->error('❌ No users found. Run User seeder first.');
            return;
        }

        $this->command->info('🏗️  Seeding Portfolio Projects...');

        $projects = [
            [
                'title' => 'Westlands Shopping Mall Connectivity',
                'category' => 'Corporate',
                'location' => 'Nairobi, Kenya',
                'description' => 'Deployed a 10Gbps dedicated fiber link with redundant failover for one of the busiest malls in the city, serving over 200 retail tenants.',
                // 'thumbnail_url' removed because it doesn't exist in your table
                'stats_value' => '10+',
                'stats_label' => 'Gbps Speed',
                'is_published' => true,
                'sort_order' => 1,
            ],
            [
                'title' => 'Countywide Smart Schools Initiative',
                'category' => 'Government',
                'location' => 'Kisumu, Kenya',
                'description' => 'Connected 45 public schools and 3 administrative offices to a secure MPLS network, facilitating e-learning and digital record keeping.',
                'stats_value' => '50+',
                'stats_label' => 'Institutions Connected',
                'is_published' => true,
                'sort_order' => 2,
            ],
            [
                'title' => 'Apex Bank Headquarters Data Center',
                'category' => 'Enterprise',
                'location' => 'Upper Hill, Nairobi',
                'description' => 'Designed and implemented a structured cabling and fiber backbone solution for a tier-3 data center upgrade.',
                'stats_value' => '99.9%',
                'stats_label' => 'Uptime Guarantee',
                'is_published' => true,
                'sort_order' => 3,
            ],
            [
                'title' => 'Savanna Resort Complex Wi-Fi',
                'category' => 'Hospitality',
                'location' => 'Maasai Mara',
                'description' => 'Provided high-density outdoor Wi-Fi coverage across the 50-acre resort, including the main lodge and guest tents.',
                'stats_value' => '100%',
                'stats_label' => 'Coverage Area',
                'is_published' => true,
                'sort_order' => 4,
            ],
            [
                'title' => 'Global Logistics Warehouse Tracking',
                'category' => 'Industrial',
                'location' => 'Mombasa Port',
                'description' => 'IoT implementation for real-time container tracking using low-latency cellular connections backed by our fiber network.',
                'stats_value' => '24/7',
                'stats_label' => 'Real-time Tracking',
                'is_published' => true,
                'sort_order' => 5,
            ],
        ];

        foreach ($projects as $project) {
            PortfolioProject::create(array_merge($project, [
                'created_by' => $user->id,
                'media_id' => null, // This column exists in your migration, so we leave it null for now
            ]));
        }

        $this->command->info('✅ Successfully seeded ' . count($projects) . ' portfolio projects.');
    }
}
