<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Supabase / PGSQL requires dropping foreign keys by alias name, or we can just empty the table to safely add non-nullable constrained columns
        \Illuminate\Support\Facades\DB::statement('TRUNCATE TABLE spare_part_returns CASCADE');

        Schema::table('spare_part_returns', function (Blueprint $table) {
            // Drop old generic status columns that moved to Header
            $table->dropForeign(['created_by']);
            $table->dropForeign(['resolved_by']);

            $table->dropColumn(['status', 'created_by', 'resolved_by', 'resolved_at']);

            // Link to Header Ticket
            $table->foreignId('spare_part_return_header_id')->after('id')->constrained('spare_part_return_headers')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('spare_part_returns', function (Blueprint $table) {
            $table->dropForeign(['spare_part_return_header_id']);
            $table->dropColumn('spare_part_return_header_id');

            $table->enum('status', ['menunggu_pengiriman_ulang', 'dikirim_ulang', 'selesai', 'dibatalkan'])->default('menunggu_pengiriman_ulang');

            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('resolved_by')->nullable()->constrained('users');
            $table->timestamp('resolved_at')->nullable();
        });
    }
};
