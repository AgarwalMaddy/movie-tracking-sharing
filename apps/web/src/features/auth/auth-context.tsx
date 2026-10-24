import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { api, setToken, type User } from '@/lib/api';

type Auth = {
  user: User | null;
  ready: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<Auth>({
  user: null,
  ready: false,
  refresh: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const data = await api<{ user: User }>('/auth/me');

      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  const logout = useCallback(async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => undefined);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <Ctx.Provider value={{ user, ready, refresh, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  return useContext(Ctx);
}
