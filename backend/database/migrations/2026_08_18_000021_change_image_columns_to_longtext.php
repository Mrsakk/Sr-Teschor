<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('destination_images', function (Blueprint $table) {
            $table->longText('image')->change();
        });

        Schema::table('businesses', function (Blueprint $table) {
            $table->longText('logo')->nullable()->change();
            $table->longText('cover_image')->nullable()->change();
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->longText('image')->nullable()->change();
        });

        Schema::table('business_services', function (Blueprint $table) {
            $table->longText('image')->nullable()->change();
        });

        Schema::table('promotions', function (Blueprint $table) {
            $table->longText('image')->nullable()->change();
        });

        Schema::table('advertisements', function (Blueprint $table) {
            $table->longText('image')->change();
        });

        Schema::table('media', function (Blueprint $table) {
            $table->longText('file_path')->change();
        });
    }

    public function down(): void
    {
        Schema::table('destination_images', function (Blueprint $table) {
            $table->string('image')->change();
        });
    }
};
