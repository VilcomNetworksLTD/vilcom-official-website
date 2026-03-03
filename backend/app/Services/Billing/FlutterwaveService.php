<?php

namespace App\Services\Billing;

use Illuminate\Support\Facades\Http;

class FlutterwaveService
{
    protected string $baseUrl  = 'https://api.flutterwave.com/v3';
    protected ?string $secretKey;
    protected ?string $publicKey;

    public function __construct()
    {
        $this->secretKey = config('flutterwave.secret_key') ?? '';
        $this->publicKey = config('flutterwave.public_key') ?? '';
    }

    /**
     * Check if Flutterwave is configured
     */
    public function isConfigured(): bool
    {
        return !empty($this->secretKey) && !empty($this->publicKey);
    }

    protected function client(): \Illuminate\Http\Client\PendingRequest
    {
        return Http::withToken($this->secretKey)
                   ->baseUrl($this->baseUrl);
    }

    /**
     * Initialize a hosted payment link.
     */
    public function initializePayment(array $data): array
    {
        $response = $this->client()->post('/payments', $data);
        $response->throw();
        return $response->json();
    }

    /**
     * Verify a transaction by ID.
     */
    public function verifyTransaction(string $transactionId): array
    {
        $response = $this->client()->get("/transactions/{$transactionId}/verify");
        $response->throw();
        return $response->json();
    }

    /**
     * Initiate a refund.
     */
    public function refund(string $transactionId, float $amount): array
    {
        $response = $this->client()->post("/transactions/{$transactionId}/refund", [
            'amount' => $amount,
        ]);
        $response->throw();
        return $response->json();
    }
}