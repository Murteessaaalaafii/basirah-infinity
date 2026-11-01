import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles, HelpCircle, ChevronDown } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { Button } from "@/components/ui/button";
import { fetchPricingTiers } from "@/integrations/firebase/helpers";
import { JsonLd } from "@/components/JsonLd";
import { buildRouteSeo, getBreadcrumbSchema, getFaqSchema, SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/pricing")({
  head: () =>
    buildRouteSeo({
      title: "Pricing Plans & Investment Packages — Basirah Infinity | Directed by Murtesa Alafi",
      description:
        "Transparent, sovereign investment packages: Launch ($499), Growth ($1,490), and bespoke Empire tiers for brands, websites, and autonomous AI systems.",
      path: "/pricing",
      keywords: [
        "Basirah Infinity Pricing",
        "Murtesa Alafi Rates",
        "AI Studio Packages",
        "Web Design Pricing",
        "Brand Identity Cost",
      ],
    }),
  component: PricingPage,
});

const DEFAULT_TIERS = [
  {
    id: "launch",
    name: "Launch Tier",
    badge: "FOUNDATION",
    description: "Ideal for founders, creators, and emerging brands launching their sovereign presence.",
    price: "$499",
    period: "project",
    deliveryTime: "7 - 10 business days",
    cta: "Start Launch Package",
    popular: false,
    features: [
      "Signature brand identity & vector logo suite",
      "One-page high-converting modern landing page",
      "Mobile responsive & SEO foundations",
      "Social media visual assets pack",
      "14 days post-launch support",
    ],
  },
  {
    id: "growth",
    name: "Growth Tier",
    badge: "MOST POPULAR",
    description: "Full-stack digital architecture for scaling businesses ready to dominate their vertical.",
    price: "$1,490",
    period: "project",
    deliveryTime: "14 - 21 business days",
    cta: "Scale with Growth",
    popular: true,
    features: [
      "Complete brand design system & style guide",
      "Multi-page custom web platform (React/Next)",
      "Autonomous AI lead capture & CRM automations",
      "Social media growth system (30 day content pack)",
      "Speed, performance & Core Web Vitals optimization",
      "30 days dedicated post-launch support",
    ],
  },
  {
    id: "empire",
    name: "Empire Tier",
    badge: "BESPOKE ENTERPRISE",
    description: "Comprehensive end-to-end transformation directed personally by Murtesa Alafi.",
    price: "Custom",
    period: "sprint",
    deliveryTime: "Tailored roadmap",
    cta: "Request Empire Consultation",
    popular: false,
    features: [
      "Direct architectural direction with Murtesa Alafi",
      "Bespoke web applications & customer portals",
      "Custom fine-tuned multi-agent AI ecosystems",
      "Omnichannel viral marketing & video production",
      "Private API integrations & enterprise security",
      "Quarterly executive advisory & priority retainer",
    ],
  },
];

const PRICING_FAQS = [
  {
    q: "Are there any hidden fees?",
    a: "No. Our pricing is completely transparent. Each quote outlines exact deliverables, revision limits, and hosting/infrastructure considerations with zero surprises.",
  },
  {
    q: "What payment terms and methods do you support?",
    a: "We work on structured milestone terms (typically 50% deposit and 50% upon final sign-off). We accept wire transfers, international bank deposits, and verified payment gateways.",
  },
  {
    q: "Can I upgrade my package during development?",
    a: "Yes. You can expand your scope or upgrade tiers at any milestone point, with payments credited proportionally.",
  },
  {
    q: "What if I need custom features not listed in the packages?",
    a: "Select the Empire package or contact us directly. Murtesa Alafi will formulate a bespoke scope document tailored specifically to your organization's technical needs.",
  },
];

function PricingPage() {
  const [tiers, setTiers] = useState<any[]>(DEFAULT_TIERS);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
      <JsonLd
        data={[
          getBreadcrumbSchema([
            { name: "Pricing", item: `${SITE_URL}/pricing` },
          ]),
          getFaqSchema(PRICING_FAQS),
        ]}
      />
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

      {/* PRICING FAQ */}
      <section className="mx-auto max-w-4xl px-6 pb-20">
        <div className="text-center">
          <span className="liquid-glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-neon-cyan mb-3">
            <HelpCircle className="h-3 w-3" /> Investment Inquiries
          </span>
          <h2 className="font-display text-3xl font-bold md:text-4xl">Pricing FAQ</h2>
          <p className="mt-2 text-muted-foreground">Everything you need to know about commissioning Basirah Infinity.</p>
        </div>

        <div className="mt-8 space-y-4">
          {PRICING_FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={faq.q}
                className="liquid-glass overflow-hidden rounded-2xl border border-white/10 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between p-5 text-left font-display font-semibold text-foreground transition hover:text-neon-cyan"
                  aria-expanded={isOpen}
                >
                  <span className="text-base md:text-lg">{faq.q}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-neon-cyan transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="border-t border-white/5 px-5 pb-5 pt-3 text-sm leading-relaxed text-muted-foreground">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>
    </SiteShell>
  );
}