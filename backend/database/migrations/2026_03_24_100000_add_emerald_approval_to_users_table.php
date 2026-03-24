<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // The product the user selected at signup, awaiting admin approval
            $table->unsignedBigInteger('emerald_pending_product_id')->nullable()->after('emerald_account_id');

            // Gate status: none | pending | approved | rejected
            $table->enum('emerald_approval_status', ['none', 'pending', 'approved', 'rejected'])
                  ->default('none')
                  ->after('emerald_pending_product_id');

            // Staff/admin who reviewed the request
            $table->unsignedBigInteger('emerald_approval_reviewed_by')->nullable()->after('emerald_approval_status');
            $table->timestamp('emerald_approval_reviewed_at')->nullable()->after('emerald_approval_reviewed_by');

            // Notes (rejection reason or approval notes)
            $table->text('emerald_approval_notes')->nullable()->after('emerald_approval_reviewed_at');

            // Foreign key constraint (soft) — reviewer may be deleted
            $table->foreign('emerald_pending_product_id')->references('id')->on('products')->nullOnDelete();
            $table->foreign('emerald_approval_reviewed_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['emerald_pending_product_id']);
            $table->dropForeign(['emerald_approval_reviewed_by']);
            $table->dropColumn([
                'emerald_pending_product_id',
                'emerald_approval_status',
                'emerald_approval_reviewed_by',
                'emerald_approval_reviewed_at',
                'emerald_approval_notes',
            ]);
        });
    }
};
