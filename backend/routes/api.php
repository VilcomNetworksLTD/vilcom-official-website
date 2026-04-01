<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\LogoutController;
use App\Http\Controllers\Api\Auth\PasswordResetController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\AddonController;
use App\Http\Controllers\Api\QuoteRequestController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\StaffController;
use App\Http\Controllers\Api\Admin\MediaController;
use App\Http\Controllers\Api\Admin\BannerController;
use App\Http\Controllers\Api\Admin\TestimonialController;
use App\Http\Controllers\Api\Admin\FaqController;
use App\Http\Controllers\Api\Admin\TicketController;
use App\Http\Controllers\Api\Admin\AdminSubscriptionController;
use App\Http\Controllers\Api\Admin\ClientController;
use App\Http\Controllers\Api\Admin\QuoteRequestController as AdminQuoteRequestController;
use App\Http\Controllers\Api\CareerApplicationController;
use App\Http\Controllers\Api\Admin\CareerApplicationController as AdminCareerApplicationController;
use App\Http\Controllers\Api\Admin\JobVacancyController;
use App\Http\Controllers\Api\PressArticleController;
use App\Http\Controllers\Api\GalleryController;
use App\Http\Controllers\Api\Admin\PressArticleController as AdminPressArticleController;
use App\Http\Controllers\Api\Admin\GalleryController as AdminGalleryController;
use App\Http\Controllers\Api\PortfolioController;
use App\Http\Controllers\Api\Admin\PortfolioController as AdminPortfolioController;
use App\Http\Controllers\Api\Admin\EmeraldApprovalController;
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
// GALLERY — Public (no auth)
// ============================================
Route::prefix('gallery')->group(function () {
    Route::get('/',           [GalleryController::class, 'index'])
        ->name('api.gallery.index');

    Route::get('/categories', [GalleryController::class, 'categories'])
        ->name('api.gallery.categories');
});



// ============================================
// PORTFOLIO — Public (no auth)
// ============================================
Route::prefix('portfolio')->group(function () {
    Route::get('/',           [PortfolioController::class, 'index'])
        ->name('api.portfolio.index');

    Route::get('/categories', [PortfolioController::class, 'categories'])
        ->name('api.portfolio.categories');
});



