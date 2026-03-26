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

            // Type column placed right after category (this controls the order)
            $table->enum('type', ['press', 'blog'])
                  ->default('press');

            $table->string('thumbnail_url')->nullable();
            $table->foreignId('thumbnail_media_id')
                  ->nullable()
                  ->constrained('media')
                  ->nullOnDelete();

            $table->boolean('is_featured')->default(false);
            $table->boolean('is_published')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->foreignId('created_by')
                  ->constrained('users')
                  ->cascadeOnDelete();

            $table->timestamps();

            // Indexes
            $table->index(['is_published', 'published_at']);
            $table->index('category');
            $table->index('is_featured');
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('press_articles');
    }
};
