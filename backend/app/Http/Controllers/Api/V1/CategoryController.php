<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => Category::orderBy('nama_kategori')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'kode_kategori' => 'nullable|string|max:50|unique:categories,kode_kategori',
            'nama_kategori' => 'required|string|max:100|unique:categories,nama_kategori',
        ]);

        $category = Category::create($request->only('kode_kategori', 'nama_kategori'));

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil ditambahkan.',
            'data' => $category,
        ], 201);
    }

    public function show(Category $category)
    {
        return response()->json(['success' => true, 'data' => $category]);
    }

    public function update(Request $request, Category $category)
    {
        $request->validate([
            'kode_kategori' => 'nullable|string|max:50|unique:categories,kode_kategori,' . $category->id,
            'nama_kategori' => 'required|string|max:100|unique:categories,nama_kategori,' . $category->id,
        ]);

        $category->update($request->only('kode_kategori', 'nama_kategori'));

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil diperbarui.',
            'data' => $category,
        ]);
    }

    public function destroy(Category $category)
    {
        if ($category->spareParts()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Kategori tidak dapat dihapus karena masih digunakan oleh suku cadang.',
            ], 409);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kategori berhasil dihapus.',
        ]);
    }
}
