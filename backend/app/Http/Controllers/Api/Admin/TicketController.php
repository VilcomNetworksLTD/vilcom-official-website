<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\TicketReply;
use App\Models\User;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    // ── List all tickets ──────────────────────────────────────────────────────
    public function index(Request $request)
    {
        $query = Ticket::with(['user:id,name,email', 'assignedTo:id,name'])
            ->withCount('replies')
            ->latest();

        if ($request->filled('status'))      $query->where('status', $request->status);
        if ($request->filled('priority'))    $query->where('priority', $request->priority);
        if ($request->filled('assigned_to')) $query->where('assigned_to', $request->assigned_to);
        if ($request->filled('category'))    $query->where('category', $request->category);

        if ($request->filled('search')) {
            $q = $request->search;
            $query->where(function ($sq) use ($q) {
                $sq->where('title', 'LIKE', "%{$q}%")
                   ->orWhereHas('user', fn($u) => $u->where('name', 'LIKE', "%{$q}%")->orWhere('email', 'LIKE', "%{$q}%"));
            });
        }

        $tickets = $query->paginate((int) $request->get('per_page', 20));

        return response()->json([
            'data' => $tickets->items(),
            'meta' => ['total' => $tickets->total(), 'per_page' => $tickets->perPage(),
                       'current_page' => $tickets->currentPage(), 'last_page' => $tickets->lastPage()],
        ]);
    }

    // ── Show with full thread ─────────────────────────────────────────────────
    public function show(Ticket $ticket)
    {
        $ticket->load(['user:id,name,email,phone', 'assignedTo:id,name', 'replies.user:id,name']);
        return response()->json(['data' => $ticket]);
    }

    // ── Assign ────────────────────────────────────────────────────────────────
    public function assign(Request $request, Ticket $ticket)
    {
        $validated = $request->validate(['assigned_to' => 'required|exists:users,id']);
        $ticket->update([...$validated, 'status' => 'in_progress']);
        return response()->json(['data' => $ticket->fresh(['assignedTo:id,name']), 'message' => 'Assigned.']);
    }

    // ── Resolve ───────────────────────────────────────────────────────────────
    public function resolve(Ticket $ticket)
    {
        $ticket->update(['status' => 'resolved', 'resolved_at' => now()]);
        return response()->json(['data' => $ticket->fresh(), 'message' => 'Resolved.']);
    }

    // ── Close ─────────────────────────────────────────────────────────────────
    public function close(Ticket $ticket)
    {
        $ticket->update(['status' => 'closed', 'closed_at' => now()]);
        return response()->json(['data' => $ticket->fresh(), 'message' => 'Closed.']);
    }

    // ── Reopen ────────────────────────────────────────────────────────────────
    public function reopen(Ticket $ticket)
    {
        $ticket->update(['status' => 'open', 'resolved_at' => null, 'closed_at' => null]);
        return response()->json(['data' => $ticket->fresh(), 'message' => 'Reopened.']);
    }

    // ── Internal note ─────────────────────────────────────────────────────────
    public function addInternalNote(Request $request, Ticket $ticket)
    {
        $validated = $request->validate(['note' => 'required|string']);
        $reply = TicketReply::create([
            'ticket_id' => $ticket->id, 'user_id' => $request->user()->id,
            'message' => $validated['note'], 'is_internal' => true,
        ]);
        return response()->json(['data' => $reply->load('user:id,name'), 'message' => 'Note added.'], 201);
    }

    // ── Reply ─────────────────────────────────────────────────────────────────
    public function reply(Request $request, Ticket $ticket)
    {
        $validated = $request->validate(['message' => 'required|string']);
        $reply = TicketReply::create([
            'ticket_id' => $ticket->id, 'user_id' => $request->user()->id,
            'message' => $validated['message'], 'is_internal' => false,
        ]);
        // Auto move to in_progress on first staff reply
        if ($ticket->status === 'open') $ticket->update(['status' => 'in_progress']);
        return response()->json(['data' => $reply->load('user:id,name'), 'message' => 'Reply sent.'], 201);
    }

    // ── Staff list for assignment dropdown ────────────────────────────────────
    public function staff()
    {
        $staff = User::role(['admin','staff','technical_support'])
            ->select('id','name','email')
            ->orderBy('name')
            ->get();
        return response()->json(['data' => $staff]);
    }

    // ── Analytics ─────────────────────────────────────────────────────────────
    public function analytics()
    {
        return response()->json([
            'summary' => [
                'total'       => Ticket::count(),
                'open'        => Ticket::where('status', 'open')->count(),
                'in_progress' => Ticket::where('status', 'in_progress')->count(),
                'resolved'    => Ticket::where('status', 'resolved')->count(),
                'closed'      => Ticket::where('status', 'closed')->count(),
            ],
            'by_priority' => [
                'urgent' => Ticket::where('priority', 'urgent')->whereNotIn('status', ['resolved','closed'])->count(),
                'high'   => Ticket::where('priority', 'high')->whereNotIn('status', ['resolved','closed'])->count(),
                'medium' => Ticket::where('priority', 'medium')->whereNotIn('status', ['resolved','closed'])->count(),
                'low'    => Ticket::where('priority', 'low')->whereNotIn('status', ['resolved','closed'])->count(),
            ],
            'unassigned' => Ticket::whereNull('assigned_to')->whereNotIn('status', ['resolved','closed'])->count(),
        ]);
    }
}