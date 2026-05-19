import { createFileRoute } from "@tanstack/react-router";
import { AdminConsole } from "@/components/admin/AdminConsole";

export const Route = createFileRoute("/_authenticated/admin/notifications")({
  component: AdminNotifications,
  head: () => ({ meta: [{ title: "Admin Notifications — ResearchChain Arabia" }] }),
});

function AdminNotifications() {
  return <AdminConsole section="notifications" />;
}
