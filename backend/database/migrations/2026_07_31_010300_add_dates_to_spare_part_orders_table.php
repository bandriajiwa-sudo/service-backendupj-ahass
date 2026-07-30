<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('spare_part_orders', function (Blueprint $table) {
            $table->date('tanggal')->nullable()->after('status');
            $table->date('tanggal_awal')->nullable()->after('tanggal');
            $table->date('tanggal_akhir')->nullable()->after('tanggal_awal');
        });
    }

    public function down(): void
    {
        Schema::table('spare_part_orders', function (Blueprint $table) {
            $table->dropColumn(['tanggal', 'tanggal_awal', 'tanggal_akhir']);
        });
    }
};
