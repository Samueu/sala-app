'use client';

import { useState } from 'react';
import { useAuth } from '@/app/lib/AuthContext';

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'registro'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);

    const result = mode === 'login' ? await signIn(email, password) : await signUp(email, password);

    if (result.error) {
      setError(result.error);
    } else if (result.needsEmailConfirmation) {
      setInfo('Cadastro feito! Confira seu e-mail pra confirmar a conta antes de entrar.');
    }

    setSubmitting(false);
  };

  const toggleMode = () => {
    setMode((m) => (m === 'login' ? 'registro' : 'login'));
    setError(null);
    setInfo(null);
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-bg">
      <div className="w-full max-w-sm p-8 rounded-md bg-surface ring-1 ring-inset ring-neutral-800">
        <h1 className="font-heading text-lg font-500 text-neutral-100">
          {mode === 'login' ? 'Entrar' : 'Criar conta'}
        </h1>
        <p className="mt-1 text-xs text-neutral-600">
          {mode === 'login' ? 'Entre com seu e-mail e senha.' : 'Crie uma conta com e-mail e senha.'}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs text-neutral-600" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 px-3 rounded-md bg-neutral-900 text-sm text-neutral-200 ring-1 ring-inset ring-neutral-800 focus:outline-none focus:ring-accent-400"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-neutral-600" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 px-3 rounded-md bg-neutral-900 text-sm text-neutral-200 ring-1 ring-inset ring-neutral-800 focus:outline-none focus:ring-accent-400"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}
          {info && <p className="text-xs text-accent-300">{info}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="h-10 rounded-md bg-accent-800 text-accent-200 text-sm font-500 hover:bg-accent-700 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <button
          type="button"
          onClick={toggleMode}
          className="mt-4 text-xs text-neutral-600 hover:text-neutral-400 transition-colors"
        >
          {mode === 'login' ? 'Não tem conta? Criar uma' : 'Já tem conta? Entrar'}
        </button>
      </div>
    </div>
  );
}
