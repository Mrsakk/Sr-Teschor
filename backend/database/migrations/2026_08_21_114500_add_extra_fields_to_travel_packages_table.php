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
        Schema::table('travel_packages', function (Blueprint $table) {
            $table->longText('image')->nullable()->after('is_active');
            $table->decimal('rating', 3, 2)->default(5.00)->after('image');
            $table->integer('reviews_count')->default(0)->after('rating');
            $table->string('duration')->nullable()->after('reviews_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('travel_packages', function (Blueprint $table) {
            $table->dropColumn(['image', 'rating', 'reviews_count', 'duration']);
        });
    }
};
