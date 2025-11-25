<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ─── Core Subscriptions Table ──────────────────────────────────────────
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();

            // ── Ownership ─────────────────────────────────────────────────────
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('subscription_number')->unique(); // SUB-2025-00001

            // ── Product / Plan ────────────────────────────────────────────────
            $table->foreignId('product_id')->constrained()->onDelete('restrict');
            $table->foreignId('product_variant_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('coverage_zone_id')->nullable()->constrained()->onDelete('set null');

            // ── Billing Cycle ─────────────────────────────────────────────────
            $table->enum('billing_cycle', [
                'monthly',
                'quarterly',
                'semi_annually',
                'annually',
            ])->default('monthly');

            // ── Pricing Snapshot (locked at subscription time) ────────────────
            $table->decimal('base_price', 10, 2);          // Product/variant price
            $table->decimal('addons_total', 10, 2)->default(0);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('setup_fee', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2);        // base + addons - discount
            $table->string('currency', 3)->default('KES');

            // ── Proration ─────────────────────────────────────────────────────
            $table->decimal('proration_credit', 10, 2)->default(0);  // Unused days credit
            $table->decimal('proration_charge', 10, 2)->default(0);  // New plan charge for remaining days
            $table->date('proration_date')->nullable();               // Date proration was calculated

            // ── Lifecycle Status ──────────────────────────────────────────────
            $table->enum('status', [
                'pending',              // Awaiting first payment / setup
                'active',               // Running normally
                'suspended',            // Payment failed / manual hold
                'cancelled',            // Cancelled by user or admin
                'expired',              // Billing cycle ended without renewal
                'pending_cancellation', // Active but set to cancel at period end
                'pending_upgrade',      // Plan change queued for next cycle
                'trial',                // Free trial period
            ])->default('pending');

            // ── Dates ─────────────────────────────────────────────────────────
            $table->date('trial_ends_at')->nullable();
            $table->date('started_at')->nullable();           // When first activated
            $table->date('current_period_start');             // Current billing cycle start
            $table->date('current_period_end');               // Current billing cycle end (renewal date)
            $table->date('next_renewal_at')->nullable();      // Alias for reminders
            $table->date('cancelled_at')->nullable();
            $table->date('suspended_at')->nullable();
            $table->date('expires_at')->nullable();

            // ── Cancellation ──────────────────────────────────────────────────
            $table->enum('cancel_reason', [
                'too_expensive',
                'switching_provider',
                'no_longer_needed',
                'poor_service',
                'moving_area',
                'other',
            ])->nullable();
            $table->text('cancel_notes')->nullable();
            $table->boolean('cancel_at_period_end')->default(false);

            // ── Suspension ────────────────────────────────────────────────────
            $table->text('suspension_reason')->nullable();
            $table->integer('grace_period_days')->default(7); // Days before hard suspend
            $table->date('grace_period_ends_at')->nullable();

            // ── Plan Change Queue ─────────────────────────────────────────────
            // Stores a pending upgrade/downgrade to apply at next cycle
            $table->foreignId('pending_product_id')->nullable()->constrained('products')->onDelete('set null');
            $table->foreignId('pending_variant_id')->nullable()->constrained('product_variants')->onDelete('set null');
            $table->enum('pending_change_type', ['upgrade', 'downgrade', 'cycle_change'])->nullable();
            $table->date('pending_change_date')->nullable(); // When to apply

            // ── Renewal Settings ──────────────────────────────────────────────
            $table->boolean('auto_renew')->default(true);
            $table->integer('renewal_reminder_days')->default(7); // Days before to send reminder
            $table->timestamp('last_reminder_sent_at')->nullable();

            // ── Trial ─────────────────────────────────────────────────────────
            $table->boolean('is_trial')->default(false);
            $table->integer('trial_days')->nullable();

            // ── Staff & Notes ─────────────────────────────────────────────────
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('managed_by')->nullable()->constrained('users')->onDelete('set null'); // Assigned sales/support
            $table->text('internal_notes')->nullable();

            // ── Metadata ─────────────────────────────────────────────────────
            $table->json('metadata')->nullable(); // Flexible bag: router serial, IP, PPPoE creds, etc.

            $table->softDeletes();
            $table->timestamps();

            // Indexes
            $table->index('user_id');
            $table->index('product_id');
            $table->index('status');
            $table->index('billing_cycle');
            $table->index('current_period_end');
            $table->index('next_renewal_at');
            $table->index('cancel_at_period_end');
            $table->index('subscription_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};

