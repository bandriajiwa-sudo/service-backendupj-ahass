<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('spare_parts', function (Blueprint $table) {
            $table->index(['category_id', 'nama_suku_cadang']);
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->index('tanggal');
            $table->index('no_nota');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('spare_parts', function (Blueprint $table) {
            $table->dropIndex(['category_id', 'nama_suku_cadang']);
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex(['tanggal']);
            $table->dropIndex(['no_nota']);
        });
    }
};
