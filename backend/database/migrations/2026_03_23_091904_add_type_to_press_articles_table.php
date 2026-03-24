<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('press_articles', function (Blueprint $table) {
            $table->enum('type', ['press', 'blog'])
                  ->default('press')
                  ->after('category');

            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::table('press_articles', function (Blueprint $table) {
            $table->dropIndex(['type']);
            $table->dropColumn('type');
        });
    }
};
