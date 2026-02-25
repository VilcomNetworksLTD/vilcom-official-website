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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            
            // Relationships
            $table->foreignId('category_id')->constrained()->onDelete('restrict');
            
            // Basic Information
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->text('short_description')->nullable();
            $table->string('sku')->unique()->nullable();
            
            // Product Type
            $table->enum('type', [
                'internet_plan',
                'hosting_package',
                'web_development',
                'bulk_sms',
                'domain',
                'addon',
                'service',
                'other'
            ])->default('other');
            
            // Internet Plan Specific
            $table->integer('speed_mbps')->nullable(); // e.g., 8, 18, 30, 60, 100
            $table->enum('connection_type', ['fiber', 'wireless', 'both'])->nullable();
            $table->enum('plan_category', ['home', 'business', 'enterprise'])->nullable();
            
            // Hosting Specific
            $table->integer('storage_gb')->nullable();
            $table->integer('bandwidth_gb')->nullable();
            $table->integer('email_accounts')->nullable();
            $table->integer('databases')->nullable();
            $table->integer('domains_allowed')->nullable();
            $table->boolean('ssl_included')->default(false);
            $table->boolean('backup_included')->default(false);
            
            // Web Development Specific
            $table->integer('pages_included')->nullable();
            $table->integer('revisions_included')->nullable();
            $table->integer('delivery_days')->nullable();
            
            // Bulk SMS Specific
            $table->integer('sms_credits')->nullable();
            $table->decimal('cost_per_sms', 8, 4)->nullable();
            
            // Pricing
            $table->decimal('price_monthly', 10, 2)->nullable();
            $table->decimal('price_quarterly', 10, 2)->nullable();
            $table->decimal('price_semi_annually', 10, 2)->nullable();
            $table->decimal('price_annually', 10, 2)->nullable();
            $table->decimal('price_one_time', 10, 2)->nullable(); // For services
            $table->decimal('setup_fee', 10, 2)->default(0);
            
            // Promotional Pricing
            $table->decimal('promotional_price', 10, 2)->nullable();
            $table->timestamp('promotional_start')->nullable();
            $table->timestamp('promotional_end')->nullable();
            
            // Features & Inclusions (JSON)
            $table->json('features')->nullable(); // List of features/benefits
            $table->json('technical_specs')->nullable(); // Technical specifications
            
            // Availability
            $table->json('coverage_areas')->nullable(); // Coverage areas for this product (JSON array)
            $table->boolean('available_nationwide')->default(false);
            
            // Stock/Capacity Management
            $table->integer('stock_quantity')->nullable(); // For physical items (routers, etc.)
            $table->integer('capacity_limit')->nullable(); // For hosting/services
            $table->integer('current_capacity')->default(0);
            $table->boolean('track_capacity')->default(false);
            
            // Display
            $table->string('image')->nullable();
            $table->json('gallery')->nullable(); // Multiple images
            $table->string('icon')->nullable();
            $table->string('badge')->nullable(); // "Popular", "Best Value", "New"
            
            // Status & Visibility
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->boolean('requires_approval')->default(false); // For custom services
            $table->integer('sort_order')->default(0);
            
            // Requirements
            $table->text('requirements')->nullable(); // What client needs to provide
            $table->text('terms_conditions')->nullable();
            
            // SEO
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->text('meta_keywords')->nullable();
            
            // Timestamps
            $table->softDeletes();
            $table->timestamps();
            
            // Indexes
            $table->index('category_id');
            $table->index('type');
            $table->index('slug');
            $table->index('sku');
            $table->index('is_active');
            $table->index('is_featured');
            $table->index('speed_mbps');
            $table->index('plan_category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};

