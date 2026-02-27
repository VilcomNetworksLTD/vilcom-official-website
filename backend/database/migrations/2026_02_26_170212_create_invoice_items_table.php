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
        Schema::create('invoice_items', function (Blueprint $table) {
    $table->id();

    $table->foreignId('invoice_id')->constrained()->onDelete('cascade');

    $table->foreignId('product_id')->nullable()->constrained()->onDelete('set null');
    $table->foreignId('addon_id')->nullable()->constrained('addons')->onDelete('set null');

    $table->string('description');
    $table->integer('quantity')->default(1);
    $table->decimal('unit_price', 10, 2);
    $table->decimal('discount_amount', 10, 2)->default(0);
    $table->decimal('tax_amount', 10, 2)->default(0);
    $table->decimal('total', 10, 2);

    $table->enum('type', ['plan', 'addon', 'setup_fee', 'proration', 'credit', 'other'])
          ->default('plan');

    $table->json('metadata')->nullable();
    $table->integer('sort_order')->default(0);

    $table->timestamps();

    $table->index('invoice_id');
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoice_items');
    }
};
