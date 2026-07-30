<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('spare_parts', function (Blueprint $table) {
            $table->dropColumn(['kategori', 'harga_jual']);
        });

        Schema::table('spare_parts', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->after('id')->constrained('categories')->nullOnDelete();
            $table->string('satuan')->default('Pcs')->after('nama_suku_cadang');
        });
    }

    public function down(): void
    {
        Schema::table('spare_parts', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropColumn(['category_id', 'satuan']);
        });

        Schema::table('spare_parts', function (Blueprint $table) {
            $table->string('kategori')->nullable();
            $table->decimal('harga_jual', 15, 2)->default(0);
        });
    }
};
