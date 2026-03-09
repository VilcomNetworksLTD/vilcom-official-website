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
        Schema::create('leads', function (Blueprint $table) {
            $table->id();

            // Unique visitor identifier (UUID)
            $table->uuid('vlc_vid')->unique()->nullable()->index();

            // Link to user (optional - can be guest lead)
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            // Link to product if applicable
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();

            // Contact information
            $table->string('name')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('company_name')->nullable();

            // Lead source
            $table->enum('source', [
                'plan_cta',
                'coverage_checker',
                'quote_form',
                'newsletter',
                'booking_partial',
                'contact_form',
                'whatsapp',
                'phone_call',
                'referral',
                'organic',
                'paid_ad',
                'social_media',
                'other'
            ])->default('organic');

            // Pipeline status
            $table->enum('status', [
                'new',
                'contacted',
                'qualified',
                'proposal',
                'converted',
                'lost',
                'spam'
            ])->default('new');

            // Lead score (0-100)
            $table->integer('score')->default(0);

            // UTM parameters
            $table->string('utm_source')->nullable();
            $table->string('utm_medium')->nullable();
            $table->string('utm_campaign')->nullable();
            $table->string('utm_content')->nullable();
            $table->string('utm_term')->nullable();

            // Tracking data
            $table->integer('page_views')->default(0);
            $table->integer('time_on_site')->default(0)->comment('Seconds');
            $table->integer('scroll_depth')->default(0)->comment('Percentage 0-100');
            $table->enum('device_type', ['desktop', 'mobile', 'tablet'])->default('desktop');

            // Lead details
            $table->boolean('is_business')->default(false);
            $table->text('message')->nullable();

            // Assignment
            $table->foreignId('assigned_staff_id')->nullable()->constrained('users')->nullOnDelete();

            // Timestamps for tracking
            $table->timestamp('converted_at')->nullable();
            $table->timestamp('last_contacted_at')->nullable();

            $table->timestamps();

            // Indexes for common queries
            $table->index('status');
            $table->index('source');
            $table->index('score');
            $table->index('created_at');
            $table->index(['status', 'score']);
            $table->index(['email', 'phone']);
            $table->index('assigned_staff_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};

