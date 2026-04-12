<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class ClientController extends Controller
{
    /**
     * Display a listing of clients.
     */
    public function index(Request $request)
    {
        $query = User::role('client')->with(['subscriptions', 'invoices']);

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('email', 'LIKE', "%{$search}%")
                    ->orWhere('phone', 'LIKE', "%{$search}%")
                    ->orWhere('company_name', 'LIKE', "%{$search}%");
            });
        }

        // Filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('customer_type')) {
            $query->where('customer_type', $request->customer_type);
        }

        // Sort
        $sortBy = $request->sort_by ?? 'created_at';
        $sortOrder = $request->sort_order ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        $clients = $query->paginate($request->per_page ?? 25);

        return response()->json($clients);
    }

    /**
     * Store a newly created client.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', Rules\Password::defaults()],
            'phone' => ['nullable', 'string', 'max:20'],
            'customer_type' => ['nullable', 'in:individual,business'],
            'company_name' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
            'county' => ['nullable', 'string', 'max:100'],
            'auto_verify' => ['nullable', 'boolean'],
            'send_welcome' => ['nullable', 'boolean'],
        ]);

        $client = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'customer_type' => $request->customer_type ?? 'individual',
            'company_name' => $request->company_name,
            'address' => $request->address,
            'city' => $request->city,
            'county' => $request->county,
            'status' => 'active',
            'email_verified_at' => $request->boolean('auto_verify', true) ? now() : null,
        ]);

        // Assign client role
        $client->assignRole('client');

        // Send notifications if requested
        if (!$request->boolean('auto_verify', true)) {
            $client->sendEmailVerificationNotification();
        }

        if ($request->boolean('send_welcome', true)) {
            $client->notify(new \App\Notifications\WelcomeNotification());
        }

        return response()->json([
            'message' => 'Client created successfully.',
            'client' => $client->load(['subscriptions', 'invoices']),
        ], 201);
    }

    /**
     * Display the specified client.
     */
    public function show(User $client)
    {
        // Ensure we're only showing clients
        if (!$client->hasRole('client')) {
            return response()->json(['message' => 'User is not a client.'], 404);
        }

        return response()->json(
            $client->load([
                'subscriptions.product',
                'subscriptions.activeAddons.addon',
                'invoices',
                'payments',
                'tickets',
            ])
        );
    }

    /**
     * Update the specified client.
     */
    public function update(Request $request, User $client)
    {
        $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'email', 'max:255', 'unique:users,email,' . $client->id],
            'phone' => ['nullable', 'string', 'max:20'],
            'customer_type' => ['nullable', 'in:individual,business'],
            'company_name' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
            'county' => ['nullable', 'string', 'max:100'],
            'status' => ['sometimes', 'in:active,inactive,suspended'],
        ]);

        $client->update($request->only([
            'name', 'email', 'phone', 'customer_type', 'company_name',
            'address', 'city', 'county', 'status'
        ]));

        return response()->json([
            'message' => 'Client updated successfully.',
            'client' => $client->load(['subscriptions', 'invoices']),
        ]);
    }

    /**
     * Remove the specified client.
     */
    public function destroy(User $client)
    {
        if (!$client->hasRole('client')) {
            return response()->json(['message' => 'User is not a client.'], 404);
        }

        // Check if client has active subscriptions
        if ($client->subscriptions()->where('status', 'active')->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete client with active subscriptions.',
            ], 422);
        }

        $client->delete();

        return response()->json([
            'message' => 'Client deleted successfully.',
        ]);
    }

    /**
     * Suspend a client.
     */
    public function suspend(Request $request, User $client)
    {
        $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        if (!$client->hasRole('client')) {
            return response()->json(['message' => 'User is not a client.'], 404);
        }

        $client->suspend($request->reason);

        return response()->json([
            'message' => 'Client suspended successfully.',
            'client' => $client,
        ]);
    }

    /**
     * Activate/reactivate a client.
     */
    public function activate(User $client)
    {
        if (!$client->hasRole('client')) {
            return response()->json(['message' => 'User is not a client.'], 404);
        }

        $client->activate();

        return response()->json([
            'message' => 'Client activated successfully.',
            'client' => $client,
        ]);
    }

    /**
     * Get client statistics.
     */
    public function statistics()
    {
        $totalClients = User::role('client')->count();
        $activeClients = User::role('client')->where('status', 'active')->count();
        $inactiveClients = User::role('client')->where('status', 'inactive')->count();
        $suspendedClients = User::role('client')->where('status', 'suspended')->count();

        $individuals = User::role('client')->where('customer_type', 'individual')->count();
        $businesses = User::role('client')->where('customer_type', 'business')->count();

        $newClientsThisMonth = User::role('client')
            ->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
            ->count();

        return response()->json([
            'total_clients' => $totalClients,
            'active_clients' => $activeClients,
            'inactive_clients' => $inactiveClients,
            'suspended_clients' => $suspendedClients,
            'individual_clients' => $individuals,
            'business_clients' => $businesses,
            'new_clients_this_month' => $newClientsThisMonth,
        ]);
    }

    /**
     * Push an existing client (who has no emerald account) to Emerald Provision queue.
     * The admin selects a product and optionally overrides the Safetika provisioning fields.
     * If all Safetika fields are provided, provisioning is attempted immediately.
     * Otherwise the client is placed in 'pending' status for the EmeraldApprovalController.
     */
    public function pushToEmerald(Request $request, User $client)
    {
        if (!$client->hasRole('client')) {
            return response()->json(['message' => 'User is not a client.'], 404);
        }

        if ($client->emerald_mbr_id) {
            return response()->json([
                'message' => 'This client already has an Emerald account (MBR ID: ' . $client->emerald_mbr_id . ').',
            ], 422);
        }

        $request->validate([
            'product_id'       => ['required', 'integer', 'exists:products,id'],
            'account_type'     => ['nullable', 'string', 'max:255'],
            'service_category' => ['nullable', 'string', 'max:255'],
            'customer_type'    => ['nullable', 'string', 'max:255'],
            'sales_person'     => ['nullable', 'string', 'max:255'],
            'notes'            => ['nullable', 'string', 'max:1000'],
        ]);

        $product = \App\Models\Product::findOrFail($request->product_id);

        // Set the pending product and move status to pending for Emerald Approval queue
        $client->update([
            'emerald_pending_product_id' => $product->id,
            'emerald_approval_status'    => 'pending',
            'emerald_approval_notes'     => $request->notes,
        ]);

        // Attempt immediate provisioning if Safetika overrides are provided
        $hasSafetikaOverrides = $request->filled('account_type')
            || $request->filled('service_category')
            || $request->filled('customer_type')
            || $request->filled('sales_person');

        if ($hasSafetikaOverrides) {
            $orchestrator = app(\App\Services\EmeraldBillingOrchestrator::class);

            $result = $orchestrator->provisionNewSubscriber(
                $client,
                (int) $product->id,
                $request->input('account_type')     ?: null,
                $request->input('service_category') ?: null,
                $request->input('customer_type')    ?: null,
                $request->input('sales_person')     ?: null,
            );

            if ($result->isSuccess()) {
                $client->update([
                    'emerald_approval_status'      => 'approved',
                    'emerald_approval_reviewed_by' => $request->user()->id,
                    'emerald_approval_reviewed_at' => now(),
                    'status'                       => 'active',
                ]);

                \Illuminate\Support\Facades\Log::info('Admin directly provisioned client to Emerald', [
                    'client_id'   => $client->id,
                    'product_id'  => $product->id,
                    'reviewed_by' => $request->user()->id,
                    'mbr_id'      => $result->customerId,
                ]);

                return response()->json([
                    'success'     => true,
                    'provisioned' => true,
                    'message'     => "Client provisioned to Emerald successfully. MBR ID: {$result->customerId}",
                    'customer_id' => $result->customerId,
                    'account_id'  => $result->accountId,
                    'client'      => $client->fresh(),
                ]);
            }

            // Provisioning failed — leave as pending so admin can retry via EmeraldApprovals
            \Illuminate\Support\Facades\Log::warning('Immediate Emerald provisioning failed — left as pending', [
                'client_id' => $client->id,
                'reason'    => $result->message,
            ]);

            return response()->json([
                'success'     => false,
                'provisioned' => false,
                'message'     => 'Provisioning failed: ' . $result->message . '. Client has been queued as pending in Emerald Approvals.',
                'client'      => $client->fresh(),
            ], 422);
        }

        // No Safetika overrides — just queued as pending
        return response()->json([
            'success'     => true,
            'provisioned' => false,
            'message'     => "Client assigned to \"{$product->name}\" and added to the Emerald Approvals queue as pending.",
            'client'      => $client->fresh()->load('pendingProduct:id,name,price_monthly,slug'),
        ]);
    }

    /**
     * Convert Application entities (Lead, Quote Request, WhatsApp) directly into a secure Client account.
     */
    public function convert(Request $request)
    {
        $request->validate([
            'source_type' => ['required', 'in:lead,quote,whatsapp'],
            'source_id' => ['required', 'integer'],
        ]);

        $name = null;
        $email = null;
        $phone = null;
        $company_name = null;
        $sourceModel = null;

        if ($request->source_type === 'lead') {
            $sourceModel = \App\Models\Lead::findOrFail($request->source_id);
            $name = $sourceModel->name;
            $email = $sourceModel->email;
            $phone = $sourceModel->phone;
            $company_name = $sourceModel->company_name;
        } elseif ($request->source_type === 'quote') {
            $sourceModel = \App\Models\QuoteRequest::findOrFail($request->source_id);
            $name = $sourceModel->contact_name;
            $email = $sourceModel->contact_email;
            $phone = $sourceModel->contact_phone;
            $company_name = $sourceModel->company_name;
        } elseif ($request->source_type === 'whatsapp') {
            $sourceModel = \App\Models\WhatsappMessage::findOrFail($request->source_id);
            $name = $sourceModel->sender_name ?? 'WhatsApp User';
            // WhatsApp might lack an email, generate a placeholder if needed
            $email = $sourceModel->email ?? ($sourceModel->sender_phone . '@vilcom-whatsapp.placeholder.com');
            $phone = $sourceModel->sender_phone;
        }

        // Search for existing user with that email
        $existingUser = User::where('email', $email)->first();

        if ($existingUser) {
            // Already exists, just ensure they have the client role and return
            if (!$existingUser->hasRole('client')) {
                $existingUser->assignRole('client');
            }

            // Bind the source to the user if applicable
            if ($request->source_type === 'quote') {
                $sourceModel->update(['user_id' => $existingUser->id]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Account already existed. Successfully linked to existing Client record.',
                'client' => $existingUser
            ]);
        }

        // Create new secure client record
        $client = User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make(\Illuminate\Support\Str::random(32)), // Secure impossible random password initially
            'phone' => $phone,
            'customer_type' => $company_name ? 'business' : 'individual',
            'company_name' => $company_name,
            'status' => 'active',
        ]);

        $client->assignRole('client');

        // Bind source to the brand new user
        if ($request->source_type === 'quote') {
            $sourceModel->update(['user_id' => $client->id]);
        } elseif ($request->source_type === 'lead') {
            $sourceModel->update(['status' => 'converted']);
        }

        // Send them a password reset email natively via Laravel so they can set their real password independently
        if (!str_contains($email, 'vilcom-whatsapp.placeholder.com')) {
            \Illuminate\Support\Facades\Password::broker()->sendResetLink(['email' => $email]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Client successfully provisioned! An email has been dispatched allowing them to securely set their password.',
            'client' => $client
        ], 201);
    }
}

