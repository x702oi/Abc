import { createFileRoute } from "@tanstack/react-router";
import { AdminConsole } from "@/components/admin/AdminConsole";

export const Route = createFileRoute("/_authenticated/admin/support")({
  component: AdminSupport,
  head: () => ({ meta: [{ title: "Admin Support — ResearchChain Arabia" }] }),
});

function AdminSupport() {
  return <AdminConsole section="support" />;
}
