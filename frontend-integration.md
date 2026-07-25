# Hospital Management System — Frontend Integration (Next.js + Tailwind CSS)

> **Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Axios, React Query, NextAuth.js

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
│   └── uploads/                    # Local fallback for uploads
├── src/
│   ├── app/
│   │   ├── (auth)/                 # Auth layout group
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/            # Dashboard layout group
│   │   │   ├── layout.tsx          # Sidebar + header
│   │   │   ├── page.tsx            # Admin dashboard
│   │   │   ├── patients/
│   │   │   ├── doctors/
│   │   │   ├── appointments/
│   │   │   ├── billing/
│   │   │   ├── medical-records/
│   │   │   ├── prescriptions/
│   │   │   ├── departments/
│   │   │   └── settings/
│   │   ├── api/
│   │   │   └── auth/[...nextauth]/
│   │   │       └── route.ts        # NextAuth handler
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Landing page
│   │   └── globals.css             # Tailwind imports
│   ├── components/
│   │   ├── ui/                     # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── FileUpload.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── DashboardLayout.tsx
│   │   └── forms/
│   │       ├── PatientForm.tsx
│   │       ├── DoctorForm.tsx
│   │       ├── AppointmentForm.tsx
│   │       └── BillingForm.tsx
│   ├── lib/
│   │   ├── api.ts                  # Axios instance
│   │   ├── auth.ts                 # NextAuth config
│   │   └── utils.ts                # Utility functions
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── usePatients.ts
│   │   ├── useDoctors.ts
│   │   ├── useAppointments.ts
│   │   ├── useBilling.ts
│   │   └── useUpload.ts
│   ├── types/
│   │   ├── index.ts                # Shared TypeScript types
│   │   ├── patient.ts
│   │   ├── doctor.ts
│   │   ├── appointment.ts
│   │   └── billing.ts
│   └── providers/
│       ├── QueryProvider.tsx        # React Query provider
│       └── SessionProvider.tsx      # NextAuth session provider
├── .env.local
├── tailwind.config.ts
├── next.config.js
└── package.json
```

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
    if (error.response?.status === 401) {
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

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
          `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
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
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
});
```

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
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/providers/QueryProvider';
import { SessionProvider } from '@/providers/SessionProvider';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hospital Management System',
  description: 'PERN Stack Hospital Management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <QueryProvider>
            {children}
            <Toaster richColors position="top-right" />
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
```

---

## 6. Layout & Theme (Tailwind)

### Tailwind Config

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger:  '#ef4444',
      },
    },
  },
  plugins: [],
};

export default config;
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

### 7.1 Custom Hooks (React Query)

```tsx
// src/hooks/usePatients.ts
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

### 7.2 Login Page

```tsx
// src/app/(auth)/login/page.tsx
'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      toast.error('Invalid email or password');
      return;
    }

    toast.success('Logged in successfully');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          Hospital Management System
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

### 7.3 Dashboard Page

```tsx
// src/app/(dashboard)/page.tsx
'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Users, Stethoscope, Calendar, DollarSign } from 'lucide-react';

export default function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard');
      return data.stats;
    },
  });

  const cards = [
    { label: 'Total Patients',   value: stats?.totalPatients,   icon: Users,      color: 'text-blue-600' },
    { label: 'Active Doctors',   value: stats?.totalDoctors,    icon: Stethoscope, color: 'text-green-600' },
    { label: "Today's Appts",    value: stats?.todayAppointments,icon: Calendar,   color: 'text-purple-600' },
    { label: 'Revenue',          value: `$${stats?.revenue || 0}`, icon: DollarSign, color: 'text-amber-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold">{card.value ?? '—'}</p>
                </div>
                <Icon className={`h-10 w-10 ${card.color} opacity-80`} />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
```

### 7.4 Patients List Page

