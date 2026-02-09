<?php

namespace App\Services\Auth;

use App\Models\User;
use App\Notifications\WelcomeNotification;
use App\Notifications\EmailVerificationNotification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

class AuthService
{
    /**
     * Send welcome email to newly registered user
     *
     * @param User $user
     * @return void
     */
    public function sendWelcomeEmail(User $user): void
    {
        try {
            if ($user->getNotificationPreferences('email')) {
                $user->notify(new WelcomeNotification());
                
                Log::info('Welcome email sent', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to send welcome email', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send email verification notification
     *
     * @param User $user
     * @return void
     */
    public function sendEmailVerification(User $user): void
    {
        try {
            $user->sendEmailVerificationNotification();
            
            Log::info('Verification email sent', [
                'user_id' => $user->id,
                'email' => $user->email,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send verification email', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send welcome SMS to newly registered user
     *
     * @param User $user
     * @return void
     */
    public function sendWelcomeSms(User $user): void
    {
        try {
            if (!$user->getNotificationPreferences('sms')) {
                return;
            }

            $message = "Welcome to Vilcom Networks, {$user->name}! Your account has been created successfully. Visit https://vilcom.co.ke to explore our services.";
            
            $this->sendSms($user->formatted_phone, $message);
            
            Log::info('Welcome SMS sent', [
                'user_id' => $user->id,
                'phone' => $user->formatted_phone,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send welcome SMS', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send SMS using Africa's Talking
     *
     * @param string $phone
     * @param string $message
     * @return bool
     */
    private function sendSms(string $phone, string $message): bool
    {
        try {
            // Initialize Africa's Talking
            $username = config('services.africastalking.username');
            $apiKey = config('services.africastalking.api_key');
            $from = config('services.africastalking.from', 'VILCOM');

            if (!$username || !$apiKey) {
                Log::warning('Africa\'s Talking credentials not configured');
                return false;
            }

            // Initialize the SDK
            $AT = new \AfricasTalking\SDK\AfricasTalking($username, $apiKey);
            $sms = $AT->sms();

            // Send SMS
            $result = $sms->send([
                'to' => $phone,
                'message' => $message,
                'from' => $from,
            ]);

            Log::info('SMS sent via Africa\'s Talking', [
                'phone' => $phone,
                'result' => $result,
            ]);

            return true;
        } catch (\Exception $e) {
            Log::error('SMS sending failed', [
                'phone' => $phone,
                'error' => $e->getMessage(),
            ]);
            
            return false;
        }
    }

    /**
     * Generate and send password reset token
     *
     * @param User $user
     * @return string
     */
    public function generatePasswordResetToken(User $user): string
    {
        $token = bin2hex(random_bytes(32));
        
        $user->update([
            'password_reset_token' => hash('sha256', $token),
            'password_reset_expires_at' => now()->addHours(2),
        ]);

        return $token;
    }

    /**
     * Validate password reset token
     *
     * @param string $token
     * @return User|null
     */
    public function validatePasswordResetToken(string $token): ?User
    {
        $hashedToken = hash('sha256', $token);
        
        return User::where('password_reset_token', $hashedToken)
            ->where('password_reset_expires_at', '>', now())
            ->first();
    }

    /**
     * Clear password reset token
     *
     * @param User $user
     * @return void
     */
    public function clearPasswordResetToken(User $user): void
    {
        $user->update([
            'password_reset_token' => null,
            'password_reset_expires_at' => null,
        ]);
    }

    /**
     * Enable two-factor authentication for user
     *
     * @param User $user
     * @return array
     */
    public function enableTwoFactor(User $user): array
    {
        // This is a placeholder - implement actual 2FA setup
        // using Google2FA or similar package
        
        $secret = bin2hex(random_bytes(16));
        $recoveryCodes = $this->generateRecoveryCodes();
        
        $user->update([
            'two_factor_secret' => encrypt($secret),
            'two_factor_recovery_codes' => encrypt(json_encode($recoveryCodes)),
            'two_factor_enabled' => true,
        ]);

        return [
            'secret' => $secret,
            'qr_code_url' => $this->generateQrCode($user, $secret),
            'recovery_codes' => $recoveryCodes,
        ];
    }

    /**
     * Disable two-factor authentication
     *
     * @param User $user
     * @return void
     */
    public function disableTwoFactor(User $user): void
    {
        $user->update([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_enabled' => false,
            'two_factor_confirmed_at' => null,
        ]);
    }

    /**
     * Generate recovery codes for 2FA
     *
     * @return array
     */
    private function generateRecoveryCodes(): array
    {
        $codes = [];
        for ($i = 0; $i < 8; $i++) {
            $codes[] = strtoupper(bin2hex(random_bytes(4)));
        }
        return $codes;
    }

    /**
     * Generate QR code URL for 2FA setup
     *
     * @param User $user
     * @param string $secret
     * @return string
     */
    private function generateQrCode(User $user, string $secret): string
    {
        $companyName = config('app.name', 'Vilcom Networks');
        $accountName = $user->email;
        
        $otpauthUrl = "otpauth://totp/{$companyName}:{$accountName}?secret={$secret}&issuer={$companyName}";
        
        return "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" . urlencode($otpauthUrl);
    }
}

