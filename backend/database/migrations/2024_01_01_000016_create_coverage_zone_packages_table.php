<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coverage_zone_packages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coverage_zone_id')->constrained()->onDelete('cascade');
            $table->string('package_name');
            $table->decimal('speed_mbps_down', 10, 2);
            $table->decimal('speed_mbps_up', 10, 2);
            $table->decimal('monthly_price', 10, 2);
            $table->string('currency', 3)->default('KES');
            $table->boolean('is_available')->default(true);
            $table->text('description')->nullable();
            $table->json('features')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index('coverage_zone_id');
            $table->index('is_available');
            $table->index('sort_order');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coverage_zone_packages');
    }
};

