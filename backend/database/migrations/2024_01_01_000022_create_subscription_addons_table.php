<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ─── Subscription Add-ons ──────────────────────────────────────────────
        Schema::create('subscription_addons', function (Blueprint $table) {
            $table->id();

            $table->foreignId('subscription_id')->constrained()->onDelete('cascade');
            $table->foreignId('addon_id')->constrained()->onDelete('restrict');

            $table->integer('quantity')->default(1);

            // Price snapshot at time of adding
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total_price', 10, 2);
            $table->string('billing_cycle', 20); // Inherits from subscription

            $table->enum('status', ['active', 'cancelled', 'pending'])->default('active');
            $table->date('added_at');
            $table->date('cancelled_at')->nullable();

            $table->timestamps();

            $table->index('subscription_id');
            $table->index('addon_id');
            $table->index('status');
            $table->unique(['subscription_id', 'addon_id']); // One of each per subscription
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_addons');
    }
};

