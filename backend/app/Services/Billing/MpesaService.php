<?php
// app/Services/Billing/MpesaService.php

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

        $this->consumerKey        = config('mpesa.consumer_key',         '');
        $this->consumerSecret     = config('mpesa.consumer_secret',      '');
        $this->shortcode          = config('mpesa.shortcode',            '');
        $this->passkey            = config('mpesa.passkey',              '');
        $this->callbackUrl        = config('mpesa.stk_callback_url',     '');
        $this->c2bValidationUrl   = config('mpesa.c2b_validation_url',   '');
        $this->c2bConfirmationUrl = config('mpesa.c2b_confirmation_url', '');
    }

    public function isConfigured(): bool
    {
        return !empty($this->consumerKey) && !empty($this->consumerSecret);
    }

    // ── OAuth ─────────────────────────────────────────────────────────────

    public function getAccessToken(): string
    {
        return Cache::remember('mpesa_access_token', 3500, function () {
            $response = Http::withBasicAuth($this->consumerKey, $this->consumerSecret)
                ->timeout(15)
                ->get("{$this->baseUrl}/oauth/v1/generate", [
                    'grant_type' => 'client_credentials',
                ]);

            if ($response->failed()) {
                throw new \RuntimeException('M-Pesa OAuth failed: ' . $response->body());
            }

            $token = $response->json('access_token');
            if (!$token) {
                throw new \RuntimeException('M-Pesa OAuth returned no token');
            }

            Log::channel('mpesa')->info('M-Pesa access token refreshed');
            return $token;
        });
    }

    // ── STK Push ──────────────────────────────────────────────────────────

    /**
     * Initiate STK Push — customer enters PIN on phone.
     *
     * @param string $phone      254XXXXXXXXX
     * @param int    $amount     KES integer
     * @param string $reference  Customer's emerald_mbr_id
     * @param string $description
     */
    public function stkPush(
        string $phone,
        int    $amount,
        string $reference,
        string $description = 'Internet Payment'
    ): array {
        $timestamp = now()->format('YmdHis');
        $password  = base64_encode($this->shortcode . $this->passkey . $timestamp);

        $payload = [
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
        ];

        Log::channel('mpesa')->info('STK Push initiated', [
            'phone' => $phone, 'amount' => $amount, 'reference' => $reference,
        ]);

        $response = Http::withToken($this->getAccessToken())
            ->timeout(30)
            ->post("{$this->baseUrl}/mpesa/stkpush/v1/processrequest", $payload);

        $result = $response->json();

        Log::channel('mpesa')->info('STK Push response', [
            'status' => $response->status(), 'response' => $result,
        ]);

        $response->throw();
        return $result;
    }

    // ── STK Query ─────────────────────────────────────────────────────────

    public function stkQuery(string $checkoutRequestId): array
    {
        $timestamp = now()->format('YmdHis');
        $password  = base64_encode($this->shortcode . $this->passkey . $timestamp);

        $response = Http::withToken($this->getAccessToken())
            ->timeout(15)
            ->post("{$this->baseUrl}/mpesa/stkpushquery/v1/query", [
                'BusinessShortCode' => $this->shortcode,
                'Password'          => $password,
                'Timestamp'         => $timestamp,
                'CheckoutRequestID' => $checkoutRequestId,
            ]);

        return $response->json() ?? [];
    }

    // ── C2B Registration ──────────────────────────────────────────────────

    /**
     * Register C2B confirmation + validation URLs.
     * Run once per environment: php artisan mpesa:register-urls
     */
    public function registerC2BUrls(): array
    {
        $payload = [
            'ShortCode'       => $this->shortcode,
            'ResponseType'    => 'Completed',
            'ConfirmationURL' => $this->c2bConfirmationUrl,
            'ValidationURL'   => $this->c2bValidationUrl,
        ];

        Log::channel('mpesa')->info('Registering C2B URLs', $payload);

        $response = Http::withToken($this->getAccessToken())
            ->timeout(15)
            ->post("{$this->baseUrl}/mpesa/c2b/v1/registerurl", $payload);

        $result = $response->json();

        Log::channel('mpesa')->info('C2B registration response', [
            'status' => $response->status(), 'response' => $result,
        ]);

        return $result ?? [];
    }

    // ── C2B Simulation (sandbox only) ─────────────────────────────────────

    /**
     * Simulate a Paybill payment for sandbox testing.
     *
     * @param float  $amount
     * @param string $msisdn   254XXXXXXXXX
     * @param string $billRef  emerald_mbr_id
     */
    public function simulateC2B(float $amount, string $msisdn, string $billRef): array
    {
        if (config('mpesa.env') !== 'sandbox') {
            throw new \RuntimeException('simulateC2B only available in sandbox');
        }

        $payload = [
            'ShortCode'     => $this->shortcode,
            'CommandID'     => 'CustomerPayBillOnline',
            'Amount'        => (int) $amount,
            'Msisdn'        => $msisdn,
            'BillRefNumber' => $billRef,
        ];

        Log::channel('mpesa')->info('C2B simulation', $payload);

        $response = Http::withToken($this->getAccessToken())
            ->timeout(15)
            ->post("{$this->baseUrl}/mpesa/c2b/v1/simulate", $payload);

        $result = $response->json();

        Log::channel('mpesa')->info('C2B simulation response', [
            'status' => $response->status(), 'response' => $result,
        ]);

        return $result ?? [];
    }

    // ── Helper ────────────────────────────────────────────────────────────

    public static function formatPhone(string $phone): string
    {
        $phone = preg_replace('/\D/', '', $phone);
        if (str_starts_with($phone, '0'))  return '254' . substr($phone, 1);
        if (str_starts_with($phone, '+'))  return ltrim($phone, '+');
        return $phone;
    }
}
