import { createFileRoute } from "@tanstack/react-router";
import { AdminConsole } from "@/components/admin/AdminConsole";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
  head: () => ({ meta: [{ title: "Admin Dashboard — ResearchChain Arabia" }] }),
});

function AdminOverview() {
  return <AdminConsole section="overview" />;
}
