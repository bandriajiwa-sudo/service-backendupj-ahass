<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

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

            // Kategori: Rem (REM-001 s/d REM-025)
            ['kode_suku_cadang' => 'REM-001', 'nama_suku_cadang' => 'Kampas Rem Depan (Brake Pad)', 'kategori' => 'Rem', 'harga_jual' => 55000],
            ['kode_suku_cadang' => 'REM-002', 'nama_suku_cadang' => 'Kampas Rem Belakang (Tromol)', 'kategori' => 'Rem', 'harga_jual' => 45000],
            ['kode_suku_cadang' => 'REM-003', 'nama_suku_cadang' => 'Piringan Cakram Depan', 'kategori' => 'Rem', 'harga_jual' => 145000],
            ['kode_suku_cadang' => 'REM-004', 'nama_suku_cadang' => 'Piringan Cakram Belakang', 'kategori' => 'Rem', 'harga_jual' => 135000],
            ['kode_suku_cadang' => 'REM-005', 'nama_suku_cadang' => 'Kaliper Rem Depan Assy', 'kategori' => 'Rem', 'harga_jual' => 320000],
            ['kode_suku_cadang' => 'REM-006', 'nama_suku_cadang' => 'Kaliper Rem Belakang Assy', 'kategori' => 'Rem', 'harga_jual' => 300000],
            ['kode_suku_cadang' => 'REM-007', 'nama_suku_cadang' => 'Master Rem Atas', 'kategori' => 'Rem', 'harga_jual' => 185000],
            ['kode_suku_cadang' => 'REM-008', 'nama_suku_cadang' => 'Master Rem Bawah', 'kategori' => 'Rem', 'harga_jual' => 175000],
            ['kode_suku_cadang' => 'REM-009', 'nama_suku_cadang' => 'Selang Rem Depan', 'kategori' => 'Rem', 'harga_jual' => 65000],
            ['kode_suku_cadang' => 'REM-010', 'nama_suku_cadang' => 'Selang Rem Belakang', 'kategori' => 'Rem', 'harga_jual' => 75000],
            ['kode_suku_cadang' => 'REM-011', 'nama_suku_cadang' => 'Baut Nipple Kaliper', 'kategori' => 'Rem', 'harga_jual' => 15000],
            ['kode_suku_cadang' => 'REM-012', 'nama_suku_cadang' => 'Karet Boot Kaliper', 'kategori' => 'Rem', 'harga_jual' => 20000],
            ['kode_suku_cadang' => 'REM-013', 'nama_suku_cadang' => 'Pin Kaliper Rem', 'kategori' => 'Rem', 'harga_jual' => 25000],
            ['kode_suku_cadang' => 'REM-014', 'nama_suku_cadang' => 'Handle Rem Kanan', 'kategori' => 'Rem', 'harga_jual' => 35000],
            ['kode_suku_cadang' => 'REM-015', 'nama_suku_cadang' => 'Handle Rem Kiri', 'kategori' => 'Rem', 'harga_jual' => 35000],
            ['kode_suku_cadang' => 'REM-016', 'nama_suku_cadang' => 'Per Kampas Rem Tromol', 'kategori' => 'Rem', 'harga_jual' => 5000],
            ['kode_suku_cadang' => 'REM-017', 'nama_suku_cadang' => 'Kawat Rem Belakang', 'kategori' => 'Rem', 'harga_jual' => 25000],
            ['kode_suku_cadang' => 'REM-018', 'nama_suku_cadang' => 'Paha Rem Belakang', 'kategori' => 'Rem', 'harga_jual' => 45000],
            ['kode_suku_cadang' => 'REM-019', 'nama_suku_cadang' => 'Pedal Rem', 'kategori' => 'Rem', 'harga_jual' => 85000],
            ['kode_suku_cadang' => 'REM-020', 'nama_suku_cadang' => 'Switch Rem Depan', 'kategori' => 'Rem', 'harga_jual' => 25000],
            ['kode_suku_cadang' => 'REM-021', 'nama_suku_cadang' => 'Switch Rem Belakang', 'kategori' => 'Rem', 'harga_jual' => 30000],
            ['kode_suku_cadang' => 'REM-022', 'nama_suku_cadang' => 'Baut Cakram', 'kategori' => 'Rem', 'harga_jual' => 5000],
            ['kode_suku_cadang' => 'REM-023', 'nama_suku_cadang' => 'Tabung Minyak Rem', 'kategori' => 'Rem', 'harga_jual' => 45000],
            ['kode_suku_cadang' => 'REM-024', 'nama_suku_cadang' => 'Seal Master Rem', 'kategori' => 'Rem', 'harga_jual' => 35000],
            ['kode_suku_cadang' => 'REM-025', 'nama_suku_cadang' => 'Tutup Tabung Minyak Rem', 'kategori' => 'Rem', 'harga_jual' => 15000],

            // Kategori: Transmisi & Kopling (TRN-001 s/d TRN-025)
            ['kode_suku_cadang' => 'TRN-001', 'nama_suku_cadang' => 'Kampas Kopling Set', 'kategori' => 'Transmisi', 'harga_jual' => 125000],
            ['kode_suku_cadang' => 'TRN-002', 'nama_suku_cadang' => 'Plat Gesek Kopling', 'kategori' => 'Transmisi', 'harga_jual' => 65000],
            ['kode_suku_cadang' => 'TRN-003', 'nama_suku_cadang' => 'Per Kopling Racing', 'kategori' => 'Transmisi', 'harga_jual' => 75000],
            ['kode_suku_cadang' => 'TRN-004', 'nama_suku_cadang' => 'Rumah Kopling', 'kategori' => 'Transmisi', 'harga_jual' => 285000],
            ['kode_suku_cadang' => 'TRN-005', 'nama_suku_cadang' => 'Kabel Kopling', 'kategori' => 'Transmisi', 'harga_jual' => 45000],
            ['kode_suku_cadang' => 'TRN-006', 'nama_suku_cadang' => 'Handle Kopling', 'kategori' => 'Transmisi', 'harga_jual' => 35000],
            ['kode_suku_cadang' => 'TRN-007', 'nama_suku_cadang' => 'Gir Depan Standard', 'kategori' => 'Transmisi', 'harga_jual' => 45000],
            ['kode_suku_cadang' => 'TRN-008', 'nama_suku_cadang' => 'Gir Belakang Standard', 'kategori' => 'Transmisi', 'harga_jual' => 85000],
            ['kode_suku_cadang' => 'TRN-009', 'nama_suku_cadang' => 'Rantai Roda Standard', 'kategori' => 'Transmisi', 'harga_jual' => 120000],
            ['kode_suku_cadang' => 'TRN-010', 'nama_suku_cadang' => 'Gear Set (Gir & Rantai)', 'kategori' => 'Transmisi', 'harga_jual' => 225000],
            ['kode_suku_cadang' => 'TRN-011', 'nama_suku_cadang' => 'V-Belt CVT Matic', 'kategori' => 'Transmisi', 'harga_jual' => 145000],
            ['kode_suku_cadang' => 'TRN-012', 'nama_suku_cadang' => 'Roller CVT Set', 'kategori' => 'Transmisi', 'harga_jual' => 65000],
            ['kode_suku_cadang' => 'TRN-013', 'nama_suku_cadang' => 'Mangkok Ganda CVT', 'kategori' => 'Transmisi', 'harga_jual' => 165000],
            ['kode_suku_cadang' => 'TRN-014', 'nama_suku_cadang' => 'Kampas Ganda CVT', 'kategori' => 'Transmisi', 'harga_jual' => 135000],
            ['kode_suku_cadang' => 'TRN-015', 'nama_suku_cadang' => 'Per CVT 1000 RPM', 'kategori' => 'Transmisi', 'harga_jual' => 45000],
            ['kode_suku_cadang' => 'TRN-016', 'nama_suku_cadang' => 'Per Sentrifugal (Per Ganda)', 'kategori' => 'Transmisi', 'harga_jual' => 25000],
            ['kode_suku_cadang' => 'TRN-017', 'nama_suku_cadang' => 'Slide Piece (Slider) CVT', 'kategori' => 'Transmisi', 'harga_jual' => 25000],
            ['kode_suku_cadang' => 'TRN-018', 'nama_suku_cadang' => 'Bos Pulley Depan', 'kategori' => 'Transmisi', 'harga_jual' => 55000],
            ['kode_suku_cadang' => 'TRN-019', 'nama_suku_cadang' => 'Kipas Pulley Depan', 'kategori' => 'Transmisi', 'harga_jual' => 75000],
            ['kode_suku_cadang' => 'TRN-020', 'nama_suku_cadang' => 'Rumah Roller (Drive Pulley)', 'kategori' => 'Transmisi', 'harga_jual' => 125000],
            ['kode_suku_cadang' => 'TRN-021', 'nama_suku_cadang' => 'As Pulley Belakang', 'kategori' => 'Transmisi', 'harga_jual' => 195000],
            ['kode_suku_cadang' => 'TRN-022', 'nama_suku_cadang' => 'Seal Kruk As CVT', 'kategori' => 'Transmisi', 'harga_jual' => 35000],
            ['kode_suku_cadang' => 'TRN-023', 'nama_suku_cadang' => 'Gigi Rasio Set', 'kategori' => 'Transmisi', 'harga_jual' => 450000],
            ['kode_suku_cadang' => 'TRN-024', 'nama_suku_cadang' => 'Karet Bantalan Gir (Damper)', 'kategori' => 'Transmisi', 'harga_jual' => 35000],
            ['kode_suku_cadang' => 'TRN-025', 'nama_suku_cadang' => 'Baut CVT Set', 'kategori' => 'Transmisi', 'harga_jual' => 40000],

            // Kategori: Kelistrikan (KLS-001 s/d KLS-025)
            ['kode_suku_cadang' => 'KLS-001', 'nama_suku_cadang' => 'Aki Kering 12V 5Ah', 'kategori' => 'Kelistrikan', 'harga_jual' => 210000],
            ['kode_suku_cadang' => 'KLS-002', 'nama_suku_cadang' => 'Aki Basah 12V 5Ah', 'kategori' => 'Kelistrikan', 'harga_jual' => 165000],
            ['kode_suku_cadang' => 'KLS-003', 'nama_suku_cadang' => 'Kiprok (Regulator Rectifier)', 'kategori' => 'Kelistrikan', 'harga_jual' => 125000],
            ['kode_suku_cadang' => 'KLS-004', 'nama_suku_cadang' => 'CDI Racing', 'kategori' => 'Kelistrikan', 'harga_jual' => 250000],
            ['kode_suku_cadang' => 'KLS-005', 'nama_suku_cadang' => 'ECU Standard', 'kategori' => 'Kelistrikan', 'harga_jual' => 850000],
            ['kode_suku_cadang' => 'KLS-006', 'nama_suku_cadang' => 'Spul Stator (Kumparan)', 'kategori' => 'Kelistrikan', 'harga_jual' => 320000],
            ['kode_suku_cadang' => 'KLS-007', 'nama_suku_cadang' => 'Magnet (Rotor)', 'kategori' => 'Kelistrikan', 'harga_jual' => 450000],
            ['kode_suku_cadang' => 'KLS-008', 'nama_suku_cadang' => 'Bendik Starter (Relay)', 'kategori' => 'Kelistrikan', 'harga_jual' => 75000],
            ['kode_suku_cadang' => 'KLS-009', 'nama_suku_cadang' => 'Dinamo Starter Assy', 'kategori' => 'Kelistrikan', 'harga_jual' => 250000],
            ['kode_suku_cadang' => 'KLS-010', 'nama_suku_cadang' => 'Areng Starter (Carbon Brush)', 'kategori' => 'Kelistrikan', 'harga_jual' => 35000],
            ['kode_suku_cadang' => 'KLS-011', 'nama_suku_cadang' => 'Bohlam Lampu Utama (Halogen)', 'kategori' => 'Kelistrikan', 'harga_jual' => 35000],
            ['kode_suku_cadang' => 'KLS-012', 'nama_suku_cadang' => 'Lampu LED Utama', 'kategori' => 'Kelistrikan', 'harga_jual' => 120000],
            ['kode_suku_cadang' => 'KLS-013', 'nama_suku_cadang' => 'Bohlam Lampu Rem', 'kategori' => 'Kelistrikan', 'harga_jual' => 15000],
            ['kode_suku_cadang' => 'KLS-014', 'nama_suku_cadang' => 'Bohlam Lampu Sein', 'kategori' => 'Kelistrikan', 'harga_jual' => 10000],
            ['kode_suku_cadang' => 'KLS-015', 'nama_suku_cadang' => 'Flasher Sein', 'kategori' => 'Kelistrikan', 'harga_jual' => 30000],
            ['kode_suku_cadang' => 'KLS-016', 'nama_suku_cadang' => 'Klakson Standard', 'kategori' => 'Kelistrikan', 'harga_jual' => 45000],
            ['kode_suku_cadang' => 'KLS-017', 'nama_suku_cadang' => 'Saklar Kiri (Lampu/Klakson)', 'kategori' => 'Kelistrikan', 'harga_jual' => 85000],
            ['kode_suku_cadang' => 'KLS-018', 'nama_suku_cadang' => 'Saklar Kanan (Starter/Engine Kill)', 'kategori' => 'Kelistrikan', 'harga_jual' => 75000],
            ['kode_suku_cadang' => 'KLS-019', 'nama_suku_cadang' => 'Kabel Bodi (Wiring Harness)', 'kategori' => 'Kelistrikan', 'harga_jual' => 450000],
            ['kode_suku_cadang' => 'KLS-020', 'nama_suku_cadang' => 'Sekring Tancap 10A', 'kategori' => 'Kelistrikan', 'harga_jual' => 2000],
            ['kode_suku_cadang' => 'KLS-021', 'nama_suku_cadang' => 'Sekring Tancap 15A', 'kategori' => 'Kelistrikan', 'harga_jual' => 2000],
            ['kode_suku_cadang' => 'KLS-022', 'nama_suku_cadang' => 'Soket Lampu Utama', 'kategori' => 'Kelistrikan', 'harga_jual' => 25000],
            ['kode_suku_cadang' => 'KLS-023', 'nama_suku_cadang' => 'Switch Standar Samping', 'kategori' => 'Kelistrikan', 'harga_jual' => 45000],
            ['kode_suku_cadang' => 'KLS-024', 'nama_suku_cadang' => 'Sensor O2', 'kategori' => 'Kelistrikan', 'harga_jual' => 150000],
            ['kode_suku_cadang' => 'KLS-025', 'nama_suku_cadang' => 'Speedometer Digital Assy', 'kategori' => 'Kelistrikan', 'harga_jual' => 650000],

            // Kategori: Suspensi & Kemudi (SUS-001 s/d SUS-025)
            ['kode_suku_cadang' => 'SUS-001', 'nama_suku_cadang' => 'Shockbreaker Depan Assy', 'kategori' => 'Suspensi', 'harga_jual' => 450000],
            ['kode_suku_cadang' => 'SUS-002', 'nama_suku_cadang' => 'Shockbreaker Belakang (Twin)', 'kategori' => 'Suspensi', 'harga_jual' => 350000],
            ['kode_suku_cadang' => 'SUS-003', 'nama_suku_cadang' => 'Monoshock Belakang', 'kategori' => 'Suspensi', 'harga_jual' => 550000],
            ['kode_suku_cadang' => 'SUS-004', 'nama_suku_cadang' => 'Per Shock Depan', 'kategori' => 'Suspensi', 'harga_jual' => 65000],
            ['kode_suku_cadang' => 'SUS-005', 'nama_suku_cadang' => 'Seal Shock Depan', 'kategori' => 'Suspensi', 'harga_jual' => 25000],
            ['kode_suku_cadang' => 'SUS-006', 'nama_suku_cadang' => 'Seal Debu Shock Depan', 'kategori' => 'Suspensi', 'harga_jual' => 15000],
            ['kode_suku_cadang' => 'SUS-007', 'nama_suku_cadang' => 'As Shock Depan', 'kategori' => 'Suspensi', 'harga_jual' => 125000],
            ['kode_suku_cadang' => 'SUS-008', 'nama_suku_cadang' => 'Komstir Set', 'kategori' => 'Suspensi', 'harga_jual' => 110000],
            ['kode_suku_cadang' => 'SUS-009', 'nama_suku_cadang' => 'Peluru Komstir (Bearing Bambu)', 'kategori' => 'Suspensi', 'harga_jual' => 65000],
            ['kode_suku_cadang' => 'SUS-010', 'nama_suku_cadang' => 'Segitiga Atas (Crown Handle)', 'kategori' => 'Suspensi', 'harga_jual' => 175000],
            ['kode_suku_cadang' => 'SUS-011', 'nama_suku_cadang' => 'Segitiga Bawah (Steering Stem)', 'kategori' => 'Suspensi', 'harga_jual' => 280000],
            ['kode_suku_cadang' => 'SUS-012', 'nama_suku_cadang' => 'Stang Kemudi Pipa', 'kategori' => 'Suspensi', 'harga_jual' => 85000],
            ['kode_suku_cadang' => 'SUS-013', 'nama_suku_cadang' => 'Stang Jepit Racing', 'kategori' => 'Suspensi', 'harga_jual' => 150000],
            ['kode_suku_cadang' => 'SUS-014', 'nama_suku_cadang' => 'Jalu Stang (Bar End)', 'kategori' => 'Suspensi', 'harga_jual' => 35000],
            ['kode_suku_cadang' => 'SUS-015', 'nama_suku_cadang' => 'Handgrip Karet Set', 'kategori' => 'Suspensi', 'harga_jual' => 45000],
            ['kode_suku_cadang' => 'SUS-016', 'nama_suku_cadang' => 'Bos Swing Arm', 'kategori' => 'Suspensi', 'harga_jual' => 55000],
            ['kode_suku_cadang' => 'SUS-017', 'nama_suku_cadang' => 'Swing Arm (Lengan Ayun)', 'kategori' => 'Suspensi', 'harga_jual' => 350000],
            ['kode_suku_cadang' => 'SUS-018', 'nama_suku_cadang' => 'Karet Tensioner Rantai Arm', 'kategori' => 'Suspensi', 'harga_jual' => 25000],
            ['kode_suku_cadang' => 'SUS-019', 'nama_suku_cadang' => 'Anting Shock Peninggi', 'kategori' => 'Suspensi', 'harga_jual' => 45000],
            ['kode_suku_cadang' => 'SUS-020', 'nama_suku_cadang' => 'Baut L Shock Depan Bawah', 'kategori' => 'Suspensi', 'harga_jual' => 10000],
            ['kode_suku_cadang' => 'SUS-021', 'nama_suku_cadang' => 'Mur Komstir', 'kategori' => 'Suspensi', 'harga_jual' => 15000],
            ['kode_suku_cadang' => 'SUS-022', 'nama_suku_cadang' => 'Bos Monoshock (Bushing)', 'kategori' => 'Suspensi', 'harga_jual' => 45000],
            ['kode_suku_cadang' => 'SUS-023', 'nama_suku_cadang' => 'Linkage Suspensi (Pro-Link)', 'kategori' => 'Suspensi', 'harga_jual' => 185000],
            ['kode_suku_cadang' => 'SUS-024', 'nama_suku_cadang' => 'Karet Dudukan Stang', 'kategori' => 'Suspensi', 'harga_jual' => 20000],
            ['kode_suku_cadang' => 'SUS-025', 'nama_suku_cadang' => 'Karet Boot Shock Depan', 'kategori' => 'Suspensi', 'harga_jual' => 35000],

            // Kategori: Filter & Cairan (FLT-001 s/d FLT-025)
            ['kode_suku_cadang' => 'FLT-001', 'nama_suku_cadang' => 'Oli Mesin 10W-40 (1 Liter)', 'kategori' => 'Cairan', 'harga_jual' => 65000],
            ['kode_suku_cadang' => 'FLT-002', 'nama_suku_cadang' => 'Oli Mesin 20W-50 (800ml)', 'kategori' => 'Cairan', 'harga_jual' => 45000],
            ['kode_suku_cadang' => 'FLT-003', 'nama_suku_cadang' => 'Oli Transmisi Matic (Gardan)', 'kategori' => 'Cairan', 'harga_jual' => 18000],
            ['kode_suku_cadang' => 'FLT-004', 'nama_suku_cadang' => 'Coolant Radiator (1 Liter)', 'kategori' => 'Cairan', 'harga_jual' => 35000],
            ['kode_suku_cadang' => 'FLT-005', 'nama_suku_cadang' => 'Minyak Rem DOT 3 (50ml)', 'kategori' => 'Cairan', 'harga_jual' => 12000],
            ['kode_suku_cadang' => 'FLT-006', 'nama_suku_cadang' => 'Minyak Rem DOT 4 (300ml)', 'kategori' => 'Cairan', 'harga_jual' => 45000],
            ['kode_suku_cadang' => 'FLT-007', 'nama_suku_cadang' => 'Oli Shockbreaker (Botol)', 'kategori' => 'Cairan', 'harga_jual' => 20000],
            ['kode_suku_cadang' => 'FLT-008', 'nama_suku_cadang' => 'Cairan Pembersih Injektor', 'kategori' => 'Cairan', 'harga_jual' => 35000],
            ['kode_suku_cadang' => 'FLT-009', 'nama_suku_cadang' => 'Brake Cleaner Spray', 'kategori' => 'Cairan', 'harga_jual' => 45000],
            ['kode_suku_cadang' => 'FLT-010', 'nama_suku_cadang' => 'Chain Lube (Pelumas Rantai)', 'kategori' => 'Cairan', 'harga_jual' => 35000],
            ['kode_suku_cadang' => 'FLT-011', 'nama_suku_cadang' => 'Pelumas Anti Karat (WD)', 'kategori' => 'Cairan', 'harga_jual' => 40000],
            ['kode_suku_cadang' => 'FLT-012', 'nama_suku_cadang' => 'Lem Gasket Mesin (Tribond)', 'kategori' => 'Cairan', 'harga_jual' => 25000],
            ['kode_suku_cadang' => 'FLT-013', 'nama_suku_cadang' => 'Gemuk CVT (CVT Grease)', 'kategori' => 'Cairan', 'harga_jual' => 15000],
            ['kode_suku_cadang' => 'FLT-014', 'nama_suku_cadang' => 'Gemuk Bearing (Chassis Grease)', 'kategori' => 'Cairan', 'harga_jual' => 20000],
            ['kode_suku_cadang' => 'FLT-015', 'nama_suku_cadang' => 'Air Aki Tambah (Botol Biru)', 'kategori' => 'Cairan', 'harga_jual' => 5000],
            ['kode_suku_cadang' => 'FLT-016', 'nama_suku_cadang' => 'Air Aki Zuur (Botol Merah)', 'kategori' => 'Cairan', 'harga_jual' => 10000],
            ['kode_suku_cadang' => 'FLT-017', 'nama_suku_cadang' => 'Filter Udara Kertas Matic', 'kategori' => 'Filter', 'harga_jual' => 45000],
            ['kode_suku_cadang' => 'FLT-018', 'nama_suku_cadang' => 'Filter Udara Busa Bebek', 'kategori' => 'Filter', 'harga_jual' => 25000],
            ['kode_suku_cadang' => 'FLT-019', 'nama_suku_cadang' => 'Filter Udara Racing K&N', 'kategori' => 'Filter', 'harga_jual' => 150000],
            ['kode_suku_cadang' => 'FLT-020', 'nama_suku_cadang' => 'Filter Oli Kertas', 'kategori' => 'Filter', 'harga_jual' => 30000],
            ['kode_suku_cadang' => 'FLT-021', 'nama_suku_cadang' => 'Filter Oli Besi Saringan', 'kategori' => 'Filter', 'harga_jual' => 15000],
            ['kode_suku_cadang' => 'FLT-022', 'nama_suku_cadang' => 'Filter Bensin Injeksi (Fuel Pump)', 'kategori' => 'Filter', 'harga_jual' => 85000],
            ['kode_suku_cadang' => 'FLT-023', 'nama_suku_cadang' => 'Filter Bensin Karburator', 'kategori' => 'Filter', 'harga_jual' => 15000],
            ['kode_suku_cadang' => 'FLT-024', 'nama_suku_cadang' => 'Shampo Motor (Pouch)', 'kategori' => 'Cairan', 'harga_jual' => 15000],
            ['kode_suku_cadang' => 'FLT-025', 'nama_suku_cadang' => 'Semir Ban Motor', 'kategori' => 'Cairan', 'harga_jual' => 25000],

            // Kategori: Bodi & Eksterior (BOD-001 s/d BOD-025)
            ['kode_suku_cadang' => 'BOD-001', 'nama_suku_cadang' => 'Spakbor Depan', 'kategori' => 'Bodi', 'harga_jual' => 95000],
            ['kode_suku_cadang' => 'BOD-002', 'nama_suku_cadang' => 'Spakbor Belakang', 'kategori' => 'Bodi', 'harga_jual' => 85000],
            ['kode_suku_cadang' => 'BOD-003', 'nama_suku_cadang' => 'Sayap Luar Kiri (Leg Shield)', 'kategori' => 'Bodi', 'harga_jual' => 125000],
            ['kode_suku_cadang' => 'BOD-004', 'nama_suku_cadang' => 'Sayap Luar Kanan (Leg Shield)', 'kategori' => 'Bodi', 'harga_jual' => 125000],
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

        // Memasukkan array created_at dan updated_at secara dinamis
        $data = array_map(function ($item) use ($now) {
            $item['created_at'] = $now;
            $item['updated_at'] = $now;
            return $item;
        }, $data);

        // Reset data secara aman tanpa error foreign keys (PostgreSQL)
        DB::statement('TRUNCATE TABLE spare_parts CASCADE');
        DB::statement('TRUNCATE TABLE spare_part_stocks CASCADE');

        // Memasukkan ke database suku cadang master
        $chunks = array_chunk($data, 50);
        foreach ($chunks as $chunk) {
            DB::table('spare_parts')->insert($chunk);
        }

        // Mengambil semua data yg barusan masuk buat dipasangkan dengan stok awal (10-50 random) dan batas minimum 10
        $allParts = \App\Models\SparePart::all();
        $stockData = [];

        foreach ($allParts as $part) {
            $stockData[] = [
                'spare_part_id' => $part->id,
                'stok_sekarang' => rand(15, 60),
                'stok_minimum' => 15,
                'terakhir_diperbarui' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        // Insert stock data dalam chunk (supaya enteng)
        $stockChunks = array_chunk($stockData, 50);
        foreach ($stockChunks as $chunk) {
            DB::table('spare_part_stocks')->insert($chunk);
        }
    }
}