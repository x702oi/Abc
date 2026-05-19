import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge } from "@/components/ui/badge";
import { Brain, Shield, Zap, BarChart3, Award, Database, Users, Coins, FileCheck, Network, Bot, Lock } from "lucide-react";

export const Route = createFileRoute("/features")({
  component: FeaturesPage,
  head: () => ({
    meta: [
      { title: "Features — ResearchChain Arabia" },
      { name: "description", content: "AI matching, on-chain consent, smart-contract rewards, live analytics — explore every capability of ResearchChain Arabia." },
    ],
  }),
});

const features = [
  { i: Brain, t: "AI Participant Matching", d: "Gemini-powered models surface the best-fit participants for your study in real time." },
  { i: Shield, t: "On-Chain Consent Ledger", d: "Every consent is SHA-256 hashed, timestamped, and stored as an immutable record." },
  { i: Zap, t: "Smart-Contract Payouts", d: "Approved participants receive rewards instantly with a verifiable transaction hash." },
  { i: BarChart3, t: "Real-Time Analytics", d: "Live charts on recruitment, demographics, completion rates, and fraud signals." },
  { i: Award, t: "Trust Scoring", d: "Participants build a portable, on-chain reputation that follows them across studies." },
  { i: Database, t: "Secure Data Vault", d: "End-to-end encrypted study artifacts with role-based access." },
  { i: Users, t: "Verified Participant Pool", d: "Identity-verified participants across nationality, age, and demographic filters." },
  { i: Coins, t: "Saudi Wallet Integration", d: "Wallet balance in SAR with simulated smart-contract settlement." },
  { i: FileCheck, t: "Compliance-Ready Exports", d: "Download research data with full consent provenance for IRB and ethics review." },
  { i: Network, t: "Multi-Institution Support", d: "Built for KSU, KAUST, KFUPM, MOH, and beyond — share studies across institutions." },
  { i: Bot, t: "AI Study Generator", d: "Describe your topic and let AI draft your study title, description, demographics, and reward." },
  { i: Lock, t: "Privacy by Default", d: "Participants choose what to share. Researchers see only what they need." },
];

function FeaturesPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <Badge variant="outline" className="mb-4">Features</Badge>
          <h1 className="text-4xl md:text-6xl font-bold">A complete <span className="gradient-text">research stack</span></h1>
          <p className="mt-6 text-lg text-muted-foreground">Twelve flagship capabilities — one platform.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-6xl mx-auto">
          {features.map((f) => (
            <div key={f.t} className="glass rounded-xl p-6 hover:border-primary/60 transition group">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/30 to-gold/20 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <f.i className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">{f.t}</h3>
              <p className="text-sm text-muted-foreground mt-2">{f.d}</p>
            </div>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
