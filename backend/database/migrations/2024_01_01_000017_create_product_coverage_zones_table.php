<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_coverage_zones', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('coverage_zone_id')->constrained()->onDelete('cascade');
            
            // Zone-specific pricing overrides (null = use product default)
            $table->decimal('price_monthly', 10, 2)->nullable();
            $table->decimal('price_quarterly', 10, 2)->nullable();
            $table->decimal('price_semi_annually', 10, 2)->nullable();
            $table->decimal('price_annually', 10, 2)->nullable();
            $table->decimal('price_one_time', 10, 2)->nullable();
            $table->decimal('setup_fee', 10, 2)->nullable();
            
            // Zone-specific promotional pricing
            $table->decimal('promotional_price', 10, 2)->nullable();
            $table->timestamp('promotional_start')->nullable();
            $table->timestamp('promotional_end')->nullable();
            
            // Zone-specific availability
            $table->boolean('is_available')->default(true);
            $table->integer('capacity_limit')->nullable();    // Zone-specific capacity cap
            $table->integer('current_capacity')->default(0);  // Current signups in this zone
            
            // Zone-specific overrides for internet plans
            $table->integer('speed_mbps')->nullable();        // Override if speed differs per zone
            $table->enum('connection_type', ['fiber', 'wireless', 'both'])->nullable();
            
            // Internal notes (e.g. "Fiber not yet available here, wireless only")
            $table->text('notes')->nullable();
            
            $table->timestamps();
            
            // A product can only be linked to a zone once
            $table->unique(['product_id', 'coverage_zone_id']);
            
            $table->index('product_id');
            $table->index('coverage_zone_id');
            $table->index('is_available');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_coverage_zones');
    }
};

