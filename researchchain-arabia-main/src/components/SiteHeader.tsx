import { Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { LayoutDashboard, LogOut, Globe } from "lucide-react";
import { useState } from "react";

export function SiteHeader() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [lang, setLang] = useState<"en" | "ar">("en");

  const dashHref = role === "admin" ? "/admin" : role === "researcher" ? "/researcher" : "/participant";

  return (
    <header className="sticky top-0 z-50 glass border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link to="/" className="hover:text-primary transition" activeOptions={{ exact: true }} activeProps={{ className: "text-primary" }}>Home</Link>
          <Link to="/about" className="hover:text-primary transition" activeProps={{ className: "text-primary" }}>About</Link>
          <Link to="/features" className="hover:text-primary transition" activeProps={{ className: "text-primary" }}>Features</Link>
          <Link to="/pricing" className="hover:text-primary transition" activeProps={{ className: "text-primary" }}>Pricing</Link>
          <Link to="/contact" className="hover:text-primary transition" activeProps={{ className: "text-primary" }}>Contact</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => {
            const next = lang === "en" ? "ar" : "en";
            setLang(next);
            document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
            document.documentElement.lang = next;
          }}>
            <Globe className="w-4 h-4" />
            {lang === "en" ? "AR" : "EN"}
          </Button>
          {user ? (
            <>
              <Button variant="outline" size="sm" onClick={() => navigate({ to: dashHref })}>
                <LayoutDashboard className="w-4 h-4" />Dashboard
              </Button>
              <Button variant="ghost" size="sm" onClick={() => signOut().then(() => navigate({ to: "/" }))}>
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/login" })}>Login</Button>
              <Button size="sm" onClick={() => navigate({ to: "/signup" })} className="bg-gradient-to-r from-primary to-primary/70">Get Started</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
