import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SiteShell } from "@/components/SiteShell";
import {
  waitForAuth,
  fetchPartnerProfile,
  savePartnerProfile,
  fetchOrders,
  fetchProjectChannels,
  fetchMessages,
  insertDoc,
  logAudit,
  ADMIN_PRIMARY_EMAIL,
} from "@/integrations/firebase/helpers";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Handshake,
  DollarSign,
  TrendingUp,
  Sparkles,
  Link as LinkIcon,
  Copy,
  Check,
  PlusCircle,
  Briefcase,
  Users,
  Layers,
  Send,
  Calendar,
  ShieldCheck,
  ExternalLink,
  Wallet,
  ArrowUpRight,
  Code2,
  FolderGit2,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/partner-dashboard")({
  head: () => ({
    meta: [
      { title: "Partner Command Portal — Basirah Infinity | Directed by Murtesa Alafi" },
      { name: "description", content: "Executive partner and agency dashboard. Manage client referrals, 20% commission pipeline, co-building sprints, and partner asset vaults." },
    ],
  }),
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const user = await waitForAuth();
    if (!user) throw redirect({ to: "/login" });
  },
  component: PartnerDashboardPage,
});

interface ReferralDeal {
  id: string;
  client_name: string;
  client_email: string;
  client_company: string;
  service: string;
  estimated_amount: number;
  commission: number;
  status: "submitted" | "contracted" | "in_progress" | "paid" | "disbursed";
  created_at: string;
}

