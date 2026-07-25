<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Login;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class LoginAccountController extends Controller
{
    public function index()
    {
        $logins = Login::with('user')->paginate(1000);

        return response()->json([
            'success' => true,
            'message' => 'Data berhasil diambil',
            'data' => $logins->items(),
            'meta' => [
                'current_page' => $logins->currentPage(),
                'per_page' => $logins->perPage(),
                'total' => $logins->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id|unique:logins,user_id',
            'username' => 'required|string|max:100|unique:logins,username',
            'password' => 'required|string|min:6',
        ]);

        $login = Login::create([
            'user_id' => $validated['user_id'],
            'username' => $validated['username'],
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Akun login berhasil dibuat',
            'data' => $login,
        ], 201);
    }

    public function show(Login $loginAccount)
    {
        return response()->json([
            'success' => true,
            'message' => 'Data berhasil diambil',
            'data' => $loginAccount->load('user'),
        ]);
    }

    public function update(Request $request, Login $loginAccount)
    {
        $validated = $request->validate([
            'username' => 'sometimes|string|max:100|unique:logins,username,' . $loginAccount->id,
            'password' => 'sometimes|string|min:6',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $loginAccount->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Akun login berhasil diperbarui',
            'data' => $loginAccount->fresh('user'),
        ]);
    }

    public function destroy(Login $loginAccount)
    {
        $loginAccount->delete();

        return response()->json([
            'success' => true,
            'message' => 'Akses login berhasil dicabut',
        ]);
    }
}
