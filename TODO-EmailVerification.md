# Email Verification URL Fix

## Current Flow:
1. RegisterController::register() → AuthService::sendEmailVerification()
2. AuthService → User::sendEmailVerificationNotification()
3. User model → notify(EmailVerificationNotification)
4. EmailVerificationNotification::verificationUrl() → config('app.frontend_url') + '/auth/verify-email?id=' + id + '&hash=' + hash

## Issue:
FRONTEND_URL=http://localhost:8081 in backend/.env is cached/old. New emails still use old value.

## Steps:
- [x] Run `php artisan config:clear && php artisan config:cache` (done)
- [ ] Add/update **backend/.env**:
  ```
  FRONTEND_URL=http://localhost:8081
  ```
- [ ] Test new registration - email should have correct URL
- [ ] Restart queue worker if using `php artisan queue:work`

**Note:** The link format is correct (frontend page). API call from frontend uses `/v1/auth/email/verify/{id}/{hash}` but controller reads query params - works as shown in your success response.
