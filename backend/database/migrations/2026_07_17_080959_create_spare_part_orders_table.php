<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Table Header
        Schema::create('spare_part_orders', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_surat_order')->unique()->nullable();
            $table->date('tanggal_pengajuan')->nullable();
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();
            $table->string('status');
            $table->text('catatan')->nullable(); // akan diubah namanya menjadi catatan_fo di migrasi 2026_07_25
            $table->timestamp('tanggal_keputusan')->nullable();
            $table->timestamps();
        });

        // Table Detail
        Schema::create('spare_part_order_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('spare_part_order_id')->constrained('spare_part_orders')->cascadeOnDelete();
            $table->foreignId('spare_part_id')->constrained('spare_parts')->restrictOnDelete();
            $table->unsignedInteger('jumlah_qty')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spare_part_order_details');
        Schema::dropIfExists('spare_part_orders');
    }
};
