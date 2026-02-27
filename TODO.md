# TODO: Terms and Privacy Policy Registration Fix

## Task
Add Terms and Privacy Policy acceptance to the registration form to fix the 422 error when registering.

## Steps

- [x] 1. Create Terms and Conditions page (Terms.tsx)
- [x] 2. Create Privacy Policy page (PrivacyPolicy.tsx)
- [x] 3. Add routes in App.tsx for /terms and /privacy
- [x] 4. Update Signup.tsx to add checkboxes and required fields
- [x] 5. Update Navbar.tsx to add links to terms and privacy policy
- [x] 6. Update email notifications with clean formatting

## Status: COMPLETED

## Additional Configuration Files Added

### Payment Gateway Config Files:
- `backend/config/mpesa.php` - M-Pesa configuration
- `backend/config/pesapal.php` - Pesapal configuration  
- `backend/config/flutterwave.php` - Flutterwave configuration

### Webhook Controllers Created:
- `backend/app/Http/Controllers/Api/Webhook/PesapalController.php`
- `backend/app/Http/Controllers/Api/Webhook/FlutterwaveController.php`

### API Routes Updated:
- Added routes for Pesapal IPN and Flutterwave Webhooks

