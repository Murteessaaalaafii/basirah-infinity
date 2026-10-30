import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Palette, Layout, Megaphone, Bot, Sparkles, Brain, Check, ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { Button } from "@/components/ui/button";
import { fetchServices } from "@/integrations/firebase/helpers";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Basirah Infinity | Directed by Murtesa Alafi" },
      { name: "description", content: "Branding, web platforms, AI systems, social media engines, and strategic consulting by Basirah Infinity." },
    ],
  }),
  component: ServicesPage,
});

const ICON_MAP: Record<string, any> = {
  Palette,
  Layout,
  Megaphone,
  Bot,
  Sparkles,
  Brain,
};

function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const data = await fetchServices();
      if (data && data.length > 0) {
        setServices(data);
      }
    }
    load();
  }, []);

  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-6 pb-12 pt-16 text-center">
        <span className="liquid-glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-neon-cyan mb-4">
          <Sparkles className="h-3 w-3" /> Directed by Murtesa Alafi
        </span>
        <h1 className="font-display text-5xl font-bold md:text-6xl">
          Services that <span className="text-gradient-brand">scale your future</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          From brand systems to autonomous AI pipelines — every capability engineered with bespoke fidelity and precision.
        </p>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-20 md:grid-cols-2 lg:grid-cols-3">
        {services.map((s, i) => {
          const IconComp = ICON_MAP[s.icon] || Sparkles;
          const featuresList = Array.isArray(s.features) ? s.features : [];

          return (
            <motion.div
              key={s.id || s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="liquid-glass rounded-3xl p-7 transition-all hover:shadow-glow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-glow">
                    <IconComp className="h-6 w-6" />
                  </div>
                  {s.tag && (
                    <span className="rounded-full bg-neon-cyan/20 px-2.5 py-0.5 text-[10px] font-semibold text-neon-cyan uppercase tracking-wider">
                      {s.tag}
                    </span>
                  )}
                </div>

                <h3 className="mt-5 font-display text-xl font-bold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {s.short || s.description}
                </p>

                {featuresList.length > 0 && (
                  <ul className="mt-5 space-y-2 text-sm">
                    {featuresList.map((x: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-2 text-muted-foreground">
                        <Check className="h-4 w-4 text-neon-cyan shrink-0" /> {x}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-6 border-t border-white/10 pt-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Investment</span>
                  <span className="font-display font-bold text-foreground text-sm">{s.price || "Custom"}</span>
                </div>
                <Button asChild size="sm" variant="outline" className="border-white/10 text-xs">
                  <Link to="/order">Order Sprints →</Link>
                </Button>
              </div>
            </motion.div>
          );
        })}
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-20 text-center">
        <Button asChild size="lg" className="bg-gradient-brand text-white shadow-glow">
          <Link to="/contact">
            Start a project with Murtesa Alafi <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </section>
    </SiteShell>
  );
}