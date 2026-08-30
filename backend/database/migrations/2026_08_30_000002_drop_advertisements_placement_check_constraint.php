<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop Postgres check constraint if exists
        try {
            DB::statement('ALTER TABLE advertisements DROP CONSTRAINT IF EXISTS advertisements_placement_check');
        } catch (\Exception $e) {
            // Ignore if already dropped or on mysql
        }
    }

    public function down(): void
    {
        //
    }
};
