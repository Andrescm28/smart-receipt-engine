import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

export type AppRole = 'admin' | 'inventory' | 'accountant' | 'cashier';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  roles: AppRole[];
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  role: null,
  roles: [],
  loading: true,
  signOut: async () => {},
});

// Priority for primary role selection (higher index = lower priority)
const ROLE_PRIORITY: AppRole[] = ['admin', 'accountant', 'inventory', 'cashier'];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        setTimeout(() => fetchRole(newSession.user.id), 0);
      } else {
        setRole(null);
        setRoles([]);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRole(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const fetchRole = async (userId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    const list = (data ?? []).map((r: any) => r.role as AppRole);
    setRoles(list);
    const primary = ROLE_PRIORITY.find((r) => list.includes(r)) ?? 'cashier';
    setRole(primary);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null);
    setRoles([]);
  };

  return (
    <AuthContext.Provider value={{ user, session, role, roles, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
