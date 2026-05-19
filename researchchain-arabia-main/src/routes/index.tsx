import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FounderCard } from "@/components/FounderCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield, Sparkles, Brain, Lock, Zap, Coins, Users, BarChart3, CheckCircle2,
  ArrowRight, Globe2, Database, Network, Award,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "ResearchChain Arabia — Saudi Vision 2030 Research Platform" },
      { name: "description", content: "Connect researchers with verified participants. Blockchain consent, AI matching, secure on-chain rewards. Built for Saudi Vision 2030." },
    ],
  }),
});

function HomePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-gold/5" />
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="container mx-auto px-4 py-24 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-gradient-to-r from-primary/20 to-gold/20 border-primary/30 text-primary-foreground">
              <Sparkles className="w-3 h-3 mr-1" /> Aligned with Saudi Vision 2030
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
              The Trust Layer for<br />
              <span className="gradient-text">Research in Arabia</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              A blockchain &amp; AI ecosystem connecting researchers with verified participants.
              On-chain consent, smart-contract rewards, and ethical data ownership — by design.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="bg-gradient-to-r from-primary to-primary/70 glow text-base h-12 px-8">
                <Link to="/signup">Start Building Trust <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base h-12 px-8 border-gold/50 hover:bg-gold/10">
                <Link to="/features">Explore the Platform</Link>
              </Button>
            </div>
            <div className="mt-16 grid grid-cols-3 max-w-2xl mx-auto gap-8">
              {[
                { v: "10K+", l: "Verified Participants" },
                { v: "100%", l: "On-Chain Consent" },
                { v: "AI", l: "Powered Matching" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-3xl md:text-4xl font-bold gradient-text">{s.v}</div>
                  <div className="text-xs md:text-sm text-muted-foreground mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="outline" className="mb-4">The Problem</Badge>
          <h2 className="text-3xl md:text-5xl font-bold">Research is broken.<br />Trust is missing.</h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Researchers struggle to find verified participants. Participants don't trust where their data goes.
            Consent is paper-based, payments are slow, and there's zero accountability. The Kingdom deserves better.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-5xl mx-auto">
          {[
            { i: Users, t: "Fragmented sourcing", d: "Researchers spend months finding qualified, diverse participants for their studies." },
            { i: Lock, t: "Broken consent", d: "Paper forms get lost. No immutable record of who agreed to what — or when." },
            { i: Coins, t: "Friction in rewards", d: "Manual bank transfers, weeks of delays, opaque tracking. Participants drop off." },
          ].map((p) => (
            <div key={p.t} className="glass rounded-xl p-6 hover:border-destructive/40 transition">
              <p.i className="w-8 h-8 text-destructive mb-3" />
              <h3 className="font-semibold text-lg">{p.t}</h3>
              <p className="text-sm text-muted-foreground mt-2">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Solution */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div>
            <Badge className="mb-4 bg-primary/20 text-primary-foreground border-primary/40">The Solution</Badge>
            <h2 className="text-3xl md:text-5xl font-bold leading-tight">
              A national-scale<br />
              <span className="gradient-text">research infrastructure</span>
            </h2>
            <p className="mt-6 text-muted-foreground">
              ResearchChain Arabia unifies recruitment, consent, payments, and analytics on a single
              blockchain-backed platform — purpose-built for the Kingdom's research and innovation agenda.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "AI-matched participant pools across the Kingdom",
                "Immutable on-chain consent — verifiable forever",
                "Smart-contract reward payouts in seconds",
                "Real-time research analytics & data export",
              ].map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="glass rounded-2xl p-8 animate-pulse-glow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                  <Network className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="font-semibold">Consent Ledger</div>
                  <div className="text-xs text-muted-foreground">Block #482,193</div>
                </div>
              </div>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2 bg-background/50 rounded text-muted-foreground">0x7f3a...b91c</div>
                <div className="p-2 bg-background/50 rounded text-muted-foreground">0x9e2d...4f88</div>
                <div className="p-2 bg-primary/10 border border-primary/30 rounded text-primary">0xc4a1...e372 ← latest consent</div>
              </div>
              <div className="mt-4 pt-4 border-t flex justify-between text-xs">
                <span className="text-muted-foreground">Verified</span>
                <span className="text-primary flex items-center gap-1"><Shield className="w-3 h-3" /> SHA-256</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">Features</Badge>
          <h2 className="text-3xl md:text-5xl font-bold">Everything researchers need.<br />Everything participants deserve.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            { i: Brain, t: "AI Matching Engine", d: "Gemini-powered models pair participants with the studies that fit them best." },
            { i: Shield, t: "On-Chain Consent", d: "Every consent is hashed and timestamped — immutable, auditable, and portable." },
            { i: Zap, t: "Smart Payouts", d: "Approved? Rewards land in the participant wallet instantly with a tx hash." },
            { i: BarChart3, t: "Live Analytics", d: "Researcher dashboards with real-time recruitment, demographics, and trust metrics." },
            { i: Award, t: "Trust Score", d: "Participants build a portable reputation across studies and institutions." },
            { i: Database, t: "Secure Data Vault", d: "End-to-end encrypted study data with role-based access controls." },
          ].map((f) => (
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

      {/* How it works */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">How It Works</Badge>
          <h2 className="text-3xl md:text-5xl font-bold">From study to insight, in 4 steps.</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            { n: "01", t: "Publish", d: "Researchers create a study with AI-assisted briefs and target demographics." },
            { n: "02", t: "Match", d: "Our AI engine surfaces the right verified participants in seconds." },
            { n: "03", t: "Consent", d: "Participants approve — and their consent is hashed onto the chain." },
            { n: "04", t: "Reward", d: "Completed work is paid instantly via smart-contract simulation with on-chain proof." },
          ].map((s) => (
            <div key={s.n} className="relative">
              <div className="text-6xl font-bold gradient-text opacity-50">{s.n}</div>
              <h3 className="font-semibold text-lg mt-2">{s.t}</h3>
              <p className="text-sm text-muted-foreground mt-1">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dashboard preview */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">Dashboard Preview</Badge>
          <h2 className="text-3xl md:text-5xl font-bold">Built like the SaaS<br />you actually want to use.</h2>
        </div>
        <div className="max-w-5xl mx-auto glass rounded-2xl p-2 border-2 border-primary/20 animate-pulse-glow">
          <div className="grid md:grid-cols-3 gap-3 p-4">
            {[
              { l: "Active Studies", v: "12", c: "primary" },
              { l: "Total Participants", v: "1,284", c: "gold" },
              { l: "Wallet Balance (SAR)", v: "47,300", c: "primary" },
            ].map((k) => (
              <div key={k.l} className="bg-background/50 rounded-lg p-4">
                <div className="text-xs text-muted-foreground">{k.l}</div>
                <div className={`text-2xl font-bold mt-1 ${k.c === "gold" ? "text-gold" : "gradient-text"}`}>{k.v}</div>
              </div>
            ))}
          </div>
          <div className="bg-background/50 rounded-lg mx-4 mb-4 p-6">
            <div className="flex items-end gap-2 h-32">
              {[40, 65, 50, 80, 70, 95, 75, 90, 60, 85, 100, 80].map((h, i) => (
                <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-primary to-gold/60" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vision 2030 */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto glass rounded-2xl p-12 text-center border-gold/30 gold-glow">
          <Globe2 className="w-12 h-12 text-gold mx-auto mb-4" />
          <Badge className="mb-4 bg-gold/20 text-gold border-gold/40">Vision 2030</Badge>
          <h2 className="text-3xl md:text-4xl font-bold">A Thriving Economy.<br />A Vibrant Society. A Knowledge Kingdom.</h2>
          <p className="mt-6 text-muted-foreground max-w-2xl mx-auto">
            ResearchChain Arabia directly supports the Kingdom's pillars of digital transformation,
            innovation, and ethical data infrastructure — anchored in the goals of Saudi Vision 2030.
          </p>
          <div className="grid md:grid-cols-3 gap-4 mt-8 text-sm">
            <div className="p-4 bg-background/40 rounded-lg">
              <div className="font-semibold text-gold">Digital Transformation</div>
              <div className="text-muted-foreground mt-1">Modernizing research infrastructure</div>
            </div>
            <div className="p-4 bg-background/40 rounded-lg">
              <div className="font-semibold text-gold">Data Sovereignty</div>
              <div className="text-muted-foreground mt-1">Saudi data, owned by Saudis</div>
            </div>
            <div className="p-4 bg-background/40 rounded-lg">
              <div className="font-semibold text-gold">Innovation Economy</div>
              <div className="text-muted-foreground mt-1">Empowering local researchers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">Founding Team</Badge>
          <h2 className="text-3xl md:text-5xl font-bold">Built by the <span className="gradient-text">next generation</span></h2>
        </div>
        <FounderCard />
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">Voices</Badge>
          <h2 className="text-3xl md:text-5xl font-bold">Trusted by researchers and participants</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            { n: "Dr. Sara A.", r: "Researcher, KAUST", q: "I recruited 200 participants in two days. The on-chain consent ledger is a game-changer for ethics review." },
            { n: "Mohammed K.", r: "Participant, Riyadh", q: "Rewards land in my wallet instantly. I can see exactly which studies I joined and what I agreed to." },
            { n: "Prof. Layla H.", r: "Public Health, KSU", q: "Finally — a platform that takes data ownership seriously. This is what Vision 2030 looks like in practice." },
          ].map((t) => (
            <div key={t.n} className="glass rounded-xl p-6">
              <p className="text-foreground/90 italic">"{t.q}"</p>
              <div className="mt-4 pt-4 border-t">
                <div className="font-semibold">{t.n}</div>
                <div className="text-xs text-muted-foreground">{t.r}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center glass rounded-2xl p-12 animate-pulse-glow">
          <h2 className="text-3xl md:text-5xl font-bold">Ready to join the <span className="gradient-text">research revolution</span>?</h2>
          <p className="mt-4 text-muted-foreground">Sign up free — whether you're conducting research or contributing to it.</p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-gradient-to-r from-primary to-primary/70 text-base h-12 px-8">
              <Link to="/signup">Create Free Account <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base h-12 px-8">
              <Link to="/contact">Talk to the Team</Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
