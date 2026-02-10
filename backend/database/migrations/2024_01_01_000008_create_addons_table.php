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
        Schema::create('addons', function (Blueprint $table) {
            $table->id();
            
            // Basic Information
            $table->string('name'); // e.g., "Static IP", "Extra 10GB Storage"
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->text('short_description')->nullable();
            $table->string('sku')->unique()->nullable();
            
            // Addon Type
            $table->enum('type', [
                'static_ip',
                'extra_bandwidth',
                'extra_storage',
                'router_upgrade',
                'ssl_certificate',
                'backup_service',
                'domain_registration',
                'email_accounts',
                'priority_support',
                'installation',
                'other'
            ])->default('other');
            
            // Applicable To (which product types can use this addon)
            $table->json('applicable_to')->nullable(); // ['internet_plan', 'hosting_package']
            
            // Pricing
            $table->decimal('price_monthly', 10, 2)->nullable();
            $table->decimal('price_quarterly', 10, 2)->nullable();
            $table->decimal('price_semi_annually', 10, 2)->nullable();
            $table->decimal('price_annually', 10, 2)->nullable();
            $table->decimal('price_one_time', 10, 2)->nullable();
            
            // Quantity & Limits
            $table->boolean('is_recurring')->default(false); // Recurring or one-time
            $table->integer('min_quantity')->default(1);
            $table->integer('max_quantity')->nullable();
            $table->integer('stock_quantity')->nullable();
            
            // Bundling Rules
            $table->json('bundle_rules')->nullable(); // e.g., {"required_with": ["product_id"], "discount": 10}
            $table->boolean('can_be_bundled')->default(true);
            $table->decimal('bundle_discount_percent', 5, 2)->nullable();
            
            // Display
            $table->string('icon')->nullable();
            $table->string('image')->nullable();
            $table->string('badge')->nullable();
            
            // Status
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->boolean('requires_approval')->default(false);
            $table->integer('sort_order')->default(0);
            
            // SEO
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            
            $table->softDeletes();
            $table->timestamps();
            
            // Indexes
            $table->index('type');
            $table->index('slug');
            $table->index('sku');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('addons');
    }
};

