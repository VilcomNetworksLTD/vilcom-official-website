# Vilcom Frontend ⚛️

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green)](../LICENSE)

Modern React 18 + TypeScript SPA for the Vilcom ISP platform. Built with **Vite**, **shadcn/ui**, **React Hook Form**, **TanStack Query**, and **Leaflet/DeckGL** for interactive maps and coverage visualization.

## 📋 Quick Navigation

- **[Installation](#-installation)** — Setup local development
- **[Project Structure](#-project-structure)** — File organization
- **[Development](#-development)** — Common commands
- **[Components & Hooks](#-components--hooks)** — UI and logic
- **[State Management](#-state-management)** — Data flow
- **[API Integration](#-api-integration)** — Backend communication
- **[Building](#-building)** — Production build
- **[Deployment](#-deployment)** — Hosting & deployment

## ⚙️ Installation

### Prerequisites

```bash
node --version                 # Node.js 18+
npm --version                  # npm 9+
# or
bun --version                  # Bun (optional, faster)
```

### Local Setup

```bash
# 1. Install dependencies
npm install
# or: bun install

# 2. Configure environment (optional)
# Copy .env if needed, or create with VITE_API_URL=http://localhost:8000

# 3. Start development server
npm run dev
# Frontend available at http://localhost:5173
```

### Environment Configuration

Create `.env` in the frontend directory:

```env
# API Configuration
VITE_API_URL=http://localhost:8000

# Real-Time (Reverb/WebSocket)
VITE_REVERB_APP_KEY=vilcom
VITE_REVERB_HOST=localhost
VITE_REVERB_PORT=8080

# Optional: Analytics, CDN, etc.
# VITE_ANALYTICS_KEY=...
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/              # Reusable React components
│   │   ├── ui/                  # shadcn/ui base components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   ├── card.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...
│   │   ├── layout/              # Layout wrappers
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Footer.tsx
│   │   ├── forms/               # Form components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── QuoteForm.tsx
│   │   │   ├── SubscriptionForm.tsx
│   │   │   └── ...
│   │   ├── maps/                # Map components
│   │   │   ├── CoverageMap.tsx
│   │   │   ├── ZoneViewer.tsx
│   │   │   └── ...
│   │   ├── dashboard/           # Dashboard components
│   │   ├── common/              # Shared components
│   │   │   ├── Loading.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── ...
│   │   └── ...
│   ├── pages/                   # Page components (routes)
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Quotes/
│   │   │   ├── QuoteList.tsx
│   │   │   ├── QuoteDetail.tsx
│   │   │   └── QuoteCreate.tsx
│   │   ├── Subscriptions/
│   │   ├── CoverageChecker.tsx
│   │   ├── Admin/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── UsersManagement.tsx
│   │   │   ├── ProductsManagement.tsx
│   │   │   └── ...
│   │   ├── NotFound.tsx
│   │   └── ...
│   ├── hooks/                   # Custom React hooks
│   │   ├── useQuery.ts          # TanStack Query wrappers
│   │   ├── useMutation.ts
│   │   ├── useAuth.ts           # Authentication hook
│   │   ├── usePrice.ts
│   │   ├── useGeolocation.ts
│   │   └── ...
│   ├── services/                # API client services
│   │   ├── api.ts               # Axios instance
│   │   ├── auth.ts              # Authentication endpoints
│   │   ├── products.ts          # Product endpoints
│   │   ├── quotes.ts            # Quote endpoints
│   │   ├── subscriptions.ts      # Subscription endpoints
│   │   ├── payments.ts          # Payment endpoints
│   │   └── ...
│   ├── contexts/                # React Context providers
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── ...
│   ├── lib/                     # Utility functions
│   │   ├── utils.ts             # Helper functions
│   │   ├── validation.ts        # Form validation schemas (Zod)
│   │   ├── constants.ts
│   │   └── types.ts             # TypeScript types
│   ├── assets/                  # Static assets
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   ├── styles/
│   │   ├── globals.css          # Global styles
│   │   ├── App.css
│   │   └── ...
│   ├── App.tsx                  # Root component
│   ├── App.css
│   ├── index.css
│   ├── main.tsx                 # Entry point
│   └── vite-env.d.ts            # Vite environment types
│
├── public/                      # Static assets (not bundled)
│   ├── kenya-counties.json      # GeoJSON: county boundaries
│   ├── vilcom_presence/         # Company presence data
│   ├── robots.txt
│   ├── sitemap.xml
│   └── ...
│
├── index.html                   # HTML entry point
├── package.json                 # npm dependencies
├── vite.config.ts               # Vite configuration
├── vitest.config.ts             # Test configuration
├── tailwind.config.ts           # TailwindCSS config
├── tsconfig.json                # TypeScript config
├── tsconfig.app.json            # App TypeScript config
├── tsconfig.node.json           # Node TypeScript config
├── eslint.config.js             # ESLint rules
├── components.json              # shadcn/ui config
└── README.md
```

## 🔧 Development

### Available Scripts

```bash
# Development server with HMR
npm run dev

# Production build
npm run build

# Build in development mode (for debugging)
npm run build:dev

# Preview production build
npm run preview

# Type check
npx tsc --noEmit

# Linting
npm run lint

# Format code
npm run lint -- --fix

# Run tests with Vitest
npm run test

# Watch mode testing
npm run test:watch
```

### Hot Module Reloading (HMR)

Changes are automatically reflected in the browser without full page reload:

```bash
npm run dev
# Modify any .tsx or .ts file → automatically updates in browser
```

## 🎨 Components & Hooks

### UI Components (shadcn/ui)

Pre-built, accessible components available in `src/components/ui/`:

```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hello</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Click me</Button>
      </CardContent>
    </Card>
  );
}
```

### Custom Hooks

**useAuth** — Authentication and user state:

```tsx
import { useAuth } from "@/hooks/useAuth";

export function Dashboard() {
  const { user, isLoading, logout } = useAuth();
  
  if (isLoading) return <Loading />;
  if (!user) return <Navigate to="/login" />;
  
  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

**useQuery** — TanStack Query wrapper for data fetching:

```tsx
import { useQuery } from "@/hooks/useQuery";
import { getProducts } from "@/services/products";

export function ProductList() {
  const { data: products, isLoading, error } = useQuery(
    ["products"],
    getProducts
  );
  
  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;
  
  return (
    <ul>
      {products?.map(p => <li key={p.id}>{p.name}</li>)}
    </ul>
  );
}
```

**useMutation** — TanStack Query for mutations (POST/PUT/DELETE):

```tsx
import { useMutation } from "@/hooks/useMutation";
import { createQuote } from "@/services/quotes";

export function QuoteForm() {
  const { mutate, isLoading } = useMutation(createQuote);
  
  const handleSubmit = (data) => {
    mutate(data, {
      onSuccess: () => alert("Quote created!"),
      onError: (err) => alert(err.message),
    });
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

## 🌍 State Management

### Authentication Context

Provides `user`, `token`, `login`, `logout` globally:

```tsx
import { useAuth } from "@/hooks/useAuth";

// In any component
const { user, isAuthenticated, logout } = useAuth();
```

### TanStack Query (React Query)

Global client-side cache for API data:

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function SubscriptionList() {
  const { data, isLoading } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: () => fetch("/api/v1/subscriptions").then(r => r.json()),
  });
  
  const queryClient = useQueryClient();
  const { mutate } = useMutation({
    mutationFn: (id) => fetch(`/api/v1/subscriptions/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries(["subscriptions"]);
    },
  });
  
  return <div>...</div>;
}
```

### Form Validation (Zod + React Hook Form)

Type-safe form validation:

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const QuoteSchema = z.object({
  email: z.string().email("Invalid email"),
  serviceType: z.enum(["broadband", "dedicated"]),
  area: z.string().min(3, "Select a coverage area"),
});

type Quote = z.infer<typeof QuoteSchema>;

export function QuoteForm() {
  const form = useForm<Quote>({
    resolver: zodResolver(QuoteSchema),
  });
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormField name="email" control={form.control} />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## 🔌 API Integration

### Axios Instance

Configured in `src/services/api.ts`:

```tsx
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

// Auto-attach auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### API Service Functions

Define reusable API calls:

```tsx
// src/services/quotes.ts
import api from "./api";

export const getQuotes = () => api.get("/quotes").then(r => r.data);
export const getQuote = (id: string) => api.get(`/quotes/${id}`).then(r => r.data);
export const createQuote = (data: any) => api.post("/quotes", data).then(r => r.data);
export const updateQuote = (id: string, data: any) => 
  api.put(`/quotes/${id}`, data).then(r => r.data);
```

### Handling Errors

```tsx
import { useQuery } from "@tanstack/react-query";

export function MyComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["resource"],
    queryFn: fetchResource,
  });
  
  if (error) {
    return (
      <div className="text-red-500">
        Error: {error.response?.data?.message || error.message}
      </div>
    );
  }
  
  return <div>...</div>;
}
```

## 🗺️ Maps & Visualization

### Coverage Map (Leaflet)

```tsx
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export function CoverageMap() {
  const [geoJson, setGeoJson] = useState(null);
  
  useEffect(() => {
    fetch("/kenya-counties.json")
      .then(r => r.json())
      .then(setGeoJson);
  }, []);
  
  return (
    <MapContainer center={[-6.369, 34.888]} zoom={6} className="h-96">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {geoJson && <GeoJSON data={geoJson} />}
    </MapContainer>
  );
}
```

### 3D Visualization (react-three-fiber)

```tsx
import { Canvas } from "@react-three/fiber";
import { Box, OrbitControls } from "@react-three/drei";

export function Model3D() {
  return (
    <Canvas>
      <Box args={[1, 1, 1]} />
      <OrbitControls />
    </Canvas>
  );
}
```

## 🏗️ Building

### Production Build

```bash
# Build optimized bundle
npm run build

# Output: dist/
# - ~150 KB JS (gzipped)
# - Tree-shaking removes unused code
# - Code splitting for faster loads
```

### Build Configuration

In `vite.config.ts`:

```tsx
build: {
  chunkSizeWarningLimit: 1500,  // Large 3D/map libs
  rollupOptions: {
    output: {
      manualChunks: (id) => {
        if (id.includes("three/")) return "vendor-3d";
      },
    },
  },
},
```

## 🚀 Deployment

### Build & Deploy

```bash
# 1. Build locally
npm run build

# 2. Deploy dist/ folder to hosting
# Option A: Copy to backend/public/frontend/
cp -r dist ../backend/public/frontend/

# Option B: Deploy to Netlify/Vercel
# - Connect GitHub repo
# - Set build command: npm run build
# - Set output directory: dist/
```

### Environment Variables (Production)

Create `.env.production` in frontend root:

```env
VITE_API_URL=https://api.vilcom.co.ke
VITE_REVERB_HOST=ws.vilcom.co.ke
VITE_REVERB_PORT=443
```

### Hosting Options

- **Netlify**: Automatic deploys from GitHub
- **Vercel**: Edge functions, serverless
- **AWS S3 + CloudFront**: Static hosting with CDN
- **Backend (Laravel)**: Serve from `public/frontend/`

## 🧪 Testing

### Unit & Component Tests (Vitest)

```bash
npm run test              # Run once
npm run test:watch       # Watch mode
```

**Test example:**

```tsx
// src/components/__tests__/Button.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeDefined();
  });
});
```

## 📚 Documentation

- **React**: https://react.dev
- **Vite**: https://vitejs.dev
- **TailwindCSS**: https://tailwindcss.com
- **shadcn/ui**: https://ui.shadcn.com
- **React Hook Form**: https://react-hook-form.com
- **TanStack Query**: https://tanstack.com/query
- **Zod**: https://zod.dev
- **Leaflet**: https://leafletjs.com
- **react-three-fiber**: https://docs.pmnd.rs/react-three-fiber

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and write tests
3. Run tests: `npm run test`
4. Lint & format: `npm run lint -- --fix`
5. Commit: `git commit -m "feat: add your feature"`
6. Push & open PR

## 📝 License

Licensed under the [MIT License](../LICENSE).

---

**Need help?** Check the [main README](../README.md) or [backend docs](../backend/README.md).
