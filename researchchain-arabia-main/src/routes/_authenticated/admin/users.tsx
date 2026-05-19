import { createFileRoute } from "@tanstack/react-router";
import { AdminConsole } from "@/components/admin/AdminConsole";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: AdminUsers,
  head: () => ({ meta: [{ title: "Admin Users — ResearchChain Arabia" }] }),
});

function AdminUsers() {
  return <AdminConsole section="users" />;
}
