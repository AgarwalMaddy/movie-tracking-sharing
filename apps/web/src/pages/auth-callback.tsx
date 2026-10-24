import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useAuth } from '@/features/auth';
import { bustCache, setToken } from '@/lib/api';
import { safeNext } from '@/lib/next-path';

export function AuthCallbackPage() {
  const { refresh } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const token = params.get('accessToken');
    const next = safeNext(params.get('next') ?? '/discover');

    if (!token) {
      void nav('/login?error=google', { replace: true });

      return;
    }

    setToken(token);
    bustCache();
    void refresh().then(() => nav(next, { replace: true }));
  }, [nav, params, refresh]);

  return <p className="muted">Signing you in…</p>;
}
