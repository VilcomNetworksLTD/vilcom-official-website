<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Run role and permission seeder first
        $this->call(RoleAndPermissionSeeder::class);

        // Create admin user
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@vilcom.co.ke',
            'password' => Hash::make('Admin@123'),
            'phone' => '+254700000000',
            'customer_type' => 'business',
            'company_name' => 'Vilcom Networks',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        // Assign admin role
        $admin->assignRole('admin');

        $this->command->info('Admin user created: admin@vilcom.co.ke / Admin@123');

        // Create a test staff user
        $staff = User::create([
            'name' => 'Staff User',
            'email' => 'staff@vilcom.co.ke',
            'password' => Hash::make('Staff@123'),
            'phone' => '+254711111111',
            'customer_type' => 'business',
            'company_name' => 'Vilcom Networks',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        // Assign staff role
        $staff->assignRole('staff');

        $this->command->info('Staff user created: staff@vilcom.co.ke / Staff@123');
    }
}
