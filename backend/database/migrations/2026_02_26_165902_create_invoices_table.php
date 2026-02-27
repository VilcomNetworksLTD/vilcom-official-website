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
       Schema::create('invoices', function (Blueprint $table) {
    $table->id();

    // Ownership
    $table->foreignId('user_id')->constrained()->onDelete('restrict');
    $table->foreignId('subscription_id')->nullable()->constrained()->onDelete('set null');

    // Identity
    $table->string('invoice_number')->unique();
    $table->string('reference_number')->nullable();

    // Type & Status
    $table->enum('type', ['subscription', 'one_time', 'prorated', 'credit_note', 'setup_fee'])
          ->default('subscription');
          
    $table->enum('status', ['draft', 'sent', 'paid', 'partial', 'overdue', 'void', 'refunded', 'uncollectible'])
          ->default('draft');

    // Dates
    $table->date('billing_period_start')->nullable();
    $table->date('billing_period_end')->nullable();
    $table->date('invoice_date');
    $table->date('due_date');
    $table->date('paid_at')->nullable();
    $table->date('voided_at')->nullable();

    // Money
    $table->string('currency', 3)->default('KES');
    $table->decimal('subtotal', 10, 2)->default(0);
    $table->decimal('discount_amount', 10, 2)->default(0);
    $table->decimal('tax_amount', 10, 2)->default(0);
    $table->decimal('setup_fee', 10, 2)->default(0);
    $table->decimal('total_amount', 10, 2)->default(0);
    $table->decimal('amount_paid', 10, 2)->default(0);
    $table->decimal('amount_due', 10, 2)->default(0);
    $table->decimal('credit_applied', 10, 2)->default(0);

    // Tax
    $table->decimal('tax_rate', 5, 2)->default(0);
    $table->string('tax_label')->nullable();
    $table->string('tax_number')->nullable();

    // Discount
    $table->string('discount_code')->nullable();
    $table->decimal('discount_percent', 5, 2)->nullable();
    $table->text('discount_reason')->nullable();

    // Credit note relation
    $table->foreignId('original_invoice_id')->nullable()->constrained('invoices')->onDelete('set null');
    $table->decimal('credit_note_amount', 10, 2)->nullable();

    // Reminders
    $table->integer('reminder_count')->default(0);
    $table->timestamp('last_reminder_sent_at')->nullable();
    $table->boolean('reminders_enabled')->default(true);

    // Audit / Notes
    $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
    $table->text('notes')->nullable();
    $table->text('internal_notes')->nullable();

    // PDF
    $table->string('pdf_path')->nullable();
    $table->timestamp('pdf_generated_at')->nullable();

    // Extra
    $table->json('metadata')->nullable();

    $table->softDeletes();
    $table->timestamps();

    // Indexes
    $table->index('user_id');
    $table->index('subscription_id');
    $table->index('status');
    $table->index('type');
    $table->index('due_date');
    $table->index('invoice_number');
    $table->index('invoice_date');
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
