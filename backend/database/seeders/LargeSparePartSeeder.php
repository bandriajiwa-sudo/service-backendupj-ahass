<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\SparePart;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class LargeSparePartSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $kategoriList = [
            'Oli & Cairan', 
            'Busi & Pengapian', 
            'Rem & Pengereman', 
            'Transmisi & Penggerak', 
            'Filter',
            'Ban & Roda',
            'Kelistrikan',
            'Suspensi & Kemudi',
            'Mesin & Gasket',
            'Bodi & Aksesoris'
        ];

        $categoryIds = [];
        foreach ($kategoriList as $index => $namaKategori) {
            $kodeKategori = 'KTG-' . str_pad($index + 1, 2, '0', STR_PAD_LEFT);
            $cat = Category::updateOrCreate(
                ['nama_kategori' => $namaKategori],
                ['kode_kategori' => $kodeKategori]
            );
            $categoryIds[$namaKategori] = $cat->id;
        }

        $models = [
            'Beat ESP', 'Beat FI', 'Beat Karbu', 
            'Vario 110', 'Vario 125', 'Vario 150', 'Vario 160',
            'Scoopy FI', 'Scoopy ESP', 
            'PCX 150', 'PCX 160', 
            'ADV 150', 'ADV 160',
            'Supra X 125', 'Supra GTR', 
            'Revo FI', 
            'Sonic 150R', 
            'CBR150R', 'CB150R', 
            'CRF150L'
        ];

        $partsTemplate = [
            'Oli & Cairan' => ['AHM Oil SPX', 'AHM Oil MPX', 'Brake Fluid', 'Coolant Radiator', 'Gear Oil'],
            'Busi & Pengapian' => ['Busi NGK', 'Busi Denso', 'Koil Pengapian', 'Cop Busi'],
            'Rem & Pengereman' => ['Kampas Rem Depan', 'Kampas Rem Belakang', 'Piringan Cakram', 'Master Rem'],
            'Transmisi & Penggerak' => ['V-Belt', 'Roller Set', 'Gear Set', 'Rantai Keteng', 'Kampas Ganda'],
            'Filter' => ['Filter Udara', 'Filter Oli', 'Filter Bensin'],
            'Ban & Roda' => ['Ban Depan', 'Ban Belakang', 'Bearing Roda', 'Velg Ring'],
            'Kelistrikan' => ['Aki (Battery)', 'Bohlam Utama', 'Bohlam Sein', 'Relay Starter', 'Klakson', 'Spul', 'Kiprok'],
            'Suspensi & Kemudi' => ['Shockbreaker Belakang', 'Seal Shock Depan', 'Komstir Set', 'Per Shock Depan'],
            'Mesin & Gasket' => ['Piston Kit', 'Ring Piston', 'Gasket Blok Mesin', 'Seal Kruk As', 'Klep Intake'],
            'Bodi & Aksesoris' => ['Spion Kanan', 'Spion Kiri', 'Handle Rem', 'Cover Knalpot', 'Mika Lampu']
        ];

        // Ensure we stop at exactly 500
        $count = 0;
        
        $this->command->getOutput()->progressStart(500);

        foreach ($models as $idx => $model) {
            foreach ($partsTemplate as $catName => $items) {
                foreach ($items as $item) {
                    if ($count >= 500) {
                        break 3;
                    }
                    
                    // Generate Unique Mock Code (e.g. 17210-K59-A10 format)
                    $partCode = strtoupper(Str::random(5)) . '-' . strtoupper(Str::random(3)) . '-' . rand(10, 99);
                    $partName = $item . ' ' . $model;
                    
                    $sp = SparePart::updateOrCreate(
                        ['kode_suku_cadang' => $partCode],
                        [
                            'nama_suku_cadang' => $partName,
                            'category_id' => $categoryIds[$catName],
                            'satuan' => ($catName == 'Oli & Cairan') ? 'Botol' : 'Pcs',
                        ]
                    );

                    $sp->stock()->updateOrCreate(
                        ['spare_part_id' => $sp->id],
                        [
                            'stok_sekarang' => rand(10, 200),
                            'stok_minimum' => rand(5, 20),
                            'terakhir_diperbarui' => now()
                        ]
                    );

                    $count++;
                    $this->command->getOutput()->progressAdvance();
                }
            }
        }
        
        $this->command->getOutput()->progressFinish();
        $this->command->info("✅ Berhasil membuat $count Data Suku Cadang dan 10 Kategori!");
    }
}
