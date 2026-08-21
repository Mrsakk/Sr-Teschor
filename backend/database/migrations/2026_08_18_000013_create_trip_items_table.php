<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trip_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trip_plan_id')->constrained('trip_plans')->onDelete('cascade');
            $table->foreignId('destination_id')->nullable()->constrained('destinations')->onDelete('set null');
            $table->foreignId('business_id')->nullable()->constrained('businesses')->onDelete('set null');
            $table->string('custom_title')->nullable(); // in case user adds a custom stop
            $table->date('visit_date')->nullable();
            $table->integer('day_number')->default(1);
            $table->integer('visit_order')->default(1);
            $table->text('notes')->nullable();
            $table->string('estimated_time')->nullable(); // e.g. "2 hours"
            $table->string('estimated_distance')->nullable(); // e.g. "12 km"
            $table->timestamps();

            $table->index(['trip_plan_id', 'day_number', 'visit_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trip_items');
    }
};
