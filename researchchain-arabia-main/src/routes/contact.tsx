import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({ meta: [{ title: "Contact — ResearchChain Arabia" }, { name: "description", content: "Get in touch with the ResearchChain Arabia team." }] }),
});

function ContactPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="container mx-auto px-4 py-20 max-w-5xl">
        <Badge variant="outline" className="mb-4">Contact</Badge>
        <h1 className="text-4xl md:text-6xl font-bold">Let's <span className="gradient-text">build trust</span> together</h1>
        <p className="mt-6 text-lg text-muted-foreground">Questions, partnerships, investments — we'd love to hear from you.</p>

        <div className="grid md:grid-cols-2 gap-12 mt-12">
          <form onSubmit={(e) => { e.preventDefault(); setLoading(true); setTimeout(() => { setLoading(false); toast.success("Message received! We'll reply within 24h."); (e.target as HTMLFormElement).reset(); }, 800); }} className="space-y-4">
            <div><Label>Name</Label><Input required placeholder="Your full name" /></div>
            <div><Label>Email</Label><Input required type="email" placeholder="you@example.com" /></div>
            <div><Label>Subject</Label><Input required placeholder="How can we help?" /></div>
            <div><Label>Message</Label><Textarea required rows={5} placeholder="Tell us more…" /></div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-primary to-primary/70">
              {loading ? "Sending…" : "Send message"}
            </Button>
          </form>
          <div className="space-y-6">
            <div className="glass rounded-xl p-6">
              <Mail className="w-6 h-6 text-primary mb-2" />
              <div className="font-semibold">Email</div>
              <div className="text-sm text-muted-foreground">hello@researchchain.sa</div>
            </div>
            <div className="glass rounded-xl p-6">
              <Phone className="w-6 h-6 text-primary mb-2" />
              <div className="font-semibold">Phone</div>
              <div className="text-sm text-muted-foreground">+966 50 000 0000</div>
            </div>
            <div className="glass rounded-xl p-6">
              <MapPin className="w-6 h-6 text-primary mb-2" />
              <div className="font-semibold">HQ</div>
              <div className="text-sm text-muted-foreground">Dhahran Techno Valley<br />KFUPM, Saudi Arabia</div>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
