# Hospital Management System — Frontend Integration (Next.js + Tailwind CSS)

> **Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Axios, React Query, NextAuth.js v5

---

## Table of Contents

1. [Project Setup](#1-project-setup)
2. [Folder Structure](#2-folder-structure)
3. [API Client (Axios Instance)](#3-api-client-axios-instance)
4. [Authentication (NextAuth.js)](#4-authentication-nextauthjs)
5. [React Query Setup](#5-react-query-setup)
6. [Layout & Theme (Tailwind)](#6-layout--theme-tailwind)
7. [Pages & API Integration](#7-pages--api-integration)
8. [File Uploads to S3](#8-file-uploads-to-s3)
9. [Environment Variables](#9-environment-variables)
10. [Deployment to Vercel](#10-deployment-to-vercel)

---

## 1. Project Setup

```bash
npx create-next-app@latest hospital-frontend --typescript --tailwind --app --src-dir
cd hospital-frontend
```

### Install Dependencies

```bash
npm install axios @tanstack/react-query next-auth@beta
npm install lucide-react sonner zustand
npm install --save-dev @types/node
```

---

## 2. Folder Structure

```
frontend/
├── public/
├── src/
│   ├── app/
│   │   ├── (auth)/                          # Auth layout group
│   │   │   ├── layout.tsx                   # ✅ Passthrough layout
│   │   │   ├── login/page.tsx               # ✅ Split‑screen (left brand / right form)
│   │   │   └── register/page.tsx            # ✅ Split‑screen with role selection
│   │   ├── (dashboard)/                     # Dashboard layout group
│   │   │   ├── layout.tsx                   # ✅ Delegates to DashboardLayout
│   │   │   ├── page.tsx                     # ✅ Admin dashboard (stats cards)
│   │   │   ├── patients/                    # 📁 Empty (page.tsx missing)
│   │   │   ├── doctors/                     # 📁 Empty
│   │   │   ├── appointments/                # 📁 Empty
│   │   │   ├── billing/                     # 📁 Empty
│   │   │   ├── medical-records/             # 📁 Empty
│   │   │   ├── prescriptions/               # 📁 Empty
│   │   │   ├── departments/                 # 📁 Empty
│   │   │   └── settings/                    # 📁 Empty
│   │   ├── api/
│   │   │   └── auth/[...nextauth]/route.ts  # ✅ NextAuth handler
│   │   ├── layout.tsx                       # ✅ Root layout
│   │   ├── page.tsx                         # ✅ Redirects to /login
│   │   └── globals.css                      # ✅ Tailwind v4 + CSS variables
│   ├── components/
│   │   ├── ui/                              # Reusable UI components
│   │   │   ├── Badge.tsx                    # ✅
│   │   │   ├── Button.tsx                   # ✅ (with loading spinner)
│   │   │   ├── Card.tsx                     # ✅
│   │   │   ├── FileUpload.tsx               # ✅ (drag‑and‑drop + preview)
│   │   │   ├── Spinner.tsx                  # ✅
│   │   │   └── Table.tsx                    # ✅ (generic typed table)
│   │   ├── layout/
│   │   │   ├── DashboardLayout.tsx          # ✅ Sidebar + header wrapper
│   │   │   ├── Header.tsx                   # ✅ User info + logout
│   │   │   └── Sidebar.tsx                  # ✅ Navigation links
│   │   └── forms/                           # 📁 Empty (PatientForm, DoctorForm, etc.)
│   ├── lib/
│   │   ├── api.ts                           # ✅ Axios instance
│   │   ├── auth.ts                          # ✅ NextAuth config
│   │   └── utils.ts                         # ✅ cn() + formatDate()
│   ├── hooks/
│   │   ├── useAuth.ts                       # ✅ Session shorthand
│   │   ├── usePatients.ts                   # ❌ Not created
│   │   ├── useDoctors.ts                    # ❌ Not created
│   │   ├── useAppointments.ts              # ❌ Not created
│   │   ├── useBilling.ts                    # ❌ Not created
│   │   └── useUpload.ts                     # ❌ Not created
│   ├── types/
│   │   ├── next-auth.d.ts                   # ✅ Session type augmentation
│   │   ├── index.ts                         # ❌ Not created
│   │   ├── patient.ts                       # ❌ Not created
│   │   ├── doctor.ts                        # ❌ Not created
│   │   ├── appointment.ts                   # ❌ Not created
│   │   └── billing.ts                       # ❌ Not created
│   └── providers/
│       ├── QueryProvider.tsx                # ✅ React Query provider
│       └── SessionProvider.tsx              # ✅ NextAuth session provider
├── .env.local                               # ✅
├── next.config.ts                           # ✅ (with API rewrites)
└── package.json                             # ✅
```

**Legend:** ✅ = done, 📁 = directory exists but empty, ❌ = not created

---

## 3. API Client (Axios Instance)

```tsx
// src/lib/api.ts
import axios from 'axios';
import { getSession } from 'next-auth/react';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

> **Note:** The backend wraps all responses in `{ success: true, data: ... }`.  
> Callers must unwrap: `const { data } = await api.get(...)` → `data.data` is the payload.

---

## 4. Authentication (NextAuth.js)

### NextAuth Config

```tsx
// src/lib/auth.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const res = await fetch(
          `${process.env.API_BACKEND_URL || 'http://54.66.17.108:5000/api/v1'}/auth/login`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
          }
        );

        const data = await res.json();

        if (res.ok && data.success) {
          return {
            id: data.data.user.id,
            email: data.data.user.email,
            role: data.data.user.role,
            accessToken: data.data.token,
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.user.role = token.role as string;
      return session;
    },
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
});
```

> **Note:** Uses `API_BACKEND_URL` (direct backend URL) rather than the proxied `NEXT_PUBLIC_API_URL`, because NextAuth runs on the server.

### Route Handler

```tsx
// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/lib/auth';
export const { GET, POST } = handlers;
```

### Session Provider

```tsx
// src/providers/SessionProvider.tsx
'use client';
import { SessionProvider as NextAuthProvider } from 'next-auth/react';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthProvider>{children}</NextAuthProvider>;
}
```

### Type Augmentation

```tsx
// src/types/next-auth.d.ts
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken: string;
    user: {
      id: string;
      email: string;
      role: string;
      name?: string | null;
      image?: string | null;
    };
  }

  interface User {
    accessToken: string;
    role: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string;
    role: string;
  }
}
```

---

## 5. React Query Setup

```tsx
// src/providers/QueryProvider.tsx
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

### Root Layout

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/providers/SessionProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hospital Management System",
  description: "PERN Stack Hospital Management System",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <SessionProvider>
          <QueryProvider>
            {children}
            <Toaster theme="dark" richColors position="top-right" />
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
```

---

## 6. Layout & Theme (Tailwind)

Tailwind **v4** is used — no `tailwind.config.ts`. Configuration is done via CSS:

```css
/* src/app/globals.css */
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
```

Custom theme tokens can be added in `@theme inline {}`:

```css
@theme inline {
  --color-primary-50:  #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6;
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger:  #ef4444;
}
```

### Dashboard Layout (Sidebar + Header)

```tsx
// src/components/layout/DashboardLayout.tsx
'use client';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
```

```tsx
// src/app/(dashboard)/layout.tsx
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
```

### Sidebar

```tsx
// src/components/layout/Sidebar.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, Stethoscope, Calendar,
  FileText, Pill, DollarSign, Building2, Settings,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard',        label: 'Dashboard',       icon: LayoutDashboard },
  { href: '/patients',         label: 'Patients',        icon: Users },
  { href: '/doctors',          label: 'Doctors',         icon: Stethoscope },
  { href: '/appointments',     label: 'Appointments',    icon: Calendar },
  { href: '/medical-records',  label: 'Medical Records', icon: FileText },
  { href: '/prescriptions',    label: 'Prescriptions',   icon: Pill },
  { href: '/billing',          label: 'Billing',         icon: DollarSign },
  { href: '/departments',      label: 'Departments',     icon: Building2 },
  { href: '/settings',         label: 'Settings',        icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-primary-600">HospitalMS</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

### Header

```tsx
// src/components/layout/Header.tsx
'use client';
import { useSession, signOut } from 'next-auth/react';

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          Welcome, {session?.user?.name || session?.user?.email}
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500 capitalize">
          {session?.user?.role}
        </span>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-sm text-red-600 hover:text-red-800"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
```

---

## 7. Pages & API Integration

### 7.1 Custom Hooks (React Query) — ❌ Not Created

These hooks need to be implemented. Example pattern for each:

```tsx
// src/hooks/usePatients.ts (example — NOT YET CREATED)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Patient } from '@/types/patient';

export function usePatients(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['patients', params],
    queryFn: async () => {
      const { data } = await api.get('/patients', { params });
      return data.data as Patient[];
    },
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      const { data } = await api.get(`/patients/${id}`);
      return data.data as Patient;
    },
    enabled: !!id,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Patient>) => {
      const { data } = await api.post('/patients', payload);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patients'] }),
  });
}
```

Repeat the same pattern for:
- `useDoctors.ts` → `/doctors`
- `useAppointments.ts` → `/appointments`
- `useBilling.ts` → `/billing`
- `useUpload.ts` → `/upload/single`

### 7.2 Auth Pages (Login / Register) — ✅ Done

Both login and register use a **split-screen layout**:
- **Left (50%)** — Dark blue gradient branding with logo, headline, feature list
- **Right (50%)** — White form card with inputs

**Login** (`login/page.tsx`):
- Email + password inputs (with show/hide toggle)
- "Remember me" checkbox + "Forgot password" link
- Calls `signIn('credentials', ...)` from next-auth/react
- On success redirects to `/dashboard`

**Register** (`register/page.tsx`):
- Step 1: Choose role (Patient or Doctor) — card-style selection
- Step 2: Fill details (name, email, password, phone, DOB, gender)
- Doctor-specific fields: specialization, license number
- Posts to `/auth/register` via API client
- On success redirects to `/login`

**Auth layout** (`(auth)/layout.tsx`): passthrough — each page renders its own full‑viewport split layout.

### 7.3 Dashboard Page — ✅ Done

```tsx
// src/app/(dashboard)/page.tsx
'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Users, Stethoscope, Calendar, DollarSign } from 'lucide-react';

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard');
      return data.stats;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const cards = [
    { label: 'Total Patients',   value: stats?.totalPatients ?? '—', icon: Users,      color: 'text-blue-600' },
    { label: 'Active Doctors',   value: stats?.totalDoctors ?? '—',  icon: Stethoscope, color: 'text-green-600' },
    { label: "Today's Appointments", value: stats?.todayAppointments ?? '—', icon: Calendar, color: 'text-purple-600' },
    { label: 'Revenue',          value: stats?.revenue ? `$${Number(stats.revenue).toLocaleString()}` : '$0', icon: DollarSign, color: 'text-amber-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
                </div>
                <div className={`h-12 w-12 rounded-lg bg-gray-50 flex items-center justify-center ${card.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
```

### 7.4 List Pages (Patients, Doctors, Appointments, Billing, etc.) — ❌ Not Created

All 8 dashboard sub‑page directories exist but are **empty**. Each needs a `page.tsx` following this pattern:

```tsx
// src/app/(dashboard)/patients/page.tsx (example — NOT YET CREATED)
'use client';
import { usePatients } from '@/hooks/usePatients';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import Link from 'next/link';

export default function PatientsPage() {
  const { data: patients, isLoading } = usePatients();

  if (isLoading) return <Spinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Patients</h1>
        <Link
          href="/patients/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          + Add Patient
        </Link>
      </div>
      <Table
        columns={[
          { header: 'Name', accessor: (p: any) => `${p.firstName} ${p.lastName}` },
          { header: 'Gender', accessor: 'gender' },
          { header: 'Phone', accessor: 'phone' },
          { header: 'Blood Group', accessor: 'bloodGroup' },
          { header: 'Status', accessor: () => <Badge variant="success">Active</Badge> },
        ]}
        data={patients || []}
      />
    </div>
  );
}
```

### 7.5 Form Components — ❌ Not Created

The `components/forms/` directory is empty. Needed forms:

| Form | Fields |
|------|--------|
| `PatientForm.tsx` | firstName, lastName, dateOfBirth, gender, phone, address, bloodGroup |
| `DoctorForm.tsx` | firstName, lastName, specialization, licenseNumber, consultationFee, departmentId |
| `AppointmentForm.tsx` | patientId (select), doctorId (select), appointmentDate, type, notes |
| `BillingForm.tsx` | patientId (select), items, subtotal, tax, discount, total, dueDate, paymentMethod |

### 7.6 Reusable UI Components — ✅ Done

All 6 UI components exist and match the implementations shown in the original document.

---

## 8. File Uploads to S3

### Upload Hook — ❌ Not Created (see Section 7.1)

### FileUpload Component — ✅ Done

```tsx
// src/components/ui/FileUpload.tsx
'use client';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Upload, X, FileAudio } from 'lucide-react';
import api from '@/lib/api';

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  accept?: string;
  maxSize?: number;
}

export function FileUpload({
  onUploadComplete,
  accept = 'image/*,audio/*,.pdf',
  maxSize = 10,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (f.size > maxSize * 1024 * 1024) {
      toast.error(`File must be under ${maxSize}MB`);
      return;
    }

    setFile(f);
    if (f.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await api.post('/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onUploadComplete(data.data.url);
      toast.success('Upload complete');
      setFile(null);
      setPreview(null);
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleSelect}
        className="hidden"
      />

      {!file ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors"
        >
          <Upload className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">Click to upload or drag & drop</p>
          <p className="text-xs text-gray-400">Images, Audio, PDF (max {maxSize}MB)</p>
        </button>
      ) : (
        <div className="border rounded-lg p-4 space-y-3">
          {preview ? (
            <img src={preview} alt="preview" className="max-h-32 rounded" />
          ) : (
            <div className="flex items-center gap-2 text-gray-600">
              <FileAudio className="h-6 w-6" />
              <span className="text-sm">{file.name}</span>
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
            <button
              onClick={() => { setFile(null); setPreview(null); }}
              className="p-2 text-gray-400 hover:text-red-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 9. Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_URL=/api/v1
API_BACKEND_URL=http://54.66.17.108:5000/api/v1
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=change_this_to_a_random_secret_in_production
```

> **Note:** `NEXT_PUBLIC_API_URL` is set to `/api/v1` — the Next.js `rewrites` in `next.config.ts` proxy these requests to `API_BACKEND_URL`. The `API_BACKEND_URL` is used directly by NextAuth (server-side).

### next.config.ts

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.s3.amazonaws.com' },
      { protocol: 'https', hostname: '*.s3.*.amazonaws.com' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.API_BACKEND_URL || 'http://54.66.17.108:5000/api/v1'}/:path*`,
      },
    ];
  },
};

export default nextConfig;
```

---

## 10. Deployment to Vercel

### 10.1 Environment Variables on Vercel

Set these in Vercel Dashboard → Project → Settings → Environment Variables:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `/api/v1` |
| `API_BACKEND_URL` | `https://api.yourdomain.com/api/v1` |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Random 32-char string |

### 10.2 Deploy

```bash
# Option 1: Vercel CLI
npm i -g vercel
vercel --prod

# Option 2: Git push (automatic)
git push origin main
```

> **vercel.json** is optional — Vercel auto-detects Next.js.

---

## Summary

```
┌─────────────────────────────────────────────────┐
│                  Browser (User)                   │
└─────────────────────┬───────────────────────────┘
                      │ HTTPS
┌─────────────────────▼───────────────────────────┐
│           Vercel (Next.js App Router)             │
│  ┌───────────┐ ┌──────────┐ ┌────────────────┐  │
│  │ NextAuth  │ │ React    │ │ Tailwind CSS   │  │
│  │ (JWT)     │ │ Query    │ │ v4 (CSS‑based) │  │
│  └───────────┘ └──────────┘ └────────────────┘  │
│  └──────────────┬───────────────────────────────┘
│                 │ Rewrite /api/v1/* → backend
│                 │ Axios (Bearer token auto-attached)
┌─────────────────▼───────────────────────────────┐
│         Backend API (Express / EC2)               │
│         http://localhost:5000/api/v1              │
└───────────────────────────────────────────────────┘
```

**Key Integration Points:**
- All API calls go through a single Axios instance with auto-auth
- Next.js rewrites proxy `/api/v1/*` to the backend (avoids CORS in production)
- NextAuth.js handles JWT session management (server-side)
- React Query handles caching, loading, and error states
- File uploads go from browser → backend → S3
- Tailwind v4 uses CSS-based config (`@import "tailwindcss"`), no `tailwind.config.ts`

### Implementation Status

| Area | Status |
|------|--------|
| Auth (login / register) | ✅ Done |
| Dashboard page | ✅ Done |
| Layout (sidebar, header) | ✅ Done |
| UI Components (6 components) | ✅ Done |
| API client + NextAuth + React Query | ✅ Done |
| List pages (patients, doctors, etc.) | ❌ 8 pages not built |
| Form components | ❌ 4 forms not built |
| Data hooks (usePatients, etc.) | ❌ 5 hooks not built |
| TypeScript types | ❌ 5 type files not built |
| File upload hook (useUpload) | ❌ Not built |
