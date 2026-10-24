import { type FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';

import { api, bustCache, setToken } from '@/lib/api';
import { fieldString } from '@/lib/form';
import { safeNext, withNext } from '@/lib/next-path';

import { AuthExtras } from './auth-actions';
import { useAuth } from './auth-context';

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const { refresh, user, ready } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const fd = new FormData(e.currentTarget);

    try {
      if (mode === 'signup') {
        const data = await api<{ accessToken?: string }>('/auth/signup', {
          method: 'POST',
          body: JSON.stringify({
            name: fd.get('name'),
            email: fd.get('email'),
            password: fd.get('password'),
            username: fieldString(fd, 'username').toLowerCase(),
          }),
        });

        if (data.accessToken) {
          setToken(data.accessToken);
        }

        bustCache();
        await refresh();
        void nav(next);
      } else {
        const data = await api<{ accessToken: string }>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: fd.get('email'),
            password: fd.get('password'),
          }),
        });

        setToken(data.accessToken);
        bustCache();
        await refresh();
        void nav(next);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
  }

  if (!ready) {
    return <main className="auth-wrap">Loading…</main>;
  }

  if (user) {
    return <Navigate to={next} replace />;
  }

  return (
    <main className="auth-wrap">
      <h1>{mode === 'signup' ? 'Join Reelwright' : 'Welcome back'}</h1>
      <form onSubmit={onSubmit} style={{ marginTop: 24 }}>
        {mode === 'signup' ? (
          <>
            <label className="field">
              Name
              <input name="name" required />
            </label>
            <label className="field">
              Username
              <input
                name="username"
                required
                minLength={3}
                pattern="[a-zA-Z0-9_]+"
              />
            </label>
          </>
        ) : null}
        <label className="field">
          Email
          <input name="email" type="email" required />
        </label>
        <label className="field field-password">
          Password
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            minLength={8}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </label>
        {error || params.get('error') === 'google' ? (
          <p className="error">{error || 'Google sign-in failed'}</p>
        ) : null}
        <button className="btn" type="submit">
          {mode === 'signup' ? 'Create account' : 'Sign in'}
        </button>
        <p className="muted" style={{ marginTop: 12 }}>
          {mode === 'signup' ? (
            <Link to={withNext('/login', next)}>Already have an account</Link>
          ) : (
            <Link to={withNext('/signup', next)}>Create one</Link>
          )}
        </p>
      </form>
      <AuthExtras next={next} />
    </main>
  );
}
