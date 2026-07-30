<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Login;
use App\Models\LoginLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthorizerController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $login = Login::with('user')->where('username', $request->username)->first();

        if (!$login || !Hash::check($request->password, $login->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials',
            ], 401);
        }

        if ($login->user->status->value !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'User is inactive',
            ], 403);
        }

        $token = $login->createToken('auth-token')->plainTextToken;

        // Record login activity for the admin dashboard chart
        try {
            LoginLog::create([
                'user_id' => $login->user->id,
                'username' => $login->username,
                'role' => $login->user->role->value,
                'logged_in_at' => now(),
            ]);
        } catch (\Exception $e) {
            // Silently fail
        }

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'token' => $token,
                'role' => $login->user->role->value,
                'user' => $login->user,
            ],
        ]);
    }

    public function me(Request $request)
    {
        $login = $request->user()->load('user');

        return response()->json([
            'success' => true,
            'message' => 'Data berhasil diambil',
            'data' => [
                'user' => $login->user
            ]
        ]);
    }

    public function logout(Request $request)
    {
        // Revoke the token that was used to authenticate the current request
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }
}
