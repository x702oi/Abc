import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Github, Linkedin, Twitter } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t mt-24 bg-sidebar">
      <div className="container mx-auto px-4 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <Logo />
          <p className="text-sm text-muted-foreground mt-4">
            Saudi Vision 2030 blockchain + AI ecosystem connecting researchers with verified participants.
          </p>
          <div className="flex gap-3 mt-4">
            <a href="#" className="text-muted-foreground hover:text-primary"><Linkedin size={18} /></a>
            <a href="#" className="text-muted-foreground hover:text-primary"><Twitter size={18} /></a>
            <a href="#" className="text-muted-foreground hover:text-primary"><Github size={18} /></a>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-gold">Platform</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/features" className="hover:text-primary">Features</Link></li>
            <li><Link to="/pricing" className="hover:text-primary">Pricing</Link></li>
            <li><Link to="/about" className="hover:text-primary">About</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-gold">Get Started</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/signup" className="hover:text-primary">Sign up</Link></li>
            <li><Link to="/login" className="hover:text-primary">Login</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-gold">Founder</h4>
          <p className="text-sm text-muted-foreground">
            <span className="text-foreground font-medium">Ali Alzahrani</span><br />
            Co-Founder &amp; CEO<br />
            MIS — KFUPM
          </p>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ResearchChain Arabia. Aligned with Saudi Vision 2030.
      </div>
    </footer>
  );
}