// ============================================
// PRESS ARTICLES — Public (no auth)
// ============================================
Route::prefix('press-articles')->group(function () {
    Route::get('/',           [PressArticleController::class, 'index'])
        ->name('api.press-articles.index');

    Route::get('/featured',   [PressArticleController::class, 'featured'])
        ->name('api.press-articles.featured');

    // NOTE: register /categories BEFORE /{pressArticle} so it isn't swallowed
    // as a dynamic segment (same pattern you already use for /products/featured etc.)
    Route::get('/categories', [PressArticleController::class, 'categories'])
        ->name('api.press-articles.categories');
});

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

            // Update current authenticated user's profile (Profile Settings)
            Route::put('/user', [App\Http\Controllers\Api\UserController::class, 'updateCurrent'])
                ->name('api.auth.user.update');

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
    // QUOTE REQUEST ROUTES (Public & Authenticated)
    // ============================================
    Route::prefix('quotes')->group(function () {
        // Public routes
        Route::get('/service-types', [QuoteRequestController::class, 'serviceTypes'])
            ->name('api.quotes.service-types');

        Route::get('/technical-fields', [QuoteRequestController::class, 'technicalFields'])
            ->name('api.quotes.technical-fields');

        Route::get('/options', [QuoteRequestController::class, 'options'])
            ->name('api.quotes.options');

        // Submit quote request (public - no auth required)
        Route::post('/', [QuoteRequestController::class, 'store'])
            ->name('api.quotes.store');

        // Authenticated routes - User's quotes
        Route::middleware('auth:sanctum')->group(function () {
            Route::get('/', [QuoteRequestController::class, 'index'])
                ->name('api.quotes.index');

            Route::get('/{quoteNumber}', [QuoteRequestController::class, 'show'])
                ->name('api.quotes.show');

            Route::post('/{quoteNumber}/respond', [QuoteRequestController::class, 'respond'])
                ->name('api.quotes.respond');
            Route::post('/{quoteNumber}/resend', [QuoteRequestController::class, 'resend'])
                ->name('api.quotes.resend');
        });
    });

    // ============================================
    // ADMIN QUOTE MANAGEMENT ROUTES
    // ============================================
    Route::prefix('admin/quotes')->middleware(['auth:sanctum', 'role:admin|staff'])->group(function () {
        Route::get('/', [AdminQuoteRequestController::class, 'index'])
            ->name('api.admin.quotes.index');

        Route::get('/statistics', [AdminQuoteRequestController::class, 'statistics'])
            ->name('api.admin.quotes.statistics');

        Route::get('/staff', [AdminQuoteRequestController::class, 'staff'])
            ->name('api.admin.quotes.staff');

        Route::get('/{id}', [AdminQuoteRequestController::class, 'show'])
            ->name('api.admin.quotes.show');

        Route::post('/{id}/mark-review', [AdminQuoteRequestController::class, 'markUnderReview'])
            ->name('api.admin.quotes.mark-review');

        Route::post('/{id}/quote', [AdminQuoteRequestController::class, 'submitQuote'])
            ->name('api.admin.quotes.submit-quote');

        Route::post('/{id}/resend', [AdminQuoteRequestController::class, 'resend'])
            ->name('api.admin.quotes.resend');

        Route::post('/{id}/assign', [AdminQuoteRequestController::class, 'assign'])
            ->name('api.admin.quotes.assign');

        Route::put('/{id}', [AdminQuoteRequestController::class, 'update'])
            ->name('api.admin.quotes.update');

        Route::post('/{id}/convert', [AdminQuoteRequestController::class, 'convertToSubscription'])
            ->name('api.admin.quotes.convert');

        Route::delete('/{id}', [AdminQuoteRequestController::class, 'destroy'])
            ->name('api.admin.quotes.destroy')
            ->middleware('role:admin');
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

        Route::post('/{user}/provision-emerald', [App\Http\Controllers\Api\UserController::class, 'provisionEmerald'])
            ->name('api.users.provision-emerald');

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
        ->name('api.users.impersonation-status.public')
        ->middleware('auth:sanctum');

    // ============================================
    // CLIENTS MANAGEMENT ROUTES (Admin/Staff Only)
    // ============================================
    Route::prefix('admin/clients')->middleware(['auth:sanctum', 'role:admin|staff'])->group(function () {
        Route::post('/convert', [ClientController::class, 'convert'])
            ->name('api.admin.clients.convert');

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
    // EMERALD APPROVALS ROUTES (Admin/Staff Only)
    // ============================================
    Route::prefix('admin/emerald-approvals')->middleware(['auth:sanctum', 'role:admin|staff'])->group(function () {
        Route::get('/', [EmeraldApprovalController::class, 'index'])
            ->name('api.admin.emerald-approvals.index');

        Route::get('/statistics', [EmeraldApprovalController::class, 'statistics'])
            ->name('api.admin.emerald-approvals.statistics');

        Route::get('/{user}', [EmeraldApprovalController::class, 'show'])
            ->name('api.admin.emerald-approvals.show');

        Route::post('/{user}/approve', [EmeraldApprovalController::class, 'approve'])
            ->name('api.admin.emerald-approvals.approve');

        Route::post('/{user}/reject', [EmeraldApprovalController::class, 'reject'])
            ->name('api.admin.emerald-approvals.reject');
    });

    // ============================================
    // VILCOM SAFETIKA PROVISIONING ROUTES (Admin/Staff Only)
    // Monitor & re-trigger the new production API provisioning flow
    // ============================================
    Route::prefix('admin/vilcom-safetika')->middleware(['auth:sanctum', 'role:admin|staff'])->group(function () {
        Route::get('/', [App\Http\Controllers\Api\Admin\VilcomSafetikaController::class, 'index'])
            ->name('api.admin.vilcom-safetika.index');

        Route::get('/statistics', [App\Http\Controllers\Api\Admin\VilcomSafetikaController::class, 'statistics'])
            ->name('api.admin.vilcom-safetika.statistics');

        Route::get('/{user}', [App\Http\Controllers\Api\Admin\VilcomSafetikaController::class, 'show'])
            ->name('api.admin.vilcom-safetika.show');

        Route::post('/{user}/reprovision', [App\Http\Controllers\Api\Admin\VilcomSafetikaController::class, 'reprovision'])
            ->name('api.admin.vilcom-safetika.reprovision');
    });

    // ============================================
    // RECENT ACTIVITIES (Admin/Staff)
    // ============================================
    Route::prefix('admin/activities')->middleware(['auth:sanctum', 'role:admin|staff'])->group(function () {
        Route::get('/', [App\Http\Controllers\Api\Admin\ActivityController::class, 'index'])
            ->name('api.admin.activities.index');
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

    // Public routes for staff invitations (no auth required)
    Route::get('/staff-invitations/{token}', [App\Http\Controllers\Api\Admin\InvitationController::class, 'show'])
        ->name('api.staff-invitations.show');

    Route::post('/staff-invitations/accept', [App\Http\Controllers\Api\Admin\InvitationController::class, 'accept'])
        ->name('api.staff-invitations.accept');

    // ============================================
    // ROLES & PERMISSIONS MANAGEMENT (Admin Only)
    // ============================================
    Route::prefix('admin/roles')->middleware(['auth:sanctum', 'role:admin'])->group(function () {
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

        Route::post('/{role}/permissions', [App\Http\Controllers\Api\Admin\RoleController::class, 'assignPermissions'])
            ->name('api.admin.roles.permissions.assign')
            ->middleware('permission:permissions.assign');

        Route::delete('/{role}/permissions', [App\Http\Controllers\Api\Admin\RoleController::class, 'revokePermissions'])
            ->name('api.admin.roles.permissions.revoke')
            ->middleware('permission:permissions.assign');

        Route::get('/{role}/users', [App\Http\Controllers\Api\Admin\RoleController::class, 'users'])
            ->name('api.admin.roles.users')
            ->middleware('permission:users.view.all');
    });

    // ============================================
    // USER-LEVEL PERMISSIONS (Admin Only)
    // Lets admin grant/revoke individual permissions on a specific staff user
    // on top of what their role already gives them.
    // ============================================
    Route::prefix('admin/users/{user}/permissions')->middleware(['auth:sanctum', 'role:admin'])->group(function () {
        Route::get('/', [App\Http\Controllers\Api\Admin\RoleController::class, 'userPermissions'])
            ->name('api.admin.users.permissions.index')
            ->middleware('permission:permissions.view');

        Route::post('/', [App\Http\Controllers\Api\Admin\RoleController::class, 'assignUserPermissions'])
            ->name('api.admin.users.permissions.assign')
            ->middleware('permission:permissions.assign');

        Route::delete('/', [App\Http\Controllers\Api\Admin\RoleController::class, 'revokeUserPermissions'])
            ->name('api.admin.users.permissions.revoke')
            ->middleware('permission:permissions.assign');

        Route::post('/sync', [App\Http\Controllers\Api\Admin\RoleController::class, 'syncUserPermissions'])
            ->name('api.admin.users.permissions.sync')
            ->middleware('permission:permissions.assign');
    });

    // ============================================
    // USER ROLE MANAGEMENT (Admin Only)
    // ============================================
    Route::prefix('admin/users/{user}/role')->middleware(['auth:sanctum', 'role:admin'])->group(function () {
        Route::put('/', [App\Http\Controllers\Api\Admin\RoleController::class, 'updateUserRole'])
            ->name('api.admin.users.role.update')
            ->middleware('permission:roles.edit');
    });

// ✅ CORRECT STRUCTURE
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

    Route::get('/zones', [App\Http\Controllers\Api\CoverageCheckerController::class, 'publicZones'])
        ->name('api.coverage.zones');
});

// ============================================
// ADMIN COVERAGE ROUTES (Moved OUT of public group)
// ============================================
Route::prefix('admin/coverage')->middleware(['auth:sanctum', 'role:admin|staff'])->group(function () {
    Route::apiResource('zones', App\Http\Controllers\Api\Admin\CoverageZoneController::class);

    Route::get('zones/{zone}/products', [App\Http\Controllers\Api\Admin\CoverageZoneController::class, 'zoneProducts']);
    Route::post('zones/{zone}/products', [App\Http\Controllers\Api\Admin\CoverageZoneController::class, 'attachProduct']);
    Route::put('zones/{zone}/products/{product}', [App\Http\Controllers\Api\Admin\CoverageZoneController::class, 'updateZoneProduct']);
    Route::delete('zones/{zone}/products/{product}', [App\Http\Controllers\Api\Admin\CoverageZoneController::class, 'detachProduct']);

    Route::get('zones/{zone}/packages', [App\Http\Controllers\Api\Admin\CoverageZoneController::class, 'zonePackages']);
    Route::post('zones/{zone}/packages', [App\Http\Controllers\Api\Admin\CoverageZoneController::class, 'storePackage']);
    Route::put('zones/{zone}/packages/{package}', [App\Http\Controllers\Api\Admin\CoverageZoneController::class, 'updatePackage']);
    Route::delete('zones/{zone}/packages/{package}', [App\Http\Controllers\Api\Admin\CoverageZoneController::class, 'destroyPackage']);

    Route::get('interest-signups', [App\Http\Controllers\Api\Admin\CoverageZoneController::class, 'interestSignups']);
    Route::put('interest-signups/{signup}/status', [App\Http\Controllers\Api\Admin\CoverageZoneController::class, 'updateSignupStatus']);

    Route::get('analytics', [App\Http\Controllers\Api\Admin\CoverageZoneController::class, 'analytics']);
    Route::get('check-logs', [App\Http\Controllers\Api\Admin\CoverageZoneController::class, 'checkLogs']);

    // Region GeoJSON files (served from storage/app/geojson/)
    Route::get('regions', [App\Http\Controllers\Api\Admin\CoverageZoneController::class, 'regionsList']);
    Route::get('regions/{region}', [App\Http\Controllers\Api\Admin\CoverageZoneController::class, 'regionGeojson']);
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
    Route::get('/media/public', [MediaController::class, 'publicIndex'])
        ->name('api.media.public');

    // ============================================
    // BANNER / SLIDER MANAGEMENT (Admin Only)
    // ============================================
    Route::prefix('banners')->group(function () {
        Route::get('/active', [BannerController::class, 'active'])
            ->name('api.banners.active');

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
        Route::get('/', [TestimonialController::class, 'publicIndex'])
            ->name('api.testimonials.public');

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
        Route::get('/', [FaqController::class, 'publicIndex'])
            ->name('api.faqs.public');

        Route::get('/categories', [FaqController::class, 'categories'])
            ->name('api.faqs.categories');

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

    // ============================================
    // CAREER APPLICATION ROUTES (Public & Admin)
    // ============================================
    Route::prefix('careers')->group(function () {
        Route::get('/positions', [CareerApplicationController::class, 'jobPositions'])
            ->name('api.careers.positions');

        Route::get('/statuses', [CareerApplicationController::class, 'statuses'])
            ->name('api.careers.statuses');

        Route::post('/apply', [CareerApplicationController::class, 'store'])
            ->name('api.careers.apply');

        Route::post('/check-status', [CareerApplicationController::class, 'checkStatus'])
            ->name('api.careers.check-status');

        Route::post('/withdraw', [CareerApplicationController::class, 'withdraw'])
            ->name('api.careers.withdraw');
    });

    // ============================================
    // ADMIN CAREER APPLICATION MANAGEMENT ROUTES
    // ============================================
    Route::prefix('admin/careers')->middleware(['auth:sanctum', 'role:admin|staff|hr'])->group(function () {
        Route::get('/', [AdminCareerApplicationController::class, 'index'])
            ->name('api.admin.careers.index');

        Route::get('/statistics', [AdminCareerApplicationController::class, 'statistics'])
            ->name('api.admin.careers.statistics');

        Route::get('/job-titles', [AdminCareerApplicationController::class, 'jobTitles'])
            ->name('api.admin.careers.job-titles');

        Route::get('/{id}', [AdminCareerApplicationController::class, 'show'])
            ->name('api.admin.careers.show');

        Route::post('/{id}/status', [AdminCareerApplicationController::class, 'updateStatus'])
            ->name('api.admin.careers.update-status');

        Route::put('/{id}/notes', [AdminCareerApplicationController::class, 'updateNotes'])
            ->name('api.admin.careers.update-notes');

        Route::get('/{id}/download/cv', [AdminCareerApplicationController::class, 'downloadCv'])
            ->name('api.admin.careers.download-cv');

        Route::get('/{id}/download/certificates', [AdminCareerApplicationController::class, 'downloadCertificates'])
            ->name('api.admin.careers.download-certificates');

        Route::get('/{id}/download/additional', [AdminCareerApplicationController::class, 'downloadAdditionalDocuments'])
            ->name('api.admin.careers.download-additional');

        Route::delete('/{id}', [AdminCareerApplicationController::class, 'destroy'])
            ->name('api.admin.careers.destroy')
            ->middleware('role:admin');

        Route::post('/bulk-update', [AdminCareerApplicationController::class, 'bulkUpdateStatus'])
            ->name('api.admin.careers.bulk-update');
    });

    // ADMIN JOB VACANCIES MANAGEMENT ROUTES
    Route::prefix('admin/vacancies')->middleware(['auth:sanctum', 'role:admin|staff|hr'])->group(function () {
        Route::get('/', [JobVacancyController::class, 'index'])
            ->name('api.admin.vacancies.index');

        Route::post('/', [JobVacancyController::class, 'store'])
            ->name('api.admin.vacancies.store');

        Route::get('/{id}', [JobVacancyController::class, 'show'])
            ->name('api.admin.vacancies.show');

        Route::put('/{id}', [JobVacancyController::class, 'update'])
            ->name('api.admin.vacancies.update');

        Route::delete('/{id}', [JobVacancyController::class, 'destroy'])
            ->name('api.admin.vacancies.destroy')
            ->middleware('role:admin');
    });

    // PUBLIC JOB VACANCIES (active only)
    Route::get('/vacancies', function () {
        $vacancies = \App\Models\JobVacancy::where('status', 'active')
            ->orderBy('created_at', 'desc')
            ->get(['id', 'title', 'department', 'location', 'type', 'description', 'requirements', 'deadline']);
        return response()->json(['success' => true, 'data' => $vacancies]);
    })->name('api.vacancies.public');

    // ============================================
    // BOOKING ROUTES (Public & Authenticated)
    // ============================================
    Route::prefix('bookings')->group(function () {
        // ── Public (no auth required) ─────────────────────────────────────
        Route::get('/services', [BookingController::class, 'bookableServices'])
            ->name('bookings.services');

        Route::get('/available-slots', [BookingController::class, 'availableSlots'])
            ->name('bookings.slots');

        Route::get('/track/{reference}', [BookingController::class, 'track'])
            ->name('bookings.track');

        Route::post('/', [BookingController::class, 'store'])
            ->name('bookings.store');

        // ── Authenticated (requires login) ────────────────────────────────
        Route::middleware('auth:sanctum')->group(function () {
            Route::get('/', [BookingController::class, 'index'])
                ->name('bookings.index');

            Route::get('/meta/statistics', [BookingController::class, 'statistics'])
                ->name('bookings.statistics');

            Route::get('/{booking}', [BookingController::class, 'show'])
                ->name('bookings.show');

            Route::patch('/{booking}/status', [BookingController::class, 'updateStatus'])
                ->name('bookings.status');

            Route::post('/{booking}/cancel', [BookingController::class, 'cancel'])
                ->name('bookings.cancel');
        });
    });

    // Public staff list for the "choose a consultant" dropdown
    Route::get('/staff/consultants', [StaffController::class, 'consultants'])
        ->name('staff.consultants');

        // ============================================
    // WHATSAPP MESSAGE ROUTES (Public)
    // ============================================
    Route::prefix('whatsapp')->group(function () {
        Route::get('/options', [App\Http\Controllers\Api\WhatsappMessageController::class, 'options'])
            ->name('api.whatsapp.options');

        Route::post('/messages', [App\Http\Controllers\Api\WhatsappMessageController::class, 'store'])
            ->name('api.whatsapp.messages.store');
    });

    // ============================================
    // ADMIN WHATSAPP MESSAGE ROUTES (Separated)
    // ============================================
    Route::prefix('admin/whatsapp')->middleware(['auth:sanctum', 'role:admin|staff'])->group(function () {
        Route::get('/messages', [App\Http\Controllers\Api\Admin\WhatsappMessageController::class, 'index'])
            ->name('api.admin.whatsapp.messages.index');

        Route::get('/messages/statistics', [App\Http\Controllers\Api\Admin\WhatsappMessageController::class, 'statistics'])
            ->name('api.admin.whatsapp.messages.statistics');

        Route::get('/messages/{id}', [App\Http\Controllers\Api\Admin\WhatsappMessageController::class, 'show'])
            ->name('api.admin.whatsapp.messages.show');

        Route::put('/messages/{id}', [App\Http\Controllers\Api\Admin\WhatsappMessageController::class, 'update'])
            ->name('api.admin.whatsapp.messages.update');

        Route::post('/messages/{id}/contacted', [App\Http\Controllers\Api\Admin\WhatsappMessageController::class, 'markContacted'])
            ->name('api.admin.whatsapp.messages.contacted');

        Route::post('/messages/{id}/converted', [App\Http\Controllers\Api\Admin\WhatsappMessageController::class, 'markConverted'])
            ->name('api.admin.whatsapp.messages.converted');

        Route::delete('/messages/{id}', [App\Http\Controllers\Api\Admin\WhatsappMessageController::class, 'destroy'])
            ->name('api.admin.whatsapp.messages.destroy')
            ->middleware('role:admin');
    });

 // ✅ CORRECT STRUCTURE
// ============================================
// CONTACT MESSAGE ROUTES (Public)
// ============================================
Route::prefix('contact')->group(function () {
    Route::post('/messages', [App\Http\Controllers\Api\ContactMessageController::class, 'store'])
        ->name('api.contact.messages.store');

    Route::get('/departments', [App\Http\Controllers\Api\ContactMessageController::class, 'departments'])
        ->name('api.contact.departments');
});

// ============================================
// ADMIN CONTACT ROUTES (Moved OUT of public group)
// ============================================
Route::prefix('admin/contact')->middleware(['auth:sanctum', 'role:admin|staff'])->group(function () {
    Route::get('/messages', [App\Http\Controllers\Api\Admin\ContactMessageController::class, 'index'])
        ->name('api.admin.contact.messages.index');

    Route::get('/messages/statistics', [App\Http\Controllers\Api\Admin\ContactMessageController::class, 'statistics'])
        ->name('api.admin.contact.messages.statistics');

    Route::get('/messages/staff', [App\Http\Controllers\Api\Admin\ContactMessageController::class, 'staff'])
        ->name('api.admin.contact.messages.staff');

    Route::get('/messages/{id}', [App\Http\Controllers\Api\Admin\ContactMessageController::class, 'show'])
        ->name('api.admin.contact.messages.show');

    Route::put('/messages/{id}', [App\Http\Controllers\Api\Admin\ContactMessageController::class, 'update'])
        ->name('api.admin.contact.messages.update');

    Route::post('/messages/{id}/contacted', [App\Http\Controllers\Api\Admin\ContactMessageController::class, 'markContacted'])
        ->name('api.admin.contact.messages.contacted');

    Route::post('/messages/{id}/resolved', [App\Http\Controllers\Api\Admin\ContactMessageController::class, 'markResolved'])
        ->name('api.admin.contact.messages.resolved');

    Route::delete('/messages/{id}', [App\Http\Controllers\Api\Admin\ContactMessageController::class, 'destroy'])
        ->name('api.admin.contact.messages.destroy')
        ->middleware('role:admin');
});

    // ============================================
    // STAFF AVAILABILITY ROUTES
    // ============================================
    Route::prefix('staff')->group(function () {
        Route::get('/{user}/availability', [StaffController::class, 'availability'])
            ->name('staff.availability');

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('/{user}/availability', [StaffController::class, 'updateAvailability'])
                ->name('staff.availability.update');
        });
    });

    // ============================================
    // LEAD TRACKING ROUTES (Public - No Auth)
    // ============================================
    Route::prefix('leads')->group(function () {
        Route::post('/track-visit', [App\Http\Controllers\Api\LeadController::class, 'trackVisit'])
            ->name('api.leads.track-visit');

        Route::post('/capture', [App\Http\Controllers\Api\LeadController::class, 'capture'])
            ->name('api.leads.capture');

        Route::post('/waitlist', [App\Http\Controllers\Api\LeadController::class, 'waitlist'])
            ->name('api.leads.waitlist');

        Route::post('/newsletter', [App\Http\Controllers\Api\LeadController::class, 'newsletter'])
            ->name('api.leads.newsletter');

        Route::post('/abandonment', [App\Http\Controllers\Api\LeadController::class, 'captureAbandonment'])
            ->name('api.leads.abandonment');

        Route::get('/visitor-id', [App\Http\Controllers\Api\LeadController::class, 'generateVisitorId'])
            ->name('api.leads.visitor-id');
    });

    // ============================================
    // ADMIN LEAD MANAGEMENT ROUTES
    // ============================================
    Route::prefix('admin/leads')->middleware(['auth:sanctum', 'role:admin|staff'])->group(function () {
        Route::get('/', [App\Http\Controllers\Api\Admin\LeadController::class, 'index'])
            ->name('api.admin.leads.index');

        Route::get('/statistics', [App\Http\Controllers\Api\Admin\LeadController::class, 'statistics'])
            ->name('api.admin.leads.statistics');

        Route::get('/staff', [App\Http\Controllers\Api\Admin\LeadController::class, 'staff'])
            ->name('api.admin.leads.staff');

        Route::get('/{id}', [App\Http\Controllers\Api\Admin\LeadController::class, 'show'])
            ->name('api.admin.leads.show');

        Route::put('/{id}', [App\Http\Controllers\Api\Admin\LeadController::class, 'update'])
            ->name('api.admin.leads.update');

        Route::post('/{id}/status', [App\Http\Controllers\Api\Admin\LeadController::class, 'updateStatus'])
            ->name('api.admin.leads.status');

        Route::post('/{id}/assign', [App\Http\Controllers\Api\Admin\LeadController::class, 'assign'])
            ->name('api.admin.leads.assign');

        Route::post('/{id}/auto-assign', [App\Http\Controllers\Api\Admin\LeadController::class, 'autoAssign'])
            ->name('api.admin.leads.auto-assign');

        Route::post('/{id}/convert', [App\Http\Controllers\Api\Admin\LeadController::class, 'convert'])
            ->name('api.admin.leads.convert');

        Route::delete('/{id}', [App\Http\Controllers\Api\Admin\LeadController::class, 'destroy'])
            ->name('api.admin.leads.destroy')
            ->middleware('role:admin');

        Route::get('/{id}/duplicates', [App\Http\Controllers\Api\Admin\LeadController::class, 'duplicates'])
            ->name('api.admin.leads.duplicates');

        Route::post('/{id}/merge', [App\Http\Controllers\Api\Admin\LeadController::class, 'merge'])
            ->name('api.admin.leads.merge');

        Route::post('/bulk-assign', [App\Http\Controllers\Api\Admin\LeadController::class, 'bulkAssign'])
            ->name('api.admin.leads.bulk-assign');
    });

    // ============================================
    // ADMIN INVOICE MANAGEMENT
    // ============================================
    Route::prefix('admin/invoices')->middleware(['auth:sanctum', 'role:admin|staff'])->group(function () {
        Route::get('/analytics', [App\Http\Controllers\Api\Admin\InvoiceController::class, 'analytics'])
            ->name('api.admin.invoices.analytics');

        Route::get('/', [App\Http\Controllers\Api\Admin\InvoiceController::class, 'index'])
            ->name('api.admin.invoices.index');

        Route::post('/', [App\Http\Controllers\Api\Admin\InvoiceController::class, 'store'])
            ->name('api.admin.invoices.store');

        Route::get('/{invoice}', [App\Http\Controllers\Api\Admin\InvoiceController::class, 'show'])
            ->name('api.admin.invoices.show');

        Route::put('/{invoice}', [App\Http\Controllers\Api\Admin\InvoiceController::class, 'update'])
            ->name('api.admin.invoices.update');

        Route::post('/{invoice}/send', [App\Http\Controllers\Api\Admin\InvoiceController::class, 'send'])
            ->name('api.admin.invoices.send');

        Route::post('/{invoice}/mark-paid', [App\Http\Controllers\Api\Admin\InvoiceController::class, 'markPaid'])
            ->name('api.admin.invoices.mark-paid');

        Route::post('/{invoice}/void', [App\Http\Controllers\Api\Admin\InvoiceController::class, 'void'])
            ->name('api.admin.invoices.void');

        Route::get('/{invoice}/download', [App\Http\Controllers\Api\Admin\InvoiceController::class, 'download'])
            ->name('api.admin.invoices.download');
    });

    // ============================================
    // ADMIN TICKET MANAGEMENT
    // ============================================
    Route::prefix('admin/tickets')->middleware(['auth:sanctum', 'role:admin|staff|technical_support'])->group(function () {
        Route::get('/analytics', [App\Http\Controllers\Api\Admin\TicketController::class, 'analytics'])
            ->name('api.admin.tickets.analytics');

        Route::get('/staff', [App\Http\Controllers\Api\Admin\TicketController::class, 'staff'])
            ->name('api.admin.tickets.staff');

        Route::get('/', [App\Http\Controllers\Api\Admin\TicketController::class, 'index'])
            ->name('api.admin.tickets.index');

        Route::get('/{ticket}', [App\Http\Controllers\Api\Admin\TicketController::class, 'show'])
            ->name('api.admin.tickets.show');

        Route::post('/{ticket}/reply', [App\Http\Controllers\Api\Admin\TicketController::class, 'reply'])
            ->name('api.admin.tickets.reply');

        Route::post('/{ticket}/assign', [App\Http\Controllers\Api\Admin\TicketController::class, 'assign'])
            ->name('api.admin.tickets.assign');

        Route::post('/{ticket}/resolve', [App\Http\Controllers\Api\Admin\TicketController::class, 'resolve'])
            ->name('api.admin.tickets.resolve');

        Route::post('/{ticket}/close', [App\Http\Controllers\Api\Admin\TicketController::class, 'close'])
            ->name('api.admin.tickets.close');

        Route::post('/{ticket}/reopen', [App\Http\Controllers\Api\Admin\TicketController::class, 'reopen'])
            ->name('api.admin.tickets.reopen');

        Route::post('/{ticket}/internal-note', [App\Http\Controllers\Api\Admin\TicketController::class, 'addInternalNote'])
            ->name('api.admin.tickets.internal-note');
    });

    // ============================================
    // CLIENT DASHBOARD ROUTES
    // ============================================
    Route::prefix('client')->middleware('auth:sanctum')->group(function () {

        // Full dashboard — user + service + payment info + stats
        Route::get('/dashboard', [
            App\Http\Controllers\Api\Client\DashboardController::class,
            'index',
        ])->name('api.client.dashboard');

        // Lightweight service status poll (called every 30s by React)
        Route::get('/service-status', [
            App\Http\Controllers\Api\Client\DashboardController::class,
            'serviceStatus',
        ])->name('api.client.service-status');

        // Paginated invoices
        Route::get('/invoices', [
            App\Http\Controllers\Api\Client\DashboardController::class,
            'invoices',
        ])->name('api.client.invoices');

        // Paginated payments
        Route::get('/payments', [
            App\Http\Controllers\Api\Client\DashboardController::class,
            'payments',
        ])->name('api.client.payments');

    });





// ============================================
// PRESS ARTICLES — Admin
// ============================================
Route::prefix('admin/press-articles')
    ->middleware(['auth:sanctum', 'role:admin|staff'])
    ->group(function () {
        Route::get('/',    [AdminPressArticleController::class, 'index'])
            ->name('api.admin.press-articles.index');

        Route::post('/',   [AdminPressArticleController::class, 'store'])
            ->name('api.admin.press-articles.store');

        Route::get('/{pressArticle}',    [AdminPressArticleController::class, 'show'])
            ->name('api.admin.press-articles.show');

        Route::put('/{pressArticle}',    [AdminPressArticleController::class, 'update'])
            ->name('api.admin.press-articles.update');

        Route::delete('/{pressArticle}', [AdminPressArticleController::class, 'destroy'])
            ->name('api.admin.press-articles.destroy');

        Route::post('/{pressArticle}/toggle-publish',  [AdminPressArticleController::class, 'togglePublish'])
            ->name('api.admin.press-articles.toggle-publish');

        Route::post('/{pressArticle}/toggle-featured', [AdminPressArticleController::class, 'toggleFeatured'])
            ->name('api.admin.press-articles.toggle-featured');
    });





// ============================================
// GALLERY — Admin
// ============================================
Route::prefix('admin/gallery')
    ->middleware(['auth:sanctum', 'role:admin|staff'])
    ->group(function () {
        Route::get('/',    [AdminGalleryController::class, 'index'])
            ->name('api.admin.gallery.index');

        Route::post('/',   [AdminGalleryController::class, 'store'])
            ->name('api.admin.gallery.store');

        // NOTE: /reorder must be registered before /{galleryItem}
        Route::post('/reorder', [AdminGalleryController::class, 'reorder'])
            ->name('api.admin.gallery.reorder');

        Route::get('/{galleryItem}',    [AdminGalleryController::class, 'show'])
            ->name('api.admin.gallery.show');

        Route::put('/{galleryItem}',    [AdminGalleryController::class, 'update'])
            ->name('api.admin.gallery.update');

        Route::delete('/{galleryItem}', [AdminGalleryController::class, 'destroy'])
            ->name('api.admin.gallery.destroy');

        Route::post('/{galleryItem}/toggle-publish', [AdminGalleryController::class, 'togglePublish'])
            ->name('api.admin.gallery.toggle-publish');
    });



// ============================================
// PORTFOLIO — Admin
// ============================================
Route::prefix('admin/portfolio')
    ->middleware(['auth:sanctum', 'role:admin|staff'])
    ->group(function () {
        Route::get('/',    [AdminPortfolioController::class, 'index'])
            ->name('api.admin.portfolio.index');

        Route::post('/',   [AdminPortfolioController::class, 'store'])
            ->name('api.admin.portfolio.store');

        Route::post('/reorder', [AdminPortfolioController::class, 'reorder'])
            ->name('api.admin.portfolio.reorder');

        Route::get('/{portfolio}',    [AdminPortfolioController::class, 'show'])
            ->name('api.admin.portfolio.show');

        Route::put('/{portfolio}',    [AdminPortfolioController::class, 'update'])
            ->name('api.admin.portfolio.update');

        Route::delete('/{portfolio}', [AdminPortfolioController::class, 'destroy'])
            ->name('api.admin.portfolio.destroy');

        Route::post('/{portfolio}/toggle-publish', [AdminPortfolioController::class, 'togglePublish'])
            ->name('api.admin.portfolio.toggle-publish');
    });

    // ============================================
    // ANALYTICS ROUTES
    // ============================================
    Route::prefix('analytics')->group(function () {
        // Public route for tracking visits
        Route::post('/track', [App\Http\Controllers\Api\AnalyticsController::class, 'track'])
            ->name('api.analytics.track');
    });

    // Admin analytics viewer
    Route::prefix('admin/analytics')->middleware(['auth:sanctum', 'role:admin|staff'])->group(function () {
        Route::get('/visitors', [App\Http\Controllers\Api\AnalyticsController::class, 'getAdminAnalytics'])
            ->name('api.admin.analytics.visitors');
    });

}); // END Route::prefix('v1')

/*
|--------------------------------------------------------------------------
| Webhook Routes (No Authentication — outside v1 prefix intentionally)
|--------------------------------------------------------------------------
|
| These routes are for payment gateway callbacks and should not require
| authentication but should verify webhook signatures.
|
*/

Route::prefix('webhooks')->group(function () {

    // ── STK Push callback (customer enters PIN) ───────────────────────────────
    Route::post('/mpesa/callback', [
        App\Http\Controllers\Api\Webhook\MpesaController::class,
        'callback',
    ])->name('api.webhooks.mpesa.callback');

    // ── C2B Paybill callbacks ─────────────────────────────────────────────────
    // Called by Safaricom when customer pays via M-Pesa → Lipa na M-Pesa → Pay Bill
    Route::post('/mpesa/c2b/confirmation', [
        App\Http\Controllers\Api\Webhook\MpesaController::class,
        'confirmation',
    ])->name('api.webhooks.mpesa.c2b.confirmation');

    Route::post('/mpesa/c2b/validation', [
        App\Http\Controllers\Api\Webhook\MpesaController::class,
        'validation',
    ])->name('api.webhooks.mpesa.c2b.validation');

    // Pesapal IPN
    Route::get('/pesapal/ipn', [
        App\Http\Controllers\Api\Webhook\PesapalController::class,
        'ipn',
    ])->name('api.webhooks.pesapal.ipn');

    // Flutterwave
    Route::post('/flutterwave/webhook', [
        App\Http\Controllers\Api\Webhook\FlutterwaveController::class,
        'webhook',
    ])->name('api.webhooks.flutterwave');
});


