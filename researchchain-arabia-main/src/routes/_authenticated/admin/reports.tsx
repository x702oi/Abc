import { createFileRoute } from "@tanstack/react-router";
import { AdminConsole } from "@/components/admin/AdminConsole";

export const Route = createFileRoute("/_authenticated/admin/reports")({
  component: AdminReports,
  head: () => ({ meta: [{ title: "Admin Reports — ResearchChain Arabia" }] }),
});

function AdminReports() {
  return <AdminConsole section="reports" />;
}
