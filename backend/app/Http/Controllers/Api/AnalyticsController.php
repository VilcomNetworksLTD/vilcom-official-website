<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VisitorLog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AnalyticsController extends Controller
{
    /**
     * Track a page visit
     */
    public function track(Request $request)
    {
        $validated = $request->validate([
            'session_id' => 'required|string',
            'url' => 'nullable|string',
            'referrer' => 'nullable|string',
            'user_agent' => 'nullable|string',
        ]);

        $ipAddress = $request->ip();
        
        // Prevent duplicate tracking for the exact same session/url within a short timeframe
        // (Optional: simple debounce, but lets just log it for now as page view)

        VisitorLog::create([
            'session_id' => $validated['session_id'],
            'ip_address' => $ipAddress,
            'url' => $validated['url'] ?? null,
            'referrer' => $validated['referrer'] ?? null,
            'user_agent' => $validated['user_agent'] ?? null,
            'country' => null, // Could use geoip package later
        ]);

        return response()->json(['status' => 'success']);
    }

    /**
     * Get analytics data for admin dashboard
     */
    public function getAdminAnalytics(Request $request)
    {
        // Simple aggregate data
        $totalVisits = VisitorLog::count();
        $uniqueVisitors = VisitorLog::distinct('session_id')->count('session_id');

        // Recent visitors (latest 50 pages viewed)
        $recentLogs = VisitorLog::orderBy('created_at', 'desc')->take(50)->get();
        
        // Top paths
        $topPages = VisitorLog::select('url', \DB::raw('count(*) as views'))
            ->whereNotNull('url')
            ->groupBy('url')
            ->orderBy('views', 'desc')
            ->take(10)
            ->get();

        return response()->json([
            'metrics' => [
                'total_visits' => $totalVisits,
                'unique_visitors' => $uniqueVisitors,
            ],
            'recent_logs' => $recentLogs,
            'top_pages' => $topPages,
        ]);
    }
}
