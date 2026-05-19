import { createFileRoute } from "@tanstack/react-router";
import { AdminConsole } from "@/components/admin/AdminConsole";

export const Route = createFileRoute("/_authenticated/admin/studies")({
  component: AdminStudies,
  head: () => ({ meta: [{ title: "Admin Studies — ResearchChain Arabia" }] }),
});

function AdminStudies() {
  return <AdminConsole section="studies" />;
}
