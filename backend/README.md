# Vilcom Backend API 🔌

[![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?logo=laravel&logoColor=white)](https://laravel.com)
[![PHP](https://img.shields.io/badge/PHP-8.2+-777BB4?logo=php&logoColor=white)](https://www.php.net)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com)
[![License](https://img.shields.io/badge/License-MIT-green)](../LICENSE)

RESTful API backend for the Vilcom ISP platform built with **Laravel 11**, **Sanctum authentication**, and **Reverb real-time broadcasting**. Handles quotes, subscriptions, payments (M-Pesa/Pesapal/Flutterwave), CRM, provisioning, and admin operations.

## 📋 Quick Navigation

- **[Installation](#-installation)** — Setup local development
- **[Project Structure](#-project-structure)** — File organization
- **[API Endpoints](#-api-endpoints)** — Available routes
- **[Database](#-database)** — Migrations & models
- **[Authentication](#-authentication)** — Sanctum tokens & 2FA
- **[Development](#-development)** — Common commands
- **[Testing](#-testing)** — Running tests
- **[Deployment](#-deployment)** — Production setup

## ⚙️ Installation

### Prerequisites

```bash
php --version                # Requires PHP 8.2+
composer --version           # Latest Composer
mysql --version              # MySQL 8.0+
```

### Local Setup

```bash
# 1. Install dependencies
composer install

# 2. Copy environment file and configure
cp .env.example .env
php artisan key:generate

# 3. Configure database in .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=vilcom
DB_USERNAME=root
DB_PASSWORD=

# 4. Run migrations and seed demo data
php artisan migrate --seed

# 5. Link storage for media library
php artisan storage:link

# 6. Start development server
php artisan serve
# API available at http://localhost:8000
```

### Environment Configuration

Required variables in `.env`:

```env
# App
APP_NAME=Vilcom
APP_ENV=local
APP_DEBUG=true
APP_TIMEZONE=Africa/Nairobi

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=vilcom
DB_USERNAME=root
DB_PASSWORD=

# M-Pesa (Safaricom)
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey

# Pesapal
PESAPAL_API_KEY=your_key
PESAPAL_SECRET_KEY=your_secret

# Flutterwave
FLW_PUBLIC_KEY=your_key
FLW_SECRET_KEY=your_secret
FLW_SECRET_HASH=your_hash

# Emerald Provisioning
EMERALD_BASE_URL=https://developer.vilcom-net.co.ke
EMERALD_ADMIN_USER=admin_username
EMERALD_ADMIN_PASSWORD=admin_password

# Email
MAIL_MAILER=smtp
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_FROM_ADDRESS=noreply@vilcom.co.ke
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_password

# Broadcasting (Reverb for WebSockets)
BROADCAST_DRIVER=reverb
REVERB_APP_ID=your_app_id
REVERB_APP_KEY=your_app_key
REVERB_APP_SECRET=your_app_secret
REVERB_HOST=localhost
REVERB_PORT=8080

# Queue (for background jobs)
QUEUE_CONNECTION=database
```

## 📁 Project Structure

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/          # API endpoint handlers
│   │   │   ├── Auth/                 # Authentication controllers
│   │   │   ├── Admin/                # Admin-only controllers
│   │   │   ├── Client/               # Client-facing controllers
│   │   │   ├── Webhook/              # Payment webhook handlers
│   │   │   ├── ProductController.php
│   │   │   ├── QuoteRequestController.php
│   │   │   ├── SubscriptionController.php
│   │   │   ├── PaymentController.php
│   │   │   ├── TicketController.php
│   │   │   └── ...
│   │   ├── Middleware/               # Auth, CORS, rate limiting
│   │   └── Requests/                 # Form validation requests
│   ├── Models/                       # 40+ Eloquent models
│   │   ├── User.php
│   │   ├── Product.php
│   │   ├── Quote.php
│   │   ├── Booking.php
│   │   ├── Subscription.php
│   │   ├── Payment.php
│   │   ├── Ticket.php
│   │   ├── Lead.php
│   │   ├── CoverageZone.php
│   │   └── ...
│   ├── Events/                       # Real-time events
│   │   ├── QuoteCreated.php
│   │   ├── BookingConfirmed.php
│   │   ├── PaymentReceived.php
│   │   └── ...
│   ├── Listeners/                    # Event listeners
│   ├── Jobs/                         # Queueable jobs
│   │   ├── SendQuoteEmail.php
│   │   ├── ProcessPayment.php
│   │   ├── ProvisionService.php
│   │   └── ...
│   ├── Mail/                         # Mailable classes
│   ├── Notifications/                # Notification classes
│   ├── Policies/                     # Authorization policies
│   ├── Services/                     # Business logic services
│   │   ├── PaymentService.php
│   │   ├── ProvisioningService.php
│   │   ├── QuoteService.php
│   │   └── ...
│   └── Console/                      # Artisan commands
├── routes/
│   ├── api.php                       # All v1 API routes
│   ├── web.php                       # Frontend routes
│   ├── channels.php                  # Broadcasting channels
│   └── console.php                   # Console commands
├── database/
│   ├── migrations/                   # Database schema
│   ├── factories/                    # Model factories for testing
│   └── seeders/                      # Database seeders
├── config/
│   ├── app.php
│   ├── database.php
│   ├── mpesa.php                     # M-Pesa config
│   ├── emerald.php                   # Emerald provisioning config
│   ├── flutterwave.php               # Flutterwave config
│   ├── pesapal.php                   # Pesapal config
│   ├── permission.php                # Spatie permissions
│   ├── sanctum.php                   # API authentication
│   ├── queue.php
│   ├── mail.php
│   └── ...
├── resources/
│   ├── views/                        # Email templates
│   └── lang/                         # Translation strings
├── storage/                          # Logs, cache, uploads
├── tests/
│   ├── Feature/                      # Feature tests
│   ├── Unit/                         # Unit tests
│   └── TestCase.php
├── public/
│   └── storage/                      # Symlink to storage/app/public
├── bootstrap/
├── .env.example                      # Environment template
├── artisan                           # Laravel CLI
├── composer.json
├── phpunit.xml
└── README.md
```

## 🌐 API Endpoints

### Base URL

```
http://localhost:8000/api/v1
```

### Authentication Required

All endpoints except **Auth** and **Public** require:

```bash
Authorization: Bearer YOUR_SANCTUM_TOKEN
```

### Core Resources

#### **Authentication**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | ✗ |
| POST | `/auth/login` | Login & get token | ✗ |
| POST | `/auth/logout` | Logout (invalidate token) | ✓ |
| POST | `/auth/2fa-verify` | Verify 2FA code | ✓ |
| GET | `/auth/me` | Get authenticated user | ✓ |

#### **Products & Categories**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/products` | List all products | ✗ |
| GET | `/products/{id}` | Get product details | ✗ |
| GET | `/categories` | List categories (tree) | ✗ |
| POST | `/admin/products` | Create product | ✓ Admin |
| PUT | `/admin/products/{id}` | Update product | ✓ Admin |
| DELETE | `/admin/products/{id}` | Delete product | ✓ Admin |

#### **Quotes**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/quotes` | Create quote (public) | ✗ |
| GET | `/quotes` | List user's quotes | ✓ |
| GET | `/quotes/{id}` | Get quote details | ✓ |
| GET | `/admin/quotes` | List all quotes | ✓ Admin |
| PUT | `/admin/quotes/{id}/status` | Update quote status | ✓ Admin |

#### **Subscriptions**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/subscriptions` | Create subscription | ✓ |
| GET | `/subscriptions` | List user subscriptions | ✓ |
| GET | `/subscriptions/{id}` | Get subscription details | ✓ |
| POST | `/subscriptions/{id}/addon` | Add addon to subscription | ✓ |
| POST | `/subscriptions/{id}/cancel` | Cancel subscription | ✓ |
| GET | `/admin/subscriptions` | List all subscriptions | ✓ Admin |

#### **Payments**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/payments/mpesa` | Initiate M-Pesa payment | ✓ |
| POST | `/payments/pesapal` | Initiate Pesapal payment | ✓ |
| GET | `/payments` | List user payments | ✓ |
| POST | `/admin/payments/{id}/refund` | Refund payment | ✓ Admin |
| POST | `/webhooks/mpesa` | M-Pesa callback | ✗ |
| POST | `/webhooks/pesapal` | Pesapal callback | ✗ |

#### **Coverage & Support**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/coverage/check` | Check service coverage | ✗ |
| GET | `/coverage/geojson` | Get coverage zones (GeoJSON) | ✗ |
| GET | `/tickets` | List user tickets | ✓ |
| POST | `/tickets` | Create support ticket | ✓ |
| POST | `/tickets/{id}/reply` | Reply to ticket | ✓ |
| GET | `/admin/tickets` | List all tickets | ✓ Admin |

See [routes/api.php](routes/api.php) for complete route documentation.

## 🗄️ Database

### Key Models

- **User** — System users (admin, staff, clients)
- **Product** — Service products
- **Category** — Product categories
- **Quote** — Service quotes
- **Booking** — Quote to subscription conversion
- **Subscription** — Active customer subscriptions
- **Payment** — Payment records
- **Ticket** — Support tickets
- **Lead** — CRM leads
- **CoverageZone** — Service coverage areas
- **ActivityLog** — Audit trail (Spatie)
- **Media** — Digital assets (Spatie)

### Migrations

```bash
# Run all pending migrations
php artisan migrate

# Rollback last migration
php artisan migrate:rollback

# Rollback all and re-run
php artisan migrate:fresh --seed

# Create migration
php artisan make:migration create_users_table
```

## 🔐 Authentication

### Sanctum Token-Based Auth

1. **Register/Login** to get token:

```bash
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

# Response
{
  "token": "1|ABC123...",
  "user": { ... }
}
```

2. **Use token** in requests:

```bash
Authorization: Bearer 1|ABC123def...
```

### Two-Factor Authentication (2FA)

**Enable** 2FA for enhanced security:

```bash
POST /api/v1/auth/2fa-setup
# Returns secret key for Google Authenticator

# Verify code
POST /api/v1/auth/2fa-verify
{
  "code": "123456"
}
```

### Role-Based Access Control (RBAC)

Using **Spatie Laravel Permission**:

**Roles**: `super-admin`, `admin`, `staff`, `sales`, `technical`, `client`

**Permissions**: Scoped by resource and action (`create:products`, `view:tickets`, etc.)

```bash
# Check permission in controller
$user->hasPermissionTo('create:products')

# Check role
$user->hasRole('admin')
```

## 🔧 Development

### Common Commands

```bash
# Database
php artisan migrate              # Run migrations
php artisan migrate:fresh        # Reset & rerun migrations
php artisan db:seed              # Run seeders
php artisan tinker               # Interactive PHP shell

# Code Quality
php artisan pint                 # Format code (Laravel Pint)
php artisan pint --test          # Check without fixing
./vendor/bin/phpunit             # Run tests

# Cache & Optimization
php artisan cache:clear
php artisan config:cache
php artisan route:cache
php artisan view:clear

# Make Commands (Scaffolding)
php artisan make:model Quote -m  # Model with migration
php artisan make:controller QuoteController -r  # Restful controller
php artisan make:job ProcessPayment      # Queueable job
php artisan make:mail QuoteEmail         # Mailable class
php artisan make:event QuoteCreated      # Broadcast event
php artisan make:policy QuotePolicy      # Authorization policy

# Queue & Broadcasting
php artisan queue:work           # Start queue worker
php artisan reverb:start         # Start WebSocket server
php artisan pail                 # Real-time log viewer
```

### Code Organization

- **Controllers**: Handle HTTP requests, validate input, call services
- **Models**: Represent database tables, relationships, business logic
- **Services**: Reusable business logic (e.g., `PaymentService`, `QuoteService`)
- **Policies**: Authorization rules for resources
- **Events**: Trigger real-time updates via Reverb
- **Jobs**: Queued background work (emails, API calls, provisioning)

## 🧪 Testing

### Run Tests

```bash
# All tests
php artisan test

# Specific test file
php artisan test tests/Feature/Auth/LoginTest.php

# With coverage
php artisan test --coverage

# Watch mode
php artisan test --watch
```

### Test Structure

```bash
tests/
├── Feature/          # Integration tests
│   ├── Api/
│   │   ├── AuthTest.php
│   │   ├── ProductTest.php
│   │   └── ...
│   └── ...
└── Unit/            # Unit tests
    ├── Models/
    ├── Services/
    └── ...
```

## 🚀 Deployment

### Pre-Deployment Checklist

```bash
# 1. Pull latest code
git pull origin main

# 2. Install production dependencies
composer install --optimize-autoloader --no-dev

# 3. Build cache (significant perf boost)
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 4. Run migrations (with --force on production)
php artisan migrate --force

# 5. Disable debug mode
APP_DEBUG=false

# 6. Restart queue workers & services
supervisorctl restart all
```

### Environment (Production `.env`)

```env
APP_ENV=production
APP_DEBUG=false
CACHE_DRIVER=redis            # Use Redis for caching
SESSION_DRIVER=redis          # Use Redis for sessions
QUEUE_CONNECTION=redis        # Use Redis for queues

DB_HOST=your-rds-endpoint     # Use managed database
DB_USERNAME=prod_user
DB_PASSWORD=strong_password
```

### Infrastructure

- **Server**: Docker / Ubuntu 22.04 LTS
- **Database**: MySQL 8.0+ (AWS RDS recommended)
- **Cache**: Redis 7.0+ (AWS ElastiCache recommended)
- **Queue**: Redis or Supervisor for background jobs
- **Storage**: AWS S3 for media/uploads
- **Email**: SendGrid or AWS SES

**Recommended**: Deploy with **Laravel Forge** or **Laravel Vapor** for automated setup.

## 📚 Documentation

- **Laravel Docs**: https://laravel.com/docs/11.x
- **Sanctum**: https://laravel.com/docs/sanctum
- **Reverb**: https://laravel.com/docs/reverb
- **Spatie Permissions**: https://spatie.be/docs/laravel-permission
- **Spatie Media**: https://spatie.be/docs/laravel-medialibrary

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and write tests
3. Run tests: `php artisan test`
4. Format code: `php artisan pint`
5. Commit: `git commit -m "feat: add your feature"`
6. Push & open PR

## 📝 License

Licensed under the [MIT License](../LICENSE).

---

**Questions?** Check [routes/api.php](routes/api.php) or open an issue on the main [README](../README.md).
