import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { FlaskConical, UserCheck } from "lucide-react";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
  head: () => ({ meta: [{ title: "Sign up — ResearchChain Arabia" }] }),
});

function SignupPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<"researcher" | "participant">("participant");
  const [form, setForm] = useState({ full_name: "", email: "", password: "", nationality: "Saudi", age: "", gender: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: form.full_name, role, nationality: form.nationality, age: form.age, gender: form.gender },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Account created — check your email to verify!");
    navigate({ to: "/login" });
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) toast.error("Google sign-in failed");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 flex items-center justify-center p-4 py-10">
        <div className="w-full max-w-2xl glass rounded-2xl p-8">
          <h1 className="text-2xl font-bold">Join ResearchChain Arabia</h1>
          <p className="text-muted-foreground text-sm mt-1">Choose your role to get started.</p>

          <div className="grid grid-cols-2 gap-3 mt-6">
            {[
              { v: "participant", i: UserCheck, t: "Participant", d: "Join studies, earn rewards" },
              { v: "researcher", i: FlaskConical, t: "Researcher", d: "Publish studies, recruit" },
            ].map((r) => (
              <button key={r.v} type="button" onClick={() => setRole(r.v as typeof role)}
                className={`p-4 rounded-xl border text-left transition ${role === r.v ? "border-primary bg-primary/10 glow" : "border-border hover:border-primary/40"}`}>
                <r.i className={`w-6 h-6 mb-2 ${role === r.v ? "text-primary" : "text-muted-foreground"}`} />
                <div className="font-semibold">{r.t}</div>
                <div className="text-xs text-muted-foreground">{r.d}</div>
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-3 mt-6">
            <div><Label>Full name</Label><Input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Email</Label><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div><Label>Password</Label><Input type="password" minLength={6} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Nationality</Label><Input value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} /></div>
              <div><Label>Age</Label><Input type="number" min={18} value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} /></div>
              <div>
                <Label>Gender</Label>
                <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" disabled={busy} className="w-full bg-gradient-to-r from-primary to-primary/70">{busy ? "Creating…" : "Create account"}</Button>
          </form>
          <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground"><div className="flex-1 h-px bg-border" />OR<div className="flex-1 h-px bg-border" /></div>
          <Button variant="outline" onClick={google} className="w-full">Continue with Google</Button>
          <p className="text-sm text-center mt-6 text-muted-foreground">Already have an account? <Link to="/login" className="text-primary hover:underline">Log in</Link></p>
        </div>
      </div>
    </div>
  );
}
