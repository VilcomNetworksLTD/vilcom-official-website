<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\LogoutController;
use App\Http\Controllers\Api\Auth\PasswordResetController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\AddonController;
use App\Http\Controllers\Api\Admin\MediaController;
use App\Http\Controllers\Api\Admin\BannerController;
use App\Http\Controllers\Api\Admin\TestimonialController;
use App\Http\Controllers\Api\Admin\FaqController;
use App\Http\Controllers\Api\Admin\AdminSubscriptionController;
use App\Http\Controllers\Api\Admin\ClientController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Multi-Tenant ISP System
|--------------------------------------------------------------------------
|
| This file defines all API routes with proper authentication and 
| authorization for a multi-tenant ISP management system.
|
*/

Route::prefix('v1')->group(function () {

    // ============================================
    // AUTHENTICATION ROUTES (Public)
    // ============================================
    Route::prefix('auth')->group(function () {
        // Registration & Login
        Route::post('/register', [RegisterController::class, 'register'])
            ->name('api.auth.register');
        
        Route::post('/login', [LoginController::class, 'login'])
            ->name('api.auth.login')
            ->middleware('throttle:5,1'); // 5 attempts per minute
        
        Route::post('/refresh', [LoginController::class, 'refresh'])
            ->name('api.auth.refresh')
            ->middleware('auth:sanctum');
        
        // Password Reset
        Route::post('/password/email', [PasswordResetController::class, 'sendResetLink'])
            ->name('api.auth.password.email')
            ->middleware('throttle:3,1');
        
        Route::post('/password/reset', [PasswordResetController::class, 'resetPassword'])
            ->name('api.auth.password.reset');
        
        Route::get('/password/verify-token/{token}', [PasswordResetController::class, 'verifyToken'])
            ->name('api.auth.password.verify-token');
        
        // 2FA Verification (before full login)
        Route::post('/verify-2fa', [LoginController::class, 'verify2FA'])
            ->name('api.auth.verify-2fa');
        
        // Email Verification
        Route::post('/email/verify/resend', [RegisterController::class, 'resendVerification'])
            ->name('api.auth.email.verify.resend')
            ->middleware('throttle:3,1');
        
        Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])
            ->name('api.auth.email.verify');

        // Protected Authentication Routes
        Route::middleware('auth:sanctum')->group(function () {
            // Current User
            Route::get('/user', [LoginController::class, 'user'])
                ->name('api.auth.user');
            
            // Logout
            Route::post('/logout', [LogoutController::class, 'logout'])
                ->name('api.auth.logout');
            
            Route::post('/logout-all', [LogoutController::class, 'logoutAll'])
                ->name('api.auth.logout-all');
            
            // Password Change (authenticated)
            Route::put('/password/change', [PasswordResetController::class, 'changePassword'])
                ->name('api.auth.password.change');
            
            // 2FA Management
            Route::post('/2fa/enable', [AuthController::class, 'enable2FA'])
                ->name('api.auth.2fa.enable');
            
            Route::post('/2fa/confirm', [AuthController::class, 'confirm2FA'])
                ->name('api.auth.2fa.confirm');
            
            Route::post('/2fa/disable', [AuthController::class, 'disable2FA'])
                ->name('api.auth.2fa.disable');
            
            Route::post('/2fa/verify', [AuthController::class, 'verify2FA'])
                ->name('api.auth.2fa.verify');
        });
    });

    // ============================================
    // CATEGORY ROUTES
    // ============================================
    Route::prefix('categories')->group(function () {
        // Public Routes - Available to everyone
        Route::get('/', [CategoryController::class, 'index'])
            ->name('api.categories.index');
        
        Route::get('/tree', [CategoryController::class, 'tree'])
            ->name('api.categories.tree');
        
        Route::get('/{slug}', [CategoryController::class, 'show'])
            ->name('api.categories.show');
        
        Route::get('/{slug}/products', [CategoryController::class, 'products'])
            ->name('api.categories.products');
        
        // Protected Routes - Admin/Staff Only
        Route::middleware(['auth:sanctum', 'role:admin|staff'])->group(function () {
            Route::post('/', [CategoryController::class, 'store'])
                ->name('api.categories.store')
                ->middleware('permission:categories.create');
            
            Route::put('/{category}', [CategoryController::class, 'update'])
                ->name('api.categories.update')
                ->middleware('permission:categories.edit');
            
            Route::delete('/{category}', [CategoryController::class, 'destroy'])
                ->name('api.categories.destroy')
                ->middleware('permission:categories.delete');
            
            Route::put('/reorder', [CategoryController::class, 'reorder'])
                ->name('api.categories.reorder')
                ->middleware('permission:categories.edit');
        });
    });

    // ============================================
    // PRODUCT ROUTES
    // ============================================
    Route::prefix('products')->group(function () {
        // Public Routes - Available to everyone (only shows active products)
        Route::get('/', [ProductController::class, 'index'])
            ->name('api.products.index');
        
        Route::get('/featured', [ProductController::class, 'featured'])
            ->name('api.products.featured');
        
        Route::get('/on-promotion', [ProductController::class, 'onPromotion'])
            ->name('api.products.on-promotion');
        
        Route::get('/category/{categorySlug}', [ProductController::class, 'byCategory'])
            ->name('api.products.by-category');
        
        Route::get('/{product:slug}', [ProductController::class, 'show'])
            ->name('api.products.show');
        
        Route::post('/{product:slug}/availability', [ProductController::class, 'checkAvailability'])
            ->name('api.products.availability');
        
        Route::get('/{product:slug}/related', [ProductController::class, 'related'])
            ->name('api.products.related');
        
        // Protected Routes - Admin/Staff Only
        Route::middleware(['auth:sanctum', 'role:admin|staff|sales'])->group(function () {
            Route::post('/', [ProductController::class, 'store'])
                ->name('api.products.store')
                ->middleware('permission:products.create');
            
            Route::put('/{product}', [ProductController::class, 'update'])
                ->name('api.products.update')
                ->middleware('permission:products.edit');
            
            Route::delete('/{product}', [ProductController::class, 'destroy'])
                ->name('api.products.destroy')
                ->middleware('permission:products.delete');
        });
    });

    // ============================================
    // ADDON ROUTES
    // ============================================
    Route::prefix('addons')->group(function () {
        // Public Routes
        Route::get('/', [AddonController::class, 'index'])
            ->name('api.addons.index');
        
        Route::get('/{addon:slug}', [AddonController::class, 'show'])
            ->name('api.addons.show');
        
        Route::get('/product/{productId}', [AddonController::class, 'forProduct'])
            ->name('api.addons.for-product');
        
        // Protected Routes - Admin/Staff Only
        Route::middleware(['auth:sanctum', 'role:admin|staff'])->group(function () {
            Route::post('/', [AddonController::class, 'store'])
                ->name('api.addons.store')
                ->middleware('permission:products.create');
            
            Route::put('/{addon}', [AddonController::class, 'update'])
                ->name('api.addons.update')
                ->middleware('permission:products.edit');
            
            Route::delete('/{addon}', [AddonController::class, 'destroy'])
                ->name('api.addons.destroy')
                ->middleware('permission:products.delete');
        });
    });

    // ============================================
    // SUBSCRIPTIONS ROUTES (Multi-Tenant)
    // ============================================
    Route::prefix('subscriptions')->middleware('auth:sanctum')->group(function () {
        // Client Routes - Users can view their own subscriptions
        Route::get('/', [App\Http\Controllers\Api\SubscriptionController::class, 'index'])
            ->name('api.subscriptions.index')
            ->middleware('permission:subscriptions.view.own|subscriptions.view.all');
        
        Route::get('/{subscription}', [App\Http\Controllers\Api\SubscriptionController::class, 'show'])
            ->name('api.subscriptions.show')
            ->middleware('permission:subscriptions.view.own|subscriptions.view.all');
        
        Route::post('/', [App\Http\Controllers\Api\SubscriptionController::class, 'store'])
            ->name('api.subscriptions.store')
            ->middleware('permission:subscriptions.view.own|subscriptions.create');
        
        Route::put('/{subscription}', [App\Http\Controllers\Api\SubscriptionController::class, 'update'])
            ->name('api.subscriptions.update')
            ->middleware('permission:subscriptions.edit.own|subscriptions.edit.all');
        
        Route::post('/{subscription}/cancel', [App\Http\Controllers\Api\SubscriptionController::class, 'cancel'])
            ->name('api.subscriptions.cancel')
            ->middleware('permission:subscriptions.cancel.own|subscriptions.cancel.all');
        
        Route::post('/{subscription}/upgrade', [App\Http\Controllers\Api\SubscriptionController::class, 'upgrade'])
            ->name('api.subscriptions.upgrade')
            ->middleware('permission:subscriptions.upgrade');
        
        Route::post('/{subscription}/downgrade', [App\Http\Controllers\Api\SubscriptionController::class, 'downgrade'])
            ->name('api.subscriptions.downgrade')
            ->middleware('permission:subscriptions.downgrade');

        // Client-specific: change-plan, reactivate, proration-preview, addons
        Route::post('/{subscription}/change-plan', [App\Http\Controllers\Api\SubscriptionController::class, 'changePlan'])
            ->name('api.subscriptions.change-plan');
        
        Route::post('/{subscription}/reactivate', [App\Http\Controllers\Api\SubscriptionController::class, 'reactivate'])
            ->name('api.subscriptions.reactivate');
        
        Route::get('/{subscription}/proration-preview', [App\Http\Controllers\Api\SubscriptionController::class, 'prorationPreview'])
            ->name('api.subscriptions.proration-preview');
        
        Route::post('/{subscription}/addons', [App\Http\Controllers\Api\SubscriptionController::class, 'addAddon'])
            ->name('api.subscriptions.addons.add');
        
        Route::delete('/{subscription}/addons/{addon}', [App\Http\Controllers\Api\SubscriptionController::class, 'removeAddon'])
            ->name('api.subscriptions.addons.remove');
        
        // Staff/Admin Only Routes
        Route::middleware('role:admin|staff')->group(function () {
            Route::post('/{subscription}/suspend', [App\Http\Controllers\Api\SubscriptionController::class, 'suspend'])
                ->name('api.subscriptions.suspend')
                ->middleware('permission:subscriptions.suspend');
            
            Route::post('/{subscription}/activate', [App\Http\Controllers\Api\SubscriptionController::class, 'activate'])
                ->name('api.subscriptions.activate')
                ->middleware('permission:subscriptions.activate');
        });
    });

    // ============================================
    // ADMIN SUBSCRIPTIONS ROUTES (Separate Admin Routes)
    // ============================================
    Route::prefix('admin/subscriptions')->middleware(['auth:sanctum', 'role:admin|staff'])->group(function () {
        Route::get('/', [App\Http\Controllers\Api\Admin\SubscriptionController::class, 'index'])
            ->name('api.admin.subscriptions.index');
        
        Route::post('/', [App\Http\Controllers\Api\Admin\SubscriptionController::class, 'store'])
            ->name('api.admin.subscriptions.store');
        
        Route::get('/analytics', [App\Http\Controllers\Api\Admin\SubscriptionController::class, 'analytics'])
            ->name('api.admin.subscriptions.analytics');
        
        Route::get('/{subscription}', [App\Http\Controllers\Api\Admin\SubscriptionController::class, 'show'])
            ->name('api.admin.subscriptions.show');
        
        Route::post('/{subscription}/activate', [App\Http\Controllers\Api\Admin\SubscriptionController::class, 'activate'])
            ->name('api.admin.subscriptions.activate');
        
        Route::post('/{subscription}/suspend', [App\Http\Controllers\Api\Admin\SubscriptionController::class, 'suspend'])
            ->name('api.admin.subscriptions.suspend');
        
        Route::post('/{subscription}/reactivate', [App\Http\Controllers\Api\Admin\SubscriptionController::class, 'reactivate'])
            ->name('api.admin.subscriptions.reactivate');
        
        Route::post('/{subscription}/change-plan', [App\Http\Controllers\Api\Admin\SubscriptionController::class, 'changePlan'])
            ->name('api.admin.subscriptions.change-plan');
    });

    // ============================================
    // INVOICES ROUTES (Multi-Tenant)
    // ============================================
    Route::prefix('invoices')->middleware('auth:sanctum')->group(function () {
        Route::get('/', [App\Http\Controllers\Api\InvoiceController::class, 'index'])
            ->name('api.invoices.index')
            ->middleware('permission:invoices.view.own|invoices.view.all');
        
        Route::get('/{invoice}', [App\Http\Controllers\Api\InvoiceController::class, 'show'])
            ->name('api.invoices.show')
            ->middleware('permission:invoices.view.own|invoices.view.all');
        
        Route::get('/{invoice}/download', [App\Http\Controllers\Api\InvoiceController::class, 'download'])
            ->name('api.invoices.download')
            ->middleware('permission:invoices.download');
        
        // Staff/Admin Only Routes
        Route::middleware('role:admin|staff')->group(function () {
            Route::post('/', [App\Http\Controllers\Api\InvoiceController::class, 'store'])
                ->name('api.invoices.store')
                ->middleware('permission:invoices.create');
            
            Route::put('/{invoice}', [App\Http\Controllers\Api\InvoiceController::class, 'update'])
                ->name('api.invoices.update')
                ->middleware('permission:invoices.edit');
            
            Route::post('/{invoice}/send', [App\Http\Controllers\Api\InvoiceController::class, 'send'])
                ->name('api.invoices.send')
                ->middleware('permission:invoices.send');
            
            Route::post('/{invoice}/mark-paid', [App\Http\Controllers\Api\InvoiceController::class, 'markPaid'])
                ->name('api.invoices.mark-paid')
                ->middleware('permission:invoices.mark.paid');
            
            Route::post('/{invoice}/void', [App\Http\Controllers\Api\InvoiceController::class, 'void'])
                ->name('api.invoices.void')
                ->middleware('permission:invoices.void');
        });
    });

    // ============================================
    // PAYMENT ROUTES (Multi-Tenant)
    // ============================================
    Route::prefix('payments')->middleware('auth:sanctum')->group(function () {
        Route::get('/', [App\Http\Controllers\Api\PaymentController::class, 'index'])
            ->name('api.payments.index')
            ->middleware('permission:payments.view.own|payments.view.all');
        
        Route::get('/{payment}', [App\Http\Controllers\Api\PaymentController::class, 'show'])
            ->name('api.payments.show')
            ->middleware('permission:payments.view.own|payments.view.all');
        
        Route::post('/mpesa', [App\Http\Controllers\Api\PaymentController::class, 'initiateMpesa'])
            ->name('api.payments.mpesa');
        
        Route::post('/pesapal', [App\Http\Controllers\Api\PaymentController::class, 'initiatePesapal'])
            ->name('api.payments.pesapal');
        
        Route::post('/flutterwave', [App\Http\Controllers\Api\PaymentController::class, 'initiateFlutterwave'])
            ->name('api.payments.flutterwave');
        
        Route::post('/card', [App\Http\Controllers\Api\PaymentController::class, 'initiateCard'])
            ->name('api.payments.card');
        
        Route::post('/manual', [App\Http\Controllers\Api\PaymentController::class, 'recordManual'])
            ->name('api.payments.manual')
            ->middleware('role:admin|staff');
        
        // Staff/Admin Only Routes
        Route::middleware('role:admin|staff')->group(function () {
            Route::post('/{payment}/verify', [App\Http\Controllers\Api\PaymentController::class, 'verify'])
                ->name('api.payments.verify')
                ->middleware('permission:payments.verify');
            
            Route::post('/{payment}/refund', [App\Http\Controllers\Api\PaymentController::class, 'refund'])
                ->name('api.payments.refund')
                ->middleware('permission:payments.refund');
        });
    });

    // ============================================
    // TICKETS ROUTES (Multi-Tenant)
    // ============================================
    Route::prefix('tickets')->middleware('auth:sanctum')->group(function () {
        Route::get('/', [App\Http\Controllers\Api\TicketController::class, 'index'])
            ->name('api.tickets.index')
            ->middleware('permission:tickets.view.own|tickets.view.assigned|tickets.view.all');
        
        Route::get('/{ticket}', [App\Http\Controllers\Api\TicketController::class, 'show'])
            ->name('api.tickets.show')
            ->middleware('permission:tickets.view.own|tickets.view.all');
        
        Route::post('/', [App\Http\Controllers\Api\TicketController::class, 'store'])
            ->name('api.tickets.store')
            ->middleware('permission:tickets.create');
        
        Route::put('/{ticket}', [App\Http\Controllers\Api\TicketController::class, 'update'])
            ->name('api.tickets.update')
            ->middleware('permission:tickets.edit.own|tickets.edit.all');
        
        Route::post('/{ticket}/reply', [App\Http\Controllers\Api\TicketController::class, 'reply'])
            ->name('api.tickets.reply');
        
        // Staff/Admin Only Routes
        Route::middleware('role:admin|staff|technical_support')->group(function () {
            Route::post('/{ticket}/assign', [App\Http\Controllers\Api\TicketController::class, 'assign'])
                ->name('api.tickets.assign')
                ->middleware('permission:tickets.assign');
            
            Route::post('/{ticket}/resolve', [App\Http\Controllers\Api\TicketController::class, 'resolve'])
                ->name('api.tickets.resolve')
                ->middleware('permission:tickets.resolve');
            
            Route::post('/{ticket}/close', [App\Http\Controllers\Api\TicketController::class, 'close'])
                ->name('api.tickets.close')
                ->middleware('permission:tickets.close');
            
            Route::post('/{ticket}/reopen', [App\Http\Controllers\Api\TicketController::class, 'reopen'])
                ->name('api.tickets.reopen')
                ->middleware('permission:tickets.reopen');
            
            Route::post('/{ticket}/internal-note', [App\Http\Controllers\Api\TicketController::class, 'addInternalNote'])
                ->name('api.tickets.internal-note')
                ->middleware('permission:tickets.internal.notes');
        });
    });

    // ============================================
    // USER MANAGEMENT ROUTES (Multi-Tenant)
    // ============================================
    Route::prefix('users')->middleware(['auth:sanctum', 'role:admin|staff'])->group(function () {
        Route::get('/', [App\Http\Controllers\Api\UserController::class, 'index'])
            ->name('api.users.index');
        
        Route::get('/statistics', [App\Http\Controllers\Api\UserController::class, 'statistics'])
            ->name('api.users.statistics');
        
        Route::get('/roles', [App\Http\Controllers\Api\UserController::class, 'roles'])
            ->name('api.users.roles');
        
        Route::get('/departments', [App\Http\Controllers\Api\UserController::class, 'departments'])
            ->name('api.users.departments');
        
        Route::get('/{user}', [App\Http\Controllers\Api\UserController::class, 'show'])
            ->name('api.users.show');
        
        Route::post('/', [App\Http\Controllers\Api\UserController::class, 'store'])
            ->name('api.users.store');
        
        Route::put('/{user}', [App\Http\Controllers\Api\UserController::class, 'update'])
            ->name('api.users.update');
        
        Route::delete('/{user}', [App\Http\Controllers\Api\UserController::class, 'destroy'])
            ->name('api.users.destroy');
        
        Route::post('/{user}/suspend', [App\Http\Controllers\Api\UserController::class, 'suspend'])
            ->name('api.users.suspend');
        
        Route::post('/{user}/activate', [App\Http\Controllers\Api\UserController::class, 'activate'])
            ->name('api.users.activate');
        
        // Admin Only Routes
        Route::middleware(['role:admin'])->group(function () {
            Route::post('/{user}/impersonate', [App\Http\Controllers\Api\UserController::class, 'impersonate'])
                ->name('api.users.impersonate');
            
            Route::post('/stop-impersonating', [App\Http\Controllers\Api\UserController::class, 'stopImpersonating'])
                ->name('api.users.stop-impersonating');
            
            Route::get('/impersonation-status', [App\Http\Controllers\Api\UserController::class, 'impersonationStatus'])
                ->name('api.users.impersonation-status');
        });
    });
    
    // Check impersonation status (accessible to impersonated users)
    Route::get('/users/impersonation-status', [App\Http\Controllers\Api\UserController::class, 'impersonationStatus'])
        ->name('api.users.impersonation-status')
        ->middleware('auth:sanctum');

    // ============================================
    // CLIENTS MANAGEMENT ROUTES (Admin/Staff Only)
    // ============================================
    Route::prefix('admin/clients')->middleware(['auth:sanctum', 'role:admin|staff'])->group(function () {
        Route::get('/', [ClientController::class, 'index'])
            ->name('api.admin.clients.index');
        
        Route::post('/', [ClientController::class, 'store'])
            ->name('api.admin.clients.store');
        
        Route::get('/statistics', [ClientController::class, 'statistics'])
            ->name('api.admin.clients.statistics');
        
        Route::get('/{client}', [ClientController::class, 'show'])
            ->name('api.admin.clients.show');
        
        Route::put('/{client}', [ClientController::class, 'update'])
            ->name('api.admin.clients.update');
        
        Route::delete('/{client}', [ClientController::class, 'destroy'])
            ->name('api.admin.clients.destroy');
        
        Route::post('/{client}/suspend', [ClientController::class, 'suspend'])
            ->name('api.admin.clients.suspend');
        
        Route::post('/{client}/activate', [ClientController::class, 'activate'])
            ->name('api.admin.clients.activate');
    });

    // ============================================
    // STAFF INVITATION ROUTES (Admin Only)
    // ============================================
    Route::prefix('admin/staff-invitations')->middleware(['auth:sanctum', 'role:admin'])->group(function () {
        Route::get('/', [App\Http\Controllers\Api\Admin\InvitationController::class, 'index'])
            ->name('api.admin.staff-invitations.index');
        
        Route::post('/', [App\Http\Controllers\Api\Admin\InvitationController::class, 'store'])
            ->name('api.admin.staff-invitations.store');
        
        Route::get('/statistics', [App\Http\Controllers\Api\Admin\InvitationController::class, 'statistics'])
            ->name('api.admin.staff-invitations.statistics');
        
        Route::post('/{invitation}/resend', [App\Http\Controllers\Api\Admin\InvitationController::class, 'resend'])
            ->name('api.admin.staff-invitations.resend');
        
        Route::delete('/{invitation}', [App\Http\Controllers\Api\Admin\InvitationController::class, 'destroy'])
            ->name('api.admin.staff-invitations.destroy');
    });

    // Public route for accepting invitation (no auth required)
    Route::post('/staff-invitations/accept', [App\Http\Controllers\Api\Admin\InvitationController::class, 'accept'])
        ->name('api.staff-invitations.accept');

