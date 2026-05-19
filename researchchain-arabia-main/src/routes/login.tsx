import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { ADMIN_LOGIN_EMAIL, ADMIN_LOGIN_USERNAME } from "@/lib/admin.constants";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Login — ResearchChain Arabia" }] }),
});

function LoginPage() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user && role) {
      navigate({ to: role === "admin" ? "/admin" : role === "researcher" ? "/researcher" : "/participant" });
    }
  }, [loading, user, role, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const loginEmail = email.trim().toLowerCase() === ADMIN_LOGIN_USERNAME.toLowerCase() ? ADMIN_LOGIN_EMAIL : email.trim();
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) toast.error("Google sign-in failed");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md glass rounded-2xl p-8">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-muted-foreground text-sm mt-1">Log in to your ResearchChain account.</p>
          <form onSubmit={submit} className="space-y-4 mt-6">
            <div><Label>Email or admin username</Label><Input type="text" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Admin1 or your email" /></div>
            <div>
              <div className="flex justify-between"><Label>Password</Label><Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot?</Link></div>
              <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" disabled={busy} className="w-full bg-gradient-to-r from-primary to-primary/70">{busy ? "…" : "Sign in"}</Button>
          </form>
          <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground"><div className="flex-1 h-px bg-border" />OR<div className="flex-1 h-px bg-border" /></div>
          <Button variant="outline" onClick={google} className="w-full">Continue with Google</Button>
          <p className="text-sm text-center mt-6 text-muted-foreground">No account? <Link to="/signup" className="text-primary hover:underline">Sign up</Link></p>
          <p className="text-xs text-center mt-2 text-muted-foreground">Admin access uses username <span className="font-medium text-foreground">Admin1</span>.</p>
        </div>
      </div>
    </div>
  );
}
