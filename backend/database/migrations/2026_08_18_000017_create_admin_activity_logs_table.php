<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admin_activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('action'); // e.g. 'Approved Business', 'Created Destination', 'Blocked User'
            $table->string('module'); // 'businesses', 'users', 'destinations', 'reviews', 'settings'
            $table->string('target')->nullable(); // e.g. 'Angkor Paradise Hotel'
            $table->string('ip_address')->nullable();
            $table->text('details')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_activity_logs');
    }
};
