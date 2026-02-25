<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('address_check_logs', function (Blueprint $table) {
            $table->id();
            $table->string('query_input');                   // What the user typed
            $table->string('matched_zone')->nullable();      // Zone name matched
            $table->boolean('is_covered')->default(false);
            $table->decimal('query_lat', 10, 8)->nullable();
            $table->decimal('query_lng', 11, 8)->nullable();
            $table->string('ip_address')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('session_id')->nullable();
            $table->json('raw_result')->nullable();          // Full result snapshot
            $table->timestamps();

            $table->index('is_covered');
            $table->index('query_input');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('address_check_logs');
    }
};
