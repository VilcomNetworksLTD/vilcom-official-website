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
        Schema::create('payments', function (Blueprint $table) {
    $table->id();

    // Ownership
    $table->foreignId('user_id')->constrained()->onDelete('restrict');
    $table->foreignId('invoice_id')->nullable()->constrained()->onDelete('set null');
    $table->foreignId('subscription_id')->nullable()->constrained()->onDelete('set null');

    // Identity
    $table->string('payment_number')->unique();
    $table->string('transaction_id')->nullable()->unique();
    $table->string('gateway_reference')->nullable();

    // Method & Gateway
    $table->enum('payment_method', [
        'mpesa', 'card', 'bank_transfer', 'cash', 'cheque',
        'wallet', 'pesapal', 'flutterwave', 'other'
    ]);

    $table->enum('gateway', [
        'mpesa_stk', 'mpesa_paybill', 'mpesa_c2b',
        'pesapal', 'flutterwave', 'stripe',
        'manual', 'wallet', 'other'
    ])->default('manual');

    // Status
    $table->enum('status', [
        'pending', 'processing', 'completed', 'failed',
        'cancelled', 'refunded', 'partial_refund',
        'disputed', 'expired'
    ])->default('pending');

    // Amounts
    $table->string('currency', 3)->default('KES');
    $table->decimal('amount', 10, 2);
    $table->decimal('gateway_fee', 10, 2)->default(0);
    $table->decimal('net_amount', 10, 2)->default(0);
    $table->decimal('refunded_amount', 10, 2)->default(0);

    // M-Pesa specific
    $table->string('mpesa_phone')->nullable();
    $table->string('mpesa_receipt_number')->nullable();
    $table->string('mpesa_checkout_request_id')->nullable();
    $table->string('mpesa_merchant_request_id')->nullable();
    $table->string('mpesa_account_reference')->nullable();

    // Card specific
    $table->string('card_last_four')->nullable();
    $table->string('card_brand')->nullable();
    $table->string('card_holder_name')->nullable();
    $table->string('card_token')->nullable();

    // Bank transfer specific
    $table->string('bank_name')->nullable();
    $table->string('bank_account')->nullable();
    $table->string('bank_reference')->nullable();
    $table->date('bank_transfer_date')->nullable();

    // Gateway response & failure
    $table->json('gateway_response')->nullable();
    $table->string('failure_reason')->nullable();
    $table->string('failure_code')->nullable();

    // Refund info
    $table->foreignId('refunded_by')->nullable()->constrained('users')->onDelete('set null');
    $table->timestamp('refunded_at')->nullable();
    $table->text('refund_reason')->nullable();
    $table->string('refund_transaction_id')->nullable();

    // Timestamps
    $table->timestamp('paid_at')->nullable();
    $table->timestamp('expires_at')->nullable();

    // Audit
    $table->foreignId('recorded_by')->nullable()->constrained('users')->onDelete('set null');
    $table->text('notes')->nullable();

    // Extra
    $table->json('metadata')->nullable();
    $table->ipAddress('ip_address')->nullable();

    $table->softDeletes();
    $table->timestamps();

    // Indexes
    $table->index('user_id');
    $table->index('invoice_id');
    $table->index('subscription_id');
    $table->index('status');
    $table->index('payment_method');
    $table->index('gateway');
    $table->index('transaction_id');
    $table->index('mpesa_receipt_number');
    $table->index('mpesa_checkout_request_id');
    $table->index('payment_number');
    $table->index('paid_at');
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
