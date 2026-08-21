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
        Schema::table('bookings', function (Blueprint $table) {
            $table->decimal('subtotal', 10, 2)->default(0)->after('total_amount');
            $table->decimal('service_fee', 10, 2)->default(0)->after('subtotal');
            $table->decimal('discount_amount', 10, 2)->default(0)->after('service_fee');
            $table->decimal('platform_commission', 10, 2)->default(0)->after('total_amount');
            $table->decimal('provider_payout', 10, 2)->default(0)->after('platform_commission');
            $table->string('promo_code')->nullable()->after('discount_amount');
            $table->enum('service_type', ['tour', 'guide', 'transport', 'experience', 'ticket', 'package'])->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            //
        });
    }
};
