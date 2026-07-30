<?php

namespace App\Models;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'role' => UserRole::class,
        'status' => UserStatus::class,
    ];

    public function login(): HasOne
    {
        return $this->hasOne(Login::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function sparePartOrders(): HasMany
    {
        return $this->hasMany(SparePartOrder::class);
    }

    public function personnel(): HasOne
    {
        return $this->hasOne(Personnel::class);
    }
}
