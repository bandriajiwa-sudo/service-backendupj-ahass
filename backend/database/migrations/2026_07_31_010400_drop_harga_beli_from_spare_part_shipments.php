<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('spare_part_shipments', function (Blueprint $table) {
            $table->dropColumn('harga_beli');
        });
    }

    public function down(): void
    {
        Schema::table('spare_part_shipments', function (Blueprint $table) {
            $table->decimal('harga_beli', 12, 2)->nullable()->after('quantity');
        });
    }
};
