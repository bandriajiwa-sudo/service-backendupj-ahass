<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\Category;
use App\Models\Login;
use App\Models\Personnel;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['nama_user' => 'Administrator'],
            ['role' => UserRole::Admin, 'status' => UserStatus::Active]
        );
        Login::updateOrCreate(
            ['username' => 'admin_dev'],
            ['user_id' => $admin->id, 'password' => Hash::make('password_dev_123')]
        );

        $fo = User::updateOrCreate(
            ['nama_user' => 'Resepsionis FO'],
            ['role' => UserRole::FrontOffice, 'status' => UserStatus::Active]
        );
        Login::updateOrCreate(
            ['username' => 'fo_dev'],
            ['user_id' => $fo->id, 'password' => Hash::make('password_dev_123')]
        );

        $kop = User::updateOrCreate(
            ['nama_user' => 'Manajer Koperasi'],
            ['role' => UserRole::Koperasi, 'status' => UserStatus::Active]
        );
        Login::updateOrCreate(
            ['username' => 'koperasi_dev'],
            ['user_id' => $kop->id, 'password' => Hash::make('password_dev_123')]
        );

        $upj = User::updateOrCreate(
            ['nama_user' => 'Kepala UPJ'],
            ['role' => UserRole::KepalaUPJ, 'status' => UserStatus::Active]
        );
        Login::updateOrCreate(
            ['username' => 'upj_dev'],
            ['user_id' => $upj->id, 'password' => Hash::make('password_dev_123')]
        );

        // Seed Kategori
        $categories = ['Oli', 'Busi', 'Kampas Rem', 'Rantai', 'Ban', 'Filter', 'Lampu', 'Bearing'];
        foreach ($categories as $i => $nama) {
            Category::updateOrCreate(
                ['nama_kategori' => $nama],
                ['kode_kategori' => 'KTG-' . str_pad($i + 1, 3, '0', STR_PAD_LEFT)]
            );
        }

        // Seed Personel
        Personnel::updateOrCreate(
            ['user_id' => $admin->id],
            ['nama_pegawai' => 'Administrator Sistem', 'unit_kerja' => 'UPJ Otomotif BLPT DIY', 'posisi' => 'Admin IT']
        );
        Personnel::updateOrCreate(
            ['user_id' => $fo->id],
            ['nama_pegawai' => 'Resepsionis Front Office', 'unit_kerja' => 'UPJ Otomotif BLPT DIY', 'posisi' => 'Front Office']
        );
        Personnel::updateOrCreate(
            ['user_id' => $kop->id],
            ['nama_pegawai' => 'Manajer Koperasi', 'unit_kerja' => 'Koperasi BLPT DIY', 'posisi' => 'Petugas Koperasi']
        );
        Personnel::updateOrCreate(
            ['user_id' => $upj->id],
            ['nama_pegawai' => 'Kepala UPJ Otomotif', 'unit_kerja' => 'UPJ Otomotif BLPT DIY', 'posisi' => 'Kepala UPJ']
        );
    }
}
