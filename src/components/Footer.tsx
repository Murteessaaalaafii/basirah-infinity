import { Link } from "@tanstack/react-router";
import { NexoraLogo } from "./NexoraLogo";
import { Mail, Globe, Sparkles, Phone, Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/5 bg-card/60 backdrop-blur-xl py-14">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-4">
        <div className="md:col-span-1 space-y-3">
          <NexoraLogo size={40} />
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            Next era of digital growth. AI-powered branding, high-conversion web platforms, and automated workflow ecosystems.
          </p>
          <div className="text-xs text-neon-cyan/90 font-medium">
            Founder & Owner: <strong>Murtesa Alafi</strong>
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground tracking-wide">Ecosystem Pillars</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/services" className="hover:text-foreground transition-colors">Digital Studio</Link></li>
            <li><Link to="/works" className="hover:text-foreground transition-colors">Showcase & Works</Link></li>
            <li><Link to="/pricing" className="hover:text-foreground transition-colors">Pricing Packages</Link></li>
            <li><span className="text-muted-foreground/60">Academy & Media</span> <span className="ml-1 text-[10px] text-neon-cyan">coming soon</span></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground tracking-wide">Company & Portal</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-foreground transition-colors">About Murtesa Alafi</Link></li>
            <li><Link to="/portfolio" className="hover:text-foreground transition-colors">Portfolio Case Studies</Link></li>
            <li><Link to="/collaborate" className="hover:text-foreground transition-colors">Partner & Collaborate</Link></li>
            <li><Link to="/login" className="hover:text-foreground transition-colors">Client & Admin Login</Link></li>
            <li><Link to="/order" className="hover:text-foreground transition-colors">Order a Service</Link></li>
            <li><Link to="/privacy" className="hover:text-foreground transition-colors text-xs opacity-75 hover:opacity-100">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-foreground transition-colors text-xs opacity-75 hover:opacity-100">Terms of Service</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground tracking-wide">Direct Contact</h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-neon-cyan shrink-0" />
              <a href="tel:+251708229717" className="hover:text-foreground transition-colors">+251 708 229 717</a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-neon-cyan shrink-0" />
              <a href="mailto:basirahinfinity@gmail.com" className="hover:text-foreground transition-colors">basirahinfinity@gmail.com</a>
            </li>
            <li className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-neon-cyan shrink-0" />
              <span>Addis Ababa, Ethiopia · Worldwide</span>
            </li>
            <li className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-neon-cyan shrink-0" />
              <span>Registered & Protected</span>
            </li>
            <li className="pt-2 flex items-center gap-3">
              <a
                href="https://www.facebook.com/murteessaa.ilma.alaafii"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-foreground hover:bg-white/10 hover:text-neon-cyan transition-colors"
                aria-label="Facebook Profile"
              >
                <span>Facebook</span>
              </a>
              <a
                href="https://www.linkedin.com/in/murteessaa-alaafii"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-foreground hover:bg-white/10 hover:text-neon-cyan transition-colors"
                aria-label="LinkedIn Profile"
              >
                <span>LinkedIn</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-white/5 px-6 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground gap-3">
        <p>© {new Date().getFullYear()} Basirah Infinity — Founded & Directed by Murtesa Alafi. All rights reserved.</p>
        <div className="flex flex-wrap items-center gap-4">
          <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          <a href="/llms.txt" target="_blank" rel="noreferrer" className="text-neon-cyan/90 hover:text-neon-cyan transition-colors font-mono text-[11px]">llms.txt</a>
          <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors font-mono text-[11px]">Sitemap</a>
        </div>
      </div>
    </footer>
  );
}
