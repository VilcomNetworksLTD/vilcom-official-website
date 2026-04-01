<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Http\Resources\ActivityResource;
use Illuminate\Http\Request;

class ActivityController extends Controller
{
    public function index(Request $request)
    {
        $limit = $request->query('limit', 5);
        $activities = Activity::latest()->take($limit)->get();
        return ActivityResource::collection($activities);
    }
}
