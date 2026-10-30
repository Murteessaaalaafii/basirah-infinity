import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { Handshake, Loader2, Send, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { insertDoc, ADMIN_PRIMARY_EMAIL } from "@/integrations/firebase/helpers";
import { toast } from "sonner";

export const Route = createFileRoute("/collaborate")({
  head: () => ({
    meta: [
      { title: "Collaborate — Basirah Infinity | Directed by Murtesa Alafi" },
      { name: "description", content: "Partner with Basirah Infinity: agencies, freelancers, investors and creators welcome." },
    ],
  }),
  component: CollabPage,
});

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  type: z.enum(["agency", "freelancer", "partner", "investor", "creator"]),
  portfolio_url: z.string().trim().url().max(500).optional().or(z.literal("")),
  proposal: z.string().trim().min(20, "Tell us a bit more").max(3000),
});

const TYPES = [
  { v: "agency", l: "Agency" },
  { v: "freelancer", l: "Freelancer" },
  { v: "partner", l: "Strategic partner" },
  { v: "investor", l: "Investor" },
  { v: "creator", l: "Creator / Influencer" },
];

function CollabPage() {
  const [form, setForm] = useState({ name: "", email: "", type: "agency", portfolio_url: "", proposal: "" });
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setLoading(true);

    try {
      // 1. Insert into Firebase collaborations collection
      await insertDoc("collaborations", {
        ...parsed.data,
        status: "pending",
        response_sent: false,
      });

      // 2. Queue notifications
      await insertDoc("notifications", {
        to_email: parsed.data.email,
        subject: "Thanks for your collaboration proposal — Basirah Infinity",
        body: `Hi ${parsed.data.name},\n\nWe received your collaboration proposal. Murtesa Alafi and our team will personally review it within 2 business days.\n\n— Basirah Infinity Studio`,
        kind: "collab-welcome",
        status: "sent",
        sent: true,
      });

      await insertDoc("notifications", {
        to_email: ADMIN_PRIMARY_EMAIL,
        subject: `🤝 Collaboration Proposal: ${parsed.data.type} — ${parsed.data.name}`,
        body: `Name: ${parsed.data.name}\nEmail: ${parsed.data.email}\nType: ${parsed.data.type}\nPortfolio: ${parsed.data.portfolio_url}\n\nProposal:\n${parsed.data.proposal}`,
        kind: "collab-admin",
        status: "queued",
        sent: false,
      });

      setForm({ name: "", email: "", type: "agency", portfolio_url: "", proposal: "" });
      toast.success("Proposal received! Murtesa Alafi & team will respond by email within 2 days.");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to submit proposal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteShell>
      <section className="mx-auto max-w-3xl px-6 pb-10 pt-16 text-center">
        <span className="liquid-glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-neon-cyan">
          <Sparkles className="h-3 w-3" /> Partnerships & Synergies
        </span>
        <h1 className="mt-4 font-display text-5xl font-bold md:text-6xl">
          Build with <span className="text-gradient-brand">Basirah Infinity</span>
        </h1>
        <p className="mt-4 text-muted-foreground text-lg">
          Directed by Murtesa Alafi. We partner with elite agencies, creators, and developers worldwide.
        </p>

        {/* Instant Partner Portal Registration Banner */}
        <div className="mt-6 rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-600/10 p-4 text-center max-w-xl mx-auto shadow-glow">
          <p className="text-xs font-semibold text-amber-200">
            ⚡ Want direct access to the Partner Portal & 20% client referral commissions?
          </p>
          <Link to="/register" search={{ role: "partner" }}>
            <Button size="sm" className="mt-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs shadow-glow hover:brightness-110">
              <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
              Register as Verified Agency Partner
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-20">
        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="liquid-glass space-y-4 rounded-3xl p-8"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="mt-1 bg-white/5" />
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="mt-1 bg-white/5" />
            </div>
            <div>
              <Label>Partner type</Label>
              <select
                className="mt-1 w-full rounded-md border border-white/10 bg-background px-3 py-2 text-sm"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {TYPES.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
              </select>
            </div>
            <div>
              <Label>Portfolio / Website</Label>
              <Input type="url" placeholder="https://" value={form.portfolio_url} onChange={(e) => setForm({ ...form, portfolio_url: e.target.value })} className="mt-1 bg-white/5" />
            </div>
          </div>
          <div>
            <Label>Collaboration Proposal *</Label>
            <Textarea
              rows={7}
              placeholder="Tell us about yourself and what you're proposing to build together…"
              value={form.proposal}
              onChange={(e) => setForm({ ...form, proposal: e.target.value })}
              required
              className="mt-1 bg-white/5"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-gradient-brand text-white shadow-glow">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Submit proposal
          </Button>
        </motion.form>
      </section>
    </SiteShell>
  );
}
