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
        Schema::create('lead_visits', function (Blueprint $table) {
            $table->id();

            // Link to lead
            $table->foreignId('lead_id')->nullable()->constrained('leads')->cascadeOnDelete();

            // Visitor ID (for tracking before lead is created)
            $table->uuid('vlc_vid')->nullable();

            // Visit details
            $table->string('url')->nullable();
            $table->string('page_title')->nullable();
            $table->integer('time_on_page')->default(0)->comment('Seconds');
            $table->integer('scroll_depth')->default(0)->comment('Percentage 0-100');
            $table->string('referrer')->nullable();

            // UTM parameters captured at this visit
            $table->json('utm_params')->nullable();

            // Device info
            $table->string('device_type')->default('desktop');
            $table->string('browser')->nullable();
            $table->string('operating_system')->nullable();
            $table->string('ip_address', 45)->nullable();

            $table->timestamps();

            // Indexes
            $table->index('lead_id');
            $table->index('vlc_vid');
            $table->index('created_at');
            $table->index('url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lead_visits');
    }
};

