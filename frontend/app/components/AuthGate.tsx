'use client';

import { useAuth } from '@/app/lib/AuthContext';
import AuthScreen from './AuthScreen';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-bg">
        <span className="text-sm text-neutral-600">Carregando...</span>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return <>{children}</>;
}
