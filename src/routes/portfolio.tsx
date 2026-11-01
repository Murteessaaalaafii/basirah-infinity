import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { SiteShell } from "@/components/SiteShell";
import { JsonLd } from "@/components/JsonLd";
import { buildRouteSeo, getBreadcrumbSchema, SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/portfolio")({
  head: () =>
    buildRouteSeo({
      title: "Portfolio & Client Transformations — Basirah Infinity | Directed by Murtesa Alafi",
      description:
        "Selected client transformations from Basirah Infinity: Luxury brand systems, web platforms, and autonomous AI automation case studies.",
      path: "/portfolio",
      keywords: [
        "Basirah Infinity Portfolio",
        "Murtesa Alafi Projects",
        "AI Automation Case Studies",
        "Digital Agency Work",
      ],
    }),
  component: PortfolioPage,
});

const work = [
  { t: "Halo Beauty", c: "Beauty · Branding + Web", q: "Sales doubled in a month after relaunch.", g: "from-pink-500/40 to-purple-600/40" },
  { t: "Northwave SaaS", c: "SaaS · AI workflows", q: "Replaced an entire ops role with automation.", g: "from-blue-500/40 to-cyan-500/40" },
  { t: "Lumen Coaching", c: "Education · Funnels", q: "10x lead flow in 6 weeks.", g: "from-amber-500/40 to-pink-500/40" },
  { t: "Orbital Studio", c: "Agency · Identity", q: "A brand that finally matched the vision.", g: "from-violet-600/40 to-blue-500/40" },
  { t: "Nimbus Wellness", c: "Wellness · Web app", q: "From idea to 5k members in a quarter.", g: "from-emerald-500/40 to-cyan-400/40" },
  { t: "Forge Logistics", c: "Logistics · Automation", q: "70% reduction in manual ops.", g: "from-orange-500/40 to-red-500/40" },
];

function PortfolioPage() {
  return (
    <SiteShell>
      <JsonLd
        data={[
          getBreadcrumbSchema([
            { name: "Portfolio", item: `${SITE_URL}/portfolio` },
          ]),
        ]}
      />
      <section className="mx-auto max-w-4xl px-6 pb-12 pt-16 text-center">
        <h1 className="font-display text-5xl font-bold">Selected Work</h1>
        <p className="mt-4 text-muted-foreground">A taste of what Basirah Infinity ships under Murtesa Alafi's direction.</p>
      </section>
      <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-20 md:grid-cols-2 lg:grid-cols-3">
        {work.map((w, i) => (
          <motion.div
            key={w.t}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="glass group overflow-hidden rounded-3xl"
          >
            <div className={`relative h-44 bg-gradient-to-br ${w.g}`}>
              <div className="absolute inset-0 bg-grid-bg opacity-30" />
            </div>
            <div className="p-6">
              <p className="text-[11px] tracking-widest text-neon-cyan">{w.c}</p>
              <h3 className="mt-1 font-display text-xl font-bold">{w.t}</h3>
              <p className="mt-3 text-sm text-muted-foreground">"{w.q}"</p>
            </div>
          </motion.div>
        ))}
      </section>
    </SiteShell>
  );
}
