<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Subscription;
use Illuminate\Auth\Access\HandlesAuthorization;

/**
 * SubscriptionPolicy
 * 
 * Handles authorization for subscription-related actions
 * in a multi-tenant system.
 */
class SubscriptionPolicy
{
    use HandlesAuthorization;

    /**
     * Determine if user can view any subscriptions
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('subscriptions.view.own') 
            || $user->hasPermissionTo('subscriptions.view.all');
    }

    /**
     * Determine if user can view the subscription
     */
    public function view(User $user, Subscription $subscription): bool
    {
        // Admin and staff can view all
        if ($user->hasPermissionTo('subscriptions.view.all')) {
            return true;
        }

        // Users can view their own subscriptions
        if ($user->hasPermissionTo('subscriptions.view.own')) {
            return $subscription->user_id === $user->id;
        }

        return false;
    }

    /**
     * Determine if user can create subscriptions
     */
    public function create(User $user): bool
    {
        // Clients can create their own subscriptions
        // Staff can create subscriptions for clients
        return $user->hasPermissionTo('subscriptions.view.own')
            || $user->hasPermissionTo('subscriptions.create');
    }

    /**
     * Determine if user can update the subscription
     */
    public function update(User $user, Subscription $subscription): bool
    {
        // Admin and staff can update all
        if ($user->hasPermissionTo('subscriptions.edit.all')) {
            return true;
        }

        // Users can update their own subscriptions
        if ($user->hasPermissionTo('subscriptions.edit.own')) {
            return $subscription->user_id === $user->id;
        }

        return false;
    }

    /**
     * Determine if user can delete the subscription
     */
    public function delete(User $user, Subscription $subscription): bool
    {
        // Only admin/staff can delete
        return $user->hasPermissionTo('subscriptions.cancel.all');
    }

    /**
     * Determine if user can cancel the subscription
     */
    public function cancel(User $user, Subscription $subscription): bool
    {
        // Admin and staff can cancel all
        if ($user->hasPermissionTo('subscriptions.cancel.all')) {
            return true;
        }

        // Users can cancel their own subscriptions
        if ($user->hasPermissionTo('subscriptions.cancel.own')) {
            return $subscription->user_id === $user->id;
        }

        return false;
    }

    /**
     * Determine if user can suspend the subscription
     */
    public function suspend(User $user, Subscription $subscription): bool
    {
        // Only admin/staff can suspend
        return $user->hasPermissionTo('subscriptions.suspend');
    }

    /**
     * Determine if user can activate the subscription
     */
    public function activate(User $user, Subscription $subscription): bool
    {
        // Only admin/staff can activate
        return $user->hasPermissionTo('subscriptions.activate');
    }

    /**
     * Determine if user can upgrade the subscription
     */
    public function upgrade(User $user, Subscription $subscription): bool
    {
        // Admin and staff can upgrade any
        if ($user->hasPermissionTo('subscriptions.edit.all')) {
            return true;
        }

        // Users can upgrade their own subscriptions
        if ($user->hasPermissionTo('subscriptions.upgrade')) {
            return $subscription->user_id === $user->id;
        }

        return false;
    }

    /**
     * Determine if user can downgrade the subscription
     */
    public function downgrade(User $user, Subscription $subscription): bool
    {
        // Admin and staff can downgrade any
        if ($user->hasPermissionTo('subscriptions.edit.all')) {
            return true;
        }

        // Users can downgrade their own subscriptions
        if ($user->hasPermissionTo('subscriptions.downgrade')) {
            return $subscription->user_id === $user->id;
        }

        return false;
    }

    /**
     * Determine if user can renew the subscription
     */
    public function renew(User $user, Subscription $subscription): bool
    {
        // Admin and staff can renew any
        if ($user->hasPermissionTo('subscriptions.renew.all')) {
            return true;
        }

        // Users can renew their own subscriptions
        if ($user->hasPermissionTo('subscriptions.renew.own')) {
            return $subscription->user_id === $user->id;
        }

        return false;
    }

    /**
     * Determine if user can change the subscription billing cycle
     */
    public function changeBillingCycle(User $user, Subscription $subscription): bool
    {
        // Admin and staff can change any
        if ($user->hasPermissionTo('subscriptions.edit.all')) {
            return true;
        }

        // Users can change their own subscription billing cycle
        if ($user->hasPermissionTo('subscriptions.change.billing')) {
            return $subscription->user_id === $user->id;
        }

        return false;
    }

    /**
     * Determine if user can add/remove addons to the subscription
     */
    public function manageAddons(User $user, Subscription $subscription): bool
    {
        // Admin and staff can manage any
        if ($user->hasPermissionTo('subscriptions.edit.all')) {
            return true;
        }

        // Users can manage their own subscription addons
        if ($user->hasPermissionTo('subscriptions.manage.addons')) {
            return $subscription->user_id === $user->id;
        }

        return false;
    }

    /**
     * Determine if user can view invoices for the subscription
     */
    public function viewInvoices(User $user, Subscription $subscription): bool
    {
        // Admin and staff can view all
        if ($user->hasPermissionTo('invoices.view.all')) {
            return true;
        }

        // Users can view their own subscription invoices
        if ($user->hasPermissionTo('invoices.view.own')) {
            return $subscription->user_id === $user->id;
        }

        return false;
    }

    /**
     * Determine if user can view payments for the subscription
     */
    public function viewPayments(User $user, Subscription $subscription): bool
    {
        // Admin and staff can view all
        if ($user->hasPermissionTo('payments.view.all')) {
            return true;
        }

        // Users can view their own subscription payments
        if ($user->hasPermissionTo('payments.view.own')) {
            return $subscription->user_id === $user->id;
        }

        return false;
    }
}

