<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            // User Management
            'users.view', 'users.view.own', 'users.view.clients', 'users.view.staff', 'users.view.all',
            'users.create', 'users.edit.own', 'users.edit.clients', 'users.edit.staff', 'users.edit.all',
            'users.delete', 'users.suspend', 'users.activate', 'users.impersonate',
            
            // Role & Permission Management
            'roles.view', 'roles.create', 'roles.edit', 'roles.delete',
            'permissions.view', 'permissions.assign',
            
            // Category Management
            'categories.view', 'categories.create', 'categories.edit', 'categories.delete',
            
            // Product/Plan Management
            'products.view', 'products.view.all', 'products.create', 'products.edit',
            'products.delete', 'products.manage.pricing', 'products.manage.features',
            
            // Subscription Management
            'subscriptions.view.own', 'subscriptions.view.all', 'subscriptions.create',
            'subscriptions.edit.own', 'subscriptions.edit.all', 'subscriptions.cancel.own',
            'subscriptions.cancel.all', 'subscriptions.suspend', 'subscriptions.activate',
            'subscriptions.upgrade', 'subscriptions.downgrade',
            
            // Billing & Invoicing
            'invoices.view.own', 'invoices.view.all', 'invoices.create', 'invoices.edit',
            'invoices.delete', 'invoices.send', 'invoices.mark.paid', 'invoices.void', 'invoices.download',
            
            // Payment Management
            'payments.view.own', 'payments.view.all', 'payments.process', 'payments.refund', 'payments.verify',
            
            // Ticket Management
            'tickets.view.own', 'tickets.view.assigned', 'tickets.view.all', 'tickets.create',
            'tickets.edit.own', 'tickets.edit.all', 'tickets.delete', 'tickets.assign',
            'tickets.resolve', 'tickets.close', 'tickets.reopen', 'tickets.internal.notes',
            
            // Media Management
            'media.view', 'media.upload', 'media.edit', 'media.delete',
            
            // Banner Management
            'banners.view', 'banners.create', 'banners.edit', 'banners.delete',
            
            // Testimonial Management
            'testimonials.view', 'testimonials.create', 'testimonials.edit',
            'testimonials.delete', 'testimonials.approve', 'testimonials.reject',
            
            // FAQ Management
            'faqs.view', 'faqs.create', 'faqs.edit', 'faqs.delete',
            
            // Knowledge Base
            'kb.view', 'kb.create', 'kb.edit', 'kb.delete', 'kb.publish',
            
            // Coverage Management
            'coverage.view', 'coverage.create', 'coverage.edit', 'coverage.delete', 'coverage.check',
            
            // Content Management (CMS)
            'pages.view', 'pages.create', 'pages.edit', 'pages.delete', 'pages.publish',
            'blog.view', 'blog.create', 'blog.edit', 'blog.delete', 'blog.publish',
            
            // Hosting Management
            'hosting.view.own', 'hosting.view.all', 'hosting.create', 'hosting.edit',
            'hosting.delete', 'hosting.suspend', 'hosting.manage.packages',
            
            // Domain Management
            'domains.view.own', 'domains.view.all', 'domains.register', 'domains.transfer', 'domains.renew',
            
            // Portfolio Management
            'portfolio.view', 'portfolio.create', 'portfolio.edit', 'portfolio.delete',
            
            // Settings
            'settings.view', 'settings.edit', 'settings.email.templates', 'settings.system',
            
            // Reports & Analytics
            'reports.view', 'reports.revenue', 'reports.subscriptions', 'reports.tickets', 'reports.export',
            'analytics.view', 'analytics.clients', 'analytics.staff',
            
            // Audit Logs
            'audit.view', 'audit.delete',
            
            // Notifications
            'notifications.view.own', 'notifications.send', 'notifications.manage.templates',
            
            // Dashboard Access
            'dashboard.client', 'dashboard.staff', 'dashboard.admin',
        ];

        // Create permissions
        $this->command->info('Creating permissions...');
        foreach ($permissions as $name) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
        }
        $this->command->info('✓ Permissions created: ' . Permission::count());

        // CLIENT ROLE
        $this->command->info('Creating CLIENT role...');
        $clientRole = Role::firstOrCreate(['name' => 'client', 'guard_name' => 'web']);
        $clientPermissions = [
            'users.view.own', 'users.edit.own',
            'subscriptions.view.own', 'subscriptions.edit.own', 'subscriptions.cancel.own', 'subscriptions.upgrade', 'subscriptions.downgrade',
            'invoices.view.own', 'invoices.download', 'payments.view.own',
            'tickets.view.own', 'tickets.create', 'tickets.edit.own',
            'hosting.view.own', 'domains.view.own', 'domains.register', 'domains.renew',
            'notifications.view.own', 'coverage.check', 'dashboard.client',
        ];
        $clientRole->givePermissionTo($clientPermissions);
        $this->command->info('✓ CLIENT role created with ' . count($clientPermissions) . ' permissions');

        // STAFF ROLE
        $this->command->info('Creating STAFF role...');
        $staffRole = Role::firstOrCreate(['name' => 'staff', 'guard_name' => 'web']);
        $staffPermissions = [
            'users.view.own', 'users.edit.own', 'users.view.clients', 'users.edit.clients',
            'products.view.all',
            'subscriptions.view.all', 'subscriptions.create', 'subscriptions.edit.all', 'subscriptions.suspend', 'subscriptions.activate',
            'invoices.view.all', 'invoices.create', 'invoices.send', 'payments.view.all', 'payments.verify',
            'tickets.view.assigned', 'tickets.view.all', 'tickets.create', 'tickets.edit.all',
            'tickets.assign', 'tickets.resolve', 'tickets.close', 'tickets.reopen', 'tickets.internal.notes',
            'hosting.view.all', 'hosting.create', 'hosting.edit', 'hosting.suspend',
            'domains.view.all', 'domains.register', 'domains.transfer', 'domains.renew',
            'coverage.view', 'coverage.check',
            'pages.view', 'blog.view', 'faqs.view', 'kb.view',
            'reports.view', 'reports.subscriptions', 'reports.tickets',
            'notifications.view.own', 'dashboard.staff',
        ];
        $staffRole->givePermissionTo($staffPermissions);
        $this->command->info('✓ STAFF role created');

        // ADMIN ROLE
        $this->command->info('Creating ADMIN role...');
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $adminRole->givePermissionTo(Permission::all());
        $this->command->info('✓ ADMIN role created with ALL permissions');

        // SALES ROLE
        $this->command->info('Creating SALES role...');
        $salesRole = Role::firstOrCreate(['name' => 'sales', 'guard_name' => 'web']);
        $salesRole->givePermissionTo(array_merge($staffPermissions, ['users.create', 'analytics.clients', 'reports.revenue']));
        $this->command->info('✓ SALES role created');

        // TECHNICAL SUPPORT ROLE
        $this->command->info('Creating TECHNICAL_SUPPORT role...');
        $techRole = Role::firstOrCreate(['name' => 'technical_support', 'guard_name' => 'web']);
        $techRole->givePermissionTo(array_merge($staffPermissions, ['kb.create', 'kb.edit', 'faqs.create', 'faqs.edit']));
        $this->command->info('✓ TECHNICAL_SUPPORT role created');

        // WEB DEVELOPER ROLE
        $this->command->info('Creating WEB_DEVELOPER role...');
        $webDevRole = Role::firstOrCreate(['name' => 'web_developer', 'guard_name' => 'web']);
        $webDevRole->givePermissionTo([
            'users.view.own', 'users.edit.own',
            'portfolio.view', 'portfolio.create', 'portfolio.edit',
            'hosting.view.all', 'domains.view.all',
            'tickets.view.assigned', 'tickets.edit.all',
            'notifications.view.own', 'dashboard.staff',
        ]);
        $this->command->info('✓ WEB_DEVELOPER role created');

        // CONTENT MANAGER ROLE
        $this->command->info('Creating CONTENT_MANAGER role...');
        $cmRole = Role::firstOrCreate(['name' => 'content_manager', 'guard_name' => 'web']);
        $cmRole->givePermissionTo([
            'users.view.own', 'users.edit.own',
            'pages.view', 'pages.create', 'pages.edit', 'pages.publish',
            'blog.view', 'blog.create', 'blog.edit', 'blog.publish',
            'media.view', 'media.upload', 'media.edit',
            'banners.view', 'banners.create', 'banners.edit',
            'testimonials.view', 'testimonials.approve',
            'faqs.view', 'faqs.create', 'faqs.edit',
            'kb.view', 'kb.create', 'kb.edit', 'kb.publish',
            'dashboard.staff',
        ]);
        $this->command->info('✓ CONTENT_MANAGER role created');

        // HR ROLE
        $this->command->info('Creating HR role...');
        $hrRole = Role::firstOrCreate(['name' => 'hr', 'guard_name' => 'web']);
        $hrRole->givePermissionTo([
            'users.view.own', 'users.edit.own',
            'dashboard.staff',
        ]);
        $this->command->info('✓ HR role created');

        // SUMMARY
        $this->command->info('');
        $this->command->info('============================================');
        $this->command->info('ROLE & PERMISSION SETUP COMPLETE');
        $this->command->info('============================================');
        $this->command->info('Total Permissions: ' . Permission::count());
        $this->command->info('Total Roles: ' . Role::count());
        $this->command->info('');
        $this->command->info('Roles: client, staff, admin, sales, technical_support, web_developer, content_manager, hr');
        $this->command->info('============================================');
    }
}
