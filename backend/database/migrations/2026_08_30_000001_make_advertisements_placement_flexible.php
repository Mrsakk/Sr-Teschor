<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('advertisements', function (Blueprint $table) {
            $table->string('placement', 100)->default('hero_banner')->change();
            $table->string('link_url')->nullable()->change();
        });
    }

    public function down(): void
    {
        //
    }
};
