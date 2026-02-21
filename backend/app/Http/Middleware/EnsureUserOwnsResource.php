<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * EnsureUserOwnsResource Middleware
 * 
 * This middleware ensures that users can only access their own resources
 * unless they have staff/admin permissions.
 * 
 * Usage in controllers:
 * $this->middleware('owns.resource:subscription')->only(['show', 'update', 'destroy']);
 */
class EnsureUserOwnsResource
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $resourceType = null): Response
    {
        $user = $request->user();
        
        // Admin and staff can access all resources
        if ($user->hasRole(['admin', 'staff'])) {
            return $next($request);
        }

        // Get the resource from route parameters
        $resource = $this->getResourceFromRoute($request, $resourceType);
        
        if (!$resource) {
            return $next($request);
        }

        // Check if user owns the resource
        if (!$this->userOwnsResource($user, $resource)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to access this resource.',
            ], 403);
        }

        return $next($request);
    }

    /**
     * Get resource from route parameters
     */
    private function getResourceFromRoute(Request $request, ?string $resourceType)
    {
        // Try to get resource from route parameter
        $routeParams = $request->route()->parameters();
        
        if ($resourceType && isset($routeParams[$resourceType])) {
            return $routeParams[$resourceType];
        }

        // Try common resource names
        $commonResources = ['subscription', 'invoice', 'payment', 'ticket', 'domain', 'hosting'];
        
        foreach ($commonResources as $resource) {
            if (isset($routeParams[$resource])) {
                return $routeParams[$resource];
            }
        }

        return null;
    }

    /**
     * Check if user owns the resource
     */
    private function userOwnsResource($user, $resource): bool
    {
        // Check if resource has user_id
        if (method_exists($resource, 'getAttribute') && $resource->getAttribute('user_id')) {
            return $resource->user_id === $user->id;
        }

        // Check if resource has a user relationship
        if (method_exists($resource, 'user') && $resource->user) {
            return $resource->user->id === $user->id;
        }

        // Check if resource has client_id (for business accounts)
        if (method_exists($resource, 'getAttribute') && $resource->getAttribute('client_id')) {
            return $resource->client_id === $user->id;
        }

        // Default to false for safety
        return false;
    }
}

