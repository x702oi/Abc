import { createFileRoute } from "@tanstack/react-router";
import { AdminConsole } from "@/components/admin/AdminConsole";

export const Route = createFileRoute("/_authenticated/admin/payments")({
  component: AdminPayments,
  head: () => ({ meta: [{ title: "Admin Payments — ResearchChain Arabia" }] }),
});

function AdminPayments() {
  return <AdminConsole section="payments" />;
}
