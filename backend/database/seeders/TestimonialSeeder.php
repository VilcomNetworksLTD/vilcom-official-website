<?php

namespace Database\Seeders;

use App\Models\Testimonial;
use App\Models\User;
use Illuminate\Database\Seeder;

class TestimonialSeeder extends Seeder
{
    public function run(): void
    {
        // Get an admin user to attach as the creator
        $user = User::first() ?? User::factory()->create();

        $testimonials = [
            [
                'name' => 'Sarah Jenkins',
                'company' => 'Nairobi Tech Hub',
                'content' => 'Vilcom has transformed our office connectivity. The speeds are consistent, and their support team is incredibly responsive. Highly recommended for any business.',
                'rating' => 5,
                'is_approved' => true,
                'is_featured' => true,
            ],
            [
                'name' => 'David Omondi',
                'company' => 'Omondi Logistics',
                'content' => 'Since switching to Vilcom for our fleet tracking systems, we have seen zero downtime. The fiber installation was quick and professional.',
                'rating' => 5,
                'is_approved' => true,
                'is_featured' => true,
            ],
            [
                'name' => 'Elena Kamau',
                'company' => 'Creative Design Studio',
                'content' => 'We needed a reliable host for our client portfolios. Vilcom’s hosting solutions are fast, secure, and the uptime is exactly as promised.',
                'rating' => 5,
                'is_approved' => true,
                'is_featured' => false,
            ],
            [
                'name' => 'Michael Kipkorir',
                'company' => 'Peak Real Estate',
                'content' => 'Great value for money. The installation team was polite and cleaned up after themselves. It is rare to find such service quality these days.',
                'rating' => 4,
                'is_approved' => true,
                'is_featured' => false,
            ],
            [
                'name' => 'Aisha Mohamed',
                'company' => 'GreenScape Agronomy',
                'content' => 'Our remote farm relies heavily on internet for IoT sensors. Vilcom provided coverage where others said it was impossible.',
                'rating' => 5,
                'is_approved' => true,
                'is_featured' => false,
            ],
        ];

        foreach ($testimonials as $item) {
            Testimonial::create(array_merge($item, [
                'created_by' => $user->id,
            ]));
        }
    }
}
