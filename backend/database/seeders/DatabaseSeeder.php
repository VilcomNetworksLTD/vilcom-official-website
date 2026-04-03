<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ─────────────────────────────────────────────────────────────
        // 1. ROLES & PERMISSIONS
        // ─────────────────────────────────────────────────────────────
        // Must run first as other seeders might assign roles.
        $this->call(RoleAndPermissionSeeder::class);

        // ─────────────────────────────────────────────────────────────
        // 2. CATALOGUE (No User Dependency)
        // ─────────────────────────────────────────────────────────────
        $this->call(CategorySeeder::class);
        $this->call(ProductSeeder::class);
        $this->call(SafetikaProductMappingSeeder::class);

        // ─────────────────────────────────────────────────────────────
        // 3. COVERAGE (No User Dependency)
        // ─────────────────────────────────────────────────────────────
        $this->call(CoverageZoneSeeder::class);

        // ─────────────────────────────────────────────────────────────
        // 4. CREATE USERS (MUST BE DONE BEFORE CONTENT SEEDERS)
        // ─────────────────────────────────────────────────────────────
        // We create the admin/staff here so that the subsequent seeders
        // (Press, Testimonials) can find a user to attach as 'created_by'.

        // Admin User
        $admin = User::create([
            'name'              => 'Admin User',
            'email'             => 'admin@vilcom.co.ke',
            'password'          => Hash::make('Adminero@123'),
            'phone'             => '+254700000000',
            'customer_type'     => 'business',
            'company_name'      => 'Vilcom Networks',
            'status'            => 'active',
            'email_verified_at' => now(),
        ]);
        $admin->assignRole('admin');
        $this->command->info('✅ Admin: admin@vilcom.co.ke / Adminero@123');

        // Staff User
        $staff = User::create([
            'name'              => 'Staff User',
            'email'             => 'staff@vilcom.co.ke',
            'password'          => Hash::make('Staffuto@123'),
            'phone'             => '+254711111111',
            'customer_type'     => 'business',
            'company_name'      => 'Vilcom Networks',
            'status'            => 'active',
            'email_verified_at' => now(),
        ]);
        $staff->assignRole('staff');
        $this->command->info('✅ Staff: staff@vilcom.co.ke / Staffuto@123');

        // ─────────────────────────────────────────────────────────────
        // 5. CONTENT SEEDERS (Require User 'created_by')
        // ─────────────────────────────────────────────────────────────
        // These MUST come after the users are created above.
        // They will use User::first() (which is now the Admin) for the foreign key.

        $this->call(PressArticleSeeder::class);       // Blogs & Media
        $this->call(TestimonialSeeder::class);        // Client Reviews
        $this->call(PortfolioProjectSeeder::class);   // Case Studies

        // Optional: Add BookingSeeder if you have dummy bookings
        // $this->call(BookingSeeder::class);
    }
}
