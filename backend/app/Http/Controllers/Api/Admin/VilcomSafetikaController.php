<?php
// app/Http/Controllers/Api/Admin/VilcomSafetikaController.php
//
// Admin/Staff endpoints for monitoring and re-triggering Vilcom Safetika provisioning.
//
// Does NOT alter any existing staff/admin functions — this is 100% new functionality.

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\VilcomProvisionOrchestrator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class VilcomSafetikaController extends Controller
{
    public function __construct(
        protected VilcomProvisionOrchestrator $vilcomOrchestrator
    ) {}

    // ── GET /api/v1/admin/vilcom-safetika ─────────────────────────────────
    /**
     * List clients and their Vilcom Safetika provisioning status.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::role('client')
            ->select([
                'id', 'name', 'email', 'phone', 'status',
                'emerald_mbr_id', 'emerald_account_id',
                'vilcom_safetika_customer_id',
                'vilcom_safetika_record_id',
                'vilcom_safetika_service_acc_id',
                'vilcom_safetika_assignment_id',
                'vilcom_safetika_serial_number',
                'vilcom_safetika_provisioned_at',
                'created_at',
            ]);

        // Filter: only show provisioned in Emerald but NOT yet in Safetika
        if ($request->filter === 'pending') {
            $query->whereNotNull('emerald_mbr_id')
                  ->whereNull('vilcom_safetika_provisioned_at');
        }

        // Filter: fully provisioned
        if ($request->filter === 'provisioned') {
            $query->whereNotNull('vilcom_safetika_provisioned_at');
        }

        // Search
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'LIKE', "%{$s}%")
                  ->orWhere('email', 'LIKE', "%{$s}%")
                  ->orWhere('vilcom_safetika_serial_number', 'LIKE', "%{$s}%")
                  ->orWhere('vilcom_safetika_customer_id', $s);
            });
        }

        return response()->json(
            $query->latest()->paginate($request->per_page ?? 25)
        );
    }

    // ── GET /api/v1/admin/vilcom-safetika/statistics ──────────────────────
    public function statistics(): JsonResponse
    {
        $clients = User::role('client');

        return response()->json([
            'emerald_provisioned'        => (clone $clients)->whereNotNull('emerald_mbr_id')->count(),
            'safetika_provisioned'        => (clone $clients)->whereNotNull('vilcom_safetika_provisioned_at')->count(),
            'safetika_pending'            => (clone $clients)->whereNotNull('emerald_mbr_id')
                                                             ->whereNull('vilcom_safetika_provisioned_at')->count(),
            'not_provisioned_at_all'      => (clone $clients)->whereNull('emerald_mbr_id')->count(),
        ]);
    }

    // ── GET /api/v1/admin/vilcom-safetika/{user} ──────────────────────────
    public function show(User $user): JsonResponse
    {
        if (!$user->hasRole('client')) {
            return response()->json(['message' => 'User is not a client.'], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'user_id'                        => $user->id,
                'name'                           => $user->name,
                'email'                          => $user->email,
                'emerald_mbr_id'                 => $user->emerald_mbr_id,
                'emerald_account_id'             => $user->emerald_account_id,
                'vilcom_safetika_customer_id'    => $user->vilcom_safetika_customer_id,
                'vilcom_safetika_record_id'      => $user->vilcom_safetika_record_id,
                'vilcom_safetika_address_id'     => $user->vilcom_safetika_address_id,
                'vilcom_safetika_service_acc_id' => $user->vilcom_safetika_service_acc_id,
                'vilcom_safetika_assignment_id'  => $user->vilcom_safetika_assignment_id,
                'vilcom_safetika_serial_number'  => $user->vilcom_safetika_serial_number,
                'vilcom_safetika_provisioned_at' => $user->vilcom_safetika_provisioned_at,
                'fully_provisioned'              => !is_null($user->vilcom_safetika_provisioned_at),
            ],
        ]);
    }

    // ── POST /api/v1/admin/vilcom-safetika/{user}/reprovision ────────────
    /**
     * Re-trigger the full Vilcom Safetika provisioning chain for a user
     * whose Safetika provisioning failed (but Emerald already succeeded).
     *
     * Guards:
     *   - User must have emerald_mbr_id (Emerald already done)
     *   - User must NOT already be Safetika-provisioned (idempotency guard)
     */
    public function reprovision(Request $request, User $user): JsonResponse
    {
        if (!$user->hasRole('client')) {
            return response()->json(['message' => 'User is not a client.'], 404);
        }

        if (!$user->emerald_mbr_id) {
            return response()->json([
                'success' => false,
                'message' => 'User does not have an Emerald MBR ID yet. Complete Emerald provisioning first.',
            ], 422);
        }

        if ($user->vilcom_safetika_provisioned_at && !$request->boolean('force')) {
            return response()->json([
                'success'      => false,
                'message'      => 'User is already provisioned in Vilcom Safetika (provisioned_at: '
                                  . $user->vilcom_safetika_provisioned_at . '). '
                                  . 'Pass force=true to re-provision.',
                'provisioned_at' => $user->vilcom_safetika_provisioned_at,
            ], 422);
        }

        Log::info('Admin manually triggering Vilcom Safetika re-provision', [
            'user_id'      => $user->id,
            'triggered_by' => $request->user()->id,
            'forced'       => $request->boolean('force'),
        ]);

        $accountType     = $request->input('account_type', config('vilcom_safetika.defaults.account_type', 'FTTH Home'));
        $serviceCategory = $request->input('service_category', config('vilcom_safetika.defaults.service_category', 'Internet'));

        $result = $this->vilcomOrchestrator->provision($user, $accountType, $serviceCategory);

        if ($result->isSuccess()) {
            return response()->json([
                'success'            => true,
                'message'            => 'Vilcom Safetika provisioning completed successfully.',
                'customer_id'        => $result->customerId,
                'record_id'          => $result->recordId,
                'service_account_id' => $result->serviceAccountId,
                'assignment_id'      => $result->assignmentId,
                'serial_number'      => $result->serialNumber,
                'user'               => $user->fresh([]),
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Safetika provisioning failed: ' . $result->message,
        ], 422);
    }
}
