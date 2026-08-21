<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('reviewable_type'); // App\Models\Destination or App\Models\Business
            $table->unsignedBigInteger('reviewable_id');
            $table->tinyInteger('rating')->unsigned(); // 1 to 5
            $table->text('comment');
            $table->json('images')->nullable();
            $table->text('reply')->nullable();
            $table->timestamp('reply_date')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('approved');
            $table->timestamps();

            $table->index(['reviewable_type', 'reviewable_id']);
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
