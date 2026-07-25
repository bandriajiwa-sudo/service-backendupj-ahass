<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\Login;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('login')->paginate(1000);

        return response()->json([
            'success' => true,
            'message' => 'Data berhasil diambil',
            'data' => $users->items(),
            'meta' => [
                'current_page' => $users->currentPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_user' => 'required|string|max:150',
            'role' => ['required', Rule::enum(UserRole::class)],
            'status' => ['required', Rule::enum(UserStatus::class)],
            'username' => 'required|string|max:150|unique:logins,username',
            'password' => 'required|string|min:6',
        ]);

        DB::beginTransaction();
        try {
            $user = User::create([
                'nama_user' => $validated['nama_user'],
                'role' => $validated['role'],
                'status' => $validated['status'],
            ]);

            Login::create([
                'user_id' => $user->id,
                'username' => $validated['username'],
                'password' => Hash::make($validated['password']),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'User berhasil dibuat',
                'data' => $user->load('login'),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage() . " | " . $e->getFile() . ":" . $e->getLine(),
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(User $user)
    {
        return response()->json([
            'success' => true,
            'message' => 'Data berhasil diambil',
            'data' => $user->load('login'),
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'nama_user' => 'sometimes|string|max:150',
            'role' => ['sometimes', Rule::enum(UserRole::class)],
            'status' => ['sometimes', Rule::enum(UserStatus::class)],
            'username' => 'sometimes|string|max:150|unique:logins,username,' . $user->id . ',user_id',
            'password' => 'nullable|string|min:6',
        ]);

        DB::beginTransaction();
        try {
            $user->update([
                'nama_user' => $validated['nama_user'] ?? $user->nama_user,
                'role' => $validated['role'] ?? $user->role,
                'status' => $validated['status'] ?? $user->status,
            ]);

            if ($request->has('username') || $request->filled('password')) {
                $login = Login::where('user_id', $user->id)->first();
                if ($login) {
                    if ($request->has('username'))
                        $login->username = $validated['username'];
                    if ($request->filled('password'))
                        $login->password = Hash::make($validated['password']);
                    $login->save();
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'User berhasil diperbarui',
                'data' => $user->load('login'),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage() . " | " . $e->getFile() . ":" . $e->getLine(),
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(User $user)
    {
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User berhasil dihapus dari sistem',
        ]);
    }
}
