<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // 'super_admin', 'content_admin', 'business_admin', 'finance_admin', 'support_admin'
            $table->string('display_name');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // 'users.view', 'businesses.approve', etc.
            $table->string('group'); // 'users', 'businesses', 'destinations', etc.
            $table->string('display_name');
            $table->timestamps();
        });

        Schema::create('role_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('role_id')->constrained('roles')->onDelete('cascade');
            $table->foreignId('permission_id')->constrained('permissions')->onDelete('cascade');
            $table->timestamps();
            $table->unique(['role_id', 'permission_id']);
        });

        // Add role_id and subrole to users table if not existing
        if (!Schema::hasColumn('users', 'admin_role')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('admin_role')->nullable()->default(null); // 'super_admin', 'content_admin', etc.
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('role_permissions');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');
        if (Schema::hasColumn('users', 'admin_role')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('admin_role');
            });
        }
    }
};
