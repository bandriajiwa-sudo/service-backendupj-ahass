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
        // 1. Shipment Table
        Schema::create('spare_part_shipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('spare_part_order_detail_id')->constrained('spare_part_order_details')->onDelete('cascade');
            $table->enum('shipment_type', ['initial', 'replacement'])->default('initial');
            $table->unsignedInteger('quantity');

            // Harga definitif dari penerimaan
            $table->decimal('harga_beli', 12, 2)->nullable();
            $table->decimal('harga_jual', 12, 2)->nullable();

            $table->enum('status', ['menunggu_verifikasi', 'disetujui', 'ditolak'])->default('menunggu_verifikasi');

            $table->foreignId('shipped_by')->constrained('users')->onDelete('cascade');
            $table->timestamp('shipped_at')->useCurrent();

            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();

            $table->text('rejection_note')->nullable();
            $table->timestamp('stock_posted_at')->nullable(); // Unique marker that stock has been incremented

            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'spare_part_order_detail_id']);
        });

        // 2. Returns Table
        Schema::create('spare_part_returns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('spare_part_order_detail_id')->constrained('spare_part_order_details')->onDelete('cascade');
            $table->foreignId('spare_part_shipment_id')->unique()->constrained('spare_part_shipments')->onDelete('cascade');

            $table->unsignedInteger('quantity');
            $table->text('reason'); // Alasan Return (wajib dari FO)

            $table->enum('status', ['menunggu_pengiriman_ulang', 'dikirim_ulang', 'selesai', 'dibatalkan'])->default('menunggu_pengiriman_ulang');

            $table->foreignId('created_by')->constrained('users'); // FO yang ngasih komplain
            $table->foreignId('resolved_by')->nullable()->constrained('users'); // Koperasi yang beresin
            $table->timestamp('resolved_at')->nullable();

            $table->timestamps();

            $table->index(['status', 'spare_part_order_detail_id'], 'returns_status_detail_id_index');
        });

        // 3. Evidences Table
        Schema::create('shipment_evidences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('spare_part_shipment_id')->nullable()->constrained('spare_part_shipments')->cascadeOnDelete();
            $table->foreignId('spare_part_return_id')->nullable()->constrained('spare_part_returns')->cascadeOnDelete();

            $table->enum('evidence_type', ['shipment_initial', 'damage_or_defect', 'shipment_replacement']);

            $table->string('storage_disk')->default('local');
            $table->string('storage_path')->unique(); // Path asli lokal file
            $table->string('original_filename');
            $table->string('mime_type');
            $table->bigInteger('size_bytes');
            $table->char('sha256', 64)->nullable();

            $table->foreignId('uploaded_by')->constrained('users');
            $table->timestamp('uploaded_at')->useCurrent();

            $table->timestamps();

            // Aturan indexing
            $table->index('evidence_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipment_evidences');
        Schema::dropIfExists('spare_part_returns');
        Schema::dropIfExists('spare_part_shipments');
    }
};
