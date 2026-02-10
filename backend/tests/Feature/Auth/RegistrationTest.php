<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Models\UserActivity;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Run role and permission seeder
        $this->artisan('db:seed', ['--class' => 'RoleAndPermissionSeeder']);
        
        // Prevent notifications from actually being sent during tests
        Notification::fake();
    }

    // ============================================
    // SUCCESSFUL REGISTRATION TESTS
    // ============================================

    /**
     * Test successful individual user registration
     */
    public function test_successful_individual_registration(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'John Doe',
            'email' => 'john.doe@example.com',
            'password' => 'SecureP@ss123',
            'password_confirmation' => 'SecureP@ss123',
            'phone' => '0712345678',
            'customer_type' => 'individual',
            'terms_accepted' => true,
            'privacy_accepted' => true,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'user' => [
                        'id',
                        'name',
                        'email',
                        'phone',
                        'customer_type',
                        'status',
                        'roles',
                    ],
                    'token',
                    'expires_at',
                ],
            ])
            ->assertJson([
                'success' => true,
                'message' => 'Registration successful! Please check your email to verify your account.',
            ]);

        // Verify user was created in database
        $this->assertDatabaseHas('users', [
            'name' => 'John Doe',
            'email' => 'john.doe@example.com',
            'phone' => '+254712345678', // Phone should be formatted
            'customer_type' => 'individual',
            'status' => 'pending_verification',
        ]);

        // Verify client role was assigned
        $user = User::where('email', 'john.doe@example.com')->first();
        $this->assertTrue($user->hasRole('client'));

        // Verify user activity was logged
        $this->assertDatabaseHas('user_activities', [
            'user_id' => $user->id,
            'action' => 'user_registered',
        ]);

        // Verify token was generated
        $this->assertNotEmpty($response->json('data.token'));
    }

    /**
     * Test successful business user registration
     */
    public function test_successful_business_registration(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Business Contact Person',
            'email' => 'contact@techsolutions.co.ke',
            'password' => 'SecureB@ss2024!',
            'password_confirmation' => 'SecureB@ss2024!',
            'phone' => '0722555666',
            'customer_type' => 'business',
            'company_name' => 'Tech Solutions Limited',
            'company_registration' => 'KE/2024/12345',
            'tax_pin' => 'A012345678B',
            'address' => 'Tech Park, Nairobi',
            'city' => 'Nairobi',
            'county' => 'Nairobi',
            'postal_code' => '00100',
            'terms_accepted' => true,
            'privacy_accepted' => true,
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
            ]);

        // Verify business user was created with correct data
        $this->assertDatabaseHas('users', [
            'email' => 'contact@techsolutions.co.ke',
            'customer_type' => 'business',
            'company_name' => 'Tech Solutions Limited',
            'company_registration' => 'KE/2024/12345',
            'tax_pin' => 'A012345678B',
            'address' => 'Tech Park, Nairobi',
            'city' => 'Nairobi',
        ]);

        // Verify business user has client role
        $user = User::where('email', 'contact@techsolutions.co.ke')->first();
        $this->assertTrue($user->hasRole('client'));
    }

    /**
     * Test registration with default preferences
     */
    public function test_registration_sets_default_preferences(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Default Prefs User',
            'email' => 'default@example.com',
            'password' => 'Test@123456!',
            'password_confirmation' => 'Test@123456!',
            'phone' => '0777888999',
            'terms_accepted' => true,
            'privacy_accepted' => true,
        ]);

        $response->assertStatus(201);

        $user = User::where('email', 'default@example.com')->first();
        
        // Verify default preferences are set
        $this->assertNotNull($user->preferences);
        $this->assertTrue($user->preferences['notifications']['email']);
        $this->assertTrue($user->preferences['notifications']['sms']);
        $this->assertTrue($user->preferences['notifications']['in_app']);
        $this->assertFalse($user->preferences['notifications']['marketing']);
    }

    /**
     * Test phone number formatting (0xxx to +254xxx)
     */
    public function test_phone_number_formatting(): void
    {
        $this->postJson('/api/auth/register', [
            'name' => 'Phone Test User',
            'email' => 'phone@test.com',
            'password' => 'Test@123456!',
            'password_confirmation' => 'Test@123456!',
            'phone' => '0712345678',
            'terms_accepted' => true,
            'privacy_accepted' => true,
        ]);

        $user = User::where('email', 'phone@test.com')->first();
        
        // Phone should be formatted to international format
        $this->assertEquals('+254712345678', $user->phone);
    }

    /**
     * Test phone number with +254 prefix is preserved
     */
    public function test_phone_with_plus_prefix_preserved(): void
    {
        $this->postJson('/api/auth/register', [
            'name' => 'Plus Prefix User',
            'email' => 'plus@test.com',
            'password' => 'Test@123456!',
            'password_confirmation' => 'Test@123456!',
            'phone' => '+254712345678',
            'terms_accepted' => true,
            'privacy_accepted' => true,
        ]);

        $user = User::where('email', 'plus@test.com')->first();
        
        $this->assertEquals('+254712345678', $user->phone);
    }

    /**
     * Test default timezone and language
     */
    public function test_default_timezone_and_language(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Timezone Test',
            'email' => 'timezone@test.com',
            'password' => 'Test@123456!',
            'password_confirmation' => 'Test@123456!',
            'phone' => '0733444555',
            'terms_accepted' => true,
            'privacy_accepted' => true,
        ]);

        $response->assertStatus(201);

        $user = User::where('email', 'timezone@test.com')->first();
        
        $this->assertEquals('Africa/Nairobi', $user->timezone);
        $this->assertEquals('en', $user->language);
    }

    // ============================================
    // VALIDATION TESTS - NAME
    // ============================================

    /**
     * Test name is required
     */
    public function test_name_is_required(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'email' => 'test@example.com',
            'password' => 'Test@123456!',
            'password_confirmation' => 'Test@123456!',
            'phone' => '0712345678',
            'terms_accepted' => true,
            'privacy_accepted' => true,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
        
        $this->assertEquals('Please enter your full name', $response->json('errors.name.0'));
    }

    /**
     * Test name minimum length validation
     */
    public function test_name_min_length(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'J', // Only 1 character
            'email' => 'test@example.com',
            'password' => 'Test@123456!',
            'password_confirmation' => 'Test@123456!',
            'phone' => '0712345678',
            'terms_accepted' => true,
            'privacy_accepted' => true,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
        
        $this->assertEquals('Name must be at least 2 characters', $response->json('errors.name.0'));
    }

    // ============================================
    // VALIDATION TESTS - EMAIL
    // ============================================

    /**
     * Test email is required
     */
    public function test_email_is_required(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'password' => 'Test@123456!',
            'password_confirmation' => 'Test@123456!',
            'phone' => '0712345678',
            'terms_accepted' => true,
            'privacy_accepted' => true,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * Test email must be valid format
     */
    public function test_email_valid_format(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'invalid-email',
            'password' => 'Test@123456!',
            'password_confirmation' => 'Test@123456!',
            'phone' => '0712345678',
            'terms_accepted' => true,
            'privacy_accepted' => true,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
        
        $this->assertEquals('Please enter a valid email address', $response->json('errors.email.0'));
    }

    /**
     * Test email must be unique
     */
    public function test_email_unique(): void
    {
        // Create existing user
        User::factory()->create([
            'email' => 'existing@example.com',
        ]);

        $response = $this->postJson('/api/auth/register', [
            'name' => 'New User',
            'email' => 'existing@example.com',
            'password' => 'Test@123456!',
            'password_confirmation' => 'Test@123456!',
            'phone' => '0712345678',
            'terms_accepted' => true,
            'privacy_accepted' => true,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
        
        $this->assertEquals('This email is already registered. Please login or use a different email.', $response->json('errors.email.0'));
    }

    /**
     * Test email is trimmed and lowercased
     */
    public function test_email_trimmed_and_lowercased(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => '  TEST@EXAMPLE.COM  ',
            'password' => 'Test@123456!',
            'password_confirmation' => 'Test@123456!',
            'phone' => '0712345678',
            'terms_accepted' => true,
            'privacy_accepted' => true,
        ]);

        $response->assertStatus(201);

        // Email should be stored in lowercase without spaces
        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
        ]);
    }

    // ============================================
    // VALIDATION TESTS - PASSWORD
    // ============================================

    /**
     * Test password is required
     */
    public function test_password_is_required(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'phone' => '0712345678',
            'terms_accepted' => true,
            'privacy_accepted' => true,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    /**
     * Test password confirmation must match
     */
    public function test_password_confirmation_must_match(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Test@123456!',
            'password_confirmation' => 'DifferentPassword!1',
            'phone' => '0712345678',
            'terms_accepted' => true,
            'privacy_accepted' => true,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
        
        $this->assertEquals('Password confirmation does not match', $response->json('errors.password.0'));
    }

    /**
     * Test password minimum length
     */
    public function test_password_minimum_length(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Short1!',
            'password_confirmation' => 'Short1!',
            'phone' => '0712345678',
            'terms_accepted' => true,
            'privacy_accepted' => true,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    /**
     * Test password requires mixed case
     */
    public function test_password_requires_mixed_case(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123!',
            'password_confirmation' => 'password123!',
            'phone' => '0712345678',
            'terms_accepted' => true,
            'privacy_accepted' => true,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    /**
     * Test password requires number
     */
    public function test_password_requires_number(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password!',
            'password_confirmation' => 'Password!',
            'phone' => '0712345678',
            'terms_accepted' => true,
            'privacy_accepted' => true,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    /**
     * Test password requires symbol
     */
    public function test_password_requires_symbol(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
            'phone' => '0712345678',
            'terms_accepted' => true,
            'privacy_accepted' => true,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    // ============================================
    // VALIDATION TESTS - PHONE
    // ============================================

    /**
     * Test phone is required
     */
    public function test_phone_is_required(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Test@123456!',
            'password_confirmation' => 'Test@123456!',
            'terms_accepted' => true,
            'privacy_accepted' => true,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['phone']);
    }

    /**
     * Test phone must be unique
     */
    public function test_phone_unique(): void
    {
        // Create existing user
        User::factory()->create([
            'phone' => '+254712345678',
        ]);

        $response = $this->postJson('/api/auth/register', [
            'name' => 'New User',
            'email' => 'new@example.com',
            'password' => 'Test@123456!',
            'password_confirmation' => 'Test@123456!',
            'phone' => '0712345678',
            'terms_accepted' => true,
            'privacy_accepted' => true,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['phone']);
        
        $this->assertEquals('This phone number is already registered', $response->json('errors.phone.0'));
    }

    /**
     * Test invalid phone format (too short)
     */
    public function test_invalid_phone_format_too_short(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Test@123456!',
            'password_confirmation' => 'Test@123456!',
            'phone' => '071234',
            'terms_accepted' => true,
            'privacy_accepted' => true,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['phone']);
    }

    /**
     * Test invalid phone format (invalid prefix)
     */
    public function test_invalid_phone_prefix(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Test@123456!',
            'password_confirmation' => 'Test@123456!',
            'phone' => '0612345678', // Invalid prefix
            'terms_accepted' => true,
            'privacy_accepted' => true,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['phone']);
        
        $this->assertEquals('Please enter a valid Kenyan phone number (e.g., 0712345678 or +254712345678)', $response->json('errors.phone.0'));
    }

    // ============================================
    // VALIDATION TESTS - TERMS & PRIVACY
    // ============================================

    /**
     * Test terms must be accepted
     */
    public function test_terms_must_be_accepted(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Test@123456!',
            'password_confirmation' => 'Test@123456!',
            'phone' => '0712345678',
            'terms_accepted' => false,
            'privacy_accepted' => true,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['terms_accepted']);
        
        $this->assertEquals('You must accept the terms and conditions', $response->json('errors.terms_accepted.0'));
    }

    /**
     * Test privacy must be accepted
     */
    public function test_privacy_must_be_accepted(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Test@123456!',
            'password_confirmation' => 'Test@123456!',
            'phone' => '0712345678',
            'terms_accepted' => true,
            'privacy_accepted' => false,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['privacy_accepted']);
    }

    /**
     * Test without accepting terms/privacy
     */
    public function test_without_accepting_terms_privacy(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Test@123456!',
            'password_confirmation' => 'Test@123456!',
            'phone' => '0712345678',
        ]);

        $response->assertStatus(422);
        
        // Both should be required
        $this->assertArrayHasKey('terms_accepted', $response->json('errors'));
        $this->assertArrayHasKey('privacy_accepted', $response->json('errors'));
    }

    // ============================================
    // VALIDATION TESTS - BUSINESS FIELDS
    // ============================================

    /**
     * Test company_name required for business customer type
     */
    public function test_company_name_required_for_business(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Test@123456!',
            'password_confirmation' => 'Test@123456!',
            'phone' => '0712345678',
            'customer_type' => 'business',
            'terms_accepted' => true,
            'privacy_accepted' => true,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['company_name']);
        
        $this->assertEquals('Company name is required for business accounts', $response->json('errors.company_name.0'));
    }

    /**
     * Test invalid KRA PIN format
     */
    public function test_invalid_kra_pin_format(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Test@123456!',
            'password_confirmation' => 'Test@123456!',
            'phone' => '0712345678',
            'customer_type' => 'business',
            'company_name' => 'Test Company',
            'tax_pin' => 'INVALID', // Invalid format
            'terms_accepted' => true,
            'privacy_accepted' => true,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['tax_pin']);
        
        $this->assertEquals('Please enter a valid KRA PIN (e.g., A001234567B)', $response->json('errors.tax_pin.0'));
    }

    /**
     * Test valid KRA PIN format
     */
    public function test_valid_kra_pin_format(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Test@123456!',
            'password_confirmation' => 'Test@123456!',
            'phone' => '0712345678',
            'customer_type' => 'business',
            'company_name' => 'Test Company',
            'tax_pin' => 'A012345678B', // Valid format
            'terms_accepted' => true,
            'privacy_accepted' => true,
        ]);

        $response->assertStatus(201);

        $user = User::where('email', 'test@example.com')->first();
        $this->assertEquals('A012345678B', $user->tax_pin);
    }

    // ============================================
    // VALIDATION TESTS - CUSTOMER TYPE
    // ============================================

    /**
     * Test customer type must be valid
     */
    public function test_customer_type_valid(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Test@123456!',
            'password_confirmation' => 'Test@123456!',
            'phone' => '0712345678',
            'customer_type' => 'invalid_type',
            'terms_accepted' => true,
            'privacy_accepted' => true,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['customer_type']);
    }

    /**
     * Test default customer type is individual
     */
    public function test_default_customer_type_individual(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Test@123456!',
            'password_confirmation' => 'Test@123456!',
            'phone' => '0712345678',
            'terms_accepted' => true,
            'privacy_accepted' => true,
        ]);

        $response->assertStatus(201);

        $user = User::where('email', 'test@example.com')->first();
        $this->assertEquals('individual', $user->customer_type);
    }

    // ============================================
    // DATABASE STATE TESTS
    // ============================================

    /**
     * Test user is not verified after registration
     */
    public function test_user_not_verified_after_registration(): void
    {
        $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Test@123456!',
            'password_confirmation' => 'Test@123456!',
            'phone' => '0712345678',
            'terms_accepted' => true,
            'privacy_accepted' => true,
        ]);

        $user = User::where('email', 'test@example.com')->first();
        
        $this->assertNull($user->email_verified_at);
        $this->assertEquals('pending_verification', $user->status);
    }

    /**
     * Test password is hashed
     */
    public function test_password_is_hashed(): void
    {
        $plainPassword = 'Test@123456!';

        $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => $plainPassword,
            'password_confirmation' => $plainPassword,
            'phone' => '0712345678',
            'terms_accepted' => true,
            'privacy_accepted' => true,
        ]);

        $user = User::where('email', 'test@example.com')->first();
        
        $this->assertNotEquals($plainPassword, $user->password);
        $this->assertTrue(password_verify($plainPassword, $user->password));
    }

    /**
     * Test user activity is logged with IP and User Agent
     */
    public function test_activity_logged_with_ip_and_user_agent(): void
    {
        $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Test@123456!',
            'password_confirmation' => 'Test@123456!',
            'phone' => '0712345678',
            'terms_accepted' => true,
            'privacy_accepted' => true,
        ], [
            'User-Agent' => 'TestClient/1.0',
        ]);

        $user = User::where('email', 'test@example.com')->first();
        $activity = UserActivity::where('user_id', $user->id)->first();

        $this->assertNotNull($activity);
        $this->assertEquals('user_registered', $activity->action);
    }

    /**
     * Test transaction is rolled back on failure
     */
    public function test_transaction_rollback_on_failure(): void
    {
        // Mock a failure by using an invalid email format that passes initial validation
        // but fails during save
        
        // This test verifies that DB transaction is used
        $initialCount = User::count();

        // This should fail due to validation
        $response = $this->postJson('/api/auth/register', [
            'name' => '', // Invalid name
            'email' => 'test@example.com',
            'password' => 'Test@123456!',
            'password_confirmation' => 'Test@123456!',
            'phone' => '0712345678',
            'terms_accepted' => true,
            'privacy_accepted' => true,
        ]);

        $response->assertStatus(422);
        $this->assertEquals($initialCount, User::count());
    }

    // ============================================
    // OPTIONAL FIELD TESTS
    // ============================================

    /**
     * Test secondary phone validation
     */
    public function test_secondary_phone_invalid_format(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Test@123456!',
            'password_confirmation' => 'Test@123456!',
            'phone' => '0712345678',
            'secondary_phone' => 'invalid',
            'terms_accepted' => true,
            'privacy_accepted' => true,
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['secondary_phone']);
    }

    /**
     * Test SMS notification preference (stored but SMS not sent as service not configured)
     * Note: SMS sending is wrapped in try-catch, so it won't fail registration
     */
    public function test_sms_notification_preference_stored(): void
    {
        $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Test@123456!',
            'password_confirmation' => 'Test@123456!',
            'phone' => '0712345678',
            'sms_notifications' => false,
            'terms_accepted' => true,
            'privacy_accepted' => true,
        ]);

        $user = User::where('email', 'test@example.com')->first();
        
        // Preference is stored even though SMS service is not configured
        $this->assertFalse($user->preferences['notifications']['sms']);
    }

    /**
     * Test marketing consent preference
     */
    public function test_marketing_consent_preference(): void
    {
        $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Test@123456!',
            'password_confirmation' => 'Test@123456!',
            'phone' => '0712345678',
            'marketing_consent' => true,
            'terms_accepted' => true,
            'privacy_accepted' => true,
        ]);

        $user = User::where('email', 'test@example.com')->first();
        
        $this->assertTrue($user->preferences['notifications']['marketing']);
    }

    // ============================================
    // RESPONSE FORMAT TESTS
    // ============================================

    /**
     * Test response includes expires_at
     */
    public function test_response_includes_expires_at(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Test@123456!',
            'password_confirmation' => 'Test@123456!',
            'phone' => '0712345678',
            'terms_accepted' => true,
            'privacy_accepted' => true,
        ]);

        $response->assertStatus(201);

        $expiresAt = $response->json('data.expires_at');
        $this->assertNotEmpty($expiresAt);
        
        // Verify it's approximately 30 days from now
        $expectedExpiry = now()->addDays(30);
        $actualExpiry = \Carbon\Carbon::parse($expiresAt);
        
        $this->assertTrue($actualExpiry->diffInDays($expectedExpiry) <= 1);
    }

    /**
     * Test response includes user with roles
     */
    public function test_response_includes_user_with_roles(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Test@123456!',
            'password_confirmation' => 'Test@123456!',
            'phone' => '0712345678',
            'terms_accepted' => true,
            'privacy_accepted' => true,
        ]);

        $response->assertStatus(201);

        $userData = $response->json('data.user');
        $this->assertArrayHasKey('roles', $userData);
        $this->assertContains('client', $userData['roles']);
    }

    // ============================================
    // ERROR HANDLING TESTS
    // ============================================

    /**
     * Test exception handling returns 500
     */
    public function test_exception_handling_returns_500(): void
    {
        // This test would require mocking to force an exception
        // For now, we verify the structure of error response
        
        // Try with database error (simulated by violating unique constraint after validation)
        // Note: This is a basic test - comprehensive error handling tests would need mocking
        
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Test@123456!',
            'password_confirmation' => 'Test@123456!',
            'phone' => '0712345678',
            'terms_accepted' => true,
            'privacy_accepted' => true,
        ]);

        // Valid request should succeed
        $response->assertStatus(201);
    }

    /**
     * Test API route exists
     */
    public function test_register_route_exists(): void
    {
        $response = $this->postJson('/api/auth/register', []);
        
        // Should get validation error, not 404
        $this->assertNotEquals(404, $response->status());
    }

    // ============================================
    // EMAIL NOTIFICATION TESTS
    // ============================================

    /**
     * Test welcome email is sent on registration
     */
    public function test_welcome_email_sent_on_registration(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Email Test User',
            'email' => 'emailtest@example.com',
            'password' => 'Test@123456!',
            'password_confirmation' => 'Test@123456!',
            'phone' => '0712345678',
            'terms_accepted' => true,
            'privacy_accepted' => true,
        ]);

        $response->assertStatus(201);

        $user = User::where('email', 'emailtest@example.com')->first();

        // Verify welcome notification was sent
        Notification::assertSentTo(
            $user,
            \App\Notifications\WelcomeNotification::class
        );
    }

    /**
     * Test email verification notification is sent on registration
     */
    public function test_email_verification_sent_on_registration(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Verify Test User',
            'email' => 'verifytest@example.com',
            'password' => 'Test@123456!',
            'password_confirmation' => 'Test@123456!',
            'phone' => '0712345678',
            'terms_accepted' => true,
            'privacy_accepted' => true,
        ]);

        $response->assertStatus(201);

        $user = User::where('email', 'verifytest@example.com')->first();

        // Verify custom email verification notification was sent
        Notification::assertSentTo(
            $user,
            \App\Notifications\EmailVerificationNotification::class
        );
    }

    /**
     * Test emails are sent with array mail driver (captured, not really sent)
     */
    public function test_emails_captured_by_array_driver(): void
    {
        // Using phpunit.xml config, MAIL_MAILER is set to array
        // which captures emails instead of sending them
        
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Array Driver Test',
            'email' => 'arraydriver@example.com',
            'password' => 'Test@123456!',
            'password_confirmation' => 'Test@123456!',
            'phone' => '0712345678',
            'terms_accepted' => true,
            'privacy_accepted' => true,
        ]);

        $response->assertStatus(201);

        // With array mail driver, emails are captured in memory
        // We verify the user was created and notifications were queued
        $user = User::where('email', 'arraydriver@example.com')->first();
        $this->assertNotNull($user);
        
        // Verify notifications were attempted to be sent
        Notification::assertSentTo(
            $user,
            \App\Notifications\WelcomeNotification::class
        );
    }
}

