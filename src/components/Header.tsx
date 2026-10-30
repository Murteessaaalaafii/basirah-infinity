import { Link, useNavigate } from "@tanstack/react-router";
import { NexoraLogo } from "./NexoraLogo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { LogOut, LayoutDashboard, Menu, X, Shield, Sparkles } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { to: "/services", label: "Services" },
  { to: "/works", label: "Works" },
  { to: "/order", label: "Order" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
  { to: "/collaborate", label: "Collaborate" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const { user, role, signOut } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="mx-auto mt-3 max-w-7xl px-4">
        <div className="mb-2 hidden items-center justify-between px-2 text-[11px] tracking-widest text-muted-foreground md:flex">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <strong className="text-foreground">BASIRAH INFINITY</strong> · Founder & Owner: Murtesa Alafi
          </span>
          <div className="flex items-center gap-4">
            <a
              href="tel:+251708229717"
              className="hover:text-foreground transition-colors"
            >
              📞 +251 708 229 717
            </a>
            <span>·</span>
            <a
              href="mailto:basirahinfinity@gmail.com"
              className="hover:text-foreground transition-colors"
            >
              ✉ basirahinfinity@gmail.com
            </a>
          </div>
        </div>

        <nav className="liquid-glass flex items-center justify-between rounded-2xl px-4 py-3 md:px-6 shadow-glow">
          <NexoraLogo size={36} />

          <div className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                activeProps={{ className: "rounded-lg px-3 py-1.5 text-sm font-semibold text-foreground bg-white/10 text-neon-cyan" }}
              >
                {n.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <ThemeToggle />
            {user ? (
              <>
                {role === "admin" && (
                  <Button asChild variant="outline" size="sm" className="gap-1.5 border-amber-400/40 text-amber-300 hover:bg-amber-400/10 shadow-[0_0_15px_rgba(245,215,110,0.15)]">
                    <Link to="/studio">
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                      Studio Pro
                    </Link>
                  </Button>
                )}
                <Button asChild variant="ghost" size="sm" className="gap-2 text-foreground">
                  <Link to={role === "admin" ? "/admin" : role === "partner" ? "/partner-dashboard" : "/dashboard"}>
                    {role === "admin" ? <Shield className="h-4 w-4 text-neon-cyan" /> : <LayoutDashboard className="h-4 w-4 text-neon-cyan" />}
                    {role === "admin" ? "Admin Console" : role === "partner" ? "Partner Portal" : "Dashboard"}
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 border-white/10 hover:bg-white/5"
                  onClick={async () => {
                    await signOut();
                    nav({ to: "/" });
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild size="sm" className="bg-gradient-brand text-white shadow-glow">
                  <Link to="/register">
                    <Sparkles className="h-3.5 w-3.5" /> Get Started
                  </Link>
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <button
              className="rounded-lg p-2 text-foreground"
              onClick={() => setOpen((o) => !o)}
              aria-label="Menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {open && (
          <div className="liquid-glass mt-2 flex flex-col gap-1 rounded-2xl p-4 lg:hidden border border-white/10">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground"
              >
                {n.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3">
              {user ? (
                <>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link to={role === "admin" ? "/admin" : role === "partner" ? "/partner-dashboard" : "/dashboard"} onClick={() => setOpen(false)}>
                        {role === "admin" ? "Admin Console" : role === "partner" ? "Partner Portal" : "Dashboard"}
                      </Link>
                    </Button>
                    <Button size="sm" variant="ghost" className="flex-1" onClick={() => { signOut(); setOpen(false); }}>
                      Sign out
                    </Button>
                  </div>
                  {role === "admin" && (
                    <Button asChild size="sm" className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold">
                      <Link to="/studio" onClick={() => setOpen(false)}>
                        <Sparkles className="h-3.5 w-3.5 mr-1" />
                        Admin Studio Pro
                      </Link>
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild size="sm" className="flex-1 bg-gradient-brand text-white">
                    <Link to="/register">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
