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

