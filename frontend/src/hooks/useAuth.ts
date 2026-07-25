import { useSession } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user ?? null,
    token: session?.accessToken ?? null,
    role: session?.user?.role ?? null,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
  };
}
