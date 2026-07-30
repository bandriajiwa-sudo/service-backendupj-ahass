<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Personnel;
use Illuminate\Http\Request;

class PersonnelController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => Personnel::with('user:id,nama_user,role,status')->orderBy('nama_pegawai')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id|unique:personnels,user_id',
            'nama_pegawai' => 'required|string|max:150',
            'unit_kerja' => 'required|string|max:150',
            'posisi' => 'required|string|max:150',
        ]);

        $personnel = Personnel::create($request->only('user_id', 'nama_pegawai', 'unit_kerja', 'posisi'));

        return response()->json([
            'success' => true,
            'message' => 'Data personel berhasil ditambahkan.',
            'data' => $personnel->load('user:id,nama_user,role,status'),
        ], 201);
    }

    public function show(Personnel $personnel)
    {
        return response()->json([
            'success' => true,
            'data' => $personnel->load('user:id,nama_user,role,status'),
        ]);
    }

    public function update(Request $request, Personnel $personnel)
    {
        $request->validate([
            'nama_pegawai' => 'required|string|max:150',
            'unit_kerja' => 'required|string|max:150',
            'posisi' => 'required|string|max:150',
        ]);

        $personnel->update($request->only('nama_pegawai', 'unit_kerja', 'posisi'));

        return response()->json([
            'success' => true,
            'message' => 'Data personel berhasil diperbarui.',
            'data' => $personnel->load('user:id,nama_user,role,status'),
        ]);
    }

    public function destroy(Personnel $personnel)
    {
        $personnel->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data personel berhasil dihapus.',
        ]);
    }
}
