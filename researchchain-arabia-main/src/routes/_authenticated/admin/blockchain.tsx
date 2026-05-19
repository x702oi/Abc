import { createFileRoute } from "@tanstack/react-router";
import { AdminConsole } from "@/components/admin/AdminConsole";

export const Route = createFileRoute("/_authenticated/admin/blockchain")({
  component: AdminBlockchain,
  head: () => ({ meta: [{ title: "Admin Blockchain — ResearchChain Arabia" }] }),
});

function AdminBlockchain() {
  return <AdminConsole section="blockchain" />;
}
