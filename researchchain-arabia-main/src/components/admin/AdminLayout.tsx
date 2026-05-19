import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ADMIN_LOGIN_EMAIL } from "@/lib/admin.constants";
import { Bell, LogOut, Shield, Sparkles, Users, FlaskConical, Wallet, Landmark, ShieldAlert, BarChart3, FileText, Settings, Headphones, DatabaseZap } from "lucide-react";

const nav = [
  { to: "/admin", label: "Dashboard", icon: BarChart3 },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/studies", label: "Studies", icon: FlaskConical },
  { to: "/admin/payments", label: "Payments", icon: Wallet },
  { to: "/admin/blockchain", label: "Blockchain", icon: Landmark },
  { to: "/admin/fraud", label: "Fraud Detection", icon: ShieldAlert },
  { to: "/admin/analytics", label: "Analytics", icon: Sparkles },
  { to: "/admin/reports", label: "Reports", icon: FileText },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/settings", label: "Settings", icon: Settings },
  { to: "/admin/support", label: "Support Center", icon: Headphones },
];

export function AdminLayout({ title, children }: { title: string; children: ReactNode }) {
  const { user, profile, role, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || role !== "admin") {
      navigate({ to: "/login" });
    }
  }, [navigate, role, user]);

  if (!user || role !== "admin") {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading admin access…</div>;
  }

  return (
    <div className="min-h-screen bg-[#07120f] text-foreground">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.15),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.08),transparent_30%)] pointer-events-none" />
      <div className="relative z-10 grid lg:grid-cols-[280px_1fr] min-h-screen">
        <aside className="border-r border-white/10 bg-black/30 backdrop-blur-xl p-5 flex flex-col gap-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.25)]">
              <Shield className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="font-semibold text-lg leading-tight">ResearchChain Arabia</div>
              <div className="text-xs text-emerald-300/80">Admin Command Center</div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Signed in as</div>
            <div className="mt-2 font-semibold">{profile?.full_name ?? "Admin1"}</div>
            <div className="text-xs text-muted-foreground">{profile?.email ?? ADMIN_LOGIN_EMAIL}</div>
            <Badge className="mt-3 bg-emerald-500/20 text-emerald-200 border-emerald-400/20">Superuser</Badge>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
            {nav.map((item) => (
              <Button
                key={item.to}
                variant="ghost"
                asChild
                className={cn("w-full justify-start gap-3 h-11 text-left text-white/80 hover:text-white hover:bg-white/8")}
              >
                <Link to={item.to} activeProps={{ className: "bg-emerald-500/15 text-emerald-100 border border-emerald-400/20" }} className="rounded-xl px-3">
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              </Button>
            ))}
          </nav>

          <div className="rounded-2xl border border-emerald-400/15 bg-emerald-500/10 p-4 text-sm text-emerald-50/90">
            Live platform status: <span className="font-semibold text-emerald-200">Operational</span>
          </div>
        </aside>

        <main className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-[#07120f]/85 backdrop-blur-xl">
            <div className="flex items-center justify-between px-6 lg:px-8 h-20">
              <div>
                <div className="text-xs uppercase tracking-[0.32em] text-emerald-300/80">Executive Control</div>
                <h1 className="text-xl md:text-2xl font-semibold">{title}</h1>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-white/10 text-white border border-white/10 hidden md:flex">Realtime Sync</Badge>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={() => navigate({ to: "/" })}>Home</Button>
                <Button variant="outline" size="sm" className="border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => signOut().then(() => navigate({ to: "/login" }))}>
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </Button>
              </div>
            </div>
          </header>
          <div className="px-4 md:px-6 lg:px-8 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
