<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Personnel extends Model
{
    protected $table = 'personnels';

    protected $fillable = [
        'user_id',
        'nama_pegawai',
        'unit_kerja',
        'posisi',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
