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
        Schema::create('quote_requests', function (Blueprint $table) {
            $table->id();
            
            // Link to user (optional - can be guest)
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            
            // Link to product if applicable
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            
            // Quote details
            $table->string('quote_number')->unique();

            $table->enum('service_type', [
                'internet_plan',
                'hosting_package',
                'web_development',
                'cloud_services',
                'cyber_security',
                'network_infrastructure',
                'isp_services',
                'cpe_device',
                'satellite_connectivity',
                'media_services',
                'erp_services',
                'smart_integration',
                'other'
            ]);

            // Status tracking
            $table->enum('status', [
                'pending',
                'under_review',
                'quoted',
                'accepted',
                'rejected',
                'expired',
                'converted_to_subscription'
            ])->default('pending');

            // General Information
            $table->json('general_info')->nullable()->comment('Company details, contact info, project overview');

            // Technical requirements
            $table->json('technical_requirements')->nullable()->comment('Technical specs based on service type');

            // Budget and timeline
            $table->string('budget_range')->nullable();
            $table->string('timeline')->nullable();
            $table->date('preferred_start_date')->nullable();

            // Staff response
            $table->foreignId('assigned_staff_id')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('quoted_price', 12, 2)->nullable();
            $table->text('staff_notes')->nullable();
            $table->text('admin_response')->nullable()->comment('Response message to customer');
            $table->timestamp('quoted_at')->nullable();
            $table->timestamp('responded_at')->nullable();

            // Quote validity
            $table->timestamp('quote_valid_until')->nullable();

            // Customer response
            $table->enum('customer_response', ['pending', 'accepted', 'rejected'])->default('pending')->nullable();
            $table->text('customer_notes')->nullable();
            $table->timestamp('customer_responded_at')->nullable();

            // Conversion
            $table->foreignId('subscription_id')->nullable()->constrained()->nullOnDelete();

            // Contact preferences
            $table->string('contact_name');
            $table->string('contact_email');
            $table->string('contact_phone')->nullable();
            $table->string('company_name')->nullable();
            $table->text('additional_notes')->nullable();

            // Urgency
            $table->enum('urgency', ['low', 'medium', 'high', 'critical'])->default('medium');

            // Source tracking
            $table->string('source')->nullable()->comment('web, mobile, referral');
            $table->string('referral_source')->nullable();

            $table->timestamps();

            // Indexes
            $table->index('status');
            $table->index('service_type');
            $table->index('quote_number');
            $table->index('created_at');
            $table->index(['status', 'created_at']);
            $table->index('user_id');
            $table->index('product_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quote_requests');
    }
};