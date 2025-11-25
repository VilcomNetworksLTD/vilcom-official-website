<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ─── Plan Change History ───────────────────────────────────────────────
        Schema::create('subscription_plan_changes', function (Blueprint $table) {
            $table->id();

            $table->foreignId('subscription_id')->constrained()->onDelete('cascade');
            $table->foreignId('changed_by')->nullable()->constrained('users')->onDelete('set null');

            // Previous plan
            $table->foreignId('from_product_id')->nullable()->constrained('products')->onDelete('set null');
            $table->foreignId('from_variant_id')->nullable()->constrained('product_variants')->onDelete('set null');
            $table->decimal('from_price', 10, 2)->nullable();
            $table->string('from_billing_cycle', 20)->nullable();

            // New plan
            $table->foreignId('to_product_id')->constrained('products')->onDelete('restrict');
            $table->foreignId('to_variant_id')->nullable()->constrained('product_variants')->onDelete('set null');
            $table->decimal('to_price', 10, 2);
            $table->string('to_billing_cycle', 20);

            // Change classification
            $table->enum('change_type', ['upgrade', 'downgrade', 'cycle_change', 'addon_change', 'initial']);
            $table->enum('apply_timing', ['immediate', 'next_cycle'])->default('immediate');

            // Proration for this change
            $table->decimal('proration_credit', 10, 2)->default(0); // Credit from old plan
            $table->decimal('proration_charge', 10, 2)->default(0); // Charge for new plan
            $table->decimal('net_proration', 10, 2)->default(0);    // charge - credit
            $table->integer('days_remaining')->nullable();           // Days left in old cycle
            $table->integer('days_in_cycle')->nullable();            // Total days in billing cycle

            $table->date('effective_date');
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();

            $table->timestamps();

            $table->index('subscription_id');
            $table->index('effective_date');
            $table->index('change_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_plan_changes');
    }
};

