import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminRouteLayout,
});

function AdminRouteLayout() {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || role !== "admin")) {
      navigate({ to: "/login" });
    }
  }, [loading, navigate, role, user]);

  if (loading) return <div className="min-h-screen grid place-items-center text-emerald-100/70">Loading admin console…</div>;
  if (!user || role !== "admin") return null;

  return (
    <AdminLayout title="Admin Dashboard">
      <Outlet />
    </AdminLayout>
  );
}
