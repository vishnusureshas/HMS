'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<'select-role' | 'fill-details'>('select-role');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    specialization: '',
    licenseNumber: '',
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const payload: Record<string, string> = {
        email: form.email,
        password: form.password,
        role,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
      };
      if (role === 'doctor') {
        payload.specialization = form.specialization;
        payload.licenseNumber = form.licenseNumber;
      }

      const { data } = await api.post('/auth/register', payload);

      if (data.success) {
        toast.success('Registration successful! Please sign in.');
        router.push('/login');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
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

          {step === 'select-role' ? (
            <>
              <h1 className="text-4xl font-bold text-white leading-tight mb-4">
                Join MediCare
              </h1>
              <p className="text-blue-200/90 text-lg mb-10 max-w-md leading-relaxed">
                Create your account and start managing your healthcare journey with
                our comprehensive platform.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold text-white leading-tight mb-4">
                Complete Your Profile
              </h1>
              <p className="text-blue-200/90 text-lg mb-10 max-w-md leading-relaxed">
                Fill in your details to get started with MediCare.
              </p>
            </>
          )}

          <div className="space-y-5">
            {[
              { text: 'Comprehensive healthcare management', icon: 'shield' },
              { text: 'HIPAA-compliant data security', icon: 'lock' },
              { text: 'Advanced analytics dashboard', icon: 'chart' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-blue-400/20 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-blue-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    {item.icon === 'shield' ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                      />
                    ) : item.icon === 'lock' ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                      />
                    )}
                  </svg>
                </div>
                <span className="text-blue-100/90">{item.text}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-blue-300/60 text-sm">&copy; 2026 MediCare. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-6 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          {step === 'select-role' ? (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
                <p className="text-gray-500 mt-2">
                  Choose your account type to get started.
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    setRole('patient');
                    setStep('fill-details');
                  }}
                  className="w-full p-5 border-2 border-gray-200 rounded-2xl text-left hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-lg">
                        Patient
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Register as a patient to book appointments and manage
                        your health records
                      </p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setRole('doctor');
                    setStep('fill-details');
                  }}
                  className="w-full p-5 border-2 border-gray-200 rounded-2xl text-left hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-lg">
                        Doctor
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Register as a doctor to manage patients, appointments,
                        and prescriptions
                      </p>
                    </div>
                  </div>
                </button>

                <p className="text-center text-sm text-gray-500 pt-4">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Register as {role === 'patient' ? 'Patient' : 'Doctor'}
                    </h2>
                    <p className="text-gray-500 mt-1 text-sm">
                      Fill in your details below
                    </p>
                  </div>
                  <button
                    onClick={() => setStep('select-role')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 19.5L8.25 12l7.5-7.5"
                      />
                    </svg>
                    Change
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      value={form.firstName}
                      onChange={(e) => update('firstName', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 text-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      value={form.lastName}
                      onChange={(e) => update('lastName', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 text-black"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 text-black"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => update('password', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 text-black"
                      minLength={6}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={form.confirmPassword}
                      onChange={(e) => update('confirmPassword', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 text-black"
                      minLength={6}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      value={form.phone}
                      onChange={(e) => update('phone', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={form.dateOfBirth}
                      onChange={(e) => update('dateOfBirth', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 text-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={form.gender}
                    onChange={(e) => update('gender', e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 text-black"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {role === 'doctor' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Specialization
                      </label>
                      <input
                        value={form.specialization}
                        onChange={(e) => update('specialization', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        License Number
                      </label>
                      <input
                        value={form.licenseNumber}
                        onChange={(e) => update('licenseNumber', e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-50 text-black"
                      />
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  loading={loading}
                  className="w-full py-3 rounded-xl text-base font-semibold shadow-lg shadow-blue-600/25"
                >
                  Create Account
                </Button>

                <p className="text-center text-sm text-gray-500 pt-1">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Sign in
                  </Link>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
