<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\Login;
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
    }
}
