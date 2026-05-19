import { createFileRoute } from "@tanstack/react-router";
import { AdminConsole } from "@/components/admin/AdminConsole";

export const Route = createFileRoute("/_authenticated/admin/fraud")({
  component: AdminFraud,
  head: () => ({ meta: [{ title: "Admin Fraud — ResearchChain Arabia" }] }),
});

function AdminFraud() {
  return <AdminConsole section="fraud" />;
}
