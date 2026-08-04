<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('spare_part_return_headers', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_tiket_retur')->unique();
            $table->foreignId('spare_part_order_id')->constrained('spare_part_orders')->onDelete('cascade');

            $table->enum('status', ['menunggu_pengiriman_ulang', 'dikirim_ulang', 'selesai', 'dibatalkan'])->default('menunggu_pengiriman_ulang');

            $table->foreignId('created_by')->constrained('users'); // FO Pembuat Tiket
            $table->foreignId('resolved_by')->nullable()->constrained('users'); // Koperasi Resolver
            $table->timestamp('resolved_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spare_part_return_headers');
    }
};
