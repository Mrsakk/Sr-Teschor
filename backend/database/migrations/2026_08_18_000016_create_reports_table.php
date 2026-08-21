<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('reportable_type'); // 'destination', 'business', 'review', 'user'
            $table->unsignedBigInteger('reportable_id');
            $table->string('report_type'); // fake_business, incorrect_info, fake_review, inappropriate, scam, other
            $table->text('reason');
            $table->enum('status', ['pending', 'investigating', 'resolved', 'rejected'])->default('pending');
            $table->text('admin_notes')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->index(['reportable_type', 'reportable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
