<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    /**
     * Generate a pre-signed S3 URL for direct file upload from client.
     */
    public function getPresignedUrl(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'folder' => 'nullable|string|in:avatar,evidence,documents,others',
            'extension' => 'required|string',
            'content_type' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal.',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $folder = $request->input('folder', 'others');
            $extension = $request->input('extension');
            $contentType = $request->input('content_type');

            // Secure unique path generator to prevent overrides
            $fileName = (string) Str::uuid() . '-' . time() . '.' . $extension;
            $path = "uploads/{$folder}/{$fileName}";

            $disk = Storage::disk('s3');
            $client = $disk->getClient();
            $bucket = config('filesystems.disks.s3.bucket');

            // Generate an Amazon S3 pre-signed URL to PUT object
            $command = $client->getCommand('PutObject', [
                'Bucket' => $bucket,
                'Key' => $path,
                'ContentType' => $contentType,
                'ACL' => 'public-read' // Set to public-read if we want it immediately accessible without a signed GET url later
            ]);

            // Expiration Time constraint (e.g. 5 minutes)
            $expires = '+5 minutes';
            $request = $client->createPresignedRequest($command, $expires);

            // Constructing successful payload 
            return response()->json([
                'success' => true,
                'data' => [
                    'upload_url' => (string) $request->getUri(),
                    'file_path' => $path,
                    'file_url' => $disk->url($path), // Final public URL assumed based on disk config
                    'expires_in_minutes' => 5,
                    'file_name' => $fileName
                ],
                'message' => 'S3 Presigned URL generated successfully.'
            ]);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("S3 Presigned URL generation failed: " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengamankan URL unggah S3.'
            ], 500);
        }
    }
}
