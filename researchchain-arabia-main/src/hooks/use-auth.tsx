import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export type AppRole = "researcher" | "participant" | "admin";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  nationality: string | null;
  age: number | null;
  gender: string | null;
  wallet_balance: number;
  trust_score: number;
  account_status: string;
  verification_status: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (u: User | null) => {
    if (!u) {
      setProfile(null);
      setRole(null);
      return;
    }
    const [{ data: prof }, { data: roleRow }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", u.id).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", u.id).maybeSingle(),
    ]);
    setProfile(prof as Profile | null);
    setRole((roleRow?.role as AppRole) ?? null);
  };

  useEffect(() => {
    // Set listener BEFORE getSession
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      // Defer DB calls
      setTimeout(() => { loadProfile(s?.user ?? null); }, 0);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      loadProfile(data.session?.user ?? null).finally(() => setLoading(false));
    });

    return () => subscription.unsubscribe();
  }, []);

  const refresh = async () => {
    await loadProfile(user);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null); setUser(null); setProfile(null); setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, role, loading, refresh, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
