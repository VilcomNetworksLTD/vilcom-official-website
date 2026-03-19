<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('emerald_product_mappings', function (Blueprint $table) {
            $table->id();

            // Link to your product
            $table->foreignId('product_id')
                  ->constrained()
                  ->cascadeOnDelete();

            // Emerald identifiers
            $table->unsignedInteger('emerald_service_type_id')
                  ->comment('AccountTypeID in Emerald');
            $table->unsignedInteger('emerald_service_category_id')
                  ->comment('ServiceCategoryID in Emerald');
            $table->string('emerald_service_type_name')
                  ->nullable()
                  ->comment('Human-readable name for debugging');

            // Provisioning controls
            $table->boolean('auto_provision')->default(true)
                  ->comment('Auto-create Emerald account on signup');
            $table->boolean('sync_price')->default(false)
                  ->comment('Sync price from Emerald');
            $table->boolean('is_active')->default(true);

            // Billing cycle override (null = use global default)
            $table->unsignedInteger('billing_cycle_id')->nullable();
            $table->unsignedInteger('pay_period_id')->nullable();

            // Audit
            $table->timestamp('last_synced_at')->nullable();
            $table->timestamps();

            // Indexes
            $table->unique('product_id');
            $table->index('emerald_service_type_id');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('emerald_product_mappings');
    }
};
