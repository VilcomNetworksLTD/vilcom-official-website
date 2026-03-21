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
            $table->boolean('auto_provision')->default(true);
            $table->boolean('sync_price')->default(false);
            $table->boolean('is_active')->default(true);

            // Billing cycle — stored as NAME (not ID) for reliability
            // e.g. "Vilcom Billing Cycle" — immune to ID changes
            $table->string('billing_cycle_name')
                  ->nullable()
                  ->comment('Billing cycle name — overrides global config if set');

            // Pay period ID — 1=Monthly 2=Quarterly 3=Six Months
            //                  4=Yearly  5=Two Weeks 6=Weekly
            $table->unsignedInteger('pay_period_id')
                  ->nullable()
                  ->comment('null = use global default (Monthly=1)');

            $table->timestamp('last_synced_at')->nullable();
            $table->timestamps();

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
