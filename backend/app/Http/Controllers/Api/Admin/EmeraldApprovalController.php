<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Product;
use App\Services\EmeraldBillingOrchestrator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EmeraldApprovalController extends Controller
{
    public function __construct(
        protected EmeraldBillingOrchestrator $orchestrator
    ) {}

    // ── GET /api/v1/admin/emerald-approvals ──────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $query = User::role('client')
            ->with([
                'pendingProduct:id,name,price_monthly,slug',
                'emeraldApprovalReviewer:id,name,email',
            ])
            ->whereIn('emerald_approval_status', ['pending', 'approved', 'rejected']);

        // Optional filter by status
        if ($request->filled('status') && in_array($request->status, ['none', 'pending', 'approved', 'rejected'])) {
            $query->where('emerald_approval_status', $request->status);
        }

        // Search
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'LIKE', "%{$s}%")
                  ->orWhere('email', 'LIKE', "%{$s}%")
                  ->orWhere('phone', 'LIKE', "%{$s}%");
            });
        }

        $results = $query->latest()->paginate($request->per_page ?? 25);

        return response()->json($results);
    }

    // ── GET /api/v1/admin/emerald-approvals/statistics ───────────────────
    public function statistics(): JsonResponse
    {
        return response()->json([
            'pending'  => User::role('client')->where('emerald_approval_status', 'pending')->count(),
            'approved' => User::role('client')->where('emerald_approval_status', 'approved')->count(),
            'rejected' => User::role('client')->where('emerald_approval_status', 'rejected')->count(),
            'none'     => User::role('client')->where('emerald_approval_status', 'none')->count(),
        ]);
    }

    // ── GET /api/v1/admin/emerald-approvals/{user} ────────────────────────
    public function show(User $user): JsonResponse
    {
        if (!$user->hasRole('client')) {
            return response()->json(['message' => 'User is not a client.'], 404);
        }

        $user->load([
            'pendingProduct:id,name,price_monthly,price_quarterly,price_annually,slug,category_id',
            'pendingProduct.category:id,name',
            'emeraldApprovalReviewer:id,name,email',
        ]);

        return response()->json($user);
    }

    // ── POST /api/v1/admin/emerald-approvals/{user}/approve ──────────────
    public function approve(Request $request, User $user): JsonResponse
    {
        if (!$user->hasRole('client')) {
            return response()->json(['message' => 'User is not a client.'], 404);
        }

        if ($user->emerald_mbr_id) {
            return response()->json([
                'message' => 'This user already has an Emerald account (MBR ID: ' . $user->emerald_mbr_id . ').',
            ], 422);
        }

        if (!in_array($user->emerald_approval_status, ['pending', 'rejected'])) {
            return response()->json([
                'message' => 'No pending Emerald approval request for this user.',
            ], 422);
        }

        if (!$user->emerald_pending_product_id) {
            return response()->json([
                'message' => 'No pending product associated with this user.',
            ], 422);
        }

        Log::info('Admin approving Emerald provisioning', [
            'user_id'    => $user->id,
            'product_id' => $user->emerald_pending_product_id,
            'reviewed_by'=> $request->user()->id,
        ]);

        // Provision in Emerald
        $result = $this->orchestrator->provisionNewSubscriber(
            $user,
            (int) $user->emerald_pending_product_id
        );

        if ($result->isSuccess()) {
            $user->update([
                'emerald_approval_status'      => 'approved',
                'emerald_approval_reviewed_by' => $request->user()->id,
                'emerald_approval_reviewed_at' => now(),
                'emerald_approval_notes'       => $request->input('notes'),
                'status'                       => 'active',
            ]);

            return response()->json([
                'success'     => true,
                'message'     => 'Emerald account provisioned successfully. MBR ID: ' . $result->customerId,
                'customer_id' => $result->customerId,
                'account_id'  => $result->accountId,
                'user'        => $user->fresh(),
            ]);
        }

        // Provisioning failed — still record that we tried but failed
        Log::error('Emerald provisioning failed during admin approval', [
            'user_id' => $user->id,
            'reason'  => $result->message,
        ]);

        return response()->json([
            'success' => false,
            'message' => 'Provisioning failed: ' . $result->message,
        ], 422);
    }

    // ── POST /api/v1/admin/emerald-approvals/{user}/reject ───────────────
    public function reject(Request $request, User $user): JsonResponse
    {
        if (!$user->hasRole('client')) {
            return response()->json(['message' => 'User is not a client.'], 404);
        }

        if (!in_array($user->emerald_approval_status, ['pending'])) {
            return response()->json([
                'message' => 'This user\'s request has already been processed (status: ' . $user->emerald_approval_status . ').',
            ], 422);
        }

        $request->validate([
            'notes' => 'required|string|max:1000',
        ]);

        $user->update([
            'emerald_approval_status'      => 'rejected',
            'emerald_approval_reviewed_by' => $request->user()->id,
            'emerald_approval_reviewed_at' => now(),
            'emerald_approval_notes'       => $request->notes,
        ]);

        Log::info('Emerald approval rejected', [
            'user_id'    => $user->id,
            'reviewed_by'=> $request->user()->id,
            'notes'      => $request->notes,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Emerald account request rejected.',
            'user'    => $user->fresh(),
        ]);
    }
}
