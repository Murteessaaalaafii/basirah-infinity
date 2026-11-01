import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { SiteShell } from "@/components/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { insertDoc, ADMIN_PRIMARY_EMAIL } from "@/integrations/firebase/helpers";
import { toast } from "sonner";
import { Sparkles, Palette, Layout, Bot, Megaphone, Brain, Loader2, ArrowRight, Check, Phone } from "lucide-react";
import brandBoard from "@/assets/ma-logo.jpg";
import { JsonLd } from "@/components/JsonLd";
import { buildRouteSeo, getBreadcrumbSchema, SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/order")({
  head: () =>
    buildRouteSeo({
      title: "Order a Service Sprint — Basirah Infinity | Directed by Murtesa Alafi",
      description:
        "Commission bespoke branding, high-performance web development, autonomous AI automation pipelines, and content systems from Basirah Infinity. Rapid kick-off within 24h.",
      path: "/order",
      keywords: [
        "Order Basirah Infinity",
        "Commission Murtesa Alafi",
        "Hire Web Developer",
        "Brand Design Sprint",
      ],
    }),
  component: OrderPage,
});

const SERVICES = [
  { id: "branding", t: "Branding & Identity", icon: Palette, from: 499 },
  { id: "web", t: "Web Design & Development", icon: Layout, from: 899 },
  { id: "social", t: "Social Media Management", icon: Megaphone, from: 399 },
  { id: "ai", t: "AI Automation", icon: Bot, from: 1290 },
  { id: "content", t: "Content Creation", icon: Sparkles, from: 349 },
  { id: "strategy", t: "Strategy & Consulting", icon: Brain, from: 690 },
];
const PACKAGES = ["Launch", "Growth", "Empire (Custom)"] as const;

