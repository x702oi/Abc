import { createFileRoute } from "@tanstack/react-router";
import { AdminConsole } from "@/components/admin/AdminConsole";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: AdminSettings,
  head: () => ({ meta: [{ title: "Admin Settings — ResearchChain Arabia" }] }),
});

function AdminSettings() {
  return <AdminConsole section="settings" />;
}
