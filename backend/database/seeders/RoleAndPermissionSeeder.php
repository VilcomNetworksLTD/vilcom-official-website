<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // ─────────────────────────────────────────────────────────────────────
        // 1. ALL PERMISSIONS
        // ─────────────────────────────────────────────────────────────────────
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

            // HR-specific
            'hr.view.staff', 'hr.edit.staff', 'hr.manage.leaves', 'hr.manage.payroll',
            'hr.view.departments', 'hr.view.reports',

            // Dashboard Access
            'dashboard.client', 'dashboard.staff', 'dashboard.admin',
        ];

        $this->command->info('Creating permissions...');
        foreach ($permissions as $name) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
        }
        $this->command->info('✓ Permissions: ' . Permission::count());

        // ─────────────────────────────────────────────────────────────────────
        // 2. ADMIN — all permissions (always up-to-date)
        // ─────────────────────────────────────────────────────────────────────
        $this->command->info('Creating ADMIN role...');
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $adminRole->syncPermissions(Permission::all());
        $this->command->info('✓ ADMIN role → ALL permissions');

        // ─────────────────────────────────────────────────────────────────────
        // 3. CLIENT
        // ─────────────────────────────────────────────────────────────────────
        $this->command->info('Creating CLIENT role...');
        $clientRole = Role::firstOrCreate(['name' => 'client', 'guard_name' => 'web']);
        $clientRole->syncPermissions([
            'users.view.own', 'users.edit.own',
            'subscriptions.view.own', 'subscriptions.edit.own',
            'subscriptions.cancel.own', 'subscriptions.upgrade', 'subscriptions.downgrade',
            'invoices.view.own', 'invoices.download',
            'payments.view.own',
            'tickets.view.own', 'tickets.create', 'tickets.edit.own',
            'hosting.view.own',
            'domains.view.own', 'domains.register', 'domains.renew',
            'notifications.view.own',
            'coverage.check',
            'dashboard.client',
        ]);
        $this->command->info('✓ CLIENT role created');

        // ─────────────────────────────────────────────────────────────────────
        // 4. STAFF (baseline for all internal roles)
        // ─────────────────────────────────────────────────────────────────────
        $this->command->info('Creating STAFF role...');
        $staffPermissions = [
            'users.view.own', 'users.edit.own',
            'users.view.clients', 'users.edit.clients',
            'products.view.all',
            'subscriptions.view.all', 'subscriptions.create',
            'subscriptions.edit.all', 'subscriptions.suspend', 'subscriptions.activate',
            'invoices.view.all', 'invoices.create', 'invoices.send',
            'payments.view.all', 'payments.verify',
            'tickets.view.assigned', 'tickets.view.all', 'tickets.create',
            'tickets.edit.all', 'tickets.assign', 'tickets.resolve',
            'tickets.close', 'tickets.reopen', 'tickets.internal.notes',
            'hosting.view.all', 'hosting.create', 'hosting.edit', 'hosting.suspend',
            'domains.view.all', 'domains.register', 'domains.transfer', 'domains.renew',
            'coverage.view', 'coverage.check',
            'pages.view', 'blog.view', 'faqs.view', 'kb.view',
            'reports.view', 'reports.subscriptions', 'reports.tickets',
            'notifications.view.own',
            'dashboard.staff',
        ];
        $staffRole = Role::firstOrCreate(['name' => 'staff', 'guard_name' => 'web']);
        $staffRole->syncPermissions($staffPermissions);
        $this->command->info('✓ STAFF role created');

        // ─────────────────────────────────────────────────────────────────────
        // 5. SALES
        // ─────────────────────────────────────────────────────────────────────
        $this->command->info('Creating SALES role...');
        $salesRole = Role::firstOrCreate(['name' => 'sales', 'guard_name' => 'web']);
        $salesRole->syncPermissions(array_unique(array_merge($staffPermissions, [
            'users.create',
            'analytics.view', 'analytics.clients',
            'reports.revenue',
            'products.view', 'products.create', 'products.edit', 'products.delete',
            'categories.view', 'categories.create', 'categories.edit', 'categories.delete',
        ])));
        $this->command->info('✓ SALES role created');

        // ─────────────────────────────────────────────────────────────────────
        // 6. TECHNICAL SUPPORT
        // ─────────────────────────────────────────────────────────────────────
        $this->command->info('Creating TECHNICAL_SUPPORT role...');
        $techRole = Role::firstOrCreate(['name' => 'technical_support', 'guard_name' => 'web']);
        $techRole->syncPermissions(array_unique(array_merge($staffPermissions, [
            'kb.create', 'kb.edit', 'kb.publish',
            'faqs.create', 'faqs.edit',
            'hosting.manage.packages',
        ])));
        $this->command->info('✓ TECHNICAL_SUPPORT role created');

        // ─────────────────────────────────────────────────────────────────────
        // 7. WEB DEVELOPER
        // ─────────────────────────────────────────────────────────────────────
        $this->command->info('Creating WEB_DEVELOPER role...');
        $webDevRole = Role::firstOrCreate(['name' => 'web_developer', 'guard_name' => 'web']);
        $webDevRole->syncPermissions([
            'users.view.own', 'users.edit.own',
            'portfolio.view', 'portfolio.create', 'portfolio.edit',
            'media.view', 'media.upload', 'media.edit',
            'banners.view', 'banners.create', 'banners.edit',
            'hosting.view.all', 'domains.view.all',
            'tickets.view.assigned', 'tickets.edit.all',
            'coverage.view',
            'notifications.view.own',
            'dashboard.staff',
        ]);
        $this->command->info('✓ WEB_DEVELOPER role created');

        // ─────────────────────────────────────────────────────────────────────
        // 8. CONTENT MANAGER
        // ─────────────────────────────────────────────────────────────────────
        $this->command->info('Creating CONTENT_MANAGER role...');
        $cmRole = Role::firstOrCreate(['name' => 'content_manager', 'guard_name' => 'web']);
        $cmRole->syncPermissions([
            'users.view.own', 'users.edit.own',
            'pages.view', 'pages.create', 'pages.edit', 'pages.delete', 'pages.publish',
            'blog.view', 'blog.create', 'blog.edit', 'blog.delete', 'blog.publish',
            'media.view', 'media.upload', 'media.edit', 'media.delete',
            'banners.view', 'banners.create', 'banners.edit', 'banners.delete',
            'testimonials.view', 'testimonials.approve', 'testimonials.create', 'testimonials.edit', 'testimonials.delete',
            'faqs.view', 'faqs.create', 'faqs.edit', 'faqs.delete',
            'kb.view', 'kb.create', 'kb.edit', 'kb.delete', 'kb.publish',
            'portfolio.view', 'portfolio.create', 'portfolio.edit', 'portfolio.delete',
            'notifications.view.own',
            'dashboard.staff',
        ]);
        $this->command->info('✓ CONTENT_MANAGER role created');

        // ─────────────────────────────────────────────────────────────────────
        // 9. HR — can view/manage staff profiles, leaves, payroll reporting
        // ─────────────────────────────────────────────────────────────────────
        $this->command->info('Creating HR role...');
        $hrRole = Role::firstOrCreate(['name' => 'hr', 'guard_name' => 'web']);
        $hrRole->syncPermissions([
            // Own profile
            'users.view.own', 'users.edit.own',

            // Staff visibility and editing (HR-specific)
            'users.view.staff', 'users.edit.staff',
            'users.create',       // can onboard new staff
            'users.suspend',      // can suspend staff (HR action)
            'users.activate',     // can reactivate staff

            // HR-specific permissions
            'hr.view.staff', 'hr.edit.staff',
            'hr.manage.leaves', 'hr.manage.payroll',
            'hr.view.departments', 'hr.view.reports',

            // Analytics/reports relevant to HR
            'analytics.staff',
            'reports.view',

            // Notifications
            'notifications.view.own',

            // Dashboard access
            'dashboard.staff',
        ]);
        $this->command->info('✓ HR role created');

        // ─────────────────────────────────────────────────────────────────────
        // Summary
        // ─────────────────────────────────────────────────────────────────────
        $this->command->info('');
        $this->command->info('============================================');
        $this->command->info('ROLE & PERMISSION SETUP COMPLETE');
        $this->command->info('============================================');
        $this->command->info('Total Permissions : ' . Permission::count());
        $this->command->info('Total Roles       : ' . Role::count());
        $this->command->info('');
        $roleList = Role::with('permissions')->get()->map(function ($r) {
            return $r->name . ' (' . $r->permissions->count() . ')';
        })->implode(', ');
        $this->command->info('Roles: ' . $roleList);
        $this->command->info('============================================');
    }
}
