<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->string('filename');
            $table->string('original_name');
            $table->string('mime_type');
            $table->integer('size');
            $table->string('path');
            $table->string('url');
            $table->string('alt_text')->nullable();
            $table->text('caption')->nullable();
            $table->string('folder')->default('general');
            $table->integer('usage_count')->default(0);
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->index(['folder', 'created_at']);
            $table->index('mime_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};

