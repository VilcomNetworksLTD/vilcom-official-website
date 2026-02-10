<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\LogoutController;
use App\Http\Controllers\Api\Auth\PasswordResetController;
use App\Http\Controllers\Api\Auth\RegisterController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Authentication API Routes
|--------------------------------------------------------------------------
|
| These routes handle user authentication including registration, login,
| logout, password reset, and token refresh.
|
*/

Route::prefix('auth')->group(function () {
    // Public routes (no authentication required)
    Route::post('/register', [RegisterController::class, 'register'])->name('auth.register');
    Route::post('/login', [LoginController::class, 'login'])->name('auth.login');
    Route::post('/refresh', [LoginController::class, 'refresh'])->name('auth.refresh');
    
    // Password Reset Routes
    Route::post('/password/email', [PasswordResetController::class, 'sendResetLink'])->name('auth.password.email');
    Route::post('/password/reset', [PasswordResetController::class, 'resetPassword'])->name('auth.password.reset');
    Route::get('/password/verify-token/{token}', [PasswordResetController::class, 'verifyToken'])->name('auth.password.verify-token');
    
    // 2FA Verification (before full login)
    Route::post('/verify-2fa', [LoginController::class, 'verify2FA'])->name('auth.verify-2fa');
    
    // Email Verification
    Route::post('/email/verify/resend', [RegisterController::class, 'resendVerification'])->name('auth.email.verify.resend');
    Route::get('/email/verify/{id}/{hash}', [AuthController::class, 'verifyEmail'])->name('auth.email.verify');

    // Protected routes (authentication required)
    Route::middleware('auth:sanctum')->group(function () {
        // User info
        Route::get('/user', [LoginController::class, 'user'])->name('auth.user');
        
        // Logout
        Route::post('/logout', [LogoutController::class, 'logout'])->name('auth.logout');
        Route::post('/logout-all', [LogoutController::class, 'logoutAll'])->name('auth.logout-all');
        
        // Password Change (authenticated)
        Route::put('/password/change', [PasswordResetController::class, 'changePassword'])->name('auth.password.change');
        
        // 2FA Management
        Route::post('/2fa/enable', [AuthController::class, 'enable2FA'])->name('auth.2fa.enable');
        Route::post('/2fa/confirm', [AuthController::class, 'confirm2FA'])->name('auth.2fa.confirm');
        Route::post('/2fa/disable', [AuthController::class, 'disable2FA'])->name('auth.2fa.disable');
        Route::post('/2fa/verify', [AuthController::class, 'verify2FA'])->name('auth.2fa.verify');
    });
});

/*
|--------------------------------------------------------------------------
| Category API Routes
|--------------------------------------------------------------------------
|
| These routes handle category management including CRUD operations,
| tree structure, and product relationships.
|
*/

Route::prefix('categories')->group(function () {
    // Public routes
    Route::get('/', [App\Http\Controllers\Api\CategoryController::class, 'index'])->name('categories.index');
    Route::get('/tree', [App\Http\Controllers\Api\CategoryController::class, 'tree'])->name('categories.tree');
    Route::get('/{slug}', [App\Http\Controllers\Api\CategoryController::class, 'show'])->name('categories.show');
    Route::get('/{slug}/products', [App\Http\Controllers\Api\CategoryController::class, 'products'])->name('categories.products');
    
    // Protected routes (admin/staff only)
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/', [App\Http\Controllers\Api\CategoryController::class, 'store'])->name('categories.store');
        Route::put('/{category}', [App\Http\Controllers\Api\CategoryController::class, 'update'])->name('categories.update');
        Route::delete('/{category}', [App\Http\Controllers\Api\CategoryController::class, 'destroy'])->name('categories.destroy');
        Route::put('/reorder', [App\Http\Controllers\Api\CategoryController::class, 'reorder'])->name('categories.reorder');
    });
});

/*
|--------------------------------------------------------------------------
| Product API Routes
|--------------------------------------------------------------------------
|
| These routes handle product management including CRUD operations,
| filtering, featured products, and availability checks.
|
*/

Route::prefix('products')->group(function () {
    // Public routes
    Route::get('/', [App\Http\Controllers\Api\ProductController::class, 'index'])->name('products.index');
    Route::get('/featured', [App\Http\Controllers\Api\ProductController::class, 'featured'])->name('products.featured');
    Route::get('/on-promotion', [App\Http\Controllers\Api\ProductController::class, 'onPromotion'])->name('products.promotion');
    Route::get('/category/{categorySlug}', [App\Http\Controllers\Api\ProductController::class, 'byCategory'])->name('products.category');
    Route::get('/{product:slug}', [App\Http\Controllers\Api\ProductController::class, 'show'])->name('products.show');
    Route::get('/{product:slug}/availability', [App\Http\Controllers\Api\ProductController::class, 'checkAvailability'])->name('products.availability');
    Route::get('/{product:slug}/related', [App\Http\Controllers\Api\ProductController::class, 'related'])->name('products.related');
    
    // Protected routes (admin/staff only)
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/', [App\Http\Controllers\Api\ProductController::class, 'store'])->name('products.store');
        Route::put('/{product}', [App\Http\Controllers\Api\ProductController::class, 'update'])->name('products.update');
        Route::delete('/{product}', [App\Http\Controllers\Api\ProductController::class, 'destroy'])->name('products.destroy');
    });
});

/*
|--------------------------------------------------------------------------
| Addon API Routes
|--------------------------------------------------------------------------
|
| These routes handle addon management including CRUD operations
| and product addon associations.
|
*/

Route::prefix('addons')->group(function () {
    // Public routes
    Route::get('/', [App\Http\Controllers\Api\AddonController::class, 'index'])->name('addons.index');
    Route::get('/{addon:slug}', [App\Http\Controllers\Api\AddonController::class, 'show'])->name('addons.show');
    Route::get('/product/{productId}', [App\Http\Controllers\Api\AddonController::class, 'forProduct'])->name('addons.product');
    
    // Protected routes (admin/staff only)
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/', [App\Http\Controllers\Api\AddonController::class, 'store'])->name('addons.store');
        Route::put('/{addon}', [App\Http\Controllers\Api\AddonController::class, 'update'])->name('addons.update');
        Route::delete('/{addon}', [App\Http\Controllers\Api\AddonController::class, 'destroy'])->name('addons.destroy');
    });
});

