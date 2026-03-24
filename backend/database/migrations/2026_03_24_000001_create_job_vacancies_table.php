<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_vacancies', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('department')->nullable();
            $table->string('location')->default('Nairobi, Kenya');
            $table->string('type')->default('Full-time'); // Full-time, Part-time, Contract, Internship
            $table->text('description');
            $table->json('requirements')->nullable(); // array of strings
            $table->string('status')->default('active'); // active, closed, draft
            $table->date('deadline')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_vacancies');
    }
};
