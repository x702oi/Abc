import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FounderCard } from "@/components/FounderCard";
import { Badge } from "@/components/ui/badge";
import { Target, Eye, Heart } from "lucide-react";

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About — ResearchChain Arabia" },
      { name: "description", content: "Our mission: build the trust infrastructure for the future of research and ethical data ownership in Saudi Arabia." },
    ],
  }),
});

function AboutPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="container mx-auto px-4 py-20 max-w-5xl">
        <Badge variant="outline" className="mb-4">About Us</Badge>
        <h1 className="text-4xl md:text-6xl font-bold">Reimagining research, <span className="gradient-text">block by block</span>.</h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-3xl">
          ResearchChain Arabia is a Saudi-built, Vision 2030-aligned platform that unifies the entire research lifecycle —
          recruitment, consent, payments, and analytics — on a single blockchain-backed infrastructure.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {[
            { i: Target, t: "Mission", d: "Build the trust layer for research and ethical data ownership in the Kingdom." },
            { i: Eye, t: "Vision", d: "A nation where every research insight is auditable, every participant is empowered, and every reward is earned transparently." },
            { i: Heart, t: "Values", d: "Trust by design. Saudi-first. AI-native. Participant-empowered." },
          ].map((v) => (
            <div key={v.t} className="glass rounded-xl p-6">
              <v.i className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold text-lg">{v.t}</h3>
              <p className="text-sm text-muted-foreground mt-2">{v.d}</p>
            </div>
          ))}
        </div>

        <h2 className="text-3xl font-bold mt-20 mb-8">Founding Team</h2>
        <FounderCard />
      </section>
      <SiteFooter />
    </div>
  );
}
