import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Brain, Layout, Bot, Megaphone, Palette, Globe, Rocket, Zap, Phone } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { Showcase } from "@/components/Showcase";
import { ShowreelModal } from "@/components/ShowreelModal";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { Button } from "@/components/ui/button";
import logoBig from "@/assets/ma-logo.jpg";
import { PortraitShowcase } from "@/components/PortraitShowcase";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Basirah Infinity — By Murtesa Alafi | Next Era of Digital Growth" },
      { name: "description", content: "Basirah Infinity — AI-powered branding, websites, content & automation. Founded and directed by Murtesa Alafi." },
      { property: "og:title", content: "Basirah Infinity — By Murtesa Alafi" },
      { property: "og:description", content: "AI-powered branding, websites, content & automation by Murtesa Alafi." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const highlights = [
  { icon: Palette, t: "Branding & Identity" },
  { icon: Layout, t: "Web Design" },
  { icon: Megaphone, t: "Social Media" },
  { icon: Bot, t: "AI Automation" },
  { icon: Sparkles, t: "Content Creation" },
  { icon: Brain, t: "Strategy" },
];
const ecosystem = [
  { n: "Studio", d: "AI Digital Services", icon: Zap },
  { n: "Academy", d: "Online Education", icon: Brain },
  { n: "Media", d: "Digital Content", icon: Globe },
  { n: "Market", d: "Digital Marketplace", icon: Rocket },
];
const stats = [
  { k: "10x", v: "Faster delivery" },
  { k: "98%", v: "Client retention" },
  { k: "120+", v: "Brands launched" },
  { k: "24/7", v: "AI strategist" },
];

function Home() {
  return (
    <SiteShell>
      <AnnouncementBanner />
      {/* HERO */}
      <section className="relative overflow-hidden pb-24 pt-12">
        <div className="absolute inset-0 -z-10 bg-mesh" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-neon-cyan">
              <Sparkles className="h-3 w-3" /> Next Era of Digital Growth
            </span>
            <h1 className="mt-5 font-display text-5xl font-bold leading-[1.05] md:text-6xl">
              Build Skills. <br />
              Grow Income. <br />
              <span className="text-gradient-brand">Shape the Future.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              Basirah Infinity is an all-in-one digital ecosystem founded & owned by Murtesa Alafi — elite AI services, brand architecture, web design, and automation pipelines.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/register">Get Started <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/order">Order a Service</Link>
              </Button>
              <ShowreelModal label="Watch Showreel" variant="ghost" size="lg" />
              <Button asChild size="lg" variant="ghost">
                <a href="tel:+251708229717"><Phone className="h-4 w-4" /> +251 708 229 717</a>
              </Button>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
              {stats.map((s) => (
                <div key={s.k} className="glass rounded-xl px-3 py-3 text-center">
                  <div className="font-display text-2xl font-bold text-gradient-brand">{s.k}</div>
                  <div className="text-[11px] text-muted-foreground">{s.v}</div>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="relative">
            <PortraitShowcase />
            <motion.img
              src={logoBig}
              alt="Murtesa Alafi logo"
              className="absolute -left-2 top-4 hidden w-28 rounded-2xl ring-1 ring-primary/40 shadow-glow sm:block md:w-36"
              animate={{ y: [0, -10, 0], rotate: [-3, 3, -3] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="text-center">
          <h2 className="font-display text-4xl font-bold">What we do</h2>
          <p className="mt-3 text-muted-foreground">Six service tracks. One unified ecosystem.</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {highlights.map((h, i) => (
            <motion.div
              key={h.t}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass group rounded-2xl p-6 transition-all hover:scale-[1.02] hover:shadow-glow"
            >
              <h.icon className="h-8 w-8 text-neon-cyan transition-transform group-hover:scale-110" />
              <h3 className="mt-4 font-display text-lg font-semibold">{h.t}</h3>
            </motion.div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button asChild variant="outline">
            <Link to="/services">See full services <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* ECOSYSTEM */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-center font-display text-4xl font-bold">The Basirah Infinity Ecosystem</h2>
        <p className="mt-3 text-center text-muted-foreground">Four pillars directed by Murtesa Alafi.</p>
        <div className="mt-12 grid gap-5 md:grid-cols-4">
          {ecosystem.map((e) => (
            <div key={e.n} className="glass rounded-2xl p-6 text-center">
              <e.icon className="mx-auto h-10 w-10 text-gradient-brand" style={{ stroke: "url(#nx-grad)" }} />
              <h3 className="mt-3 font-display text-xl font-bold">Basirah {e.n}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{e.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SHOWCASE — bento of works */}
      <Showcase />

      {/* WORKS PREVIEW */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-4xl font-bold">Recent Works</h2>
            <p className="mt-2 text-muted-foreground">Brands. Sites. AI systems. Shipped.</p>
          </div>
          <Button asChild variant="outline"><Link to="/works">View all <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { t: "Halo Beauty", c: "Branding · Web", g: "from-pink-500/40 to-purple-600/40" },
            { t: "Northwave SaaS", c: "AI · Automation", g: "from-blue-500/40 to-cyan-500/40" },
            { t: "Lumen Coaching", c: "Funnels · Content", g: "from-amber-500/40 to-pink-500/40" },
          ].map((w) => (
            <Link key={w.t} to="/works" className="liquid-glass group block overflow-hidden rounded-3xl">
              <div className={`relative h-44 bg-gradient-to-br ${w.g}`}>
                <div className="absolute inset-0 grid-bg opacity-30" />
              </div>
              <div className="p-5">
                <p className="text-[11px] tracking-widest text-neon-cyan">{w.c}</p>
                <h3 className="mt-1 font-display text-lg font-bold">{w.t}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="liquid-glass relative overflow-hidden rounded-3xl p-10 text-center">
          <h2 className="font-display text-4xl font-bold">Ready to launch your next era?</h2>
          <p className="mt-3 text-muted-foreground">Join Basirah Infinity today with Murtesa Alafi — turn skills into systems and ideas into revenue.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/register">Get Started Free</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/order">Order a Service</Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <a href="tel:+251708229717"><Phone className="h-4 w-4" /> Call us</a>
            </Button>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
