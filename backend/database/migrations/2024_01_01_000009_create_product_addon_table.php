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
        Schema::create('product_addon', function (Blueprint $table) {
            $table->id();
            
            // Relationships
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('addon_id')->constrained()->onDelete('cascade');
            
            // Custom pricing for this combination
            $table->decimal('custom_price', 10, 2)->nullable();
            $table->decimal('discount_percent', 5, 2)->nullable();
            
            // Rules
            $table->boolean('is_required')->default(false);
            $table->boolean('is_default')->default(false);
            $table->integer('sort_order')->default(0);
            
            $table->timestamps();
            
            // Indexes
            $table->index(['product_id', 'addon_id']);
            $table->unique(['product_id', 'addon_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_addon');
    }
};

