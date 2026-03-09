<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();

            // ─── Client Identity ──────────────────────────────────────────
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email');
            $table->string('phone');
            $table->string('company_name')->nullable();
            $table->enum('customer_type', ['individual', 'business'])->default('individual');

            // ─── Links to your existing products table ────────────────────
            // product_id: the live product reference
            // product_snapshot: frozen copy at booking time (survives product edits/deletions)
            $table->foreignId('product_id')->constrained()->restrictOnDelete();
            $table->json('product_snapshot')->nullable();

            // ─── Assigned Vilcom staff member ─────────────────────────────
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();

            // ─── Booking Details ──────────────────────────────────────────
            $table->string('reference')->unique();
            $table->date('booking_date');
            $table->time('booking_time');
            $table->integer('duration_minutes')->default(30);
            $table->enum('meeting_type', ['in_person', 'virtual', 'phone'])->default('in_person');
            $table->string('meeting_link')->nullable();
            $table->string('meeting_location')->nullable();
            $table->text('notes')->nullable();
            $table->text('internal_notes')->nullable();

            // ─── Status ───────────────────────────────────────────────────
            $table->enum('status', [
                'pending', 'confirmed', 'cancelled',
                'completed', 'rescheduled', 'no_show',
            ])->default('pending');

            $table->timestamp('confirmed_at')->nullable();
            $table->foreignId('confirmed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('cancelled_at')->nullable();
            $table->string('cancellation_reason')->nullable();

            // ─── Rescheduling ─────────────────────────────────────────────
            $table->foreignId('rescheduled_from')->nullable()->constrained('bookings')->nullOnDelete();
            $table->date('original_date')->nullable();
            $table->time('original_time')->nullable();

            // ─── Notification Tracking ────────────────────────────────────
            $table->boolean('reminder_sent')->default(false);
            $table->timestamp('reminder_sent_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['booking_date', 'status']);
            $table->index(['assigned_to', 'booking_date']);
            $table->index(['product_id', 'booking_date']);
            $table->index(['email', 'status']);
            $table->index('reference');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};

