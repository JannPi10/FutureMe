import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import NextAuthSessionProvider from '@/components/admin/SessionProvider';
import AdminShell from '@/components/admin/AdminShell';
import { Toaster } from 'react-hot-toast';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <NextAuthSessionProvider>
      <AdminShell session={session}>
        {children}
      </AdminShell>
      <Toaster position="top-right" />
    </NextAuthSessionProvider>
  );
}

