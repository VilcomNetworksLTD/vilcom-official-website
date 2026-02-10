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
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            
            // Basic Information
            $table->foreignId('parent_id')->nullable()->constrained('categories')->onDelete('cascade');
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->text('short_description')->nullable();
            
            // Category Type
            $table->enum('type', [
                'internet_plans',
                'hosting_packages',
                'web_development',
                'bulk_sms',
                'domains',
                'addons',
                'other'
            ])->default('other');
            
            // Visual
            $table->string('icon')->nullable(); // Font awesome icon class
            $table->string('image')->nullable();
            $table->string('banner')->nullable();
            $table->string('color')->nullable(); // Hex color code
            
            // Attributes (JSON for flexible attributes)
            $table->json('attributes')->nullable(); // Speed tiers, storage, domains, etc.
            
            // Display & Ordering
            $table->integer('sort_order')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->boolean('show_in_menu')->default(true);
            
            // SEO
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->text('meta_keywords')->nullable();
            
            // Nested Set Model fields (for efficient querying)
            $table->integer('_lft')->default(0);
            $table->integer('_rgt')->default(0);
            $table->integer('depth')->default(0);
            
            // Soft deletes for data retention
            $table->softDeletes();
            
            $table->timestamps();
            
            // Indexes
            $table->index('parent_id');
            $table->index('type');
            $table->index('slug');
            $table->index('is_active');
            $table->index('is_featured');
            $table->index('sort_order');
            $table->index(['_lft', '_rgt']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};

