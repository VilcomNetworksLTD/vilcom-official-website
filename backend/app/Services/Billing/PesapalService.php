<?php

namespace App\Services\Billing;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class PesapalService
{
    protected string $baseUrl;
    protected ?string $consumerKey;
    protected ?string $consumerSecret;
    protected ?string $ipnUrl;
    protected ?string $callbackUrl;

    public function __construct()
    {
        $sandbox = config('pesapal.sandbox', true);

        $this->baseUrl         = $sandbox
            ? 'https://cybqa.pesapal.com/pesapalv3'
            : 'https://pay.pesapal.com/v3';
        $this->consumerKey     = config('pesapal.consumer_key') ?? '';
        $this->consumerSecret  = config('pesapal.consumer_secret') ?? '';
        $this->ipnUrl          = config('pesapal.ipn_url') ?? '';
        $this->callbackUrl     = config('pesapal.callback_url') ?? '';
    }

    /**
     * Check if Pesapal is configured
     */
    public function isConfigured(): bool
    {
        return !empty($this->consumerKey) && !empty($this->consumerSecret);
    }

    // ── Auth ──────────────────────────────────────────────────────────────────

    public function getToken(): string
    {
        return Cache::remember('pesapal_token', 290, function () {
            $resp = Http::post("{$this->baseUrl}/api/Auth/RequestToken", [
                'consumer_key'    => $this->consumerKey,
                'consumer_secret' => $this->consumerSecret,
            ]);
            $resp->throw();
            return $resp->json('token');
        });
    }

    // ── Register IPN ──────────────────────────────────────────────────────────

    public function registerIpn(): string
    {
        $resp = Http::withToken($this->getToken())
            ->post("{$this->baseUrl}/api/URLSetup/RegisterIPN", [
                'url'              => $this->ipnUrl,
                'ipn_notification_type' => 'GET',
            ]);
        $resp->throw();
        return $resp->json('ipn_id');
    }

    // ── Submit Order ──────────────────────────────────────────────────────────

    public function submitOrder(
        float  $amount,
        string $currency,
        string $reference,
        string $description,
        string $email,
        string $phone,
        string $firstName,
        string $lastName,
    ): array {
        $ipnId = Cache::get('pesapal_ipn_id') ?? $this->registerIpn();

        $resp = Http::withToken($this->getToken())
            ->post("{$this->baseUrl}/api/Transactions/SubmitOrderRequest", [
                'id'                => $reference,
                'currency'          => $currency,
                'amount'            => $amount,
                'description'       => $description,
                'callback_url'      => $this->callbackUrl,
                'notification_id'   => $ipnId,
                'billing_address'   => [
                    'email_address' => $email,
                    'phone_number'  => $phone,
                    'first_name'    => $firstName,
                    'last_name'     => $lastName,
                ],
            ]);

        $resp->throw();
        return $resp->json();
    }

    // ── Transaction Status ─────────────────────────────────────────────────────

    public function getTransactionStatus(string $orderTrackingId): array
    {
        $resp = Http::withToken($this->getToken())
            ->get("{$this->baseUrl}/api/Transactions/GetTransactionStatus", [
                'orderTrackingId' => $orderTrackingId,
            ]);
        $resp->throw();
        return $resp->json();
    }
}