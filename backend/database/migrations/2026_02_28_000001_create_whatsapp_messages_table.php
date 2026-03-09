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
        Schema::create('whatsapp_messages', function (Blueprint $table) {
            $table->id();
            $table->string('phone', 20)->nullable();
            $table->string('name')->nullable();
            $table->string('email')->nullable();
            $table->text('message');
            $table->string('message_type')->default('custom'); // predefined, custom
            $table->enum('status', ['pending', 'contacted', 'converted', 'failed'])->default('pending');
            $table->string('source')->nullable(); // website, mobile_app
            $table->string('page_url')->nullable(); // which page they contacted from
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index('phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('whatsapp_messages');
    }
};

