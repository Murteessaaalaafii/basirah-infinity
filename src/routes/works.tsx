import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SiteShell } from "@/components/SiteShell";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, ExternalLink } from "lucide-react";
import { fetchWorks } from "@/integrations/firebase/helpers";
import brandBoard from "@/assets/ma-logo.jpg";
import coverImg from "@/assets/basirah-cover.jpg";

export const Route = createFileRoute("/works")({
  head: () => ({
    meta: [
      { title: "Our Works — Basirah Infinity | Directed by Murtesa Alafi" },
      { name: "description", content: "A showcase of brands, websites, and AI systems crafted by Basirah Infinity and Murtesa Alafi." },
    ],
  }),
  component: WorksPage,
});

function WorksPage() {
  const [works, setWorks] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const data = await fetchWorks();
      if (data && data.length > 0) {
        setWorks(data);
      }
    }
    load();
  }, []);

  return (
    <SiteShell>
      {/* HERO */}
      <section className="relative overflow-hidden pb-12 pt-16">
        <div
          className="absolute inset-0 -z-10 opacity-[0.08]"
          style={{ backgroundImage: `url(${brandBoard})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div className="absolute inset-0 -z-10 bg-mesh" />
        <div className="mx-auto max-w-4xl px-6 text-center">
          <span className="liquid-glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-neon-cyan">
            <Sparkles className="h-3 w-3" /> Selected Portfolio Works
          </span>
          <h1 className="mt-5 font-display text-5xl font-bold md:text-6xl">
            Crafted in the <span className="text-gradient-brand">Basirah Infinity lab</span>.
          </h1>
          <p className="mt-4 text-muted-foreground">
            Directed by Murtesa Alafi — luxury brands, high-performance web applications, and autonomous AI systems.
          </p>
        </div>
      </section>

      {/* FEATURED WORK COVER & PREVIEW PLACE */}
      <section className="mx-auto max-w-7xl px-6 pb-12">
        <div className="liquid-glass relative overflow-hidden rounded-3xl border border-neon-cyan/30 p-6 md:p-8 shadow-elevated">
          <div className="grid gap-6 lg:grid-cols-12 items-center">
            <div className="lg:col-span-7 relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-white/10 group">
              <img
                src={coverImg}
                alt="Basirah Infinity — Full Spectrum Digital Ecosystem"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-5">
                <span className="rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white">
                  Visual Cover: 3D Brands · Web Platforms · AI Agents
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-gradient-brand px-3 py-1 text-[10px] font-bold text-white uppercase tracking-widest">
                  FEATURED ECOSYSTEM
                </span>
                <span className="text-xs text-neon-cyan font-semibold">Live Preview</span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Basirah Infinity Sovereign Work Suite
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Full-spectrum digital showcase combining bespoke visual identities, high-conversion web platforms, autonomous AI workflows, and cinematic motion production directed by Murtesa Alafi.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs text-foreground font-mono">React 19</span>
                <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs text-foreground font-mono">TypeScript</span>
                <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs text-foreground font-mono">Tailwind v4</span>
                <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs text-foreground font-mono">Autonomous AI</span>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button asChild className="bg-gradient-brand text-white shadow-glow">
                  <a href="https://basirahinfinity.com" target="_blank" rel="noreferrer">
                    Open Live Platform <ExternalLink className="h-4 w-4 ml-1.5" />
                  </a>
                </Button>
                <Button asChild variant="outline" className="border-white/10">
                  <Link to="/order">Commission Similar</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GRID */}
      <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-16 md:grid-cols-2 lg:grid-cols-3">
        {works.map((w, i) => (
          <motion.div
            key={w.id || w.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="liquid-glass group overflow-hidden rounded-3xl flex flex-col justify-between"
          >
            <div>
              <div className={`relative h-48 overflow-hidden bg-gradient-to-br ${w.gradient || "from-blue-500/40 to-cyan-500/40"}`}>
                <div className="absolute inset-0 grid-bg opacity-30" />
                <div className="absolute left-4 top-4">
                  <span className="liquid-glass rounded-full px-3 py-1 text-[10px] font-semibold tracking-widest text-white uppercase">
                    {w.tag || "Showcase"}
                  </span>
                </div>
                {w.client && (
                  <div className="absolute right-4 top-4">
                    <span className="rounded bg-black/40 px-2 py-0.5 text-[10px] text-white/80">
                      {w.client}
                    </span>
                  </div>
                )}
                {w.liveUrl && (
                  <a
                    href={w.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute inset-0 flex items-end p-5 opacity-0 transition-opacity group-hover:opacity-100 bg-black/30"
                  >
                    <span className="text-xs text-white/90 flex items-center gap-1">
                      View live platform <ExternalLink className="h-3.5 w-3.5" />
                    </span>
                  </a>
                )}
              </div>
              <div className="p-6">
                <p className="text-[11px] tracking-widest text-neon-cyan uppercase font-semibold">{w.category}</p>
                <h3 className="mt-1 font-display text-xl font-bold text-foreground">{w.title}</h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">"{w.summary}"</p>
              </div>
            </div>

            <div className="p-6 pt-0 border-t border-white/5 mt-4 flex items-center justify-between">
              <span className="text-xs font-semibold text-gradient-brand">Impact: {w.impact}</span>
              <Button asChild size="sm" variant="ghost" className="text-xs text-neon-cyan">
                <Link to="/order">Commission Similar →</Link>
              </Button>
            </div>
          </motion.div>
        ))}
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="liquid-glass relative overflow-hidden rounded-3xl p-10 text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Like what you see?</h2>
          <p className="mt-2 text-muted-foreground">Let's craft your next era together with Murtesa Alafi.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-gradient-brand text-white shadow-glow">
              <Link to="/order">Place an order <ArrowRight className="h-4 w-4 ml-1" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/10">
              <a href="tel:+251708229717">📞 Call +251 708 229 717</a>
            </Button>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}