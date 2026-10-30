import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { Button } from "@/components/ui/button";
import { fetchPricingTiers } from "@/integrations/firebase/helpers";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Basirah Infinity | Directed by Murtesa Alafi" },
      { name: "description", content: "Transparent, premium pricing for Launch, Growth, and custom Empire packages by Basirah Infinity." },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const [tiers, setTiers] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const data = await fetchPricingTiers();
      if (data && data.length > 0) {
        setTiers(data);
      }
    }
    load();
  }, []);

  return (
    <SiteShell>
      <section className="mx-auto max-w-4xl px-6 pb-12 pt-16 text-center">
        <span className="liquid-glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-neon-cyan mb-4">
          <Sparkles className="h-3 w-3" /> Directed by Murtesa Alafi
        </span>
        <h1 className="font-display text-5xl font-bold md:text-6xl">
          Pricing for <span className="text-gradient-brand">every stage</span>
        </h1>
        <p className="mt-4 text-muted-foreground">
          Transparent, sovereign, and engineered for high compounding ROI.
        </p>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-20 md:grid-cols-3">
        {tiers.map((t, i) => {
          const featuresList = Array.isArray(t.features) ? t.features : [];

          return (
            <motion.div
              key={t.id || t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className={`liquid-glass relative rounded-3xl p-8 flex flex-col justify-between ${
                t.popular ? "shadow-glow ring-2 ring-primary" : "border border-white/10"
              }`}
            >
              <div>
                {t.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-brand px-3 py-1 text-[10px] font-bold tracking-widest text-white uppercase">
                    {t.badge || "MOST POPULAR"}
                  </span>
                )}
                <h3 className="font-display text-2xl font-bold text-foreground">{t.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold text-gradient-brand">{t.price}</span>
                  <span className="text-xs text-muted-foreground">/{t.period || "project"}</span>
                </div>

                {t.deliveryTime && (
                  <p className="text-[11px] font-semibold text-neon-cyan mt-1">
                    Timeline: {t.deliveryTime}
                  </p>
                )}

                <ul className="mt-6 space-y-2 text-xs">
                  {featuresList.map((x: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2 text-muted-foreground">
                      <Check className="h-4 w-4 text-neon-cyan shrink-0" /> {x}
                    </li>
                  ))}
                </ul>
              </div>

              <Button asChild className="mt-8 w-full bg-gradient-brand text-white shadow-glow">
                <Link to={t.name?.includes("Empire") ? "/contact" : "/order"}>
                  {t.cta || "Select Package"}
                </Link>
              </Button>
            </motion.div>
          );
        })}
      </section>
    </SiteShell>
  );
}