'use client';
import { useSession, signOut } from 'next-auth/react';

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div>
        <p className="text-sm text-gray-500">Welcome back,</p>
        <p className="text-sm font-semibold text-gray-800">
          {session?.user?.email || 'User'}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full capitalize">
          {session?.user?.role?.replace('_', ' ') || 'guest'}
        </span>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-sm text-red-600 hover:text-red-800 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
