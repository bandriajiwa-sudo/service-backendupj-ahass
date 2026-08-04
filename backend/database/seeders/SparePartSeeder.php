<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\SparePart;
use App\Models\SparePartStock;
use Carbon\Carbon;

class SparePartSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        $data = [
            // Kategori: Mesin (MSN-001 s/d MSN-025)
            ['kode' => 'MSN-001', 'nama' => 'Piston Kit Standard', 'kategori' => 'Mesin'],
            ['kode' => 'MSN-002', 'nama' => 'Ring Piston Standard', 'kategori' => 'Mesin'],
            ['kode' => 'MSN-003', 'nama' => 'Klep Intake (In)', 'kategori' => 'Mesin'],
            ['kode' => 'MSN-004', 'nama' => 'Klep Exhaust (Ex)', 'kategori' => 'Mesin'],
            ['kode' => 'MSN-005', 'nama' => 'Noken As (Camshaft)', 'kategori' => 'Mesin'],
            ['kode' => 'MSN-006', 'nama' => 'Kruk As (Crankshaft)', 'kategori' => 'Mesin'],
            ['kode' => 'MSN-007', 'nama' => 'Rantai Keteng (Timing Chain)', 'kategori' => 'Mesin'],
            ['kode' => 'MSN-008', 'nama' => 'Tensioner Rantai Keteng', 'kategori' => 'Mesin'],
            ['kode' => 'MSN-009', 'nama' => 'Busi NGK C7HSA', 'kategori' => 'Mesin'],
            ['kode' => 'MSN-010', 'nama' => 'Busi Iridium', 'kategori' => 'Mesin'],
            ['kode' => 'MSN-011', 'nama' => 'Koil Pengapian', 'kategori' => 'Mesin'],
            ['kode' => 'MSN-012', 'nama' => 'Paking Blok Mesin', 'kategori' => 'Mesin'],
            ['kode' => 'MSN-013', 'nama' => 'Paking Head Silinder', 'kategori' => 'Mesin'],
            ['kode' => 'MSN-014', 'nama' => 'Sil Klep', 'kategori' => 'Mesin'],
            ['kode' => 'MSN-015', 'nama' => 'Bos Klep', 'kategori' => 'Mesin'],
            ['kode' => 'MSN-016', 'nama' => 'Kipas Radiator', 'kategori' => 'Mesin'],
            ['kode' => 'MSN-017', 'nama' => 'Pompa Air (Water Pump)', 'kategori' => 'Mesin'],
            ['kode' => 'MSN-018', 'nama' => 'Karburator Assy', 'kategori' => 'Mesin'],
            ['kode' => 'MSN-019', 'nama' => 'Injektor', 'kategori' => 'Mesin'],
            ['kode' => 'MSN-020', 'nama' => 'Throttle Body Assy', 'kategori' => 'Mesin'],
            ['kode' => 'MSN-021', 'nama' => 'Intake Manifold', 'kategori' => 'Mesin'],
            ['kode' => 'MSN-022', 'nama' => 'Knalpot Standard', 'kategori' => 'Mesin'],
            ['kode' => 'MSN-023', 'nama' => 'Paking Knalpot', 'kategori' => 'Mesin'],
            ['kode' => 'MSN-024', 'nama' => 'Baut Blok Mesin Set', 'kategori' => 'Mesin'],
            ['kode' => 'MSN-025', 'nama' => 'Ring Baut Oli', 'kategori' => 'Mesin'],

            // Kategori: Bodi (BOD-001 s/d BOD-025)
            ['kode' => 'BOD-001', 'nama' => 'Sayap Depan Kanan (Leg Shield)', 'kategori' => 'Bodi'],
            ['kode' => 'BOD-002', 'nama' => 'Sayap Depan Kiri', 'kategori' => 'Bodi'],
            ['kode' => 'BOD-003', 'nama' => 'Spakbor Depan', 'kategori' => 'Bodi'],
            ['kode' => 'BOD-004', 'nama' => 'Spakbor Belakang', 'kategori' => 'Bodi'],
            ['kode' => 'BOD-005', 'nama' => 'Batok Lampu Depan', 'kategori' => 'Bodi'],
            ['kode' => 'BOD-006', 'nama' => 'Batok Belakang (Speedometer)', 'kategori' => 'Bodi'],
            ['kode' => 'BOD-007', 'nama' => 'Cover Knalpot (Protector)', 'kategori' => 'Bodi'],
            ['kode' => 'BOD-008', 'nama' => 'Cover Radiator', 'kategori' => 'Bodi'],
            ['kode' => 'BOD-009', 'nama' => 'Cover CVT Plastik', 'kategori' => 'Bodi'],
            ['kode' => 'BOD-010', 'nama' => 'Behel Belakang (Grip Pillion)', 'kategori' => 'Bodi'],
            ['kode' => 'BOD-011', 'nama' => 'Jok Motor Assy', 'kategori' => 'Bodi'],
            ['kode' => 'BOD-012', 'nama' => 'Kulit Jok Sintetis', 'kategori' => 'Bodi'],
            ['kode' => 'BOD-013', 'nama' => 'Spion Kanan Standard', 'kategori' => 'Bodi'],
            ['kode' => 'BOD-014', 'nama' => 'Spion Kiri Standard', 'kategori' => 'Bodi'],
            ['kode' => 'BOD-015', 'nama' => 'Standar Tengah (Main Stand)', 'kategori' => 'Bodi'],
            ['kode' => 'BOD-016', 'nama' => 'Standar Samping (Side Stand)', 'kategori' => 'Bodi'],
            ['kode' => 'BOD-017', 'nama' => 'Per Standar Tengah', 'kategori' => 'Bodi'],
            ['kode' => 'BOD-018', 'nama' => 'Per Standar Samping', 'kategori' => 'Bodi'],
            ['kode' => 'BOD-019', 'nama' => 'Step Depan Kanan (Besi)', 'kategori' => 'Bodi'],
            ['kode' => 'BOD-020', 'nama' => 'Step Depan Kiri (Besi)', 'kategori' => 'Bodi'],
            ['kode' => 'BOD-021', 'nama' => 'Footstep Belakang Set', 'kategori' => 'Bodi'],
            ['kode' => 'BOD-022', 'nama' => 'Karet Footstep Depan', 'kategori' => 'Bodi'],
            ['kode' => 'BOD-023', 'nama' => 'Mata Kucing (Reflektor)', 'kategori' => 'Bodi'],
            ['kode' => 'BOD-024', 'nama' => 'Klip Bodi Plastik (Kancing)', 'kategori' => 'Bodi'],
            ['kode' => 'BOD-025', 'nama' => 'Baut Bodi Halus (Visor)', 'kategori' => 'Bodi'],

            // Kategori: Ban & Roda (ROD-001 s/d ROD-025)
            ['kode' => 'ROD-001', 'nama' => 'Ban Luar Depan Tubetype 80/90-14', 'kategori' => 'Ban'],
            ['kode' => 'ROD-002', 'nama' => 'Ban Luar Belakang Tubetype 90/90-14', 'kategori' => 'Ban'],
            ['kode' => 'ROD-003', 'nama' => 'Ban Luar Depan Tubeless 90/80-14', 'kategori' => 'Ban'],
            ['kode' => 'ROD-004', 'nama' => 'Ban Luar Belakang Tubeless 100/80-14', 'kategori' => 'Ban'],
            ['kode' => 'ROD-005', 'nama' => 'Ban Dalam Ring 14 Standard', 'kategori' => 'Ban'],
            ['kode' => 'ROD-006', 'nama' => 'Ban Luar Depan Sport 90/80-17', 'kategori' => 'Ban'],
            ['kode' => 'ROD-007', 'nama' => 'Ban Luar Belakang Sport 120/70-17', 'kategori' => 'Ban'],
            ['kode' => 'ROD-008', 'nama' => 'Ban Dalam Ring 17 Standard', 'kategori' => 'Ban'],
            ['kode' => 'ROD-009', 'nama' => 'Pentil Tubeless Besi', 'kategori' => 'Ban'],
            ['kode' => 'ROD-010', 'nama' => 'Pentil Tubeless Karet', 'kategori' => 'Ban'],
            ['kode' => 'ROD-011', 'nama' => 'Cairan Anti Bocor Ban Tubeless', 'kategori' => 'Cairan'],
            ['kode' => 'ROD-012', 'nama' => 'Velg Racing Depan Ring 14', 'kategori' => 'Roda'],
            ['kode' => 'ROD-013', 'nama' => 'Velg Racing Belakang Ring 14', 'kategori' => 'Roda'],
            ['kode' => 'ROD-014', 'nama' => 'Velg Jari-jari (Rim Besi) Ring 17', 'kategori' => 'Roda'],
            ['kode' => 'ROD-015', 'nama' => 'Jari-jari Roda (Spoke Set) Depan', 'kategori' => 'Roda'],
            ['kode' => 'ROD-016', 'nama' => 'Jari-jari Roda (Spoke Set) Belakang', 'kategori' => 'Roda'],
            ['kode' => 'ROD-017', 'nama' => 'Tromol Depan (Hub)', 'kategori' => 'Roda'],
            ['kode' => 'ROD-018', 'nama' => 'Tromol Belakang (Hub)', 'kategori' => 'Roda'],
            ['kode' => 'ROD-019', 'nama' => 'Bearing Roda Depan (6201)', 'kategori' => 'Roda'],
            ['kode' => 'ROD-020', 'nama' => 'Bearing Roda Belakang (6302)', 'kategori' => 'Roda'],
            ['kode' => 'ROD-021', 'nama' => 'Bos Roda Depan (Collar)', 'kategori' => 'Roda'],
            ['kode' => 'ROD-022', 'nama' => 'Seal Debu Roda Depan', 'kategori' => 'Roda'],
            ['kode' => 'ROD-023', 'nama' => 'As Roda Depan', 'kategori' => 'Roda'],
            ['kode' => 'ROD-024', 'nama' => 'As Roda Belakang Matic', 'kategori' => 'Roda'],
            ['kode' => 'ROD-025', 'nama' => 'Mur As Roda Belakang', 'kategori' => 'Roda'],
        ];

        foreach ($data as $item) {
            $cat = Category::firstOrCreate(
                ['nama_kategori' => $item['kategori']],
                ['kode_kategori' => strtoupper(substr($item['kategori'], 0, 3)) . '-' . str_pad(Category::count() + 1, 3, '0', STR_PAD_LEFT)]
            );

            $sp = SparePart::updateOrCreate(
                ['kode_suku_cadang' => $item['kode']],
                [
                    'nama_suku_cadang' => $item['nama'],
                    'category_id' => $cat->id,
                    'satuan' => 'Pcs',
                ]
            );

            SparePartStock::updateOrCreate(
                ['spare_part_id' => $sp->id],
                [
                    'stok_sekarang' => 0,
                    'stok_minimum' => 5,
                    'terakhir_diperbarui' => $now,
                ]
            );
        }
    }
}