// ============================================
    // REPORTS & ANALYTICS (Admin/Staff Only)
    // ============================================
    Route::prefix('reports')->middleware(['auth:sanctum', 'role:admin|staff|sales'])->group(function () {
        Route::get('/dashboard', [App\Http\Controllers\Api\ReportController::class, 'dashboard'])
            ->name('api.reports.dashboard')
            ->middleware('permission:reports.view');
        
        Route::get('/revenue', [App\Http\Controllers\Api\ReportController::class, 'revenue'])
            ->name('api.reports.revenue')
            ->middleware('permission:reports.revenue');
        
        Route::get('/subscriptions', [App\Http\Controllers\Api\ReportController::class, 'subscriptions'])
            ->name('api.reports.subscriptions')
            ->middleware('permission:reports.subscriptions');
        
        Route::get('/tickets', [App\Http\Controllers\Api\ReportController::class, 'tickets'])
            ->name('api.reports.tickets')
            ->middleware('permission:reports.tickets');
        
        Route::post('/export', [App\Http\Controllers\Api\ReportController::class, 'export'])
            ->name('api.reports.export')
            ->middleware('permission:reports.export');
    });

    // ============================================
    // ROLES & PERMISSIONS MANAGEMENT (Admin Only)
    // ============================================
    Route::prefix('admin/roles')->middleware(['auth:sanctum', 'role:admin'])->group(function () {
        // Roles CRUD
        Route::get('/', [App\Http\Controllers\Api\Admin\RoleController::class, 'index'])
            ->name('api.admin.roles.index')
            ->middleware('permission:roles.view');
        
        Route::get('/permissions', [App\Http\Controllers\Api\Admin\RoleController::class, 'permissions'])
            ->name('api.admin.roles.permissions')
            ->middleware('permission:permissions.view');
        
        Route::get('/{role}', [App\Http\Controllers\Api\Admin\RoleController::class, 'show'])
            ->name('api.admin.roles.show')
            ->middleware('permission:roles.view');
        
        Route::post('/', [App\Http\Controllers\Api\Admin\RoleController::class, 'store'])
            ->name('api.admin.roles.store')
            ->middleware('permission:roles.create');
        
        Route::put('/{role}', [App\Http\Controllers\Api\Admin\RoleController::class, 'update'])
            ->name('api.admin.roles.update')
            ->middleware('permission:roles.edit');
        
        Route::delete('/{role}', [App\Http\Controllers\Api\Admin\RoleController::class, 'destroy'])
            ->name('api.admin.roles.destroy')
            ->middleware('permission:roles.delete');
        
        // Role Permissions
        Route::post('/{role}/permissions', [App\Http\Controllers\Api\Admin\RoleController::class, 'assignPermissions'])
            ->name('api.admin.roles.permissions.assign')
            ->middleware('permission:permissions.assign');
        
        Route::delete('/{role}/permissions', [App\Http\Controllers\Api\Admin\RoleController::class, 'revokePermissions'])
            ->name('api.admin.roles.permissions.revoke')
            ->middleware('permission:permissions.assign');
        
        // Role Users
        Route::get('/{role}/users', [App\Http\Controllers\Api\Admin\RoleController::class, 'users'])
            ->name('api.admin.roles.users')
            ->middleware('permission:users.view.all');
    });

    // ============================================
    // COVERAGE CHECK (Public)
    // ============================================
    Route::prefix('coverage')->group(function () {
        Route::post('/check', [App\Http\Controllers\Api\CoverageCheckerController::class, 'check'])
            ->name('api.coverage.check');
        
        Route::get('/areas', [App\Http\Controllers\Api\CoverageCheckerController::class, 'publicAreas'])
            ->name('api.coverage.areas');
        
        Route::get('/geojson', [App\Http\Controllers\Api\CoverageCheckerController::class, 'geojson'])
            ->name('api.coverage.geojson');
        
        Route::post('/interest', [App\Http\Controllers\Api\CoverageCheckerController::class, 'registerInterest'])
            ->name('api.coverage.interest');
        
        // Admin/Staff Coverage Management
        Route::middleware(['auth:sanctum', 'role:admin|staff'])->prefix('admin/coverage')->group(function () {
            // Zone CRUD
            Route::apiResource('zones', App\Http\Controllers\Api\Admin\CoverageZoneController::class);
            
            // Zone Products Management
            Route::get('zones/{zone}/products', [App\Http\Controllers\Api\Admin\CoverageZoneController::class, 'zoneProducts']);
            Route::post('zones/{zone}/products', [App\Http\Controllers\Api\Admin\CoverageZoneController::class, 'attachProduct']);
            Route::put('zones/{zone}/products/{product}', [App\Http\Controllers\Api\Admin\CoverageZoneController::class, 'updateZoneProduct']);
            Route::delete('zones/{zone}/products/{product}', [App\Http\Controllers\Api\Admin\CoverageZoneController::class, 'detachProduct']);
            
            // Zone Packages Management
            Route::get('zones/{zone}/packages', [App\Http\Controllers\Api\Admin\CoverageZoneController::class, 'zonePackages']);
            Route::post('zones/{zone}/packages', [App\Http\Controllers\Api\Admin\CoverageZoneController::class, 'storePackage']);
            Route::put('zones/{zone}/packages/{package}', [App\Http\Controllers\Api\Admin\CoverageZoneController::class, 'updatePackage']);
            Route::delete('zones/{zone}/packages/{package}', [App\Http\Controllers\Api\Admin\CoverageZoneController::class, 'destroyPackage']);
            
            // Interest Signups
            Route::get('interest-signups', [App\Http\Controllers\Api\Admin\CoverageZoneController::class, 'interestSignups']);
            Route::put('interest-signups/{signup}/status', [App\Http\Controllers\Api\Admin\CoverageZoneController::class, 'updateSignupStatus']);
            
            // Analytics & Logs
            Route::get('analytics', [App\Http\Controllers\Api\Admin\CoverageZoneController::class, 'analytics']);
            Route::get('check-logs', [App\Http\Controllers\Api\Admin\CoverageZoneController::class, 'checkLogs']);
        });
    });

    // ============================================
    // SETTINGS (Admin Only)
    // ============================================
    Route::prefix('settings')->middleware(['auth:sanctum', 'role:admin'])->group(function () {
        Route::get('/', [App\Http\Controllers\Api\SettingsController::class, 'index'])
            ->name('api.settings.index')
            ->middleware('permission:settings.view');
        
        Route::put('/', [App\Http\Controllers\Api\SettingsController::class, 'update'])
            ->name('api.settings.update')
            ->middleware('permission:settings.edit');
        
        Route::get('/email-templates', [App\Http\Controllers\Api\SettingsController::class, 'emailTemplates'])
            ->name('api.settings.email-templates')
            ->middleware('permission:settings.email.templates');
        
        Route::put('/email-templates/{template}', [App\Http\Controllers\Api\SettingsController::class, 'updateEmailTemplate'])
            ->name('api.settings.email-templates.update')
            ->middleware('permission:settings.email.templates');
    });

    // ============================================
    // MEDIA / FILE MANAGEMENT (Admin Only)
    // ============================================
    Route::prefix('media')->middleware(['auth:sanctum', 'role:admin|staff'])->group(function () {
        Route::get('/', [MediaController::class, 'index'])
            ->name('api.media.index')
            ->middleware('permission:media.view');
        
        Route::post('/', [MediaController::class, 'store'])
            ->name('api.media.store')
            ->middleware('permission:media.upload');
        
        Route::get('/folders', [MediaController::class, 'folders'])
            ->name('api.media.folders');
        
        Route::post('/folders', [MediaController::class, 'createFolder'])
            ->name('api.media.create-folder');
        
        Route::delete('/folders', [MediaController::class, 'deleteFolder'])
            ->name('api.media.delete-folder');
        
        Route::get('/{media}', [MediaController::class, 'show'])
            ->name('api.media.show');
        
        Route::put('/{media}', [MediaController::class, 'update'])
            ->name('api.media.update')
            ->middleware('permission:media.edit');
        
        Route::delete('/{media}', [MediaController::class, 'destroy'])
            ->name('api.media.destroy')
            ->middleware('permission:media.delete');
        
        Route::post('/bulk-delete', [MediaController::class, 'bulkDelete'])
            ->name('api.media.bulk-delete')
            ->middleware('permission:media.delete');
    });

    // Public media routes
    Route::prefix('media')->group(function () {
        Route::get('/public', [MediaController::class, 'publicIndex'])
            ->name('api.media.public');
    });

    // ============================================
    // BANNER / SLIDER MANAGEMENT (Admin Only)
    // ============================================
    Route::prefix('banners')->group(function () {
        // Public routes for active banners
        Route::get('/active', [BannerController::class, 'active'])
            ->name('api.banners.active');
        
        // Admin/Staff routes
        Route::middleware(['auth:sanctum', 'role:admin|staff'])->group(function () {
            Route::get('/', [BannerController::class, 'index'])
                ->name('api.banners.index')
                ->middleware('permission:banners.view');
            
            Route::post('/', [BannerController::class, 'store'])
                ->name('api.banners.store')
                ->middleware('permission:banners.create');
            
            Route::get('/positions', [BannerController::class, 'positions'])
                ->name('api.banners.positions');
            
            Route::get('/{banner}', [BannerController::class, 'show'])
                ->name('api.banners.show');
            
            Route::put('/{banner}', [BannerController::class, 'update'])
                ->name('api.banners.update')
                ->middleware('permission:banners.edit');
            
            Route::delete('/{banner}', [BannerController::class, 'destroy'])
                ->name('api.banners.destroy')
                ->middleware('permission:banners.delete');
            
            Route::post('/{banner}/toggle', [BannerController::class, 'toggleStatus'])
                ->name('api.banners.toggle')
                ->middleware('permission:banners.edit');
            
            Route::post('/reorder', [BannerController::class, 'reorder'])
                ->name('api.banners.reorder')
                ->middleware('permission:banners.edit');
            
            Route::post('/{banner}/duplicate', [BannerController::class, 'duplicate'])
                ->name('api.banners.duplicate')
                ->middleware('permission:banners.create');
        });
    });

    // ============================================
    // TESTIMONIAL MANAGEMENT (Admin/Staff + Public)
    // ============================================
    Route::prefix('testimonials')->group(function () {
        // Public routes for approved testimonials
        Route::get('/', [TestimonialController::class, 'publicIndex'])
            ->name('api.testimonials.public');
        
        // Admin/Staff routes
        Route::middleware(['auth:sanctum', 'role:admin|staff'])->group(function () {
            Route::get('/admin', [TestimonialController::class, 'index'])
                ->name('api.testimonials.index')
                ->middleware('permission:testimonials.view');
            
            Route::post('/', [TestimonialController::class, 'store'])
                ->name('api.testimonials.store')
                ->middleware('permission:testimonials.create');
            
            Route::get('/statistics', [TestimonialController::class, 'statistics'])
                ->name('api.testimonials.statistics')
                ->middleware('permission:testimonials.view');
            
            Route::get('/{testimonial}', [TestimonialController::class, 'show'])
                ->name('api.testimonials.show');
            
            Route::put('/{testimonial}', [TestimonialController::class, 'update'])
                ->name('api.testimonials.update')
                ->middleware('permission:testimonials.edit');
            
            Route::delete('/{testimonial}', [TestimonialController::class, 'destroy'])
                ->name('api.testimonials.destroy')
                ->middleware('permission:testimonials.delete');
            
            Route::post('/{testimonial}/approve', [TestimonialController::class, 'approve'])
                ->name('api.testimonials.approve')
                ->middleware('permission:testimonials.approve');
            
            Route::post('/{testimonial}/reject', [TestimonialController::class, 'reject'])
                ->name('api.testimonials.reject')
                ->middleware('permission:testimonials.approve');
            
            Route::post('/{testimonial}/featured', [TestimonialController::class, 'toggleFeatured'])
                ->name('api.testimonials.featured')
                ->middleware('permission:testimonials.edit');
            
            Route::post('/bulk-approve', [TestimonialController::class, 'bulkApprove'])
                ->name('api.testimonials.bulk-approve')
                ->middleware('permission:testimonials.approve');
            
            Route::post('/bulk-delete', [TestimonialController::class, 'bulkDelete'])
                ->name('api.testimonials.bulk-delete')
                ->middleware('permission:testimonials.delete');
        });
    });

    // ============================================
    // FAQ / KNOWLEDGE BASE MANAGEMENT (Admin/Staff + Public)
    // ============================================
    Route::prefix('faqs')->group(function () {
        // Public routes
        Route::get('/', [FaqController::class, 'publicIndex'])
            ->name('api.faqs.public');
        
        Route::get('/categories', [FaqController::class, 'categories'])
            ->name('api.faqs.categories');
        
        // Admin/Staff routes
        Route::middleware(['auth:sanctum', 'role:admin|staff'])->group(function () {
            Route::get('/admin', [FaqController::class, 'index'])
                ->name('api.faqs.index')
                ->middleware('permission:faqs.view');
            
            Route::post('/', [FaqController::class, 'store'])
                ->name('api.faqs.store')
                ->middleware('permission:faqs.create');
            
            Route::get('/statistics', [FaqController::class, 'statistics'])
                ->name('api.faqs.statistics')
                ->middleware('permission:faqs.view');
            
            Route::get('/{faq}', [FaqController::class, 'show'])
                ->name('api.faqs.show');
            
            Route::put('/{faq}', [FaqController::class, 'update'])
                ->name('api.faqs.update')
                ->middleware('permission:faqs.edit');
            
            Route::delete('/{faq}', [FaqController::class, 'destroy'])
                ->name('api.faqs.destroy')
                ->middleware('permission:faqs.delete');
            
            Route::post('/{faq}/toggle', [FaqController::class, 'toggleStatus'])
                ->name('api.faqs.toggle')
                ->middleware('permission:faqs.edit');
            
            Route::post('/{faq}/view', [FaqController::class, 'view'])
                ->name('api.faqs.view');
            
            Route::post('/reorder', [FaqController::class, 'reorder'])
                ->name('api.faqs.reorder')
                ->middleware('permission:faqs.edit');
            
            Route::post('/bulk-delete', [FaqController::class, 'bulkDelete'])
                ->name('api.faqs.bulk-delete')
                ->middleware('permission:faqs.delete');
            
            // Category routes
            Route::post('/categories', [FaqController::class, 'storeCategory'])
                ->name('api.faqs.categories.store')
                ->middleware('permission:faqs.create');
            
            Route::put('/categories/{faqCategory}', [FaqController::class, 'updateCategory'])
                ->name('api.faqs.categories.update')
                ->middleware('permission:faqs.edit');
            
            Route::delete('/categories/{faqCategory}', [FaqController::class, 'destroyCategory'])
                ->name('api.faqs.categories.destroy')
                ->middleware('permission:faqs.delete');
        });
    });
});

