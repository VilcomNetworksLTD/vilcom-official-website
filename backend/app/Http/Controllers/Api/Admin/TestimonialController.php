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
    public function index(Request $request): JsonResponse
    {
        $query = Testimonial::with('creator');

        if ($request->has('status')) {
            if ($request->status === 'pending') {
                $query->pending();
            } elseif ($request->status === 'approved') {
                $query->approved();
            }
        }

        if ($request->has('featured')) {
            $query->featured();
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('company', 'like', "%{$request->search}%")
                  ->orWhere('content', 'like', "%{$request->search}%");
            });
        }

        $testimonials = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json(['success' => true, 'data' => $testimonials]);
    }

    public function publicIndex(): JsonResponse
    {
        $testimonials = Testimonial::approved()
            ->orderBy('is_featured', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $testimonials]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name'        => 'required|string|max:255',
            'company'     => 'nullable|string|max:255',
            'avatar'      => 'nullable|image|max:2048',
            'content'     => 'required|string|min:10|max:2000',
            'rating'      => 'required|integer|between:1,5',  // ✅ fixed
            'is_approved' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',
        ]);

        $avatarPath = null;
        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $avatarPath = $file->storeAs('testimonials', $filename, 'public');
        }

        $testimonial = Testimonial::create([
            'name'        => $request->name,
            'company'     => $request->company,
            'avatar'      => $avatarPath,
            'content'     => $request->content,
            'rating'      => (int) $request->rating,  // ✅ cast to int
            'is_approved' => $request->boolean('is_approved', false),
            'is_featured' => $request->boolean('is_featured', false),
            'created_by'  => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Testimonial created successfully',
            'data'    => $testimonial->load('creator'),
        ], 201);
    }

    public function show(Testimonial $testimonial): JsonResponse
    {
        return response()->json(['success' => true, 'data' => $testimonial->load('creator')]);
    }

    public function update(Request $request, Testimonial $testimonial): JsonResponse
    {
        $request->validate([
            'name'        => 'sometimes|string|max:255',
            'company'     => 'nullable|string|max:255',
            'avatar'      => 'nullable|image|max:2048',
            'content'     => 'sometimes|string|min:10|max:2000',
            'rating'      => 'sometimes|integer|between:1,5',  // ✅ fixed
            'is_approved' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',
        ]);

        $data = $request->except(['avatar']);

        // Cast rating to int if present
        if (isset($data['rating'])) {
            $data['rating'] = (int) $data['rating'];
        }

        if ($request->hasFile('avatar')) {
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
            'data'    => $testimonial->load('creator'),
        ]);
    }

    public function destroy(Testimonial $testimonial): JsonResponse
    {
        if ($testimonial->avatar && Storage::disk('public')->exists($testimonial->avatar)) {
            Storage::disk('public')->delete($testimonial->avatar);
        }

        $testimonial->delete();

        return response()->json(['success' => true, 'message' => 'Testimonial deleted successfully']);
    }

    public function approve(Testimonial $testimonial): JsonResponse
    {
        $testimonial->approve();
        return response()->json(['success' => true, 'message' => 'Testimonial approved successfully', 'data' => $testimonial]);
    }

    public function reject(Testimonial $testimonial): JsonResponse
    {
        $testimonial->reject();
        return response()->json(['success' => true, 'message' => 'Testimonial rejected', 'data' => $testimonial]);
    }

    public function toggleFeatured(Testimonial $testimonial): JsonResponse
    {
        $testimonial->toggleFeatured();
        return response()->json(['success' => true, 'message' => 'Featured status updated', 'data' => $testimonial]);
    }

    public function bulkApprove(Request $request): JsonResponse
    {
        $request->validate([
            'ids'   => 'required|array',
            'ids.*' => 'exists:testimonials,id',
        ]);

        Testimonial::whereIn('id', $request->ids)->update(['is_approved' => true]);

        return response()->json(['success' => true, 'message' => 'Testimonials approved successfully']);
    }

    public function bulkDelete(Request $request): JsonResponse
    {
        $request->validate([
            'ids'   => 'required|array',
            'ids.*' => 'exists:testimonials,id',
        ]);

        $testimonials = Testimonial::whereIn('id', $request->ids)->get();

        foreach ($testimonials as $testimonial) {
            if ($testimonial->avatar && Storage::disk('public')->exists($testimonial->avatar)) {
                Storage::disk('public')->delete($testimonial->avatar);
            }
            $testimonial->delete();
        }

        return response()->json(['success' => true, 'message' => 'Testimonials deleted successfully']);
    }

    public function statistics(): JsonResponse
    {
        $stats = [
            'total'          => Testimonial::count(),
            'approved'       => Testimonial::approved()->count(),
            'pending'        => Testimonial::pending()->count(),
            'featured'       => Testimonial::featured()->count(),
            'average_rating' => Testimonial::approved()->avg('rating') ?? 0,
        ];

        return response()->json(['success' => true, 'data' => $stats]);
    }
}
