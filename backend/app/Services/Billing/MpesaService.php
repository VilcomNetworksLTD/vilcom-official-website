<?php

namespace App\Services\Billing;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MpesaService
{
    protected string $baseUrl;
    protected string $consumerKey;
    protected string $consumerSecret;
    protected string $shortcode;
    protected string $passkey;
    protected string $callbackUrl;
    protected string $c2bValidationUrl;
    protected string $c2bConfirmationUrl;

    public function __construct()
    {
        $env = config('mpesa.env', 'sandbox');

        $this->baseUrl            = $env === 'production'
            ? 'https://api.safaricom.co.ke'
            : 'https://sandbox.safaricom.co.ke';
        $this->consumerKey        = config('mpesa.consumer_key');
        $this->consumerSecret     = config('mpesa.consumer_secret');
        $this->shortcode          = config('mpesa.shortcode');
        $this->passkey            = config('mpesa.passkey');
        $this->callbackUrl        = config('mpesa.stk_callback_url');
    }

    // ── OAuth Token ───────────────────────────────────────────────────────────

    public function getAccessToken(): string
    {
        return Cache::remember('mpesa_access_token', 3500, function () {
            $response = Http::withBasicAuth($this->consumerKey, $this->consumerSecret)
                ->get("{$this->baseUrl}/oauth/v1/generate", ['grant_type' => 'client_credentials']);

            if ($response->failed()) {
                throw new \RuntimeException('Failed to obtain M-Pesa access token.');
            }

            return $response->json('access_token');
        });
    }

    // ── STK Push ──────────────────────────────────────────────────────────────

    public function stkPush(
        string $phone,
        int    $amount,
        string $reference,
        string $description = 'Payment'
    ): array {
        $timestamp = now()->format('YmdHis');
        $password  = base64_encode($this->shortcode . $this->passkey . $timestamp);

        $response = Http::withToken($this->getAccessToken())
            ->post("{$this->baseUrl}/mpesa/stkpush/v1/processrequest", [
                'BusinessShortCode' => $this->shortcode,
                'Password'          => $password,
                'Timestamp'         => $timestamp,
                'TransactionType'   => 'CustomerPayBillOnline',
                'Amount'            => $amount,
                'PartyA'            => $phone,
                'PartyB'            => $this->shortcode,
                'PhoneNumber'       => $phone,
                'CallBackURL'       => $this->callbackUrl,
                'AccountReference'  => $reference,
                'TransactionDesc'   => $description,
            ]);

        Log::info('MpesaSTK', ['phone' => $phone, 'amount' => $amount, 'response' => $response->json()]);

        $response->throw();

        return $response->json();
    }

    // ── STK Query (poll status) ───────────────────────────────────────────────

    public function stkQuery(string $checkoutRequestId): array
    {
        $timestamp = now()->format('YmdHis');
        $password  = base64_encode($this->shortcode . $this->passkey . $timestamp);

        $response = Http::withToken($this->getAccessToken())
            ->post("{$this->baseUrl}/mpesa/stkpushquery/v1/query", [
                'BusinessShortCode'  => $this->shortcode,
                'Password'           => $password,
                'Timestamp'          => $timestamp,
                'CheckoutRequestID'  => $checkoutRequestId,
            ]);

        return $response->json();
    }

    // ── C2B Registration ──────────────────────────────────────────────────────

    public function registerC2BUrls(): array
    {
        $response = Http::withToken($this->getAccessToken())
            ->post("{$this->baseUrl}/mpesa/c2b/v1/registerurl", [
                'ShortCode'       => $this->shortcode,
                'ResponseType'    => 'Completed',
                'ConfirmationURL' => config('mpesa.c2b_confirmation_url'),
                'ValidationURL'   => config('mpesa.c2b_validation_url'),
            ]);

        return $response->json();
    }
}