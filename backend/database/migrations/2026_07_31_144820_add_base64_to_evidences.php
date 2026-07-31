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
        Schema::table('shipment_evidences', function (Blueprint $table) {
            $table->longText('base64_data')->nullable()->after('evidence_type');
            $table->string('storage_path')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('shipment_evidences', function (Blueprint $table) {
            $table->dropColumn('base64_data');
            $table->string('storage_path')->nullable(false)->change();
        });
    }
};
