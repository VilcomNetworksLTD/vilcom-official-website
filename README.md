# Vilcom Official Website 🚀

[![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Node.js](https://img.shields.io/badge/Node.js->=18-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![PHP](https://img.shields.io/badge/PHP-8.2+-777BB4?logo=php&logoColor=white)](https://www.php.net)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

**Vilcom** is a comprehensive, full-stack ISP (Internet Service Provider) and service provider platform built specifically for the Kenyan market. It manages the complete business lifecycle: from customer quotes and subscriptions to payments, coverage mapping, CRM, and administrative operations.

## 🎯 Core Features

| Feature Category | Capabilities |
|---|---|
| **Product Management** | Products, service categories, add-ons, pricing variations, plan composition |
| **Sales Workflow** | Quote generation, booking management, subscription lifecycle (activation, plan changes, add-ons, cancellation) |
| **Coverage & Delivery** | Service zones, coverage maps (GeoJSON), area-based packages, coverage interest tracking |
| **Payments & Billing** | M-Pesa (STK Push & C2B), Pesapal, Flutterwave integration; payment webhooks, credit wallet, invoicing |
| **CRM & Support** | Lead tracking, WhatsApp/SMS messaging, support tickets with internal notes and replies, contact management |
| **Service Provisioning** | Integration with Emerald and Safetika provisioning APIs for automated service activation |
| **Content Management** | Banners, testimonials, FAQs, image galleries, portfolio projects, press articles |
| **Human Resources** | Job vacancies, career applications (with CV uploads), staff availability scheduling |
| **Admin & Governance** | Multi-tenant role-based access control (Spatie), user management, 2FA, admin impersonation, activity logging, media library |
| **Real-time Features** | WebSocket support for live notifications via Laravel Reverb, server-sent events integration |

## 🏗️ Architecture

### Technology Stack

```
┌───────────────────────────────────────────────────────┐
│  Frontend (Vite + React + TypeScript)                 │
│  ├─ UI Framework: shadcn/ui + Radix (accessible)     │
│  ├─ Styling: TailwindCSS                             │
│  ├─ Forms: React Hook Form + Zod validation          │
│  ├─ Maps: Leaflet, DeckGL, react-simple-maps (Kenya) │
│  ├─ 3D Graphics: react-three-fiber, GSAP             │
│  ├─ Data Fetching: TanStack Query (React Query)      │
│  └─ Real-time: Laravel Echo (Reverb/Pusher)          │
└─────────────────┬─────────────────────────────────────┘
                  │ Sanctum Authentication API (v1/)
┌─────────────────┴─────────────────────────────────────┐
│  Backend (Laravel 11 + Reverb)                        │
│  ├─ API: RESTful endpoints, multi-tenant             │
│  ├─ Auth: Laravel Sanctum, 2FA (Google Authenticator) │
│  ├─ Permissions: Spatie Laravel Permission (RBAC)    │
│  ├─ Workflows: Events, jobs, queued commands          │
│  ├─ Payments: M-Pesa, Pesapal, Flutterwave webhooks  │
│  ├─ Provisioning: Emerald & Safetika APIs            │
│  ├─ Media: Spatie Media Library (cloud storage)       │
│  ├─ Activity: Spatie Activity Log for audit trails    │
│  ├─ Broadcasting: Laravel Reverb for real-time       │
│  └─ Database: MySQL with optimized Eloquent models    │
└───────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Backend**: PHP 8.2+, Composer, MySQL 8.0+
- **Frontend**: Node.js 18+ (or Bun), npm/yarn/bun
- **Optional**: Docker & Docker Compose for containerization

### Installation & Local Setup

#### 1. Clone Repository

```bash
git clone https://github.com/vilcom/official-website.git vilcom-website
cd vilcom-website
```

#### 2. Backend Setup

```bash
cd backend

# Copy environment configuration
cp .env.example .env

# Install dependencies
composer install

# Generate application key
php artisan key:generate

# Run migrations and seeders
php artisan migrate --seed

# Create storage symlink for media library
php artisan storage:link

# Start development server
php artisan serve
# Backend API: http://localhost:8000
```

**Configure `.env` with required services:**

```env
# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=vilcom
DB_USERNAME=root
DB_PASSWORD=

# M-Pesa Integration
MPESA_CONSUMER_KEY=your_key
MPESA_CONSUMER_SECRET=your_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey

# Pesapal Integration
PESAPAL_API_KEY=your_key
PESAPAL_SECRET_KEY=your_secret

# Flutterwave Integration
FLW_PUBLIC_KEY=your_key
FLW_SECRET_KEY=your_secret
FLW_SECRET_HASH=your_hash

# Emerald Provisioning
EMERALD_BASE_URL=https://developer.vilcom-net.co.ke
EMERALD_ADMIN_USER=admin_username
EMERALD_ADMIN_PASSWORD=admin_password

# Email Service
MAIL_MAILER=smtp
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_password
MAIL_FROM_ADDRESS=noreply@vilcom.co.ke

# Real-Time Broadcasting (Reverb)
BROADCAST_DRIVER=reverb
REVERB_APP_ID=your_app_id
REVERB_APP_KEY=your_app_key
REVERB_APP_SECRET=your_app_secret
```

**Start background services** (optional, in separate terminals):

```bash
# Queue worker (handles jobs, emails, webhooks)
php artisan queue:work

# Reverb server (WebSocket broadcasting)
php artisan reverb:start

# Log viewer (real-time logs)
php artisan pail
```

**Seed Initial Data**

After migration, the system is seeded with:
- Default admin account: `admin@vilcom.co.ke` / `password`
- Sample products, categories, and add-ons
- Kenyan counties and coverage zones
- Job vacancies and career opportunities

#### 3. Frontend Setup

```bash
cd ../frontend

# Copy environment configuration (optional)
cp .env.example .env

# Install dependencies
npm install
# or: bun install

# Start development server
npm run dev
# or: bun run dev
# Frontend: http://localhost:5173
```

**Configure environment** (create `.env` if needed):

```env
VITE_API_URL=http://localhost:8000
VITE_REVERB_APP_KEY=your_app_key
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080
```

#### 4. Access Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api/v1
- **Admin Dashboard**: http://localhost:5173/admin (login with seeded credentials)
- **API Documentation**: Use frontend or Postman with `/api/v1/*` endpoints

## 📁 Project Structure

```
vilcom-website/
├── backend/                          # Laravel API backend
│   ├── app/
│   │   ├── Http/Controllers/Api/    # API endpoint handlers
│   │   ├── Models/                  # 40+ Eloquent models
│   │   ├── Events/                  # Event classes for broadcasting
│   │   ├── Listeners/               # Event listeners
│   │   ├── Mail/                    # Mailable classes
│   │   ├── Notifications/           # Notification classes
│   │   ├── Policies/                # Authorization policies
│   │   ├── Services/                # Business logic services
│   │   └── Console/                 # Artisan commands
│   ├── routes/
│   │   ├── api.php                  # All v1 API routes
│   │   ├── web.php                  # Frontend routes
│   │   ├── channels.php             # Broadcasting channels
│   │   └── console.php              # Console commands
│   ├── database/
│   │   ├── migrations/              # Database migrations
│   │   ├── factories/               # Model factories
│   │   └── seeders/                 # Database seeders
│   ├── config/                      # Configuration files
│   │   ├── mpesa.php               # M-Pesa settings
│   │   ├── emerald.php             # Emerald provisioning
│   │   ├── flutterwave.php         # Flutterwave settings
│   │   ├── permission.php           # Role-based permissions
│   │   └── ...
│   ├── storage/                     # Application storage (logs, cache)
│   ├── tests/                       # PHPUnit tests
│   ├── .env.example                 # Environment template
│   ├── composer.json                # PHP dependencies
│   └── artisan                      # Laravel CLI
│
├── frontend/                         # React + TypeScript frontend
│   ├── src/
│   │   ├── components/              # Reusable React components
│   │   ├── pages/                   # Page components
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── services/                # API service layer
│   │   ├── contexts/                # React context providers
│   │   ├── lib/                     # Utility functions
│   │   ├── assets/                  # Images, icons, fonts
│   │   ├── App.tsx                  # Root component
│   │   └── main.tsx                 # Entry point
│   ├── public/                      # Static assets
│   │   ├── kenya-counties.json      # County boundaries
│   │   ├── vilcom_presence/         # Company presence data
│   │   └── ...
│   ├── index.html                   # HTML entry point
│   ├── package.json                 # npm dependencies
│   ├── vite.config.ts               # Vite configuration
│   ├── tailwind.config.ts           # TailwindCSS config
│   ├── tsconfig.json                # TypeScript config
│   └── vitest.config.ts             # Test configuration
│
├── .github/
│   ├── prompts/                     # GitHub Copilot prompts
│   └── workflows/                   # CI/CD workflows (if any)
│
├── docs/                            # Additional documentation
├── README.md                         # This file
├── LICENSE                          # MIT License
└── .gitignore                       # Git ignore rules
```

## 🔌 API Overview

### Authentication

All API endpoints (except public routes) require a Sanctum token:

```bash
# Login
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}

# Response includes Authorization token
{
  "token": "1|ABC123...",
  "user": { ... }
}

# Use token in subsequent requests
Authorization: Bearer 1|ABC123...
```

### Core Endpoints

| Resource | Public | Authenticated | Admin |
|---|---|---|---|
| **Products** | `GET /products`<br>`GET /categories` | — | `POST/PUT/DELETE /admin/products` |
| **Quotes** | `POST /quotes`<br>`GET /quotes/service-types` | `GET /quotes` (own) | `GET /admin/quotes` (all) |
| **Subscriptions** | — | `GET /subscriptions` (own)<br>`POST /subscriptions` | `GET /admin/subscriptions` (all) |
| **Payments** | — | `GET /payments` (own)<br>`POST /payments/mpesa` | `GET /admin/payments`<br>`POST /admin/payments/refund` |
| **Coverage** | `POST /coverage/check`<br>`GET /coverage/geojson` | — | `POST/PUT /admin/coverage/zones` |
| **CRM** | — | `GET /tickets` (own)<br>`POST /tickets` | `GET /admin/tickets` (all) |
| **Tickets & Support** | — | `GET /tickets`<br>`POST /tickets` | `CRUD /admin/tickets` |
| **Auth** | `POST /auth/register`<br>`POST /auth/login` | `POST /auth/logout`<br>`POST /auth/2fa-verify` | — |

See [backend/routes/api.php](backend/routes/api.php) for complete endpoint documentation.

## 🔧 Development Commands

### Backend

```bash
cd backend

# Database operations
php artisan migrate              # Run migrations
php artisan migrate:rollback     # Rollback migrations
php artisan db:seed              # Run seeders
php artisan tinker               # Interactive shell

# Code quality
php artisan pint                 # Format code (Laravel Pint)
./vendor/bin/phpunit            # Run tests
php artisan test                # Run tests with artisan

# Cache & optimization
php artisan cache:clear          # Clear application cache
php artisan view:clear           # Clear compiled views
php artisan optimize             # Optimize application

# Make commands (scaffolding)
php artisan make:model Post -m   # Create model with migration
php artisan make:controller PostController -r  # Restful controller
php artisan make:migration create_users_table
php artisan make:job SendEmail
php artisan make:mail WelcomeMail
php artisan make:event UserCreated
```

### Frontend

```bash
cd frontend

# Development
npm run dev           # Start dev server with HMR
npm run build         # Build for production
npm run build:dev     # Build in development mode
npm run preview       # Preview production build

# Quality
npm run lint          # ESLint checks
npm run test          # Run vitest tests
npm run test:watch    # Watch mode testing

# Type checking (with TypeScript)
npx tsc --noEmit      # Check types without emitting
```

## 🌍 Kenya-Specific Features

- **Geolocation & Maps**: GeoJSON county boundaries, DeckGL 3D visualization, coverage zone mapping
- **Payment Methods**: M-Pesa (STK Push for subscriptions, C2B for bill payments), Pesapal, Flutterwave
- **SMS Support**: AfricasTalking SMS integration for notifications and alerts
- **Service Zones**: County-based coverage areas, package-per-zone pricing
- **Local Compliance**: Support for KES currency, Kenyan phone formats, regional languages

## 📚 Documentation & Support

- **API Documentation**: See [backend/routes/api.php](backend/routes/api.php) and request schemas
- **Backend README**: [backend/README.md](backend/README.md)
- **Frontend README**: [frontend/README.md](frontend/README.md)
- **Database Schema**: Check migrations in `backend/database/migrations/`
- **Environment Guide**: See `.env.example` files in both directories
- **Laravel Documentation**: [Laravel 11 Docs](https://laravel.com/docs/11.x)
- **React Documentation**: [React 18 Docs](https://react.dev)

## 👥 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Commit with a clear message: `git commit -am 'Add your feature'`
5. Push to the branch: `git push origin feature/your-feature`
6. Open a Pull Request

For detailed guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md) (if available).

## 🐛 Issues & Bug Reports

Encountered a bug? Please:

1. Search [existing issues](../../issues) to avoid duplicates
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (PHP version, Laravel version, Node version, etc.)
   - Screenshots/logs if applicable

## 📝 License

This project is open-sourced software licensed under the [MIT License](LICENSE).

## 👤 Maintainers

- **Vilcom Development Team** — Primary maintainers and developers

## 🙏 Acknowledgments

- **Laravel** — Web framework and ecosystem
- **React** — UI library
- **TailwindCSS & shadcn/ui** — Styling and components
- **Spatie** — Laravel packages (permissions, media, activity)
- **Kenya Open Data** — GeoJSON and county boundary data

---

**Questions?** Open an issue or check the [FAQ section in the repository wiki](../../wiki).

**Want to deploy?** Check the deployment section in [backend/README.md](backend/README.md).