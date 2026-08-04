<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\Category;
use App\Models\User;
use App\Models\SparePartOrder;
use App\Models\SparePartOrderDetail;
use App\Models\SparePartShipment;
use App\Models\SparePart;
use App\Models\SparePartStock;

class SparePartSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        $data = [
            // Kategori: Mesin (MSN-001 s/d MSN-025)
            ['kode_suku_cadang' => 'MSN-001', 'nama_suku_cadang' => 'Piston Kit Standard', 'kategori' => 'Mesin', 'harga_jual' => 175000],
            ['kode_suku_cadang' => 'MSN-002', 'nama_suku_cadang' => 'Ring Piston Standard', 'kategori' => 'Mesin', 'harga_jual' => 85000],
            ['kode_suku_cadang' => 'MSN-003', 'nama_suku_cadang' => 'Klep Intake (In)', 'kategori' => 'Mesin', 'harga_jual' => 45000],
            ['kode_suku_cadang' => 'MSN-004', 'nama_suku_cadang' => 'Klep Exhaust (Ex)', 'kategori' => 'Mesin', 'harga_jual' => 45000],
            ['kode_suku_cadang' => 'MSN-005', 'nama_suku_cadang' => 'Noken As (Camshaft)', 'kategori' => 'Mesin', 'harga_jual' => 250000],
            ['kode_suku_cadang' => 'MSN-006', 'nama_suku_cadang' => 'Kruk As (Crankshaft)', 'kategori' => 'Mesin', 'harga_jual' => 650000],
            ['kode_suku_cadang' => 'MSN-007', 'nama_suku_cadang' => 'Rantai Keteng (Timing Chain)', 'kategori' => 'Mesin', 'harga_jual' => 95000],
            ['kode_suku_cadang' => 'MSN-008', 'nama_suku_cadang' => 'Tensioner Rantai Keteng', 'kategori' => 'Mesin', 'harga_jual' => 120000],
            ['kode_suku_cadang' => 'MSN-009', 'nama_suku_cadang' => 'Busi NGK C7HSA', 'kategori' => 'Mesin', 'harga_jual' => 15000],
            ['kode_suku_cadang' => 'MSN-010', 'nama_suku_cadang' => 'Busi Iridium', 'kategori' => 'Mesin', 'harga_jual' => 95000],
            ['kode_suku_cadang' => 'MSN-011', 'nama_suku_cadang' => 'Koil Pengapian', 'kategori' => 'Mesin', 'harga_jual' => 135000],
            ['kode_suku_cadang' => 'MSN-012', 'nama_suku_cadang' => 'Paking Blok Mesin', 'kategori' => 'Mesin', 'harga_jual' => 25000],
            ['kode_suku_cadang' => 'MSN-013', 'nama_suku_cadang' => 'Paking Head Silinder', 'kategori' => 'Mesin', 'harga_jual' => 45000],
            ['kode_suku_cadang' => 'MSN-014', 'nama_suku_cadang' => 'Sil Klep', 'kategori' => 'Mesin', 'harga_jual' => 15000],
            ['kode_suku_cadang' => 'MSN-015', 'nama_suku_cadang' => 'Bos Klep', 'kategori' => 'Mesin', 'harga_jual' => 35000],
            ['kode_suku_cadang' => 'MSN-016', 'nama_suku_cadang' => 'Kipas Radiator', 'kategori' => 'Mesin', 'harga_jual' => 55000],
            ['kode_suku_cadang' => 'MSN-017', 'nama_suku_cadang' => 'Pompa Air (Water Pump)', 'kategori' => 'Mesin', 'harga_jual' => 185000],
            ['kode_suku_cadang' => 'MSN-018', 'nama_suku_cadang' => 'Karburator Assy', 'kategori' => 'Mesin', 'harga_jual' => 450000],
            ['kode_suku_cadang' => 'MSN-019', 'nama_suku_cadang' => 'Injektor', 'kategori' => 'Mesin', 'harga_jual' => 210000],
            ['kode_suku_cadang' => 'MSN-020', 'nama_suku_cadang' => 'Throttle Body Assy', 'kategori' => 'Mesin', 'harga_jual' => 550000],
            ['kode_suku_cadang' => 'MSN-021', 'nama_suku_cadang' => 'Intake Manifold', 'kategori' => 'Mesin', 'harga_jual' => 85000],
            ['kode_suku_cadang' => 'MSN-022', 'nama_suku_cadang' => 'Knalpot Standard', 'kategori' => 'Mesin', 'harga_jual' => 450000],
            ['kode_suku_cadang' => 'MSN-023', 'nama_suku_cadang' => 'Paking Knalpot', 'kategori' => 'Mesin', 'harga_jual' => 10000],
            ['kode_suku_cadang' => 'MSN-024', 'nama_suku_cadang' => 'Baut Blok Mesin Set', 'kategori' => 'Mesin', 'harga_jual' => 65000],
            ['kode_suku_cadang' => 'MSN-025', 'nama_suku_cadang' => 'Ring Baut Oli', 'kategori' => 'Mesin', 'harga_jual' => 2000],

            // Kategori: Bodi (BOD-001 s/d BOD-025)
            ['kode_suku_cadang' => 'BOD-001', 'nama_suku_cadang' => 'Sayap Depan Kanan (Leg Shield)', 'kategori' => 'Bodi', 'harga_jual' => 150000],
            ['kode_suku_cadang' => 'BOD-002', 'nama_suku_cadang' => 'Sayap Depan Kiri', 'kategori' => 'Bodi', 'harga_jual' => 150000],
            ['kode_suku_cadang' => 'BOD-003', 'nama_suku_cadang' => 'Spakbor Depan', 'kategori' => 'Bodi', 'harga_jual' => 120000],
            ['kode_suku_cadang' => 'BOD-004', 'nama_suku_cadang' => 'Spakbor Belakang', 'kategori' => 'Bodi', 'harga_jual' => 95000],
            ['kode_suku_cadang' => 'BOD-005', 'nama_suku_cadang' => 'Batok Lampu Depan', 'kategori' => 'Bodi', 'harga_jual' => 110000],
            ['kode_suku_cadang' => 'BOD-006', 'nama_suku_cadang' => 'Batok Belakang (Speedometer)', 'kategori' => 'Bodi', 'harga_jual' => 75000],
            ['kode_suku_cadang' => 'BOD-007', 'nama_suku_cadang' => 'Cover Knalpot (Protector)', 'kategori' => 'Bodi', 'harga_jual' => 65000],
            ['kode_suku_cadang' => 'BOD-008', 'nama_suku_cadang' => 'Cover Radiator', 'kategori' => 'Bodi', 'harga_jual' => 45000],
            ['kode_suku_cadang' => 'BOD-009', 'nama_suku_cadang' => 'Cover CVT Plastik', 'kategori' => 'Bodi', 'harga_jual' => 85000],
            ['kode_suku_cadang' => 'BOD-010', 'nama_suku_cadang' => 'Behel Belakang (Grip Pillion)', 'kategori' => 'Bodi', 'harga_jual' => 150000],
            ['kode_suku_cadang' => 'BOD-011', 'nama_suku_cadang' => 'Jok Motor Assy', 'kategori' => 'Bodi', 'harga_jual' => 250000],
            ['kode_suku_cadang' => 'BOD-012', 'nama_suku_cadang' => 'Kulit Jok Sintetis', 'kategori' => 'Bodi', 'harga_jual' => 45000],
            ['kode_suku_cadang' => 'BOD-013', 'nama_suku_cadang' => 'Spion Kanan Standard', 'kategori' => 'Bodi', 'harga_jual' => 35000],
            ['kode_suku_cadang' => 'BOD-014', 'nama_suku_cadang' => 'Spion Kiri Standard', 'kategori' => 'Bodi', 'harga_jual' => 35000],
            ['kode_suku_cadang' => 'BOD-015', 'nama_suku_cadang' => 'Standar Tengah (Main Stand)', 'kategori' => 'Bodi', 'harga_jual' => 120000],
            ['kode_suku_cadang' => 'BOD-016', 'nama_suku_cadang' => 'Standar Samping (Side Stand)', 'kategori' => 'Bodi', 'harga_jual' => 65000],
            ['kode_suku_cadang' => 'BOD-017', 'nama_suku_cadang' => 'Per Standar Tengah', 'kategori' => 'Bodi', 'harga_jual' => 15000],
            ['kode_suku_cadang' => 'BOD-018', 'nama_suku_cadang' => 'Per Standar Samping', 'kategori' => 'Bodi', 'harga_jual' => 10000],
            ['kode_suku_cadang' => 'BOD-019', 'nama_suku_cadang' => 'Step Depan Kanan (Besi)', 'kategori' => 'Bodi', 'harga_jual' => 45000],
            ['kode_suku_cadang' => 'BOD-020', 'nama_suku_cadang' => 'Step Depan Kiri (Besi)', 'kategori' => 'Bodi', 'harga_jual' => 45000],
            ['kode_suku_cadang' => 'BOD-021', 'nama_suku_cadang' => 'Footstep Belakang Set', 'kategori' => 'Bodi', 'harga_jual' => 85000],
            ['kode_suku_cadang' => 'BOD-022', 'nama_suku_cadang' => 'Karet Footstep Depan', 'kategori' => 'Bodi', 'harga_jual' => 20000],
            ['kode_suku_cadang' => 'BOD-023', 'nama_suku_cadang' => 'Mata Kucing (Reflektor)', 'kategori' => 'Bodi', 'harga_jual' => 15000],
            ['kode_suku_cadang' => 'BOD-024', 'nama_suku_cadang' => 'Klip Bodi Plastik (Kancing)', 'kategori' => 'Bodi', 'harga_jual' => 2000],
            ['kode_suku_cadang' => 'BOD-025', 'nama_suku_cadang' => 'Baut Bodi Halus (Visor)', 'kategori' => 'Bodi', 'harga_jual' => 3000],

            // Kategori: Roda & Ban (ROD-001 s/d ROD-025)
            ['kode_suku_cadang' => 'ROD-001', 'nama_suku_cadang' => 'Ban Luar Depan Tubetype 80/90-14', 'kategori' => 'Ban', 'harga_jual' => 165000],
            ['kode_suku_cadang' => 'ROD-002', 'nama_suku_cadang' => 'Ban Luar Belakang Tubetype 90/90-14', 'kategori' => 'Ban', 'harga_jual' => 195000],
            ['kode_suku_cadang' => 'ROD-003', 'nama_suku_cadang' => 'Ban Luar Depan Tubeless 90/80-14', 'kategori' => 'Ban', 'harga_jual' => 220000],
            ['kode_suku_cadang' => 'ROD-004', 'nama_suku_cadang' => 'Ban Luar Belakang Tubeless 100/80-14', 'kategori' => 'Ban', 'harga_jual' => 250000],
            ['kode_suku_cadang' => 'ROD-005', 'nama_suku_cadang' => 'Ban Dalam Ring 14 Standard', 'kategori' => 'Ban', 'harga_jual' => 35000],
            ['kode_suku_cadang' => 'ROD-006', 'nama_suku_cadang' => 'Ban Luar Depan Sport 90/80-17', 'kategori' => 'Ban', 'harga_jual' => 280000],
            ['kode_suku_cadang' => 'ROD-007', 'nama_suku_cadang' => 'Ban Luar Belakang Sport 120/70-17', 'kategori' => 'Ban', 'harga_jual' => 450000],
            ['kode_suku_cadang' => 'ROD-008', 'nama_suku_cadang' => 'Ban Dalam Ring 17 Standard', 'kategori' => 'Ban', 'harga_jual' => 40000],
            ['kode_suku_cadang' => 'ROD-009', 'nama_suku_cadang' => 'Pentil Tubeless Besi', 'kategori' => 'Ban', 'harga_jual' => 15000],
            ['kode_suku_cadang' => 'ROD-010', 'nama_suku_cadang' => 'Pentil Tubeless Karet', 'kategori' => 'Ban', 'harga_jual' => 10000],
            ['kode_suku_cadang' => 'ROD-011', 'nama_suku_cadang' => 'Cairan Anti Bocor Ban Tubeless', 'kategori' => 'Cairan', 'harga_jual' => 35000],
            ['kode_suku_cadang' => 'ROD-012', 'nama_suku_cadang' => 'Velg Racing Depan Ring 14', 'kategori' => 'Roda', 'harga_jual' => 450000],
            ['kode_suku_cadang' => 'ROD-013', 'nama_suku_cadang' => 'Velg Racing Belakang Ring 14', 'kategori' => 'Roda', 'harga_jual' => 550000],
            ['kode_suku_cadang' => 'ROD-014', 'nama_suku_cadang' => 'Velg Jari-jari (Rim Besi) Ring 17', 'kategori' => 'Roda', 'harga_jual' => 185000],
            ['kode_suku_cadang' => 'ROD-015', 'nama_suku_cadang' => 'Jari-jari Roda (Spoke Set) Depan', 'kategori' => 'Roda', 'harga_jual' => 65000],
            ['kode_suku_cadang' => 'ROD-016', 'nama_suku_cadang' => 'Jari-jari Roda (Spoke Set) Belakang', 'kategori' => 'Roda', 'harga_jual' => 65000],
            ['kode_suku_cadang' => 'ROD-017', 'nama_suku_cadang' => 'Tromol Depan (Hub)', 'kategori' => 'Roda', 'harga_jual' => 135000],
            ['kode_suku_cadang' => 'ROD-018', 'nama_suku_cadang' => 'Tromol Belakang (Hub)', 'kategori' => 'Roda', 'harga_jual' => 185000],
            ['kode_suku_cadang' => 'ROD-019', 'nama_suku_cadang' => 'Bearing Roda Depan (6201)', 'kategori' => 'Roda', 'harga_jual' => 25000],
            ['kode_suku_cadang' => 'ROD-020', 'nama_suku_cadang' => 'Bearing Roda Belakang (6302)', 'kategori' => 'Roda', 'harga_jual' => 35000],
            ['kode_suku_cadang' => 'ROD-021', 'nama_suku_cadang' => 'Bos Roda Depan (Collar)', 'kategori' => 'Roda', 'harga_jual' => 25000],
            ['kode_suku_cadang' => 'ROD-022', 'nama_suku_cadang' => 'Seal Debu Roda Depan', 'kategori' => 'Roda', 'harga_jual' => 15000],
            ['kode_suku_cadang' => 'ROD-023', 'nama_suku_cadang' => 'As Roda Depan', 'kategori' => 'Roda', 'harga_jual' => 45000],
            ['kode_suku_cadang' => 'ROD-024', 'nama_suku_cadang' => 'As Roda Belakang Matic', 'kategori' => 'Roda', 'harga_jual' => 85000],
            ['kode_suku_cadang' => 'ROD-025', 'nama_suku_cadang' => 'Mur As Roda Belakang', 'kategori' => 'Roda', 'harga_jual' => 15000],
        ];

        DB::statement('TRUNCATE TABLE spare_part_price_logs CASCADE');
        DB::statement('TRUNCATE TABLE spare_part_shipments CASCADE');
        DB::statement('TRUNCATE TABLE spare_part_order_details CASCADE');
        DB::statement('TRUNCATE TABLE spare_part_orders CASCADE');
        DB::statement('TRUNCATE TABLE spare_part_stocks CASCADE');
        DB::statement('TRUNCATE TABLE spare_parts CASCADE');
        DB::statement('TRUNCATE TABLE categories CASCADE');

        // Define FO User for orders and Koperasi user for Shipments mapping
        $foUser = User::where('role', 'front_office')->first();
        $kpUser = User::where('role', 'koperasi')->first();

        DB::beginTransaction();
        try {
            // Create single dummy order for initialization
            $dummyOrder = SparePartOrder::create([
                'user_id' => $foUser ? $foUser->id : 1,
                'nomor_surat_order' => 'SO-' . date('Ymd') . '-0000',
                'status' => 'disetujui',
                'tanggal_pengajuan' => $now,
            ]);

            foreach ($data as $item) {
                // Handle categories
                $cat = Category::firstOrCreate(['nama_kategori' => $item['kategori']]);

                // Create SparePart
                $sp = SparePart::create([
                    'kode_suku_cadang' => $item['kode_suku_cadang'],
                    'nama_suku_cadang' => $item['nama_suku_cadang'],
                    'category_id' => $cat->id,
                    'satuan' => 'Pcs',
                ]);

                // Insert Stock
                $stokSekarang = rand(15, 60);
                SparePartStock::create([
                    'spare_part_id' => $sp->id,
                    'stok_sekarang' => $stokSekarang,
                    'stok_minimum' => 15,
                    'terakhir_diperbarui' => $now,
                ]);

                // Create Order Detail bridging logic to attach pricing history 
                $od = SparePartOrderDetail::create([
                    'spare_part_order_id' => $dummyOrder->id,
                    'spare_part_id' => $sp->id,
                    'jumlah_qty' => $stokSekarang
                ]);

                // Create verified shipment recording active base price
                SparePartShipment::create([
                    'spare_part_order_detail_id' => $od->id,
                    'shipped_by' => $kpUser ? $kpUser->id : 1,
                    'verified_by' => $foUser ? $foUser->id : 1,
                    'quantity' => $stokSekarang,
                    'status' => 'disetujui',
                    'shipment_type' => 'initial',
                    'harga_jual' => $item['harga_jual'],
                    'verified_at' => $now,
                    'shipped_at' => $now,
                    'stock_posted_at' => $now,
                ]);
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            echo "Failed Seeding: " . $e->getMessage() . "\n";
        }
    }
}