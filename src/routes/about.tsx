import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb, Shield, Heart, Target, Sparkles, User, Award, Globe, ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { Button } from "@/components/ui/button";
import { fetchAboutContent } from "@/integrations/firebase/helpers";
import portraitImg from "@/assets/murtesa-portrait.png";
import { JsonLd } from "@/components/JsonLd";
import { buildRouteSeo, getBreadcrumbSchema, getPersonSchema, SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () =>
    buildRouteSeo({
      title: "About Murtesa Alafi & Basirah Infinity — Leadership & Systems Architecture",
      description:
        "Meet Murtesa Alafi, founder, creative director, and systems architect of Basirah Infinity. Discover our mission, core values, and AI-powered digital growth ecosystem.",
      path: "/about",
      type: "profile",
      keywords: [
        "Murtesa Alafi",
        "Murtesa Alafi Biography",
        "Basirah Infinity Founder",
        "Creative Technologist Ethiopia",
        "Digital Studio Leadership",
      ],
    }),
  component: AboutPage,
});

const defaultValues = [
  { icon: Lightbulb, t: "Visionary Innovation", d: "We embrace cutting-edge AI and design systems to ship 10x faster than traditional agencies." },
  { icon: Heart, t: "Client Empowerment", d: "We equip founders and brands with scalable digital assets and monetizable systems." },
  { icon: Shield, t: "Absolute Integrity", d: "Transparency, milestone security, and high fidelity in every single deliverable." },
  { icon: Target, t: "Compounding Impact", d: "We build digital foundations that generate ongoing value and measurable growth." },
];

function AboutPage() {
  const [content, setContent] = useState<any>({
    founder_name: "Murtesa Alafi",
    founder_title: "Founder, Creative Director & Systems Architect",
    founder_phone: "+251 708 229 717",
    founder_email: "basirahinfinity@gmail.com",
    location: "Addis Ababa, Ethiopia · Global Operations",
    bio_p1: "As the visionary behind Basirah Infinity, Murtesa Alafi combines creative direction, full-stack technology, and artificial intelligence to elevate businesses beyond conventional limitations.",
    bio_p2: "Based in Addis Ababa with global reach, Murtesa has spearheaded digital growth for startups, creators, and enterprises — establishing brand authority and automating business workflows.",
    vision: "To empower visionary entrepreneurs across Africa and globally with world-class digital brands and autonomous AI systems that redefine what's possible.",
    stats: [
      { label: "Global Projects Delivered", value: "50+" },
      { label: "Client Satisfaction Rate", value: "99.8%" },
      { label: "Client Pipeline Powered", value: "$12M+" },
      { label: "On-Time Delivery Record", value: "100%" },
    ],
    values: defaultValues,
  });

  useEffect(() => {
    async function load() {
      const data = await fetchAboutContent();
      if (data && data.founder_name) {
        setContent(data);
      }
    }
    load();
  }, []);

  const valuesList = content.values && content.values.length > 0 ? content.values : defaultValues;
  const statsList = content.stats && content.stats.length > 0 ? content.stats : [
    { label: "Global Projects Delivered", value: "50+" },
    { label: "Client Satisfaction Rate", value: "99.8%" },
    { label: "Client Pipeline Powered", value: "$12M+" },
    { label: "On-Time Delivery Record", value: "100%" },
  ];

  return (
    <SiteShell>
      <JsonLd
        data={[
          getBreadcrumbSchema([
            { name: "About", item: `${SITE_URL}/about` },
          ]),
          getPersonSchema(),
        ]}
      />
      {/* HERO */}
      <section className="mx-auto max-w-4xl px-6 pb-12 pt-16 text-center">
        <span className="liquid-glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-neon-cyan">
          <Sparkles className="h-3 w-3" /> About Basirah Infinity
        </span>
        <h1 className="mt-4 font-display text-5xl font-bold md:text-6xl">
          Crafting the Future with <span className="text-gradient-brand">{content.founder_name || "Murtesa Alafi"}</span>
        </h1>
        <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {content.vision || "Basirah Infinity is a next-generation AI digital studio architecting high-conversion web platforms, futuristic brand identities, and autonomous AI systems."}
        </p>
      </section>

      {/* STATS STRIP */}
      <section className="mx-auto max-w-7xl px-6 pb-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statsList.map((st: any, i: number) => (
            <div key={i} className="liquid-glass rounded-2xl p-6 text-center border border-white/10">
              <p className="font-display text-3xl font-bold text-gradient-brand">{st.value}</p>
              <p className="mt-1 text-xs text-muted-foreground uppercase tracking-wider">{st.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOUNDER SPOTLIGHT */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="liquid-glass grid gap-10 rounded-3xl p-8 md:p-12 lg:grid-cols-2 items-center">
          <div className="space-y-5">
            <span className="rounded-full bg-neon-cyan/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-neon-cyan border border-neon-cyan/30">
              Founder & Director
            </span>
            <h2 className="font-display text-3xl font-bold md:text-4xl text-foreground">
              Meet {content.founder_name || "Murtesa Alafi"}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {content.bio_p1}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {content.bio_p2}
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Button asChild size="lg" className="bg-gradient-brand text-white shadow-glow">
                <Link to="/contact">Work Directly with Murtesa <ArrowRight className="h-4 w-4 ml-1.5" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/10">
                <Link to="/works">Explore Works</Link>
              </Button>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs text-muted-foreground">Follow Murtesa:</span>
              <a
                href="https://www.facebook.com/murteessaa.ilma.alaafii"
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-foreground hover:bg-white/10 hover:text-neon-cyan transition-colors"
              >
                Facebook
              </a>
              <a
                href="https://www.linkedin.com/in/murteessaa-alaafii"
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-foreground hover:bg-white/10 hover:text-neon-cyan transition-colors"
              >
                LinkedIn
              </a>
            </div>
          </div>

          <div className="relative mx-auto max-w-md overflow-hidden rounded-3xl border border-white/10 shadow-elevated">
            <img
              src={portraitImg}
              alt="Murtesa Alafi — Founder & Director of Basirah Infinity"
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent flex items-end p-6">
              <div>
                <h3 className="font-display text-xl font-bold text-foreground">{content.founder_name || "Murtesa Alafi"}</h3>
                <p className="text-xs text-neon-cyan font-semibold">{content.founder_title || "Founder & Director, Basirah Infinity"}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION & VALUES */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="liquid-glass rounded-3xl p-10 md:p-12 text-center max-w-4xl mx-auto">
          <h2 className="font-display text-3xl font-bold">Our Core Mission</h2>
          <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
            To make world-class digital growth and elite brand architecture accessible to ambitious creators and founders —
            combining AI precision with human artistic instinct under one unified ecosystem.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {valuesList.map((v: any, i: number) => {
            const IconComp = v.icon || Lightbulb;
            return (
              <motion.div
                key={v.t || v.title || i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="liquid-glass rounded-2xl p-6 transition-all hover:scale-[1.02] flex flex-col justify-between"
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neon-cyan/10 text-neon-cyan mb-4">
                    <IconComp className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground">{v.t || v.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v.d || v.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </SiteShell>
  );
}