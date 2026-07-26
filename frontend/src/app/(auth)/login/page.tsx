'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-screen flex w-full">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#1e40af] relative overflow-hidden">
        <div className="absolute top-10 -left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 -right-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col justify-center px-16 w-full">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-14 w-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-xl">
              <span className="text-white font-bold text-2xl">+</span>
            </div>
            <div>
              <h2 className="text-white text-xl font-bold tracking-tight">MediCare</h2>
              <p className="text-blue-300/80 text-sm">Hospital Management</p>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Welcome Back
          </h1>
          <p className="text-blue-200/90 text-lg mb-10 max-w-md leading-relaxed">
            Your trusted healthcare management platform. Streamline operations, manage patients, and deliver better care.
          </p>

          <div className="space-y-5">
            {[
              'Secure patient data management',
              'Easy appointment scheduling',
              'Real-time analytics & reports',
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-emerald-400/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <span className="text-blue-100/90">{text}</span>
              </div>
            ))}
          </div>

          <div className="mt-16 pt-8 border-t border-white/10">
            <p className="text-blue-300/60 text-sm">&copy; 2026 MediCare. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-6">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Sign In</h2>
            <p className="text-gray-500 mt-2">Welcome back! Please enter your credentials.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow bg-gray-50 text-black placeholder-gray-500"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow bg-gray-50 text-black placeholder-gray-500 pr-12"
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700 font-medium"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full py-3.5 rounded-xl text-base font-semibold shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 transition-all"
            >
              Sign In
            </Button>

            <p className="text-center text-sm text-gray-500 pt-2">
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="text-blue-600 hover:underline font-semibold"
              >
                Create one
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
