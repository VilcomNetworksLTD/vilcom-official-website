<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    /**
     * Get all media files
     */
    public function index(Request $request): JsonResponse
    {
        $query = Media::with('creator');

        // Filter by folder
        if ($request->has('folder')) {
            $query->where('folder', $request->folder);
        }

        // Search
        if ($request->has('search')) {
            $query->search($request->search);
        }

        // Filter by type
        if ($request->has('type')) {
            $query->where('mime_type', 'like', $request->type . '%');
        }

        $media = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $media,
        ]);
    }

    /**
     * Get all folders
     */
    public function folders(): JsonResponse
    {
        $folders = Media::distinct()
            ->whereNotNull('folder')
            ->pluck('folder')
            ->filter()
            ->values();

        return response()->json([
            'success' => true,
            'data' => $folders,
        ]);
    }

    /**
     * Upload new media file
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB max
            'folder' => 'nullable|string|max:255',
            'alt_text' => 'nullable|string|max:255',
            'caption' => 'nullable|string|max:500',
        ]);

        $file = $request->file('file');
        
        // Generate unique filename
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $originalName = $file->getClientOriginalName();
        
        // Determine folder path
        $folder = $request->input('folder', 'general');
        $path = "media/{$folder}";

        // Store file
        $storedPath = $file->storeAs($path, $filename, 'public');
        
        // Get file info
        $mimeType = $file->getMimeType();
        $size = $file->getSize();

        // Create media record
        $media = Media::create([
            'filename' => $filename,
            'original_name' => $originalName,
            'mime_type' => $mimeType,
            'size' => $size,
            'path' => $storedPath,
            'url' => Storage::disk('public')->url($storedPath),
            'alt_text' => $request->input('alt_text', ''),
            'caption' => $request->input('caption', ''),
            'folder' => $folder,
            'usage_count' => 0,
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'File uploaded successfully',
            'data' => $media,
        ], 201);
    }

    /**
     * Get single media file
     */
    public function show(Media $media): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $media->load('creator'),
        ]);
    }

    /**
     * Update media metadata
     */
    public function update(Request $request, Media $media): JsonResponse
    {
        $request->validate([
            'alt_text' => 'nullable|string|max:255',
            'caption' => 'nullable|string|max:500',
            'folder' => 'nullable|string|max:255',
        ]);

        $media->update($request->only(['alt_text', 'caption', 'folder']));

        return response()->json([
            'success' => true,
            'message' => 'Media updated successfully',
            'data' => $media,
        ]);
    }

    /**
     * Delete media file
     */
    public function destroy(Media $media): JsonResponse
    {
        // Delete file from storage
        if (Storage::disk('public')->exists($media->path)) {
            Storage::disk('public')->delete($media->path);
        }

        // Delete record
        $media->delete();

        return response()->json([
            'success' => true,
            'message' => 'Media deleted successfully',
        ]);
    }

    /**
     * Bulk delete media files
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:media,id',
        ]);

        $mediaFiles = Media::whereIn('id', $request->ids)->get();

        foreach ($mediaFiles as $media) {
            // Delete files from storage
            if (Storage::disk('public')->exists($media->path)) {
                Storage::disk('public')->delete($media->path);
            }
            $media->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Media files deleted successfully',
        ]);
    }

    /**
     * Create new folder
     */
    public function createFolder(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:media,folder',
        ]);

        // Just return success - folders are virtual
        return response()->json([
            'success' => true,
            'message' => 'Folder created successfully',
            'data' => ['folder' => $request->name],
        ]);
    }

    /**
     * Delete folder (moves files to general or deletes)
     */
    public function deleteFolder(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        // Move files to general folder
        Media::where('folder', $request->name)->update(['folder' => 'general']);

        return response()->json([
            'success' => true,
            'message' => 'Folder deleted successfully',
        ]);
    }

    /**
     * Get media for public use (filtered, approved only)
     */
    public function publicIndex(Request $request): JsonResponse
    {
        $media = Media::whereNotNull('alt_text')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $media,
        ]);
    }
}

