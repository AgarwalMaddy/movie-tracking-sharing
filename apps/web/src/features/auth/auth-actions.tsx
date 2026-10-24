import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { api, bustCache, setToken } from '@/lib/api';
import { safeNext } from '@/lib/next-path';

import { useAuth } from './auth-context';

export function AuthExtras({ next }: { next: string }) {
  const { refresh } = useAuth();
  const nav = useNavigate();
  const [google, setGoogle] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const dest = safeNext(next);

  useEffect(() => {
    void api<{ google: boolean }>('/auth/providers')
      .then((d) => setGoogle(d.google))
      .catch(() => undefined);
  }, []);

  async function demo() {
    setBusy(true);
    setError('');

    try {
      const data = await api<{ accessToken: string }>('/auth/demo', {
        method: 'POST',
      });

      setToken(data.accessToken);
      bustCache();
      await refresh();
      void nav(dest);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo login failed');
      setBusy(false);
    }
  }

  return (
    <div className="auth-extras">
      <button
        className="btn ghost"
        type="button"
        disabled={busy}
        onClick={() => void demo()}
      >
        Try the demo
      </button>
      {google ? (
        <a
          className="btn ghost"
          href={`/api/auth/google?next=${encodeURIComponent(dest)}`}
        >
          Continue with Google
        </a>
      ) : null}
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}
