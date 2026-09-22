import { NextAuthOptions, getServerSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { NextResponse } from 'next/server'

export const ADMIN_EMAILS = [
  (process.env.ADMIN_EMAIL || 'leidysabata@gmail.com').toLowerCase(),
  'jannpierre00@gmail.com',
  'jannpierre00@gmail.con',
];

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),

    // Credentials para Administrador y Clientes
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
        name: { label: 'Nombre', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.toLowerCase().trim();
        const adminPassword = process.env.ADMIN_PASSWORD || 'LeidySabata2024*';

        // 1. Verificación si es Administrador
        if (isAdminEmail(email)) {
          if (credentials.password === adminPassword) {
            const displayName = email.includes('leidy') ? 'Leidy Sabata (Admin)' : 'Jann Pierre (Admin)';
            return {
              id: `admin-${email.split('@')[0]}`,
              email,
              name: displayName,
              role: 'admin',
            };
          }
          return null;
        }

        // 2. Verificación si es Cliente de la tienda
        if (credentials.password.length >= 4) {
          return {
            id: `cust-${email.replace(/[^a-zA-Z0-9]/g, '')}`,
            email,
            name: credentials.name || email.split('@')[0],
            role: 'customer',
          };
        }

        return null;
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 horas
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  callbacks: {
    async signIn({ user, account }) {
      // Permite acceso a todos los usuarios autenticados válidos (Google o Credenciales)
      return true;
    },

    async jwt({ token, user, account }) {
      const email = user?.email || (token.email as string);
      const isAdmin = isAdminEmail(email) || (user as any)?.role === 'admin';
      token.role = isAdmin ? 'admin' : 'customer';
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        const email = session.user.email || (token.email as string);
        const isAdmin = token.role === 'admin' || isAdminEmail(email);
        (session.user as any).role = isAdmin ? 'admin' : 'customer';
        (session.user as any).provider = token.provider;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === 'production',
};

/**
 * Verifica que el request proviene de una sesión de administrador autorizada.
 * Retorna null si la sesión es válida, o un NextResponse 401/403 si no lo es.
 */
export async function requireAdminSession(): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { error: 'No autorizado. Inicia sesión.' },
      { status: 401 }
    );
  }

  const userRole = (session.user as { role?: string })?.role;
  const userEmail = session.user?.email;

  if (userRole !== 'admin' && !isAdminEmail(userEmail)) {
    return NextResponse.json(
      { error: 'Acceso denegado. Se requieren permisos de administrador.' },
      { status: 403 }
    );
  }

  return null;
}