function OrderPage() {
  const nav = useNavigate();
  const [service, setService] = useState(SERVICES[0].id);
  const [pkg, setPkg] = useState<typeof PACKAGES[number]>("Growth");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const svc = SERVICES.find((s) => s.id === service)!;

    try {
      // 1. Record in orders collection
      await insertDoc("orders", {
        client_name: name,
        client_email: email,
        service: svc.t,
        package: pkg,
        amount: budget ? Number(budget) : svc.from,
        notes: `Order from ${name} (${company || "Individual"})\nPhone: ${phone}\n\nBrief: ${notes}`,
        status: "pending",
      });

      // 2. Also register in leads CRM
      await insertDoc("leads", {
        name,
        email,
        phone,
        company,
        service_interest: svc.t,
        message: `Package: ${pkg}\nBudget: ${budget || "$" + svc.from}\n\n${notes}`,
        source: "order_form",
        tag: `order:${service}:${pkg.toLowerCase()}`,
        status: "new",
      });

      // 3. Queue email notifications
      await insertDoc("notifications", {
        to_email: email,
        subject: `Order Confirmation — ${svc.t} (${pkg}) | Basirah Infinity`,
        body: `Hi ${name},\n\nWe have received your order request for ${svc.t} (${pkg} package). Murtesa Alafi and our project leads are reviewing your brief and will connect within 24 hours to initiate sprint planning.\n\nThank you,\nBasirah Infinity Team`,
        kind: "order-confirmation",
        status: "sent",
        sent: true,
      });

      await insertDoc("notifications", {
        to_email: ADMIN_PRIMARY_EMAIL,
        subject: `🛒 New Order: ${svc.t} (${pkg}) from ${name}`,
        body: `New order request from ${name} (${email}, ${phone})\nCompany: ${company}\nService: ${svc.t}\nPackage: ${pkg}\nBudget: ${budget}\nNotes:\n${notes}`,
        kind: "order",
        status: "queued",
        sent: false,
      });

      toast.success("Order placed successfully! Murtesa Alafi & the team will reach out within 24 hours.");
      nav({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message ?? "Failed to place order.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteShell>
      <JsonLd
        data={[
          getBreadcrumbSchema([
            { name: "Order", item: `${SITE_URL}/order` },
          ]),
        ]}
      />
      <section className="relative overflow-hidden pb-10 pt-16">
        <div
          className="absolute inset-0 -z-10 opacity-[0.06]"
          style={{ backgroundImage: `url(${brandBoard})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div className="absolute inset-0 -z-10 bg-mesh" />
        <div className="mx-auto max-w-4xl px-6 text-center">
          <span className="liquid-glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-neon-cyan">
            <Sparkles className="h-3 w-3" /> Place your order
          </span>
          <h1 className="mt-5 font-display text-5xl font-bold leading-tight md:text-6xl">
            Build with <span className="text-gradient-brand">Basirah Infinity</span>.
          </h1>
          <p className="mt-4 text-muted-foreground text-lg">
            Directed by Murtesa Alafi. Choose your service track and package — our sprint starts within 24h.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-20 lg:grid-cols-[1.2fr_1fr]">
        {/* FORM */}
        <form onSubmit={submit} className="liquid-glass rounded-3xl p-7 md:p-9">
          <h2 className="font-display text-2xl font-bold">1. Choose your service</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {SERVICES.map((s) => {
              const active = service === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setService(s.id)}
                  className={`group relative flex items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
                    active
                      ? "border-transparent liquid-btn shadow-glow"
                      : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                  }`}
                >
                  <s.icon className="mt-0.5 h-5 w-5 text-neon-cyan" />
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{s.t}</div>
                    <div className="text-[11px] opacity-80">From ${s.from}</div>
                  </div>
                  {active && <Check className="h-4 w-4 text-white" />}
                </button>
              );
            })}
          </div>

          <h2 className="mt-8 font-display text-2xl font-bold">2. Pick a package</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {PACKAGES.map((p) => {
              const active = pkg === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPkg(p)}
                  className={`rounded-2xl border p-4 text-sm font-semibold transition-all ${
                    active ? "border-transparent liquid-btn shadow-glow" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          <h2 className="mt-8 font-display text-2xl font-bold">3. Your details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Full name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 bg-white/5" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 bg-white/5" />
            </div>
            <div>
              <Label>Phone number</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+251…" className="mt-1 bg-white/5" />
            </div>
            <div>
              <Label>Company or Brand</Label>
              <Input value={company} onChange={(e) => setCompany(e.target.value)} className="mt-1 bg-white/5" />
            </div>
            <div className="sm:col-span-2">
              <Label>Estimated budget (USD)</Label>
              <Input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. 1500" className="mt-1 bg-white/5" />
            </div>
            <div className="sm:col-span-2">
              <Label>Project brief & specifications</Label>
              <Textarea rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} required placeholder="Goals, deadlines, reference inspirations…" className="mt-1 bg-white/5" />
            </div>
          </div>

          <Button type="submit" size="lg" disabled={loading} className="mt-6 w-full bg-gradient-brand text-white shadow-glow">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Place order <ArrowRight className="h-4 w-4" /></>}
          </Button>
        </form>

        {/* SIDE */}
        <aside className="space-y-6">
          <div className="liquid-glass rounded-3xl p-6">
            <h3 className="font-display text-lg font-bold">What happens next</h3>
            <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li><span className="text-foreground font-semibold">1.</span> Murtesa Alafi & team review your brief within 24 hours.</li>
              <li><span className="text-foreground font-semibold">2.</span> A dedicated strategist hops on a 20-min kickoff call.</li>
              <li><span className="text-foreground font-semibold">3.</span> You receive a milestone timeline & custom board.</li>
              <li><span className="text-foreground font-semibold">4.</span> Rapid sprint execution with daily updates.</li>
            </ol>
          </div>
          <div className="liquid-glass rounded-3xl p-6">
            <h3 className="font-display text-lg font-bold">Direct Line to Murtesa Alafi</h3>
            <a
              href="tel:+251708229717"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl liquid-btn px-4 py-3 text-sm font-semibold"
            >
              <Phone className="h-4 w-4" /> +251 708 229 717
            </a>
            <p className="mt-3 text-xs text-muted-foreground">
              Or email: <a href="mailto:basirahinfinity@gmail.com" className="text-foreground underline">basirahinfinity@gmail.com</a>
            </p>
          </div>
        </aside>
      </section>
    </SiteShell>
  );
}
