import type { Metadata } from 'next';
import { AppProvider } from '@/app/lib/context';
import { AuthProvider } from '@/app/lib/AuthContext';
import AuthGate from '@/app/components/AuthGate';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sala',
  description: 'A Discord-like chat application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <AuthGate>
            <AppProvider>{children}</AppProvider>
          </AuthGate>
        </AuthProvider>
      </body>
    </html>
  );
}
