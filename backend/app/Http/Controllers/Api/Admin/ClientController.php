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
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'phone' => ['nullable', 'string', 'max:20'],
            'customer_type' => ['nullable', 'in:individual,business'],
            'company_name' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
            'county' => ['nullable', 'string', 'max:100'],
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
        ]);

        // Assign client role
        $client->assignRole('client');

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
}