export function PartnerDashboardPage() {
  const { user } = useAuth();
  const [partner, setPartner] = useState<any>(null);
  const [deals, setDeals] = useState<ReferralDeal[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<"referrals" | "sprints" | "vault" | "hotline" | "profile">("referrals");

  // Referral Modal
  const [newDealOpen, setNewDealOpen] = useState(false);
  const [dealForm, setDealForm] = useState({
    client_name: "",
    client_email: "",
    client_company: "",
    service: "Web Design & Development",
    estimated_amount: 3500,
    notes: "",
  });

  // Payout Modal
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState("bank");
  const [payoutAddress, setPayoutAddress] = useState("");
  const [payoutAmount, setPayoutAmount] = useState(950);

  // Message Hotline
  const [hotlineMsg, setHotlineMsg] = useState("");
  const [hotlineSending, setHotlineSending] = useState(false);

  // Profile Edit
  const [agencyName, setAgencyName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  async function loadPartnerData() {
    if (!user?.uid) return;
    const profile = await fetchPartnerProfile(user.uid);
    if (profile) {
      setPartner(profile);
      setAgencyName(profile.agency_name || "");
      setSpecialization(profile.specialization || "");
      setPortfolioUrl(profile.portfolio_url || "");
    } else {
      // Default fallback profile
      const defaultProfile = {
        partner_id: user.uid,
        partner_name: user.displayName || "Agency Partner",
        agency_name: "Verified Agency Partner",
        email: user.email || "",
        specialization: "Full-Stack & AI Systems",
        portfolio_url: "",
        status: "verified",
        commission_rate: 20,
        referral_code: `BI-${(user.displayName || "PARTNER").replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 8)}-20`,
        total_referred_revenue: 12500,
        commission_earned: 2500,
        pending_payout: 950,
        active_sprints: 2,
      };
      setPartner(defaultProfile);
      setAgencyName(defaultProfile.agency_name);
      setSpecialization(defaultProfile.specialization);
    }

    // Load initial referral deals from local storage or mock
    try {
      const storedDeals = localStorage.getItem(`bi_partner_deals_${user.uid}`);
      if (storedDeals) {
        setDeals(JSON.parse(storedDeals));
      } else {
        const initialDeals: ReferralDeal[] = [
          {
            id: "deal-1",
            client_name: "Apex Logistics Corp",
            client_email: "contact@apexlogistics.io",
            client_company: "Apex Logistics",
            service: "AI Business Automation & Web Platform",
            estimated_amount: 5500,
            commission: 1100,
            status: "paid",
            created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
          },
          {
            id: "deal-2",
            client_name: "Lumina Skin Clinic",
            client_email: "dr.sarah@luminaskin.com",
            client_company: "Lumina Clinic",
            service: "Branding & High-Conversion Web",
            estimated_amount: 3500,
            commission: 700,
            status: "in_progress",
            created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
          },
          {
            id: "deal-3",
            client_name: "Oasis Real Estate UAE",
            client_email: "invest@oasisdxb.ae",
            client_company: "Oasis Real Estate",
            service: "High-Ticket Client Acquisition Portal",
            estimated_amount: 7500,
            commission: 1500,
            status: "contracted",
            created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
          },
        ];
        setDeals(initialDeals);
        localStorage.setItem(`bi_partner_deals_${user.uid}`, JSON.stringify(initialDeals));
      }
    } catch (e) {}
  }

  useEffect(() => {
    loadPartnerData();
  }, [user?.uid]);

  const referralLink = partner?.referral_code
    ? `https://basirahinfinity.com?ref=${partner.referral_code}`
    : `https://basirahinfinity.com?ref=BI-PARTNER-20`;

  function copyReferralLink() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(referralLink);
      setCopiedLink(true);
      toast.success("Referral link copied to clipboard! Share with prospective clients.");
      setTimeout(() => setCopiedLink(false), 2500);
    }
  }

  async function handleCreateReferral(e: React.FormEvent) {
    e.preventDefault();
    if (!dealForm.client_name.trim() || !dealForm.client_email.trim()) {
      return toast.error("Client name and email required");
    }

    const comm = Math.round(dealForm.estimated_amount * 0.2);
    const newDeal: ReferralDeal = {
      id: `deal-${Date.now()}`,
      client_name: dealForm.client_name.trim(),
      client_email: dealForm.client_email.trim(),
      client_company: dealForm.client_company.trim() || "Private Venture",
      service: dealForm.service,
      estimated_amount: dealForm.estimated_amount,
      commission: comm,
      status: "submitted",
      created_at: new Date().toISOString(),
    };

    const updated = [newDeal, ...deals];
    setDeals(updated);
    if (user?.uid) {
      localStorage.setItem(`bi_partner_deals_${user.uid}`, JSON.stringify(updated));
    }

    // Also register lead into Basirah Infinity leads pipeline
    await insertDoc("leads", {
      name: dealForm.client_name.trim(),
      email: dealForm.client_email.trim(),
      company: dealForm.client_company.trim(),
      service_interest: dealForm.service,
      budget: `$${dealForm.estimated_amount}`,
      message: `Referred by Partner: ${partner?.partner_name || user?.displayName || "Partner"} (${partner?.agency_name || "Agency"}). Notes: ${dealForm.notes}`,
      source: `partner_referral:${partner?.referral_code || "partner"}`,
      tag: "partner_referral",
      status: "new",
    });

    logAudit("partner.deal_submit", "lead", newDeal.id, {
      partner: user?.email,
      client: newDeal.client_email,
      estimated: newDeal.estimated_amount,
      commission: comm,
    });

    toast.success("Client referral registered! Murtesa Alafi will initiate discovery within 12 hours.");
    setNewDealOpen(false);
    setDealForm({
      client_name: "",
      client_email: "",
      client_company: "",
      service: "Web Design & Development",
      estimated_amount: 3500,
      notes: "",
    });
  }

  async function handleSendHotlineMsg(e: React.FormEvent) {
    e.preventDefault();
    if (!hotlineMsg.trim()) return;
    setHotlineSending(true);

    try {
      await insertDoc("messages", {
        sender_id: user?.uid || "partner",
        sender_name: `${user?.displayName || "Partner"} [${partner?.agency_name || "Partner"}]`,
        sender_email: user?.email || "partner@basirahinfinity.com",
        subject: `Partner Priority Channel: Update from ${partner?.agency_name || "Agency"}`,
        body: hotlineMsg.trim(),
        from_role: "partner",
        read: false,
      });

      logAudit("partner.message", "message", undefined, { from: user?.email });
      toast.success("Message dispatched to Murtesa Alafi's priority console!");
      setHotlineMsg("");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to send message");
    } finally {
      setHotlineSending(false);
    }
  }

  async function handleRequestPayout(e: React.FormEvent) {
    e.preventDefault();
    if (!payoutAddress.trim()) {
      return toast.error("Payout destination / account address required");
    }

    await insertDoc("notifications", {
      to_email: ADMIN_PRIMARY_EMAIL,
      subject: `💰 Partner Payout Request: $${payoutAmount} from ${partner?.agency_name || user?.displayName}`,
      body: `Partner ${user?.displayName} (${user?.email}) has requested payout of $${payoutAmount} via ${payoutMethod}.\nDestination Address: ${payoutAddress}`,
      kind: "payout_request",
      status: "queued",
      sent: false,
    });

    logAudit("partner.payout_request", "payout", undefined, {
      amount: payoutAmount,
      method: payoutMethod,
      partner: user?.email,
    });

    toast.success("Payout request submitted! Murtesa Alafi will review and disburse within 24 hours.");
    setPayoutOpen(false);
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.uid) return;
    await savePartnerProfile(user.uid, {
      agency_name: agencyName,
      specialization,
      portfolio_url: portfolioUrl,
    });
    setPartner((prev: any) => ({
      ...prev,
      agency_name: agencyName,
      specialization,
      portfolio_url: portfolioUrl,
    }));
    toast.success("Partner profile updated!");
  }

  return (
    <SiteShell>
      <div className="min-h-screen bg-background bg-mesh pb-20 pt-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header Banner */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-glow">
                  <Handshake className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                      {partner?.agency_name || "Partner Command Portal"}
                    </h1>
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300 shadow-sm">
                      <ShieldCheck className="h-3 w-3" />
                      VERIFIED PARTNER
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Lead Partner: <span className="font-medium text-foreground">{user?.displayName || "Partner Member"}</span> · Direct Alliance with Murtesa Alafi
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                onClick={copyReferralLink}
                variant="outline"
                size="sm"
                className="border-amber-400/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 text-xs"
              >
                {copiedLink ? <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-400" /> : <Copy className="mr-1.5 h-3.5 w-3.5" />}
                Copy 20% Referral Link
              </Button>

              <Button
                onClick={() => setNewDealOpen(true)}
                size="sm"
                className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-black font-semibold shadow-glow text-xs hover:brightness-110"
              >
                <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                Register Client Deal
              </Button>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="liquid-glass rounded-2xl p-5 border border-white/10 relative overflow-hidden">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium uppercase tracking-wider">Total Referred Scale</span>
                <TrendingUp className="h-4 w-4 text-cyan-400" />
              </div>
              <p className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-2">
                ${(partner?.total_referred_revenue || 12500).toLocaleString()}
              </p>
              <p className="text-[11px] text-cyan-400 mt-1 flex items-center gap-1 font-mono">
                <ArrowUpRight className="h-3 w-3" />
                Pipeline value generated
              </p>
            </div>

            <div className="liquid-glass rounded-2xl p-5 border border-amber-400/20 bg-amber-500/[0.03] relative overflow-hidden">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium uppercase tracking-wider">Commission Earned (20%)</span>
                <DollarSign className="h-4 w-4 text-amber-400" />
              </div>
              <p className="font-display text-2xl sm:text-3xl font-bold text-amber-300 mt-2">
                ${(partner?.commission_earned || 2500).toLocaleString()}
              </p>
              <p className="text-[11px] text-amber-400/80 mt-1 font-mono">
                Guaranteed milestone payouts
              </p>
            </div>

            <div className="liquid-glass rounded-2xl p-5 border border-emerald-400/20 bg-emerald-500/[0.03]">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium uppercase tracking-wider">Ready for Withdrawal</span>
                <Wallet className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <p className="font-display text-2xl sm:text-3xl font-bold text-emerald-300">
                  ${(partner?.pending_payout || 950).toLocaleString()}
                </p>
                <Button
                  onClick={() => setPayoutOpen(true)}
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 p-1 font-semibold"
                >
                  Withdraw
                </Button>
              </div>
              <p className="text-[11px] text-emerald-400/80 mt-1 font-mono">
                Wire / PayPal / Crypto
              </p>
            </div>

            <div className="liquid-glass rounded-2xl p-5 border border-white/10">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium uppercase tracking-wider">Active Sprints</span>
                <Briefcase className="h-4 w-4 text-purple-400" />
              </div>
              <p className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-2">
                {deals.length + (partner?.active_sprints || 2)}
              </p>
              <p className="text-[11px] text-purple-400 mt-1 font-mono">
                Live projects & co-builds
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-8 flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("referrals")}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  activeTab === "referrals"
                    ? "bg-gradient-brand text-white shadow-glow"
                    : "liquid-glass text-muted-foreground hover:text-foreground"
                }`}
              >
                Client Referrals ({deals.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("sprints")}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  activeTab === "sprints"
                    ? "bg-gradient-brand text-white shadow-glow"
                    : "liquid-glass text-muted-foreground hover:text-foreground"
                }`}
              >
                Co-Building Sprints
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("vault")}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  activeTab === "vault"
                    ? "bg-gradient-brand text-white shadow-glow"
                    : "liquid-glass text-muted-foreground hover:text-foreground"
                }`}
              >
                Asset Vault & Studio Miracles
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("hotline")}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  activeTab === "hotline"
                    ? "bg-gradient-brand text-white shadow-glow"
                    : "liquid-glass text-muted-foreground hover:text-foreground"
                }`}
              >
                Murtesa Alafi Hotline
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  activeTab === "profile"
                    ? "bg-gradient-brand text-white shadow-glow"
                    : "liquid-glass text-muted-foreground hover:text-foreground"
                }`}
              >
                Partner Profile
              </button>
            </div>
          </div>

          {/* TAB 1: Referrals */}
          {activeTab === "referrals" && (
            <div className="mt-6 space-y-6">
              {/* Custom Referral Link Box */}
              <div className="liquid-glass rounded-3xl p-6 border border-amber-400/20 bg-gradient-to-r from-amber-500/[0.04] via-transparent to-cyan-500/[0.04]">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-amber-400" />
                      Your 20% Commission Referral Link
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Every prospective client who contacts or places an order through your link automatically assigns you 20% of the project contract value.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-2xl p-1.5 px-3">
                    <code className="text-xs font-mono text-cyan-300 truncate max-w-[280px]">
                      {referralLink}
                    </code>
                    <Button
                      onClick={copyReferralLink}
                      size="sm"
                      className="bg-amber-400 text-black hover:bg-amber-300 font-bold text-xs h-8"
                    >
                      {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* On-Screen Direct Deal Registration Card */}
              <div className="liquid-glass rounded-3xl p-6 sm:p-8 border border-white/15 bg-background/90 shadow-elevated">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div>
                    <h3 className="font-display text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
                      <PlusCircle className="h-4 w-4 text-amber-400" /> Register Client Deal & Claim 20% Commission
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Input your client's contact details below to register their project in Murtesa Alafi's queue.
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-mono font-bold text-amber-300 border border-amber-400/30">
                    20% GUARANTEED
                  </span>
                </div>

                <form onSubmit={handleCreateReferral} className="mt-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="inline_deal_name" className="text-xs font-semibold text-foreground">
                        Client Contact Person / Lead <span className="text-amber-400">*</span>
                      </Label>
                      <Input
                        id="inline_deal_name"
                        required
                        value={dealForm.client_name}
                        onChange={(e) => setDealForm({ ...dealForm, client_name: e.target.value })}
                        placeholder="e.g. Tariq Mansoor / Selamawit Bekele"
                        className="mt-1 bg-white/5 border-white/15 text-sm font-medium text-foreground h-10"
                      />
                    </div>
                    <div>
                      <Label htmlFor="inline_deal_email" className="text-xs font-semibold text-foreground">
                        Client Email Address <span className="text-amber-400">*</span>
                      </Label>
                      <Input
                        id="inline_deal_email"
                        type="email"
                        required
                        value={dealForm.client_email}
                        onChange={(e) => setDealForm({ ...dealForm, client_email: e.target.value })}
                        placeholder="client@company.com"
                        className="mt-1 bg-white/5 border-white/15 text-sm font-medium text-foreground h-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="inline_deal_company" className="text-xs font-semibold text-foreground">
                        Company / Brand
                      </Label>
                      <Input
                        id="inline_deal_company"
                        value={dealForm.client_company}
                        onChange={(e) => setDealForm({ ...dealForm, client_company: e.target.value })}
                        placeholder="e.g. Gulf Creative Studio"
                        className="mt-1 bg-white/5 border-white/15 text-sm text-foreground h-10"
                      />
                    </div>
                    <div>
                      <Label htmlFor="inline_deal_service" className="text-xs font-semibold text-foreground">
                        Service Category
                      </Label>
                      <select
                        id="inline_deal_service"
                        value={dealForm.service}
                        onChange={(e) => setDealForm({ ...dealForm, service: e.target.value })}
                        className="mt-1 w-full bg-black/40 border border-white/15 rounded-md px-3 py-2 text-sm text-foreground h-10 focus:outline-none"
                      >
                        <option value="Web Design & Development">Web Design & Development</option>
                        <option value="AI Automation & Agents">AI Automation & Agents</option>
                        <option value="Branding & Visual Identity">Branding & Visual Identity</option>
                        <option value="3D Motion & VFX">3D Motion & VFX</option>
                        <option value="Mobile App Development">Mobile App Development</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="inline_deal_amount" className="text-xs font-semibold text-foreground">
                        Est. Budget ($ USD)
                      </Label>
                      <Input
                        id="inline_deal_amount"
                        type="number"
                        value={dealForm.estimated_amount}
                        onChange={(e) => setDealForm({ ...dealForm, estimated_amount: Number(e.target.value) })}
                        className="mt-1 bg-white/5 border-white/15 text-sm font-bold text-foreground h-10"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
                    <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                      Your Guaranteed 20% Payout: <strong className="text-amber-300 font-bold">${Math.round(dealForm.estimated_amount * 0.2).toLocaleString()} USD</strong>
                    </div>

                    <Button
                      type="submit"
                      className="bg-gradient-brand text-white font-bold text-xs h-10 px-6 shadow-glow hover:brightness-110 flex items-center gap-1.5"
                    >
                      <PlusCircle className="h-4 w-4" />
                      Register Deal with Murtesa Alafi
                    </Button>
                  </div>
                </form>
              </div>

              {/* Referral Deals List */}
              <div className="liquid-glass rounded-3xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground">Referred Client Deals</h3>
                    <p className="text-xs text-muted-foreground">Real-time status of your client pipeline and commission disbursements.</p>
                  </div>
                  <Button
                    onClick={() => setNewDealOpen(true)}
                    size="sm"
                    className="bg-gradient-brand text-white text-xs shadow-glow"
                  >
                    <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
                    New Referral
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-white/10 text-muted-foreground uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="pb-3 font-semibold">Client / Company</th>
                        <th className="pb-3 font-semibold">Service</th>
                        <th className="pb-3 font-semibold">Deal Value</th>
                        <th className="pb-3 font-semibold text-amber-300">Your Commission (20%)</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {deals.map((deal) => (
                        <tr key={deal.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 font-medium text-foreground">
                            <div>{deal.client_name}</div>
                            <div className="text-[11px] text-muted-foreground">{deal.client_company} · {deal.client_email}</div>
                          </td>
                          <td className="py-3.5 text-muted-foreground">{deal.service}</td>
                          <td className="py-3.5 font-bold text-foreground">${deal.estimated_amount.toLocaleString()}</td>
                          <td className="py-3.5 font-bold text-amber-300">${deal.commission.toLocaleString()}</td>
                          <td className="py-3.5">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${
                                deal.status === "paid"
                                  ? "bg-emerald-500/10 text-emerald-300 border border-emerald-400/30"
                                  : deal.status === "in_progress"
                                  ? "bg-blue-500/10 text-blue-300 border border-blue-400/30"
                                  : deal.status === "contracted"
                                  ? "bg-purple-500/10 text-purple-300 border border-purple-400/30"
                                  : "bg-amber-500/10 text-amber-300 border border-amber-400/30"
                              }`}
                            >
                              {deal.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="py-3.5 text-muted-foreground">
                            {new Date(deal.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Co-building Sprints */}
          {activeTab === "sprints" && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="liquid-glass rounded-3xl p-6 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-cyan-400/10 border border-cyan-400/30 px-2.5 py-0.5 text-[10px] font-mono text-cyan-300">
                    SPRINT // LIVE_CO_BUILD
                  </span>
                  <span className="text-xs text-muted-foreground">Milestone 2 of 3</span>
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">
                  Northwave Sovereign AI Cluster
                </h3>
                <p className="text-xs text-muted-foreground">
                  Partner sprint: Frontend integration of interactive AI swarm canvas and WebSockets streaming logic.
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Sprint Budget Allocation</span>
                    <span className="font-bold text-foreground">$2,800 USD</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Target Delivery Date</span>
                    <span className="font-mono text-cyan-300">In 6 Days</span>
                  </div>
                </div>
                <div className="pt-2 flex gap-2">
                  <Button size="sm" className="bg-gradient-brand text-white text-xs shadow-glow">
                    <FolderGit2 className="mr-1.5 h-3.5 w-3.5" />
                    Open Partner Repo
                  </Button>
                  <Button size="sm" variant="outline" className="border-white/10 text-xs">
                    Submit Milestone Code
                  </Button>
                </div>
              </div>

              <div className="liquid-glass rounded-3xl p-6 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-purple-400/10 border border-purple-400/30 px-2.5 py-0.5 text-[10px] font-mono text-purple-300">
                    DESIGN SYSTEM // TOKENS
                  </span>
                  <span className="text-xs text-muted-foreground">Milestone 1 of 2</span>
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">
                  Halo Beauty 3D E-Commerce Rebrand
                </h3>
                <p className="text-xs text-muted-foreground">
                  Partner sprint: Crafting luxury mobile interactive 3D product visualizer and dark-glass checkout states.
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Sprint Budget Allocation</span>
                    <span className="font-bold text-foreground">$1,950 USD</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Target Delivery Date</span>
                    <span className="font-mono text-purple-300">In 11 Days</span>
                  </div>
                </div>
                <div className="pt-2 flex gap-2">
                  <Button size="sm" className="bg-purple-600 text-white text-xs shadow-glow hover:bg-purple-500">
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                    Open Figma Tokens
                  </Button>
                  <Button size="sm" variant="outline" className="border-white/10 text-xs">
                    View Brief
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Asset Vault */}
          {activeTab === "vault" && (
            <div className="mt-6 space-y-6">
              <div className="liquid-glass rounded-3xl p-6 border border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                      <Code2 className="h-5 w-5 text-cyan-400" />
                      Basirah Infinity Component Vault (100+ Pro Miracles)
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      As a verified partner, you have full license to integrate Basirah Infinity's 50+ background styles and 100+ miracle components into client deliveries.
                    </p>
                  </div>
                  <Link to="/studio">
                    <Button className="bg-gradient-brand text-white text-xs shadow-glow">
                      Open Studio Component Library
                      <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                    <h4 className="font-bold text-sm text-foreground">50+ Background Presets</h4>
                    <p className="text-xs text-muted-foreground mt-1">Water glass, brushed chrome, 24K imperial gold, and obsidian void backgrounds.</p>
                    <Link to="/studio">
                      <Button size="sm" variant="ghost" className="mt-3 text-cyan-400 text-xs p-0 h-auto">
                        Browse 50 Styles &rarr;
                      </Button>
                    </Link>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                    <h4 className="font-bold text-sm text-foreground">100+ Miracle Components</h4>
                    <p className="text-xs text-muted-foreground mt-1">Sovereign buttons, bento cards, AI agent feeds, high-conversion checkouts, and docks.</p>
                    <Link to="/studio">
                      <Button size="sm" variant="ghost" className="mt-3 text-cyan-400 text-xs p-0 h-auto">
                        Inspect Components &rarr;
                      </Button>
                    </Link>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                    <h4 className="font-bold text-sm text-foreground">Brand Asset Generator</h4>
                    <p className="text-xs text-muted-foreground mt-1">Export vector SVGs and high-res PNG brand tokens directly from the Studio engine.</p>
                    <Link to="/studio">
                      <Button size="sm" variant="ghost" className="mt-3 text-cyan-400 text-xs p-0 h-auto">
                        Launch Generator &rarr;
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Hotline with Murtesa Alafi */}
          {activeTab === "hotline" && (
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 liquid-glass rounded-3xl p-6 border border-white/10">
                <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                  <Send className="h-4 w-4 text-cyan-400" />
                  Direct Priority Hotline with Murtesa Alafi
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Send high-priority briefs, custom project proposals, or co-building proposals straight to Murtesa's executive inbox.
                </p>

                <form onSubmit={handleSendHotlineMsg} className="mt-6 space-y-4">
                  <div>
                    <Label htmlFor="hotlineMsg" className="text-xs">Your Message / Brief</Label>
                    <Textarea
                      id="hotlineMsg"
                      required
                      rows={5}
                      value={hotlineMsg}
                      onChange={(e) => setHotlineMsg(e.target.value)}
                      placeholder="Hi Murtesa, I have an enterprise fintech client looking for an AI automated onboarding system. Here are the parameters..."
                      className="mt-1 bg-white/5 border-white/10 text-xs"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={hotlineSending}
                    className="bg-gradient-brand text-white text-xs shadow-glow"
                  >
                    {hotlineSending ? "Dispatching..." : "Send to Murtesa Alafi"}
                  </Button>
                </form>
              </div>

              <div className="liquid-glass rounded-3xl p-6 border border-white/10 space-y-4">
                <h4 className="font-display font-bold text-foreground">Partner Advisory & Strategy Sync</h4>
                <p className="text-xs text-muted-foreground">
                  Book a direct 30-minute strategic architecture call with Murtesa Alafi to align on high-ticket client bids.
                </p>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs space-y-2">
                  <p className="text-muted-foreground"><strong className="text-foreground">Phone:</strong> +251 708 229 717</p>
                  <p className="text-muted-foreground"><strong className="text-foreground">Email:</strong> basirahinfinity@gmail.com</p>
                  <p className="text-muted-foreground"><strong className="text-foreground">Location:</strong> Addis Ababa, Ethiopia · Global Remote</p>
                </div>
                <a
                  href="https://wa.me/251708229717"
                  target="_blank"
                  rel="noreferrer"
                  className="block"
                >
                  <Button variant="outline" className="w-full border-emerald-400/30 text-emerald-300 bg-emerald-500/10 text-xs">
                    Direct WhatsApp with Murtesa
                  </Button>
                </a>
              </div>
            </div>
          )}

          {/* TAB 5: Profile */}
          {activeTab === "profile" && (
            <div className="mt-6 max-w-2xl liquid-glass rounded-3xl p-6 border border-white/10">
              <h3 className="font-display text-lg font-bold text-foreground">Agency & Partner Profile</h3>
              <p className="text-xs text-muted-foreground mt-1">Manage your public partner credentials and specialization details.</p>

              <form onSubmit={handleSaveProfile} className="mt-6 space-y-4">
                <div>
                  <Label htmlFor="agencyName" className="text-xs">Agency / Studio Name</Label>
                  <Input
                    id="agencyName"
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    className="mt-1 bg-white/5 border-white/10 text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="specialization" className="text-xs">Core Specialization</Label>
                  <Input
                    id="specialization"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="mt-1 bg-white/5 border-white/10 text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="portfolioUrl" className="text-xs">Portfolio / Showcase URL</Label>
                  <Input
                    id="portfolioUrl"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    className="mt-1 bg-white/5 border-white/10 text-xs"
                  />
                </div>
                <Button type="submit" className="bg-gradient-brand text-white text-xs shadow-glow">
                  Update Partner Profile
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Register Deal Dialog */}
      <Dialog open={newDealOpen} onOpenChange={setNewDealOpen}>
        <DialogContent className="liquid-glass border-white/20 bg-background/95 sm:max-w-xl max-h-[92vh] overflow-y-auto p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold text-foreground">
              Register Client Referral
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateReferral} className="space-y-4 mt-2">
            <div>
              <Label htmlFor="deal_name" className="text-xs">Client Contact Name</Label>
              <Input
                id="deal_name"
                required
                value={dealForm.client_name}
                onChange={(e) => setDealForm({ ...dealForm, client_name: e.target.value })}
                placeholder="e.g. Tariq Mansoor"
                className="mt-1 bg-white/5 border-white/10 text-xs"
              />
            </div>
            <div>
              <Label htmlFor="deal_email" className="text-xs">Client Email</Label>
              <Input
                id="deal_email"
                type="email"
                required
                value={dealForm.client_email}
                onChange={(e) => setDealForm({ ...dealForm, client_email: e.target.value })}
                placeholder="client@company.com"
                className="mt-1 bg-white/5 border-white/10 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="deal_company" className="text-xs">Company / Brand</Label>
                <Input
                  id="deal_company"
                  value={dealForm.client_company}
                  onChange={(e) => setDealForm({ ...dealForm, client_company: e.target.value })}
                  placeholder="Acme Corp"
                  className="mt-1 bg-white/5 border-white/10 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="deal_amount" className="text-xs">Est. Project Budget ($)</Label>
                <Input
                  id="deal_amount"
                  type="number"
                  value={dealForm.estimated_amount}
                  onChange={(e) => setDealForm({ ...dealForm, estimated_amount: Number(e.target.value) })}
                  className="mt-1 bg-white/5 border-white/10 text-xs"
                />
              </div>
            </div>
            <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-xs text-amber-200">
              Your Estimated Commission: <strong className="text-amber-300 font-bold">${Math.round(dealForm.estimated_amount * 0.2).toLocaleString()} USD (20%)</strong> upon project settlement.
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setNewDealOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-brand text-white text-xs shadow-glow">
                Submit Deal to Murtesa Alafi
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payout Dialog */}
      <Dialog open={payoutOpen} onOpenChange={setPayoutOpen}>
        <DialogContent className="liquid-glass border-white/20 bg-background/95 sm:max-w-xl max-h-[92vh] overflow-y-auto p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold text-foreground">
              Request Commission Withdrawal
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRequestPayout} className="space-y-4 mt-2">
            <div>
              <Label className="text-xs">Available Balance</Label>
              <p className="font-display text-2xl font-bold text-emerald-300 mt-1">
                ${(partner?.pending_payout || 950).toLocaleString()} USD
              </p>
            </div>
            <div>
              <Label htmlFor="payout_amount" className="text-xs">Withdrawal Amount ($)</Label>
              <Input
                id="payout_amount"
                type="number"
                max={partner?.pending_payout || 950}
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(Number(e.target.value))}
                className="mt-1 bg-white/5 border-white/10 text-xs"
              />
            </div>
            <div>
              <Label className="text-xs">Payout Method</Label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {["bank", "paypal", "crypto"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPayoutMethod(m)}
                    className={`rounded-xl py-2 text-xs font-semibold uppercase ${
                      payoutMethod === m ? "bg-emerald-500 text-black font-bold" : "bg-white/5 text-muted-foreground"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="payout_address" className="text-xs">
                {payoutMethod === "bank" ? "Bank Wire IBAN / Swift & Account Name" : payoutMethod === "paypal" ? "PayPal Email" : "USDT (TRC20 / ERC20) Address"}
              </Label>
              <Input
                id="payout_address"
                required
                value={payoutAddress}
                onChange={(e) => setPayoutAddress(e.target.value)}
                placeholder={payoutMethod === "bank" ? "IBAN / Swift code and account name" : payoutMethod === "paypal" ? "account@paypal.com" : "0x... or T..."}
                className="mt-1 bg-white/5 border-white/10 text-xs"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setPayoutOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs">
                Confirm Withdrawal Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SiteShell>
  );
}
export default PartnerDashboardPage;

