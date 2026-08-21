<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('advertisements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->nullable()->constrained('businesses')->onDelete('cascade');
            $table->string('title');
            $table->string('image');
            $table->string('link_url')->nullable();
            $table->enum('placement', ['hero_banner', 'sidebar', 'destination_footer', 'search_top'])->default('hero_banner');
            $table->integer('impressions')->default(0);
            $table->integer('clicks')->default(0);
            $table->decimal('price', 8, 2)->default(0);
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['pending', 'active', 'expired'])->default('active');
            $table->timestamps();

            $table->index(['placement', 'status']);
            $table->index(['start_date', 'end_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('advertisements');
    }
};
