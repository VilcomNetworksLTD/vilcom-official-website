<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\TicketReply;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    // ── Client: List own tickets ──────────────────────────────────────────────
    public function index(Request $request)
    {
        $user  = $request->user();
        $query = Ticket::with(['assignedTo:id,name', 'replies'])
            ->withCount('replies');

        if (!$user->hasAnyRole(['admin', 'staff', 'technical_support'])) {
            $query->where('user_id', $user->id);
        }

        if ($request->filled('status'))   $query->where('status', $request->status);
        if ($request->filled('priority')) $query->where('priority', $request->priority);
        if ($request->filled('search'))   $query->where('title', 'LIKE', "%{$request->search}%");

        $tickets = $query->latest()->paginate($request->get('per_page', 15));

        return response()->json([
            'data' => $tickets->items(),
            'meta' => ['total' => $tickets->total(), 'per_page' => $tickets->perPage(),
                       'current_page' => $tickets->currentPage(), 'last_page' => $tickets->lastPage()],
        ]);
    }

    // ── Show single ───────────────────────────────────────────────────────────
    public function show(Request $request, Ticket $ticket)
    {
        $user = $request->user();
        if (!$user->hasAnyRole(['admin','staff','technical_support']) && $ticket->user_id !== $user->id) {
            abort(403);
        }
        $ticket->load(['user:id,name,email','assignedTo:id,name','replies.user:id,name']);
        return response()->json(['data' => $ticket]);
    }

    // ── Client: Create ────────────────────────────────────────────────────────
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'required|string',
            'priority'    => 'nullable|in:low,medium,high,urgent',
            'category'    => 'nullable|string|max:100',
        ]);

        $ticket = Ticket::create([
            ...$validated,
            'user_id'  => $request->user()->id,
            'status'   => 'open',
            'priority' => $validated['priority'] ?? 'medium',
        ]);

        return response()->json(['data' => $ticket->load('user:id,name,email'), 'message' => 'Ticket created.'], 201);
    }

    // ── Update (client edits own open ticket) ─────────────────────────────────
    public function update(Request $request, Ticket $ticket)
    {
        $user = $request->user();
        if (!$user->hasAnyRole(['admin','staff','technical_support']) && $ticket->user_id !== $user->id) abort(403);

        $validated = $request->validate([
            'title'       => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'priority'    => 'sometimes|in:low,medium,high,urgent',
        ]);

        $ticket->update($validated);
        return response()->json(['data' => $ticket->fresh(), 'message' => 'Ticket updated.']);
    }

    // ── Reply ─────────────────────────────────────────────────────────────────
    public function reply(Request $request, Ticket $ticket)
    {
        $user = $request->user();
        if (!$user->hasAnyRole(['admin','staff','technical_support']) && $ticket->user_id !== $user->id) abort(403);

        $validated = $request->validate(['message' => 'required|string']);

        $reply = TicketReply::create([
            'ticket_id'   => $ticket->id,
            'user_id'     => $user->id,
            'message'     => $validated['message'],
            'is_internal' => false,
        ]);

        // Reopen if client replies on resolved ticket
        if (!$user->hasAnyRole(['admin','staff','technical_support']) && in_array($ticket->status, ['resolved','closed'])) {
            $ticket->update(['status' => 'open']);
        }

        return response()->json(['data' => $reply->load('user:id,name'), 'message' => 'Reply added.'], 201);
    }

    // ── Staff: Assign ─────────────────────────────────────────────────────────
    public function assign(Request $request, Ticket $ticket)
    {
        $validated = $request->validate(['assigned_to' => 'required|exists:users,id']);
        $ticket->update([...$validated, 'status' => 'in_progress']);
        return response()->json(['data' => $ticket->fresh(['assignedTo:id,name']), 'message' => 'Ticket assigned.']);
    }

    // ── Staff: Resolve ────────────────────────────────────────────────────────
    public function resolve(Request $request, Ticket $ticket)
    {
        $ticket->update(['status' => 'resolved', 'resolved_at' => now()]);
        return response()->json(['data' => $ticket->fresh(), 'message' => 'Ticket resolved.']);
    }

    // ── Staff: Close ──────────────────────────────────────────────────────────
    public function close(Request $request, Ticket $ticket)
    {
        $ticket->update(['status' => 'closed', 'closed_at' => now()]);
        return response()->json(['data' => $ticket->fresh(), 'message' => 'Ticket closed.']);
    }

    // ── Staff: Reopen ─────────────────────────────────────────────────────────
    public function reopen(Request $request, Ticket $ticket)
    {
        $ticket->update(['status' => 'open', 'resolved_at' => null, 'closed_at' => null]);
        return response()->json(['data' => $ticket->fresh(), 'message' => 'Ticket reopened.']);
    }

    // ── Staff: Internal note ──────────────────────────────────────────────────
    public function addInternalNote(Request $request, Ticket $ticket)
    {
        $validated = $request->validate(['note' => 'required|string']);
        $reply = TicketReply::create([
            'ticket_id'   => $ticket->id,
            'user_id'     => $request->user()->id,
            'message'     => $validated['note'],
            'is_internal' => true,
        ]);
        return response()->json(['data' => $reply->load('user:id,name'), 'message' => 'Internal note added.'], 201);
    }
}