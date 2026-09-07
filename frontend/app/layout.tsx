import type { Metadata } from 'next';
import { AppProvider } from '@/app/lib/context';
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
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
