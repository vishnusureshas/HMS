import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

const BACKEND_URL = process.env.API_BACKEND_URL || 'http://54.66.17.108:5000/api/v1';

async function refreshAccessToken(token) {
  try {
    const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.accessToken}` },
    });

    const data = await res.json();
    if (!res.ok || !data.success) throw new Error('Refresh failed');

    return { ...token, accessToken: data.data.token };
  } catch {
    return { ...token, error: 'RefreshAccessTokenError' };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const res = await fetch(`${BACKEND_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });

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
        const decoded = JSON.parse(Buffer.from(user.accessToken.split('.')[1], 'base64').toString());
        token.accessTokenExpires = decoded.exp * 1000;
        return token;
      }

      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      return refreshAccessToken(token);
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
