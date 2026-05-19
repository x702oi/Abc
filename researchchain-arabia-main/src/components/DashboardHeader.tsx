import { Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function DashboardHeader({ title }: { title: string }) {
  const { signOut, profile, role } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-40 glass border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Logo />
          <Badge variant="outline" className="hidden md:flex">{title}</Badge>
        </div>
        <div className="flex items-center gap-3">
          {profile && (
            <div className="hidden md:block text-right text-xs">
              <div className="font-medium">{profile.full_name || profile.email}</div>
              <div className="text-muted-foreground capitalize">{role}</div>
            </div>
          )}
          <Button variant="ghost" size="icon"><Bell className="w-4 h-4" /></Button>
          <Button variant="ghost" size="sm" asChild><Link to="/">Home</Link></Button>
          <Button variant="ghost" size="icon" onClick={() => signOut().then(() => navigate({ to: "/" }))}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
