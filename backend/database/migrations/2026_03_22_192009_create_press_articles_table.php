<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('press_articles', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('excerpt')->nullable();
            $table->string('source_name');
            $table->string('source_url')->nullable();
            $table->string('article_url')->nullable();
            $table->string('category')->default('Company News');
            // Thumbnail: either a free URL or picked from the media library
            $table->string('thumbnail_url')->nullable();
            $table->foreignId('thumbnail_media_id')
                  ->nullable()
                  ->constrained('media')
                  ->nullOnDelete();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_published')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->index(['is_published', 'published_at']);
            $table->index('category');
            $table->index('is_featured');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('press_articles');
    }
};
