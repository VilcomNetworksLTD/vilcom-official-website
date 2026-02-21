<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Testimonial;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class TestimonialController extends Controller
{
    /**
     * Get all testimonials
     */
    public function index(Request $request): JsonResponse
    {
        $query = Testimonial::with('creator');

        // Filter by status
        if ($request->has('status')) {
            if ($request->status === 'pending') {
                $query->pending();
            } elseif ($request->status === 'approved') {
                $query->approved();
            }
        }

        // Filter featured
        if ($request->has('featured')) {
            $query->featured();
        }

        // Search
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('company', 'like', "%{$request->search}%")
                  ->orWhere('content', 'like', "%{$request->search}%");
            });
        }

        $testimonials = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $testimonials,
        ]);
    }

    /**
     * Get approved testimonials for public display
     */
    public function publicIndex(): JsonResponse
    {
        $testimonials = Testimonial::approved()
            ->orderBy('is_featured', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $testimonials,
        ]);
    }

    /**
     * Create new testimonial
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'company' => 'nullable|string|max:255',
            'avatar' => 'nullable|image|max:2048',
            'content' => 'required|string|min:10|max:2000',
            'rating' => 'required|integer|min:1|max:5',
            'is_approved' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',
        ]);

        // Handle avatar upload
        $avatarPath = null;
        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $avatarPath = $file->storeAs('testimonials', $filename, 'public');
        }

        $testimonial = Testimonial::create([
            'name' => $request->name,
            'company' => $request->company,
            'avatar' => $avatarPath,
            'content' => $request->content,
            'rating' => $request->rating,
            'is_approved' => $request->boolean('is_approved', false),
            'is_featured' => $request->boolean('is_featured', false),
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Testimonial created successfully',
            'data' => $testimonial->load('creator'),
        ], 201);
    }

    /**
     * Get single testimonial
     */
    public function show(Testimonial $testimonial): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $testimonial->load('creator'),
        ]);
    }

    /**
     * Update testimonial
     */
    public function update(Request $request, Testimonial $testimonial): JsonResponse
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'company' => 'nullable|string|max:255',
            'avatar' => 'nullable|image|max:2048',
            'content' => 'sometimes|string|min:10|max:2000',
            'rating' => 'sometimes|integer|min:1|max:5',
            'is_approved' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',
        ]);

        $data = $request->except(['avatar']);

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar
            if ($testimonial->avatar && Storage::disk('public')->exists($testimonial->avatar)) {
                Storage::disk('public')->delete($testimonial->avatar);
            }
            
            $file = $request->file('avatar');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $data['avatar'] = $file->storeAs('testimonials', $filename, 'public');
        }

        $testimonial->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Testimonial updated successfully',
            'data' => $testimonial->load('creator'),
        ]);
    }

    /**
     * Delete testimonial
     */
    public function destroy(Testimonial $testimonial): JsonResponse
    {
        // Delete avatar
        if ($testimonial->avatar && Storage::disk('public')->exists($testimonial->avatar)) {
            Storage::disk('public')->delete($testimonial->avatar);
        }

        $testimonial->delete();

        return response()->json([
            'success' => true,
            'message' => 'Testimonial deleted successfully',
        ]);
    }

    /**
     * Approve testimonial
     */
    public function approve(Testimonial $testimonial): JsonResponse
    {
        $testimonial->approve();

        return response()->json([
            'success' => true,
            'message' => 'Testimonial approved successfully',
            'data' => $testimonial,
        ]);
    }

    /**
     * Reject testimonial
     */
    public function reject(Testimonial $testimonial): JsonResponse
    {
        $testimonial->reject();

        return response()->json([
            'success' => true,
            'message' => 'Testimonial rejected',
            'data' => $testimonial,
        ]);
    }

    /**
     * Toggle featured status
     */
    public function toggleFeatured(Testimonial $testimonial): JsonResponse
    {
        $testimonial->toggleFeatured();

        return response()->json([
            'success' => true,
            'message' => 'Featured status updated',
            'data' => $testimonial,
        ]);
    }

    /**
     * Bulk approve testimonials
     */
    public function bulkApprove(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:testimonials,id',
        ]);

        Testimonial::whereIn('id', $request->ids)->update(['is_approved' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Testimonials approved successfully',
        ]);
    }

    /**
     * Bulk delete testimonials
     */
    public function bulkDelete(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:testimonials,id',
        ]);

        $testimonials = Testimonial::whereIn('id', $request->ids)->get();

        foreach ($testimonials as $testimonial) {
            if ($testimonial->avatar && Storage::disk('public')->exists($testimonial->avatar)) {
                Storage::disk('public')->delete($testimonial->avatar);
            }
            $testimonial->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Testimonials deleted successfully',
        ]);
    }

    /**
     * Get statistics
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total' => Testimonial::count(),
            'approved' => Testimonial::approved()->count(),
            'pending' => Testimonial::pending()->count(),
            'featured' => Testimonial::featured()->count(),
            'average_rating' => Testimonial::approved()->avg('rating') ?? 0,
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}

