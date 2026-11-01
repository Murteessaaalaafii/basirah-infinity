import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { Mail, Phone, MapPin, Loader2, Send, Sparkles } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { insertDoc, ADMIN_PRIMARY_EMAIL } from "@/integrations/firebase/helpers";
import { toast } from "sonner";
import { JsonLd } from "@/components/JsonLd";
import { buildRouteSeo, getBreadcrumbSchema, SITE_URL } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () =>
    buildRouteSeo({
      title: "Contact Us & Project Inquiry — Basirah Infinity | Directed by Murtesa Alafi",
      description:
        "Initiate your project with Murtesa Alafi and the Basirah Infinity team. Direct inquiries for branding, web platforms, and AI automation. Fast 24-hour response.",
      path: "/contact",
      keywords: [
        "Contact Basirah Infinity",
        "Murtesa Alafi Contact",
        "Addis Ababa Digital Studio",
        "Hire AI Web Developer",
      ],
    }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(1, "Name required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  company: z.string().trim().max(100).optional().or(z.literal("")),
  service_interest: z.string().max(80).optional().or(z.literal("")),
  budget: z.string().max(80).optional().or(z.literal("")),
  message: z.string().trim().min(1, "Message required").max(2000),
});

const SERVICES = ["Branding & Identity", "Website Design", "Social Media", "AI Automation", "Content Creation", "Strategy & Growth"];
const BUDGETS = ["< $500", "$500 – $1500", "$1500 – $5000", "$5000+"];

function ContactPage() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", company: "", service_interest: "", budget: "", message: "",
  });
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setLoading(true);
    const tag = parsed.data.service_interest || "general";

    try {
      // 1. Insert lead into Firebase Firestore / local store
      await insertDoc("leads", {
        ...parsed.data,
        tag,
        status: "new",
        source: "contact-form",
      });

      // 2. Queue follow-up notification
      await insertDoc("notifications", {
        to_email: parsed.data.email,
        subject: "We received your message — Basirah Infinity",
        body: `Hi ${parsed.data.name},\n\nThank you for reaching out to Basirah Infinity. Murtesa Alafi and our strategy team will personally review your brief and reply within 24 hours.\n\nWarm regards,\nMurtesa Alafi\nFounder & Director, Basirah Infinity`,
        kind: "lead-welcome",
        status: "sent",
        sent: true,
      });

      await insertDoc("notifications", {
        to_email: ADMIN_PRIMARY_EMAIL,
        subject: `🚀 New Lead: ${parsed.data.name} (${tag})`,
        body: `Name: ${parsed.data.name}\nEmail: ${parsed.data.email}\nPhone: ${parsed.data.phone}\nCompany: ${parsed.data.company}\nInterest: ${tag}\nBudget: ${parsed.data.budget}\n\nMessage:\n${parsed.data.message}`,
        kind: "lead-admin",
        status: "queued",
        sent: false,
      });

      setForm({ name: "", email: "", phone: "", company: "", service_interest: "", budget: "", message: "" });
      toast.success("Message dispatched to Murtesa Alafi & Basirah Infinity team! We'll reply within 24h.");
    } catch (error: any) {
      toast.error(error.message ?? "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteShell>
      <JsonLd
        data={[
          getBreadcrumbSchema([
            { name: "Contact", item: `${SITE_URL}/contact` },
          ]),
        ]}
      />
      <section className="mx-auto max-w-4xl px-6 pb-8 pt-16 text-center">
        <span className="liquid-glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-neon-cyan">
          <Sparkles className="h-3 w-3" /> Connect with Basirah Infinity
        </span>
        <h1 className="mt-4 font-display text-5xl font-bold md:text-6xl">
          Let's talk with <span className="text-gradient-brand">Murtesa Alafi</span>.
        </h1>
        <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
          Tell us about your brand vision, web needs, or automation requirements — we'll come back with an actionable growth blueprint.
        </p>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 pb-20 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-4">
          <div className="liquid-glass rounded-2xl p-6">
            <Mail className="h-5 w-5 text-neon-cyan" />
            <p className="mt-2 text-xs text-muted-foreground uppercase tracking-wider font-semibold">Direct Inquiries</p>
            <p className="font-medium text-foreground">{ADMIN_PRIMARY_EMAIL}</p>
          </div>
          <div className="liquid-glass rounded-2xl p-6">
            <Phone className="h-5 w-5 text-neon-cyan" />
            <p className="mt-2 text-xs text-muted-foreground uppercase tracking-wider font-semibold">Direct Call / WhatsApp</p>
            <a href="tel:+251708229717" className="font-medium text-foreground hover:text-neon-cyan transition-colors">
              +251 708 229 717
            </a>
          </div>
          <div className="liquid-glass rounded-2xl p-6">
            <MapPin className="h-5 w-5 text-neon-cyan" />
            <p className="mt-2 text-xs text-muted-foreground uppercase tracking-wider font-semibold">Studio Location</p>
            <p className="font-medium text-foreground">Addis Ababa, Ethiopia · Global Delivery</p>
          </div>
          <div className="liquid-glass rounded-2xl p-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Connect with Murtesa</p>
            <div className="mt-3 flex flex-wrap gap-2">
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
        </div>

        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="liquid-glass space-y-4 rounded-3xl p-8"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Full name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="mt-1 bg-white/5"
              />
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="mt-1 bg-white/5"
              />
            </div>
            <div>
              <Label>Phone number</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+251…"
                className="mt-1 bg-white/5"
              />
            </div>
            <div>
              <Label>Company or Brand</Label>
              <Input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="mt-1 bg-white/5"
              />
            </div>
            <div>
              <Label>Service interest</Label>
              <select
                className="mt-1 w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm"
                value={form.service_interest}
                onChange={(e) => setForm({ ...form, service_interest: e.target.value })}
              >
                <option value="">Select a service…</option>
                {SERVICES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Estimated budget</Label>
              <select
                className="mt-1 w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
              >
                <option value="">Select budget range…</option>
                {BUDGETS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <Label>Project brief & goals *</Label>
            <Textarea
              rows={6}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
              placeholder="Tell us what you want to achieve, your timeline, or any reference websites…"
              className="mt-1 bg-white/5"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-gradient-brand text-white shadow-glow">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send message to Basirah Infinity
          </Button>
        </motion.form>
      </section>
    </SiteShell>
  );
}
