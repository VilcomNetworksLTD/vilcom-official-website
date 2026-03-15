<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Roles & permissions first — everything depends on these
        $this->call(RoleAndPermissionSeeder::class);

        // 2. Catalogue
        $this->call(CategorySeeder::class);
        $this->call(ProductSeeder::class);

        // 3. Coverage — counties → regions → survey points → hubs
        $this->call(CoverageZoneSeeder::class);

        // 4. Admin user
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
        $this->command->info('Admin: admin@vilcom.co.ke / Adminero@123');

        // 5. Staff user
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
        $this->command->info('Staff: staff@vilcom.co.ke / Staffuto@123');
    }
}
