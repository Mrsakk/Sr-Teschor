<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('destinations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->string('name');
            $table->string('khmer_name')->nullable();
            $table->string('slug')->unique();
            $table->text('description');
            $table->text('short_description')->nullable();
            $table->string('address');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->decimal('entrance_fee', 8, 2)->default(0);
            $table->string('fee_notes')->nullable();
            $table->time('opening_time')->nullable();
            $table->time('closing_time')->nullable();
            $table->string('best_time')->nullable(); // e.g. "Sunrise 5:30 AM - 7:00 AM" or "November - February"
            $table->string('phone')->nullable();
            $table->string('website')->nullable();
            $table->json('facilities')->nullable(); // e.g. ["Parking", "Restrooms", "Tour Guide", "Souvenir Shop"]
            $table->decimal('rating', 3, 2)->default(5.00);
            $table->integer('review_count')->default(0);
            $table->integer('views_count')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_hidden_gem')->default(false);
            $table->enum('status', ['draft', 'pending', 'published', 'rejected'])->default('published');
            $table->timestamps();

            $table->index('slug');
            $table->index('category_id');
            $table->index(['latitude', 'longitude']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('destinations');
    }
};
