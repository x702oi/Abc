import { createFileRoute } from "@tanstack/react-router";
import { AdminConsole } from "@/components/admin/AdminConsole";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  component: AdminAnalytics,
  head: () => ({ meta: [{ title: "Admin Analytics — ResearchChain Arabia" }] }),
});

function AdminAnalytics() {
  return <AdminConsole section="analytics" />;
}
