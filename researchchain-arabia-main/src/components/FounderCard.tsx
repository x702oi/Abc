import { Award, GraduationCap, Linkedin, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function FounderCard({ compact = false }: { compact?: boolean }) {
  return (
    <div className="glass rounded-2xl p-8 max-w-3xl mx-auto relative overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-gold/20 to-transparent rounded-full blur-3xl" />
      <div className="flex flex-col md:flex-row gap-6 items-start relative">
        <div className="flex-shrink-0">
          <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary to-gold p-0.5">
            <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center text-4xl font-bold gradient-text">
              AA
            </div>
          </div>
          <Badge className="mt-3 bg-gradient-to-r from-gold to-gold/70 text-gold-foreground border-0">
            <Award className="w-3 h-3 mr-1" /> CEO
          </Badge>
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold">Ali Alzahrani</h3>
          <p className="text-primary font-medium">Co-Founder &amp; CEO</p>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <GraduationCap className="w-4 h-4" /> MIS — King Fahd University of Petroleum &amp; Minerals (KFUPM)
          </p>
          {!compact && (
            <p className="mt-4 text-muted-foreground leading-relaxed">
              A visionary Management Information Systems student at KFUPM focused on blockchain innovation,
              AI-powered platforms, and Saudi Vision 2030 digital transformation initiatives.
            </p>
          )}
          <div className="mt-6 relative pl-6 border-l-2 border-gold">
            <Quote className="absolute -left-3 top-0 w-5 h-5 text-gold bg-card" />
            <p className="italic text-foreground/90">
              "We are building the trust infrastructure for the future of research and ethical data ownership in Saudi Arabia."
            </p>
          </div>
          {!compact && (
            <div className="mt-4 flex gap-2">
              <a href="#" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                <Linkedin className="w-4 h-4" /> Connect on LinkedIn
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