/*
|--------------------------------------------------------------------------
| Webhook Routes (No Authentication)
|--------------------------------------------------------------------------
|
| These routes are for payment gateway callbacks and should not require
| authentication but should verify webhook signatures.
|
*/

Route::prefix('webhooks')->group(function () {
    // M-Pesa Webhooks
    Route::post('/mpesa/callback', [App\Http\Controllers\Api\Webhook\MpesaController::class, 'callback'])
        ->name('api.webhooks.mpesa.callback');
    
    Route::post('/mpesa/validation', [App\Http\Controllers\Api\Webhook\MpesaController::class, 'validation'])
        ->name('api.webhooks.mpesa.validation');
    
    // Stripe Webhook
    Route::post('/stripe/webhook', [App\Http\Controllers\Api\Webhook\StripeController::class, 'webhook'])
        ->name('api.webhooks.stripe');
    
    // Pesapal IPN
    Route::get('/pesapal/ipn', [App\Http\Controllers\Api\Webhook\PesapalController::class, 'ipn'])
        ->name('api.webhooks.pesapal.ipn');
    
    // Flutterwave Webhook
    Route::post('/flutterwave/webhook', [App\Http\Controllers\Api\Webhook\FlutterwaveController::class, 'webhook'])
        ->name('api.webhooks.flutterwave');
});
