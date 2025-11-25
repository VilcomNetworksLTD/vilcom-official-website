<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ─── Subscription Status History (audit trail) ────────────────────────
        Schema::create('subscription_status_history', function (Blueprint $table) {
            $table->id();

            $table->foreignId('subscription_id')->constrained()->onDelete('cascade');
            $table->foreignId('changed_by')->nullable()->constrained('users')->onDelete('set null');

            $table->string('from_status', 30)->nullable();
            $table->string('to_status', 30);
            $table->text('reason')->nullable();
            $table->json('metadata')->nullable();

            $table->timestamp('changed_at');
            $table->timestamps();

            $table->index('subscription_id');
            $table->index('changed_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_status_history');
    }
};

