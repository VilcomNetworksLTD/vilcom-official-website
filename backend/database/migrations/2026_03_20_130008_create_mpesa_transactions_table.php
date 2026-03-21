<?php
// database/migrations/xxxx_create_mpesa_transactions_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mpesa_transactions', function (Blueprint $table) {
            $table->id();

            // Safaricom transaction reference — globally unique
            $table->string('trans_id')->unique()
                  ->comment('Safaricom TransID e.g. RBK6XXXXX');

            $table->timestamp('trans_time')->nullable()
                  ->comment('Actual transaction time from Safaricom');

            $table->enum('trans_type', ['C2B', 'STK'])->default('C2B');

            // Payment details
            $table->decimal('amount', 10, 2);
            $table->string('bill_ref')
                  ->comment('BillRefNumber = emerald_mbr_id');
            $table->string('phone', 20)->nullable();

            // Customer name from Safaricom
            $table->string('first_name')->nullable();
            $table->string('middle_name')->nullable();
            $table->string('last_name')->nullable();

            // Safaricom metadata
            $table->string('short_code', 20)->nullable();
            $table->decimal('org_acc_balance', 12, 2)->nullable();

            // Link to our user
            $table->foreignId('user_id')
                  ->nullable()
                  ->constrained()
                  ->nullOnDelete()
                  ->comment('null if BillRef not matched to any user');

            // Processing status
            $table->enum('status', [
                'pending',        // received, not yet posted to Emerald
                'posted',         // successfully posted to Emerald
                'emerald_failed', // received but Emerald post failed
                'unmatched',      // BillRef not found in users table
            ])->default('pending');

            $table->timestamp('emerald_posted_at')->nullable();

            // Full raw payload for debugging
            $table->json('raw_payload')->nullable();

            $table->timestamps();

            // Indexes
            $table->index('bill_ref');
            $table->index('phone');
            $table->index('status');
            $table->index('user_id');
            $table->index('trans_time');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mpesa_transactions');
    }
};
