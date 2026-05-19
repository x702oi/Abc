import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  component: ResetPassword,
  head: () => ({ meta: [{ title: "Set new password — ResearchChain Arabia" }] }),
});

function ResetPassword() {
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated. Please log in.");
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 flex items-center justify-center p-4">
        <form onSubmit={submit} className="w-full max-w-md glass rounded-2xl p-8 space-y-4">
          <h1 className="text-2xl font-bold">Set a new password</h1>
          <div><Label>New password</Label><Input type="password" minLength={6} required value={pw} onChange={(e) => setPw(e.target.value)} /></div>
          <Button type="submit" disabled={busy} className="w-full bg-gradient-to-r from-primary to-primary/70">{busy ? "…" : "Update password"}</Button>
        </form>
      </div>
    </div>
  );
}
