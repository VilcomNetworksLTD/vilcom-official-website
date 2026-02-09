<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            
            // Basic Information
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            
            // Contact Information
            $table->string('phone')->unique()->nullable();
            $table->string('phone_verified_at')->nullable();
            $table->string('secondary_phone')->nullable();
            
            // Address Information
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('county')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('country')->default('Kenya');
            
            // Business Information (for business clients)
            $table->string('company_name')->nullable();
            $table->string('company_registration')->nullable();
            $table->string('tax_pin')->nullable();
            $table->enum('customer_type', ['individual', 'business'])->default('individual');
            
            // Profile
            $table->string('avatar')->nullable();
            $table->text('bio')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female', 'other', 'prefer_not_to_say'])->nullable();
            
            // Account Status
            $table->enum('status', ['active', 'inactive', 'suspended', 'banned', 'pending_verification'])
                  ->default('pending_verification');
            $table->timestamp('suspended_at')->nullable();
            $table->text('suspension_reason')->nullable();
            
            // Security
            $table->string('two_factor_secret')->nullable();
            $table->text('two_factor_recovery_codes')->nullable();
            $table->boolean('two_factor_enabled')->default(false);
            $table->timestamp('two_factor_confirmed_at')->nullable();
            
            // Password Reset
            $table->string('password_reset_token')->nullable();
            $table->timestamp('password_reset_expires_at')->nullable();
            
            // Preferences
            $table->json('preferences')->nullable(); // Notification preferences, language, etc.
            $table->string('timezone')->default('Africa/Nairobi');
            $table->string('language')->default('en');
            
            // Staff-specific fields
            $table->string('employee_id')->unique()->nullable();
            $table->string('department')->nullable(); // sales, support, technical, web_dev, admin
            $table->decimal('commission_rate', 5, 2)->nullable(); // For sales staff
            $table->boolean('is_team_leader')->default(false);
            $table->foreignId('reports_to')->nullable()->constrained('users')->onDelete('set null');
            
            // Tracking
            $table->timestamp('last_login_at')->nullable();
            $table->string('last_login_ip')->nullable();
            $table->string('last_login_user_agent')->nullable();
            
            // Soft deletes for data retention
            $table->softDeletes();
            
            $table->rememberToken();
            $table->timestamps();
            
            // Indexes
            $table->index('email');
            $table->index('phone');
            $table->index('status');
            $table->index('customer_type');
            $table->index('department');
            $table->index('employee_id');
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
