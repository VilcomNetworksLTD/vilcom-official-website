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

            // ─── 1. CLIENT IDENTITY ─────────────────────────────────────────
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email');
            $table->string('phone');
            $table->string('company_name')->nullable();

            // UPDATED: Customer Status (New vs Existing Client)
            $table->enum('customer_type', ['new', 'existing'])->default('new');

            // ─── 2. PRODUCT CONTEXT (OPTIONAL) ───────────────────────────────
            // Nullable because interviews or general visits might not need a product
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();

            // JSON snapshot to preserve details even if product is deleted later
            $table->json('product_snapshot')->nullable();

            // ─── 3. ACTIVITY DEFINITION ───────────────────────────────────────
            // WHAT are they doing? (Business Logic)
            $table->enum('activity_type', [
                'meeting', 'interview', 'consultancy', 'training'
            ])->default('meeting');

            // HOW are they doing it? (Logistics & VMS Location Logic)
            // VMS needs to know if it's physical (Reception) or Virtual to generate the correct pass.
            $table->enum('meeting_mode', [
                'in_person', 'virtual', 'phone'
            ])->default('in_person');

            // ─── 4. VMS INTEGRATION DATA ─────────────────────────────────────
            // ID details required to generate the visitor pass
            $table->enum('id_type', [
                'national_id', 'passport', 'drivers_license', 'other'
            ])->default('national_id');

            $table->string('id_number', 50)->nullable();

            // Response fields returned from VMS API
            $table->string('vms_reference', 50)->nullable()->comment('External VMS Booking ID');
            $table->string('vms_check_in_code', 20)->nullable()->comment('Visitor Pass Code');
            $table->string('vms_qr_code_url')->nullable()->comment('Link to Pass QR Image');
            $table->timestamp('vms_synced_at')->nullable()->comment('Last successful sync with VMS');

            // ─── 5. ASSIGNMENT & SCHEDULING ─────────────────────────────────
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();

            $table->string('reference')->unique();
            $table->date('booking_date');
            $table->time('booking_time');
            $table->integer('duration_minutes')->default(30);

            // Specific location details (e.g. "Boardroom A" or Zoom Link)
            $table->string('meeting_link')->nullable();
            $table->string('meeting_location')->nullable();

            // ─── 6. NOTES ─────────────────────────────────────────────────────
            $table->text('notes')->nullable();          // Visible to client
            $table->text('internal_notes')->nullable(); // Admin only

            // ─── 7. STATUS WORKFLOW ─────────────────────────────────────────
            $table->enum('status', [
                'pending', 'confirmed', 'cancelled',
                'completed', 'rescheduled', 'no_show',
            ])->default('pending');

            $table->timestamp('confirmed_at')->nullable();
            $table->foreignId('confirmed_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamp('cancelled_at')->nullable();
            $table->string('cancellation_reason')->nullable();

            // ─── 8. RESCHEDULING TRACKING ────────────────────────────────────
            $table->foreignId('rescheduled_from')->nullable()->constrained('bookings')->nullOnDelete();
            $table->date('original_date')->nullable();
            $table->time('original_time')->nullable();

            // ─── 9. NOTIFICATIONS ─────────────────────────────────────────────
            $table->boolean('reminder_sent')->default(false);
            $table->timestamp('reminder_sent_at')->nullable();

            // ─── 10. METADATA ────────────────────────────────────────────────
            $table->timestamps();
            $table->softDeletes();

            // ─── INDEXES ────────────────────────────────────────────────────
            $table->index(['booking_date', 'status']);
            $table->index(['assigned_to', 'booking_date']);
            $table->index(['product_id', 'booking_date']);
            $table->index(['email', 'status']);
            $table->index('reference');
            $table->index('vms_reference');
            $table->index('activity_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
