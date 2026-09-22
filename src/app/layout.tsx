import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: {
    default: 'FutureMe by Leidy Sabata',
    template: '%s | FutureMe by Leidy Sabata',
  },
  description: 'Ropa cómoda, moderna y versátil para mujer, hombre e infantil. FutureMe by Leidy Sabata.',
  keywords: ['ropa', 'moda', 'mujer', 'hombre', 'infantil', 'accesorios', 'Colombia', 'FutureMe'],
  openGraph: {
    title: 'FutureMe by Leidy Sabata',
    description: 'Ropa cómoda, moderna y versátil para toda la familia.',
    type: 'website',
    locale: 'es_CO',
  },
}

import NextAuthSessionProvider from '@/components/admin/SessionProvider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <NextAuthSessionProvider>
          {children}
        </NextAuthSessionProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#171516',
              color: '#FFF9F7',
              fontSize: '14px',
              fontFamily: 'DM Sans, system-ui, sans-serif',
              borderRadius: '2px',
            },
            success: {
              iconTheme: {
                primary: '#E8B7C8',
                secondary: '#171516',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
