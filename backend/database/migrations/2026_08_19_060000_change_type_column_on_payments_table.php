<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Alter type column to varchar(50) to prevent truncation errors
        try {
            DB::statement("ALTER TABLE payments MODIFY COLUMN `type` VARCHAR(50) NOT NULL DEFAULT 'subscription'");
        } catch (\Exception $e) {
            // fallback if using sqlite
            Schema::table('payments', function (Blueprint $table) {
                // ignore
            });
        }
    }

    public function down(): void
    {
        // no-op
    }
};
