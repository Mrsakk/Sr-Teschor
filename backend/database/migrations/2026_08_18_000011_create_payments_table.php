<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('business_id')->nullable()->constrained('businesses')->onDelete('set null');
            $table->decimal('amount', 10, 2);
            $table->string('payment_method')->default('ABA Payway'); // ABA Payway, Wing, Credit Card, Cash
            $table->string('transaction_id')->unique();
            $table->enum('type', ['subscription', 'advertisement', 'booking_commission', 'promotion'])->default('subscription');
            $table->enum('status', ['pending', 'completed', 'failed', 'refunded'])->default('completed');
            $table->string('description')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'business_id']);
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
