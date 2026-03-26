<?php

namespace Database\Seeders;

use App\Models\PressArticle;
use App\Models\User;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class PressArticleSeeder extends Seeder
{
    public function run(): void
    {
        // 1. GET THE ADMIN USER
        // Since DatabaseSeeder creates the User before running this,
        // User::first() will successfully return the Admin.
        $user = User::first();

        if (!$user) {
            $this->command->error('❌ No users found! Please ensure User seeding runs before PressArticleSeeder.');
            return;
        }

        $this->command->info('📰 Seeding Press Articles and Blogs...');

        // 2. BLOG POSTS (Internal Content)
        // Based on "Our Blog" section from your text
        $blogs = [
            [
                'title' => 'WHY RELIABLE TECHNOLOGY MATTERS. MORE THAN SPEED.',
                'excerpt' => 'Speed attracts attention. Reliability builds trust. In a world dependent on video calls, cloud platforms, financial systems, and digital platforms, downtime is costly.',
                'category' => 'Business',
                'type' => 'blog',
                'source_name' => 'Vilcom Blog',
                'published_at' => Carbon::now()->subDays(2),
                'is_featured' => true,
            ],
            [
                'title' => 'HOW CONNECTIVITY UNLOCKS SME GROWTH.',
                'excerpt' => 'Small and medium enterprises are the backbone of Kenya’s economy. But growth today requires more than hard work. It requires digital capability. Reliable.',
                'category' => 'Technology',
                'type' => 'blog',
                'source_name' => 'Vilcom Blog',
                'published_at' => Carbon::now()->subWeek(),
                'is_featured' => true,
            ],
            [
                'title' => 'IDEAS NEED INFRASTRUCTURE.',
                'excerpt' => 'Great ideas are everywhere. Execution is what separates vision from reality. That is why Vilcom positions itself not just as a service provider, but as a partner.',
                'category' => 'Technology',
                'type' => 'blog',
                'source_name' => 'Vilcom Blog',
                'published_at' => Carbon::now()->subWeeks(2),
                'is_featured' => false,
            ],
            [
                'title' => 'MOVING FORWARD STARTS WITH THE RIGHT CONNECTION.',
                'excerpt' => 'March marks a season of growth. Growth in business. Growth in learning. Growth in ideas. At Vilcom Networks, we believe one thing: Vilcom doesn’t just connect, we enable.',
                'category' => 'Technology',
                'type' => 'blog',
                'source_name' => 'Vilcom Blog',
                'published_at' => Carbon::now()->subWeeks(3),
                'is_featured' => false,
            ],
            [
                'title' => 'STORIES THAT MATTER, REAL LIVES, REAL IMPACT, REAL SUPPORT.',
                'excerpt' => 'Behind every connection is a story. This month, we spotlight real Vilcom customers, traders, farmers, and students, sharing how reliable connectivity supports their daily lives.',
                'category' => 'Modern',
                'type' => 'blog',
                'source_name' => 'Vilcom Blog',
                'published_at' => Carbon::now()->subWeeks(4),
                'is_featured' => true,
            ],
            [
                'title' => 'CONNECTED BY LOVE; COMMUNITY, INCLUSION, AND VALENTINE’S WITH VILCOM.',
                'excerpt' => 'Valentine’s Day is about love and at Vilcom, love means inclusion. Our Valentine’s Community Wi-Fi initiative goes beyond free access. It’s about creating connections.',
                'category' => 'Modern',
                'type' => 'blog',
                'source_name' => 'Vilcom Blog',
                'published_at' => Carbon::now()->subMonth(),
                'is_featured' => false,
            ],
            [
                'title' => 'LOYALTY THAT MEANS SOMETHING, GROWING TOGETHER THROUGH TECHNOLOGY.',
                'excerpt' => 'Loyalty is not just consistency; it’s commitment on both sides. At Vilcom, we are reframing loyalty rewards beyond discounts or offers. To us, loyalty means growing together.',
                'category' => 'Business',
                'type' => 'blog',
                'source_name' => 'Vilcom Blog',
                'published_at' => Carbon::now()->subMonth(),
                'is_featured' => false,
            ],
            [
                'title' => 'MORE THAN A CONNECTION; WELCOME TO THE VILCOM FAMILY.',
                'excerpt' => 'Technology works best when it feels human. At Vilcom Networks, we believe you’re not just a customer; you’re part of the Vilcom family.',
                'category' => 'Business',
                'type' => 'blog',
                'source_name' => 'Vilcom Blog',
                'published_at' => Carbon::now()->subMonths(2),
                'is_featured' => false,
            ],
        ];

        // 3. PRESS & MEDIA FEATURES (External Content)
        // Based on "Media Features" section from your text
        $media = [
            [
                'title' => 'How Vilcom Network’s staff empowerment will drive customer satisfaction',
                'excerpt' => 'Insight into how empowering staff leads to better service delivery for Vilcom customers.',
                'source_name' => 'Business Now',
                'source_url' => 'https://businessnow.co.ke',
                'category' => 'Company News',
                'type' => 'press',
                'published_at' => Carbon::create(2025, 8, 18),
                'is_featured' => true,
            ],
            [
                'title' => 'Vilcom Networks Concludes 4-Cohort Customer Service & Experience Training for All Staff',
                'excerpt' => 'A comprehensive training program concluded to ensure all staff members are aligned with customer experience goals.',
                'source_name' => 'Nipashe Biz',
                'source_url' => 'https://nipashebiz.co.ke',
                'category' => 'Company News',
                'type' => 'press',
                'published_at' => Carbon::create(2025, 8, 18),
                'is_featured' => true,
            ],
            [
                'title' => 'Vilcom Networks Concludes 4-Cohort Mandatory Customer Service & Experience Training for All Staff',
                'excerpt' => 'Mandatory training sessions across the organization to elevate service standards.',
                'source_name' => 'Newsline',
                'source_url' => 'https://newsline.co.ke',
                'category' => 'Company News',
                'type' => 'press',
                'published_at' => Carbon::create(2025, 8, 16),
                'is_featured' => false,
            ],
            [
                'title' => 'Vilcom Networks, IEK sign landmark partnership to bridge digital, engineering divide',
                'excerpt' => 'Vilcom partners with the Institution of Engineers of Kenya to foster digital skills and engineering growth.',
                'source_name' => 'KBC Digital',
                'source_url' => 'https://kbcdigital.ke',
                'category' => 'Partnerships',
                'type' => 'press',
                'published_at' => Carbon::create(2025, 6, 3),
                'is_featured' => true,
            ],
            [
                'title' => 'Telecom firms urged to consider safety when putting cables on power lines',
                'excerpt' => 'Industry stakeholders call for stricter safety measures regarding infrastructure deployment on utility poles.',
                'source_name' => 'The Star',
                'source_url' => 'https://thestarkenya.co.ke',
                'category' => 'Industry News',
                'type' => 'press',
                'published_at' => Carbon::create(2025, 5, 19),
                'is_featured' => false,
            ],
            [
                'title' => 'Communication Authority of Kenya Ranks Vilcom Networks 5th in Broadband Market After Market Share Surge',
                'excerpt' => 'Vilcom climbs the rankings significantly following a surge in market share and subscriber base.',
                'source_name' => 'Tukio',
                'source_url' => 'https://tukio.co.ke',
                'category' => 'Awards',
                'type' => 'press',
                'published_at' => Carbon::create(2025, 3, 29),
                'is_featured' => true,
            ],
            [
                'title' => 'List of Home Internet Service Providers in Kenya with 2025 Prices',
                'excerpt' => 'A comprehensive look at the pricing landscape for home internet providers in Kenya for the year 2025.',
                'source_name' => 'Techweez',
                'source_url' => 'https://techweez.com',
                'category' => 'Technology',
                'type' => 'press',
                'published_at' => Carbon::create(2025, 1, 25),
                'is_featured' => false,
            ],
            [
                'title' => 'CA flags illegal internet service providers in Kenya',
                'excerpt' => 'The Communications Authority of Kenya moves to crack down on unlicensed operators in the sector.',
                'source_name' => 'Business Daily',
                'source_url' => 'https://businessdailyafrica.com',
                'category' => 'Industry News',
                'type' => 'press',
                'published_at' => Carbon::create(2024, 12, 31),
                'is_featured' => false,
            ],
            [
                'title' => 'Vilcom Networks In Comprehensive Revamp Of Its Pricing Structure for Fiber To Home',
                'excerpt' => 'Vilcom announces new competitive pricing for its fiber-to-the-home packages.',
                'source_name' => 'Mount Kenya Times',
                'source_url' => 'https://mountkenyatimes.co.ke',
                'category' => 'Company News',
                'type' => 'press',
                'published_at' => Carbon::create(2024, 10, 2),
                'is_featured' => false,
            ],
            [
                'title' => 'Vilcom Networks Bridges Digital Divide with High-Speed Internet in Rural Kenya',
                'excerpt' => 'Efforts to bring high-speed connectivity to underserved rural areas are yielding results.',
                'source_name' => 'Tukio',
                'source_url' => 'https://tukio.co.ke',
                'category' => 'CSR',
                'type' => 'press',
                'published_at' => Carbon::create(2024, 12, 17),
                'is_featured' => true,
            ],
            [
                'title' => 'Vilcom Slashes Wi-Fi Prices, Ups Speed to Hit 500Mbps after Safaricom, Starlink Market Moves',
                'excerpt' => 'Responding to competitive market dynamics, Vilcom adjusts pricing and increases speed offerings.',
                'source_name' => 'Tuko',
                'source_url' => 'https://tuko.co.ke',
                'category' => 'Business',
                'type' => 'press',
                'published_at' => Carbon::create(2024, 9, 30),
                'is_featured' => false,
            ],
            [
                'title' => 'Internet of Things is the new world order',
                'excerpt' => 'Exploring how IoT is transforming industries and daily life in Kenya.',
                'source_name' => 'The Star',
                'source_url' => 'https://thestarkenya.co.ke',
                'category' => 'Technology',
                'type' => 'press',
                'published_at' => Carbon::create(2024, 8, 30),
                'is_featured' => false,
            ],
            [
                'title' => 'Vilcom Networks Limited Ranked 6th in Broadband Service Provision',
                'excerpt' => 'Recognition of Vilcom\'s growing footprint in the broadband service sector.',
                'source_name' => 'Kenyans.co.ke',
                'source_url' => 'https://kenyans.co.ke',
                'category' => 'Awards',
                'type' => 'press',
                'published_at' => Carbon::create(2024, 7, 10),
                'is_featured' => false,
            ],
            [
                'title' => 'Vilcom Networks Opens New Office in Ongata Rongai as Company Expands Footprint',
                'excerpt' => 'Strategic expansion to Ongata Rongai to better serve the growing customer base in the region.',
                'source_name' => 'Kenyans.co.ke',
                'source_url' => 'https://kenyans.co.ke',
                'category' => 'Company News',
                'type' => 'press',
                'published_at' => Carbon::create(2024, 5, 28),
                'is_featured' => false,
            ],
        ];

        // 4. MERGE AND INSERT
        $allArticles = array_merge($blogs, $media);

        foreach ($allArticles as $article) {
            PressArticle::create(array_merge($article, [
                'created_by' => $user->id, // Links to the Admin User created in DatabaseSeeder
                'is_published' => true,
                'thumbnail_url' => 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800', // Generic tech/business image
            ]));
        }

        $this->command->info('✅ Successfully seeded ' . count($allArticles) . ' articles.');
    }
}
