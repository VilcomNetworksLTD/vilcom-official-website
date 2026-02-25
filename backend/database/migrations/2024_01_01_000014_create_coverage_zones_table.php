<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coverage_zones', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->enum('type', ['area', 'zone', 'region', 'county', 'sub-county'])->default('area');
            $table->foreignId('parent_id')->nullable()->constrained('coverage_zones')->onDelete('set null');
            $table->json('geojson')->nullable(); // GeoJSON polygon for the zone
            $table->decimal('center_lat', 10, 8)->nullable();
            $table->decimal('center_lng', 11, 8)->nullable();
            $table->decimal('radius_km', 8, 2)->nullable(); // For circular zones
            $table->enum('status', ['active', 'inactive', 'planned'])->default('active');
            $table->boolean('is_serviceable')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('slug');
            $table->index('type');
            $table->index('status');
            $table->index('is_serviceable');
            $table->index('parent_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coverage_zones');
    }
};

