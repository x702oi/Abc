import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
  head: () => ({ meta: [{ title: "Pricing — ResearchChain Arabia" }, { name: "description", content: "Simple, scalable pricing for researchers and institutions." }] }),
});

const tiers = [
  { n: "Participant", p: "Free", d: "Forever", feats: ["Browse all open studies", "On-chain consent records", "Instant wallet payouts", "Trust score tracking"], cta: "Sign up free", primary: false },
  { n: "Researcher", p: "299", d: "SAR / month", feats: ["Up to 10 active studies", "AI study generator", "1,000 participants/month", "Live analytics", "Data export"], cta: "Start free trial", primary: true },
  { n: "Institution", p: "Custom", d: "Annual", feats: ["Unlimited studies", "Unlimited participants", "Multi-team workspaces", "Dedicated support", "Custom integrations"], cta: "Contact sales", primary: false },
];

function PricingPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <Badge variant="outline" className="mb-4">Pricing</Badge>
          <h1 className="text-4xl md:text-6xl font-bold">Built to <span className="gradient-text">scale with you</span></h1>
          <p className="mt-6 text-lg text-muted-foreground">From individual research to nation-scale studies.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto">
          {tiers.map((t) => (
            <div key={t.n} className={`glass rounded-2xl p-8 relative ${t.primary ? "border-primary/60 animate-pulse-glow" : ""}`}>
              {t.primary && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-gold border-0">Most popular</Badge>}
              <h3 className="text-xl font-bold">{t.n}</h3>
              <div className="mt-4">
                <span className="text-5xl font-bold gradient-text">{t.p}</span>
                {t.p !== "Free" && t.p !== "Custom" && <span className="text-muted-foreground"> SAR</span>}
              </div>
              <div className="text-sm text-muted-foreground">{t.d}</div>
              <ul className="mt-6 space-y-3">
                {t.feats.map((f) => (
                  <li key={f} className="flex gap-2 text-sm"><Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />{f}</li>
                ))}
              </ul>
              <Button asChild className={`w-full mt-8 ${t.primary ? "bg-gradient-to-r from-primary to-primary/70" : ""}`} variant={t.primary ? "default" : "outline"}>
                <Link to={t.n === "Institution" ? "/contact" : "/signup"}>{t.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
