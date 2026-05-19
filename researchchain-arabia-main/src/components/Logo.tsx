import { Link } from "@tanstack/react-router";
import { Hexagon } from "lucide-react";

export function Logo({ size = 24 }: { size?: number }) {
  return (
    <Link to="/" className="flex items-center gap-2 group">
      <div className="relative">
        <Hexagon className="text-primary group-hover:rotate-180 transition-transform duration-700" size={size} strokeWidth={1.5} fill="currentColor" fillOpacity={0.1} />
        <Hexagon className="absolute inset-0 text-gold animate-pulse" size={size} strokeWidth={1} />
      </div>
      <span className="font-bold tracking-tight" style={{ fontSize: size * 0.7 }}>
        Research<span className="gradient-text">Chain</span> <span className="text-gold">Arabia</span>
      </span>
    </Link>
  );
}
