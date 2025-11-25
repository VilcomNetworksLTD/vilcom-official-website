<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ─── Renewal Reminders Log ─────────────────────────────────────────────
        Schema::create('subscription_reminders', function (Blueprint $table) {
            $table->id();

            $table->foreignId('subscription_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            $table->enum('type', [
                'renewal_upcoming',     // X days before renewal
                'renewal_failed',       // Payment failed
                'suspension_warning',   // About to suspend
                'suspended',            // Just suspended
                'trial_ending',         // Trial ending soon
                'plan_change_applied',  // Upgrade/downgrade went live
                'cancellation_confirmed',
            ]);

            $table->enum('channel', ['email', 'sms', 'in_app', 'whatsapp'])->default('email');
            $table->enum('status', ['pending', 'sent', 'failed', 'skipped'])->default('pending');

            $table->timestamp('scheduled_at');
            $table->timestamp('sent_at')->nullable();
            $table->text('error_message')->nullable();
            $table->json('payload')->nullable(); // Email/SMS content snapshot

            $table->timestamps();

            $table->index('subscription_id');
            $table->index('type');
            $table->index('status');
            $table->index('scheduled_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_reminders');
    }
};

