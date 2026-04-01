<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('safetika_product_mappings', function (Blueprint $table) {
            $table->id();

            $table->foreignId('product_id')
                  ->unique()
                  ->constrained('products')
                  ->cascadeOnDelete();

            // Maps to Safetika create-mbr "account_type"
            // e.g. "FTTH Home", "FTTH Business", "FTTH Enterprise"
            $table->string('account_type', 50)->default('FTTH Home');

            // Maps to Safetika add-service "service_category"
            // e.g. "Internet", "Voice", "TV"
            $table->string('service_category', 50)->default('Internet');

            // Maps to Safetika create-mbr "customer_type"
            // Residential | Business | Enterprise
            $table->string('customer_type', 30)->default('Residential');

            // Human-readable label for admin UI
            $table->string('label')->nullable();

            $table->boolean('auto_provision')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_provisioned_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('safetika_product_mappings');
    }
};