```tsx
// src/app/(dashboard)/patients/page.tsx
'use client';
import { usePatients } from '@/hooks/usePatients';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';

export default function PatientsPage() {
  const { data: patients, isLoading } = usePatients();

  if (isLoading) return <Spinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Patients</h1>
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          + Add Patient
        </button>
      </div>

      <Table
        columns={[
          { header: 'Name', accessor: (p) => `${p.firstName} ${p.lastName}` },
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

### 7.5 Appointments Page

```tsx
// src/app/(dashboard)/appointments/page.tsx
'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { format } from '@/lib/utils';

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  checked_in: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function AppointmentsPage() {
  const { data: appointments } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const { data } = await api.get('/appointments');
      return data;
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Appointments</h1>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Patient</th>
              <th className="text-left p-3">Doctor</th>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments?.map((apt: any) => (
              <tr key={apt.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{apt.Patient?.firstName} {apt.Patient?.lastName}</td>
                <td className="p-3">{apt.Doctor?.firstName} {apt.Doctor?.lastName}</td>
                <td className="p-3">{format(new Date(apt.appointmentDate), 'PPp')}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[apt.status]}`}>
                    {apt.status.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

### 7.6 Reusable UI Components

```tsx
// src/components/ui/Button.tsx
'use client';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-lg font-medium transition-colors disabled:opacity-50',
        {
          'bg-primary-600 text-white hover:bg-primary-700': variant === 'primary',
          'bg-gray-100 text-gray-700 hover:bg-gray-200':    variant === 'secondary',
          'bg-red-600 text-white hover:bg-red-700':         variant === 'danger',
          'bg-transparent text-gray-600 hover:bg-gray-100': variant === 'ghost',
        },
        {
          'px-2 py-1 text-xs':  size === 'sm',
          'px-4 py-2 text-sm':  size === 'md',
          'px-6 py-3 text-base': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

```tsx
// src/components/ui/Table.tsx
interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
}

export function Table<T>({ columns, data }: TableProps<T>) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th key={col.header} className="text-left p-3 font-medium text-gray-600">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-t hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col.header} className="p-3">
                  {typeof col.accessor === 'function'
                    ? col.accessor(row)
                    : (row[col.accessor] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

```tsx
// src/components/ui/Card.tsx
import { cn } from '@/lib/utils';

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('bg-white rounded-xl shadow-sm p-6', className)}>
      {children}
    </div>
  );
}
```

```tsx
// src/components/ui/Spinner.tsx
export function Spinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );
}
```

```tsx
// src/components/ui/Badge.tsx
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info';
}

export function Badge({ children, variant = 'info' }: BadgeProps) {
  return (
    <span
      className={cn(
        'px-2 py-1 rounded-full text-xs font-medium',
        {
          'bg-green-100 text-green-800': variant === 'success',
          'bg-yellow-100 text-yellow-800': variant === 'warning',
          'bg-red-100 text-red-800':    variant === 'danger',
          'bg-blue-100 text-blue-800':  variant === 'info',
        }
      )}
    >
      {children}
    </span>
  );
}
```

```tsx
// src/lib/utils.ts
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export function format(date: Date, fmt: string = 'PPp') {
  // Simple formatter — you can use date-fns for production
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
```

---

## 8. File Uploads to S3

### Upload Hook

```tsx
// src/hooks/useUpload.ts
import { useState } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';

export function useUpload() {
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await api.post('/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return data.url;
    } catch (err) {
      toast.error('Upload failed');
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploadFile, uploading };
}
```

### FileUpload Component

```tsx
// src/components/ui/FileUpload.tsx
'use client';
import { useState, useRef } from 'react';
import { useUpload } from '@/hooks/useUpload';
import { Image, FileAudio, X, Upload } from 'lucide-react';

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  accept?: string;
  maxSize?: number; // MB
}

export function FileUpload({
  onUploadComplete,
  accept = 'image/*,audio/*,.pdf',
  maxSize = 10,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, uploading } = useUpload();
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
    const url = await uploadFile(file);
    if (url) {
      onUploadComplete(url);
      toast.success('Upload complete');
      setFile(null);
      setPreview(null);
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
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors"
        >
          <Upload className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">
            Click to upload or drag & drop
          </p>
          <p className="text-xs text-gray-400">
            Images, Audio, PDF (max {maxSize}MB)
          </p>
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
              className="flex-1 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50"
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
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_change_in_production
```

### next.config.js

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
      },
    ],
  },
};

module.exports = nextConfig;
```

---

## 10. Deployment to Vercel

### 10.1 Vercel Config

```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "env": {
    "NEXT_PUBLIC_API_URL": "@next_public_api_url",
    "NEXTAUTH_URL": "@nextauth_url",
    "NEXTAUTH_SECRET": "@nextauth_secret"
  }
}
```

### 10.2 Environment Variables on Vercel

Set these in Vercel Dashboard → Project → Settings → Environment Variables:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.yourdomain.com/api/v1` |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Random 32-char string |

### 10.3 Deploy

```bash
# Option 1: Vercel CLI
npm i -g vercel
vercel --prod

# Option 2: Git push (automatic)
git push origin main
```

---

## Summary

```
┌───────────────────────────────────────────────┐
│              Browser (User)                     │
└───────────────────┬───────────────────────────┘
                    │ HTTPS
┌───────────────────▼───────────────────────────┐
│         Vercel (Next.js App Router)            │
│  ┌───────────┐ ┌──────────┐ ┌──────────────┐ │
│  │ NextAuth  │ │ React    │ │ Tailwind CSS │ │
│  │ (JWT)     │ │ Query    │ │ UI           │ │
│  └───────────┘ └──────────┘ └──────────────┘ │
│  │                                             │
│  └──────────────┬──────────────────────────────┘
│                 │ Axios (Bearer Token)
┌─────────────────▼──────────────────────────────┐
│   Backend API (Express)                         │
│   http://localhost:5000/api/v1                  │
└─────────────────────────────────────────────────┘
```

**Key Integration Points:**
- All API calls go through a single Axios instance with auto-auth
- NextAuth.js handles JWT session management
- React Query handles caching, loading, and error states
- File uploads go directly from browser → backend → S3
- Tailwind utility classes used throughout for styling
