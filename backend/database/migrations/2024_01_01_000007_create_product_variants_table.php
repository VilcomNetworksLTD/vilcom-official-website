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
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            
            // Relationships
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            
            // Variant Details
            $table->string('name'); // e.g., "8 Mbps - Home", "30 Mbps - Business"
            $table->string('sku')->unique()->nullable();
            
            // Variant Attributes
            $table->json('attributes')->nullable(); // e.g., {"speed": "8", "type": "home"}
            
            // Pricing
            $table->decimal('price_monthly', 10, 2)->nullable();
            $table->decimal('price_quarterly', 10, 2)->nullable();
            $table->decimal('price_semi_annually', 10, 2)->nullable();
            $table->decimal('price_annually', 10, 2)->nullable();
            $table->decimal('price_one_time', 10, 2)->nullable();
            $table->decimal('setup_fee', 10, 2)->default(0);
            
            // Stock/Capacity
            $table->integer('stock_quantity')->nullable();
            $table->integer('capacity_limit')->nullable();
            $table->integer('current_capacity')->default(0);
            
            // Status
            $table->boolean('is_active')->default(true);
            $table->boolean('is_default')->default(false);
            $table->integer('sort_order')->default(0);
            
            $table->timestamps();
            
            // Indexes
            $table->index('product_id');
            $table->index('sku');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};

