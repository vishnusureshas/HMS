'use client';
import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#1e40af] relative overflow-hidden">
        <div className="absolute top-10 -left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 -right-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
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
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">Forgot Password?</h1>
          <p className="text-blue-200/90 text-lg max-w-md leading-relaxed">
            Enter your email and we will send you a reset link.
          </p>
          <div className="mt-16 pt-8 border-t border-white/10">
            <p className="text-blue-300/60 text-sm">&copy; 2026 MediCare. All rights reserved.</p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-6">
        <div className="w-full max-w-md">
          {sent ? (
            <div className="text-center">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
              <p className="text-gray-500 mb-6">
                If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly.
              </p>
              <Link href="/login" className="text-blue-600 hover:underline font-medium">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
                <p className="text-gray-500 mt-2">Enter your email and we will send you a reset link.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow bg-gray-50 text-black placeholder-gray-500"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <Button type="submit" loading={loading} className="w-full py-3.5 rounded-xl text-base font-semibold shadow-lg shadow-blue-600/25">
                  Send Reset Link
                </Button>
                <p className="text-center text-sm text-gray-500 pt-2">
                  Remember your password?{' '}
                  <Link href="/login" className="text-blue-600 hover:underline font-semibold">Sign In</Link>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
