import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SiteShell } from "@/components/SiteShell";
import { useAuth } from "@/lib/auth";
import {
  fetchOrders,
  fetchMessages,
  insertDoc,
  ADMIN_PRIMARY_EMAIL,
  fetchProjectChannels,
  createProjectChannel,
  updateProjectChannel,
  fetchUserProfile,
  saveUserProfile,
} from "@/integrations/firebase/helpers";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ShoppingBag,
  MessageSquare,
  Send,
  Loader2,
  Sparkles,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Shield,
  Layers,
  ExternalLink,
  FileText,
  Check,
  CreditCard,
  ArrowRight,
  Download,
  Star,
  Award,
  Briefcase,
  Calendar,
  Building,
  Mail,
  Receipt,
  FileCheck2,
  Flame,
  BadgeCheck,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Client Portal & Consultation — Basirah Infinity | Directed by Murtesa Alafi" },
      { name: "description", content: "Client portal with project consultation, requirement specifications, order milestones, and delivery channels." },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { name: "googlebot", content: "noindex, nofollow, noarchive" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user, role } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<any | null>(null);

  // Profile State
  const [profile, setProfile] = useState({
    displayName: "",
    company: "",
    phone: "",
    roleTitle: "Enterprise Client",
    avatarInitial: "B",
  });
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // New Consultation Form & Dialog State
  const [newConsultDialogOpen, setNewConsultDialogOpen] = useState(false);
  const [showInlineConsultForm, setShowInlineConsultForm] = useState(false);
  const [newConsultName, setNewConsultName] = useState("");
  const [newConsultEmail, setNewConsultEmail] = useState("");
  const [newConsultCompany, setNewConsultCompany] = useState("");
  const [newConsultPhone, setNewConsultPhone] = useState("");
  const [newConsultTitle, setNewConsultTitle] = useState("");
  const [newConsultBrief, setNewConsultBrief] = useState("");
  const [creatingConsult, setCreatingConsult] = useState(false);

  // Answers State for Discovery Questionnaire
  const [answersMap, setAnswersMap] = useState<Record<string, string>>({});
  const [savingAnswers, setSavingAnswers] = useState(false);

  // Payment Checkout Dialog
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "telebirr" | "cbe">("telebirr");
  const [telebirrPhone, setTelebirrPhone] = useState("+251 ");
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);

  // Direct Message to Admin
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Client signoff rating
  const [rating, setRating] = useState(5);
  const [testimonial, setTestimonial] = useState("");
  const [submittedReview, setSubmittedReview] = useState(false);

  async function loadData() {
    if (!user) return;
    setLoadingData(true);
    try {
      const [allOrders, allMsgs, allChannels, userProf] = await Promise.all([
        fetchOrders(),
        fetchMessages(),
        fetchProjectChannels(),
        fetchUserProfile(user.uid),
      ]);

      // Filter orders
      const userOrders = allOrders.filter(
        (o) =>
          !o.client_email ||
          o.client_email?.toLowerCase() === user.email?.toLowerCase() ||
          o.client_id === user.uid ||
          user.email?.toLowerCase() === ADMIN_PRIMARY_EMAIL.toLowerCase()
      );
      setOrders(userOrders);

      // Filter messages
      const userMsgs = allMsgs.filter(
        (m) =>
          m.sender_email?.toLowerCase() === user.email?.toLowerCase() ||
          m.sender_id === user.uid ||
          user.email?.toLowerCase() === ADMIN_PRIMARY_EMAIL.toLowerCase()
      );
      setMessages(userMsgs);

      // Filter project channels
      const userChannels = allChannels.filter(
        (c) =>
          !c.client_email ||
          c.client_email?.toLowerCase() === user.email?.toLowerCase() ||
          c.client_id === user.uid ||
          user.email?.toLowerCase() === ADMIN_PRIMARY_EMAIL.toLowerCase()
      );
      setChannels(userChannels);

      // Set default selected channel
      if (userChannels.length > 0 && !selectedChannel) {
        setSelectedChannel(userChannels[0]);
      } else if (selectedChannel) {
        // Refresh currently active channel
        const refreshed = userChannels.find((c) => c.id === selectedChannel.id);
        if (refreshed) setSelectedChannel(refreshed);
      }

      // Populate user profile
      const name = userProf?.displayName || user.displayName || user.email?.split("@")[0] || "Valued Client";
      const comp = userProf?.company || "";
      const ph = userProf?.phone || "";
      setProfile({
        displayName: name,
        company: comp || "Strategic Client",
        phone: ph || "+251 708 229 717",
        roleTitle: userProf?.roleTitle || "Verified Client",
        avatarInitial: name.charAt(0).toUpperCase() || "B",
      });

      // Pre-populate consultation form inputs so they are never blank or hidden
      setNewConsultName((prev) => prev || name);
      setNewConsultEmail((prev) => prev || user.email || "");
      setNewConsultCompany((prev) => prev || comp);
      setNewConsultPhone((prev) => prev || ph);
    } catch (e) {
      console.error("Dashboard loadData error:", e);
    } finally {
      setLoadingData(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [user]);

  // Synchronize questionnaire answers when active channel changes
  useEffect(() => {
    if (selectedChannel?.questions) {
      const map: Record<string, string> = {};
      selectedChannel.questions.forEach((q: any) => {
        map[q.id] = q.answer || "";
      });
      setAnswersMap(map);
    }
  }, [selectedChannel]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    try {
      await saveUserProfile(user.uid, profile);
      toast.success("Profile updated successfully!");
      setProfileDialogOpen(false);
    } catch (e: any) {
      toast.error(e.message ?? "Failed to save profile");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleCreateConsultation(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const finalTitle = newConsultTitle.trim();
    const finalName = newConsultName.trim() || profile.displayName || user.displayName || "Client";
    if (!finalTitle) {
      toast.error("Please enter a project title");
      return;
    }
    if (!finalName) {
      toast.error("Please enter your name");
      return;
    }
    setCreatingConsult(true);
    try {
      const channelId = await createProjectChannel({
        client_id: user.uid,
        client_name: finalName,
        client_email: newConsultEmail.trim() || user.email || "",
        client_company: newConsultCompany.trim() || profile.company || undefined,
        client_phone: newConsultPhone.trim() || profile.phone || undefined,
        project_title: finalTitle,
        initial_brief: newConsultBrief.trim(),
      });
      toast.success("Project Consultation Channel opened with Murtesa Alafi!");
      setNewConsultDialogOpen(false);
      setShowInlineConsultForm(false);
      setNewConsultTitle("");
      setNewConsultBrief("");
      await loadData();
      const updated = await fetchProjectChannels();
      const created = updated.find((c) => c.id === channelId);
      if (created) setSelectedChannel(created);
    } catch (e: any) {
      toast.error(e.message ?? "Failed to open consultation channel");
    } finally {
      setCreatingConsult(false);
    }
  }

  async function handleSubmitAnswers() {
    if (!selectedChannel) return;
    setSavingAnswers(true);
    try {
      const updatedQuestions = selectedChannel.questions.map((q: any) => ({
        ...q,
        answer: answersMap[q.id] || "",
        answered: Boolean((answersMap[q.id] || "").trim()),
      }));

      await updateProjectChannel(selectedChannel.id, {
        questions: updatedQuestions,
        status: "discovery",
      });

      // Notify admin
      await insertDoc("messages", {
        sender_id: user?.uid ?? "client",
        sender_name: profile.displayName,
        sender_email: user?.email,
        subject: `Discovery Answers Submitted: ${selectedChannel.project_title}`,
        body: `Client ${profile.displayName} (${user?.email}) has submitted all discovery questionnaire answers. Ready to compose Requirement Specification Document (RSD).`,
        from_role: "client",
        read: false,
      });

      toast.success("Answers submitted to Murtesa Alafi! The Requirement Specification Document is being drafted.");
      await loadData();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to submit answers");
    } finally {
      setSavingAnswers(false);
    }
  }

  async function handleConfirmSpecification() {
    if (!selectedChannel || !selectedChannel.specification) return;
    try {
      const spec = {
        ...selectedChannel.specification,
        client_confirmed: true,
        confirmed_at: new Date().toISOString(),
      };
      await updateProjectChannel(selectedChannel.id, {
        specification: spec,
        status: "confirmed",
      });
      toast.success("Specification Confirmed! You can now proceed to payment.");
      await loadData();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to confirm specification");
    }
  }

  async function handleCompletePayment() {
    if (!selectedChannel || !selectedChannel.specification) return;
    setProcessingPayment(true);
    try {
      const amount = selectedChannel.specification.total_amount || 2400;
      const currency = selectedChannel.specification.currency || "USD";
      const txId = `tx_bi_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      const receiptNo = `REC-BI-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const paymentData = {
        paid: true,
        paid_at: new Date().toISOString(),
        amount_paid: amount,
        currency,
        payment_method:
          paymentMethod === "telebirr"
            ? "Telebirr (+251)"
            : paymentMethod === "cbe"
            ? "CBE Birr / Bank"
            : "Card (Stripe)",
        transaction_id: txId,
        receipt_number: receiptNo,
      };

      await updateProjectChannel(selectedChannel.id, {
        payment: paymentData,
        status: "in_development",
      });

      // Also create an order record for cross-referencing
      await insertDoc("orders", {
        client_id: user?.uid,
        client_name: profile.displayName,
        client_email: user?.email,
        service: selectedChannel.project_title,
        package: selectedChannel.specification.title || "Custom Specification",
        amount,
        notes: `Paid via ${paymentData.payment_method}. Transaction ID: ${txId}`,
        status: "in_progress",
      });

      // Create confirmation notification
      await insertDoc("notifications", {
        to_email: user?.email,
        subject: `Payment Confirmed & Sprint Activated: ${selectedChannel.project_title}`,
        body: `Thank you ${profile.displayName}. Your payment of ${currency} ${amount.toLocaleString()} was successfully processed (Receipt: ${receiptNo}). Murtesa Alafi and the Basirah Infinity engineering team have officially begun development.`,
        kind: "payment-receipt",
        status: "sent",
        sent: true,
      });

      toast.success("Payment confirmed! Official receipt generated and sprint activated.");
      setCheckoutDialogOpen(false);
      setReceiptDialogOpen(true);
      await loadData();
    } catch (e: any) {
      toast.error(e.message ?? "Payment processing failed");
    } finally {
      setProcessingPayment(false);
    }
  }

  async function sendToAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!body.trim()) {
      toast.error("Please enter a message.");
      return;
    }
    setSending(true);
    try {
      await insertDoc("messages", {
        sender_id: user.uid,
        sender_name: profile.displayName || user.displayName || user.email || "Client",
        sender_email: user.email,
        subject: subject.trim() || "Client Inquiry",
        body: body.trim(),
        from_role: role ?? "client",
        read: false,
      });
      setSubject("");
      setBody("");
      toast.success("Message dispatched to Murtesa Alafi & Basirah Infinity team!");
      loadData();
    } catch (error: any) {
      toast.error(error.message ?? "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  return (
    <SiteShell>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {/* TOP PROFILE & WELCOME BANNER */}
        <div className="liquid-glass rounded-3xl p-6 md:p-8 shadow-elevated">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* User Profile Card */}
            <div className="flex items-center gap-5">
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-brand text-2xl font-bold text-white shadow-glow">
                {profile.avatarInitial}
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-background">
                  <Check className="h-3 w-3" />
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                    {profile.displayName}
                  </h1>
                  <span className="liquid-glass rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neon-cyan">
                    {profile.roleTitle}
                  </span>
                  {role === "admin" && (
                    <span className="rounded-full bg-neon-magenta/20 px-2.5 py-0.5 text-[10px] font-semibold text-neon-magenta border border-neon-magenta/30">
                      Founder / Admin
                    </span>
                  )}
                  {role === "partner" && (
                    <Link to="/partner-dashboard">
                      <span className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-1 text-[10px] font-bold text-black border border-amber-300 shadow-glow cursor-pointer hover:brightness-110">
                        ⚡ Switch to Partner Portal & Referrals
                      </span>
                    </Link>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-neon-cyan" /> {user?.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Building className="h-3.5 w-3.5 text-neon-cyan" /> {profile.company}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-neon-cyan" /> {profile.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProfileDialogOpen(true)}
                className="gap-1.5 border-white/10 bg-white/5"
              >
                <User className="h-4 w-4" /> Edit Profile
              </Button>
              <Button
                size="sm"
                onClick={() => setNewConsultDialogOpen(true)}
                className="bg-gradient-brand text-white shadow-glow gap-1.5"
              >
                <Sparkles className="h-4 w-4" /> Start Project Consultation
              </Button>
              {role === "admin" && (
                <Button asChild size="sm" variant="outline" className="border-neon-cyan/40 text-neon-cyan">
                  <Link to="/admin">
                    <Shield className="h-4 w-4" /> Admin Console
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-6 sm:grid-cols-4">
            <div className="rounded-xl bg-white/[0.03] p-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Active Channels</p>
              <p className="mt-1 font-display text-xl font-bold text-foreground">{channels.length}</p>
            </div>
            <div className="rounded-xl bg-white/[0.03] p-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Direct Orders</p>
              <p className="mt-1 font-display text-xl font-bold text-foreground">{orders.length}</p>
            </div>
            <div className="rounded-xl bg-white/[0.03] p-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Lead Architect</p>
              <p className="mt-1 font-display text-sm font-bold text-neon-cyan">Murtesa Alafi</p>
            </div>
            <div className="rounded-xl bg-white/[0.03] p-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Studio Status</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Sprints Open
              </p>
            </div>
          </div>
        </div>

        {/* MAIN INTERACTIVE SECTION */}
        <div className="mt-8">
          <Tabs defaultValue="consultation" className="w-full">
            <TabsList className="glass border border-white/10 p-1">
              <TabsTrigger value="consultation" className="gap-2">
                <FileCheck2 className="h-4 w-4" /> Project Specification & Consultation ({channels.length})
              </TabsTrigger>
              <TabsTrigger value="orders" className="gap-2">
                <ShoppingBag className="h-4 w-4" /> Project Orders ({orders.length})
              </TabsTrigger>
              <TabsTrigger value="messages" className="gap-2">
                <MessageSquare className="h-4 w-4" /> Direct Messages ({messages.length})
              </TabsTrigger>
            </TabsList>

            {/* TAB: PROJECT CONSULTATION & SPECIFICATION CHANNEL */}
            <TabsContent value="consultation" className="mt-6 space-y-6">
              {/* If no channels yet, display the full creation form directly on screen */}
              {channels.length === 0 ? (
                <div className="liquid-glass rounded-3xl p-6 sm:p-10 border border-white/15 bg-background/90 shadow-elevated">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/10">
                    <div>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs font-mono font-bold text-cyan-300">
                        <Sparkles className="h-3.5 w-3.5" /> DIRECT DISCOVERY WITH MURTESA ALAFI
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-2">
                        Open Your Project Consultation Channel
                      </h3>
                      <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-2xl">
                        Fill in your name and project requirements below. Your dedicated consultation channel, discovery questionnaire, and custom Requirement Specification Document (RSD) will be initialized immediately on your screen.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleCreateConsultation} className="mt-6 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="inline-name" className="text-xs font-semibold text-foreground">
                          Your Full Name <span className="text-neon-cyan">*</span>
                        </Label>
                        <Input
                          id="inline-name"
                          value={newConsultName}
                          onChange={(e) => setNewConsultName(e.target.value)}
                          placeholder="e.g. Selamawit Bekele / Tariq Mansoor"
                          className="mt-1.5 bg-white/5 border-white/15 text-sm font-medium text-foreground h-11"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="inline-email" className="text-xs font-semibold text-foreground">
                          Your Email Address <span className="text-neon-cyan">*</span>
                        </Label>
                        <Input
                          id="inline-email"
                          type="email"
                          value={newConsultEmail}
                          onChange={(e) => setNewConsultEmail(e.target.value)}
                          placeholder="client@company.com"
                          className="mt-1.5 bg-white/5 border-white/15 text-sm font-medium text-foreground h-11"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="inline-company" className="text-xs font-semibold text-foreground">
                          Company / Brand Organization
                        </Label>
                        <Input
                          id="inline-company"
                          value={newConsultCompany}
                          onChange={(e) => setNewConsultCompany(e.target.value)}
                          placeholder="e.g. AddisTech / Gulf Creative"
                          className="mt-1.5 bg-white/5 border-white/15 text-sm text-foreground h-11"
                        />
                      </div>
                      <div>
                        <Label htmlFor="inline-phone" className="text-xs font-semibold text-foreground">
                          Direct Phone / WhatsApp
                        </Label>
                        <Input
                          id="inline-phone"
                          value={newConsultPhone}
                          onChange={(e) => setNewConsultPhone(e.target.value)}
                          placeholder="+251 911 234 567"
                          className="mt-1.5 bg-white/5 border-white/15 text-sm text-foreground h-11"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="inline-title" className="text-xs font-semibold text-foreground">
                        Project Title / System Requirement <span className="text-neon-cyan">*</span>
                      </Label>
                      <Input
                        id="inline-title"
                        value={newConsultTitle}
                        onChange={(e) => setNewConsultTitle(e.target.value)}
                        placeholder="e.g. Autonomous AI Client Onboarding System & Luxury Web Platform"
                        className="mt-1.5 bg-white/5 border-white/15 text-sm font-bold text-foreground h-11"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="inline-brief" className="text-xs font-semibold text-foreground">
                        Initial Brief, Goals & Vision (Optional)
                      </Label>
                      <Textarea
                        id="inline-brief"
                        value={newConsultBrief}
                        onChange={(e) => setNewConsultBrief(e.target.value)}
                        placeholder="Detail your goals, tech preferences, target timeline, and any assets you already have..."
                        rows={4}
                        className="mt-1.5 bg-white/5 border-white/15 text-sm text-foreground"
                      />
                    </div>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        disabled={creatingConsult}
                        className="w-full sm:w-auto px-8 py-3 h-12 bg-gradient-brand text-white font-bold text-sm shadow-glow hover:brightness-110 flex items-center justify-center gap-2"
                      >
                        {creatingConsult ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        Open Project Consultation Channel with Murtesa Alafi
                      </Button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Top Bar with On-Screen Open Channel Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 liquid-glass rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center gap-2">
                      <FileCheck2 className="h-5 w-5 text-neon-cyan" />
                      <div>
                        <h4 className="font-display text-sm font-bold text-foreground">Project Consultation Hub</h4>
                        <p className="text-[11px] text-muted-foreground">{channels.length} active consultation channel(s) with Murtesa Alafi</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setShowInlineConsultForm((prev) => !prev)}
                      className="bg-gradient-brand text-white font-semibold text-xs shadow-glow"
                    >
                      {showInlineConsultForm ? "✕ Close Channel Form" : "+ Open Another Consultation Channel"}
                    </Button>
                  </div>

                  {/* Inline On-Screen Creation Form (when toggled on) */}
                  {showInlineConsultForm && (
                    <div className="liquid-glass rounded-3xl p-6 sm:p-8 border border-cyan-400/30 bg-background/95 shadow-glow">
                      <div className="flex items-center justify-between pb-4 border-b border-white/10">
                        <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-cyan-400" /> Open Additional Consultation Channel
                        </h3>
                        <Button size="sm" variant="ghost" onClick={() => setShowInlineConsultForm(false)} className="text-xs">
                          Close
                        </Button>
                      </div>

                      <form onSubmit={handleCreateConsultation} className="mt-4 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="inline-add-name" className="text-xs font-semibold">Your Name *</Label>
                            <Input
                              id="inline-add-name"
                              value={newConsultName}
                              onChange={(e) => setNewConsultName(e.target.value)}
                              placeholder="Your full name"
                              className="mt-1 bg-white/5 border-white/10 text-xs"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="inline-add-email" className="text-xs font-semibold">Your Email *</Label>
                            <Input
                              id="inline-add-email"
                              type="email"
                              value={newConsultEmail}
                              onChange={(e) => setNewConsultEmail(e.target.value)}
                              placeholder="client@company.com"
                              className="mt-1 bg-white/5 border-white/10 text-xs"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="inline-add-comp" className="text-xs font-semibold">Company</Label>
                            <Input
                              id="inline-add-comp"
                              value={newConsultCompany}
                              onChange={(e) => setNewConsultCompany(e.target.value)}
                              placeholder="Brand or agency"
                              className="mt-1 bg-white/5 border-white/10 text-xs"
                            />
                          </div>
                          <div>
                            <Label htmlFor="inline-add-phone" className="text-xs font-semibold">Phone / WhatsApp</Label>
                            <Input
                              id="inline-add-phone"
                              value={newConsultPhone}
                              onChange={(e) => setNewConsultPhone(e.target.value)}
                              placeholder="+251 ..."
                              className="mt-1 bg-white/5 border-white/10 text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="inline-add-title" className="text-xs font-semibold">Project Title *</Label>
                          <Input
                            id="inline-add-title"
                            value={newConsultTitle}
                            onChange={(e) => setNewConsultTitle(e.target.value)}
                            placeholder="e.g. NextGen Mobile Banking Application"
                            className="mt-1 bg-white/5 border-white/10 text-xs font-bold"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="inline-add-brief" className="text-xs font-semibold">Initial Brief / Vision</Label>
                          <Textarea
                            id="inline-add-brief"
                            value={newConsultBrief}
                            onChange={(e) => setNewConsultBrief(e.target.value)}
                            placeholder="Brief project summary..."
                            rows={3}
                            className="mt-1 bg-white/5 border-white/10 text-xs"
                          />
                        </div>

                        <Button type="submit" disabled={creatingConsult} className="bg-gradient-brand text-white font-bold text-xs shadow-glow">
                          {creatingConsult ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Sparkles className="h-4 w-4 mr-1" />}
                          Open Channel
                        </Button>
                      </form>
                    </div>
                  )}

                  <div className="grid gap-6 lg:grid-cols-12">
                    {/* Left: Channel Selector List */}
                    <div className="lg:col-span-4 space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Your Channels
                        </h3>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setNewConsultDialogOpen(true)}
                          className="h-7 text-xs text-neon-cyan hover:bg-neon-cyan/10"
                        >
                          + New Channel
                        </Button>
                      </div>

                      <div className="space-y-2">
                      {channels.map((c) => {
                        const isSelected = selectedChannel?.id === c.id;
                        return (
                          <div
                            key={c.id}
                            onClick={() => setSelectedChannel(c)}
                            className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                              isSelected
                                ? "border-neon-cyan bg-neon-cyan/10 shadow-glow"
                                : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-display text-sm font-bold text-foreground line-clamp-1">
                                {c.project_title}
                              </h4>
                              <span
                                className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
                                  c.status === "delivered"
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : c.status === "in_development"
                                    ? "bg-blue-500/20 text-blue-400"
                                    : c.status === "confirmed" || c.status === "paid"
                                    ? "bg-purple-500/20 text-purple-300"
                                    : "bg-amber-500/20 text-amber-300"
                                }`}
                              >
                                {c.status}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                              {c.specification?.title || "Discovery questionnaire in progress"}
                            </p>
                            <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                              <span>Created: {new Date(c.created_at).toLocaleDateString()}</span>
                              <span className="font-semibold text-foreground">
                                {c.specification?.total_amount ? `$${c.specification.total_amount}` : "Quote Pending"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right: Selected Channel Details & Workflow */}
                  {selectedChannel && (
                    <div className="lg:col-span-8 space-y-6">
                      {/* Channel Header */}
                      <div className="liquid-glass rounded-3xl p-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-neon-cyan">
                              Active Channel · Directed by Murtesa Alafi
                            </span>
                            <h2 className="font-display text-2xl font-bold text-foreground">
                              {selectedChannel.project_title}
                            </h2>
                            <p className="text-xs text-muted-foreground">
                              Client: {selectedChannel.client_name} ({selectedChannel.client_company})
                            </p>
                          </div>

                          {/* Status Pill */}
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-foreground">
                              <span className="h-2 w-2 rounded-full bg-neon-cyan animate-pulse" />
                              Phase: {selectedChannel.status.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Visual Workflow Steps */}
                        <div className="mt-6 grid grid-cols-2 gap-2 text-center text-xs sm:grid-cols-5">
                          <div
                            className={`rounded-xl p-2.5 ${
                              selectedChannel.status === "discovery"
                                ? "bg-neon-cyan/20 text-neon-cyan font-bold border border-neon-cyan/40"
                                : "bg-white/5 text-muted-foreground"
                            }`}
                          >
                            1. Discovery Q&A
                          </div>
                          <div
                            className={`rounded-xl p-2.5 ${
                              selectedChannel.specification && !selectedChannel.specification.client_confirmed
                                ? "bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40"
                                : selectedChannel.specification?.client_confirmed
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-white/5 text-muted-foreground"
                            }`}
                          >
                            2. Review Spec (RSD)
                          </div>
                          <div
                            className={`rounded-xl p-2.5 ${
                              selectedChannel.status === "confirmed"
                                ? "bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40"
                                : selectedChannel.payment?.paid
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-white/5 text-muted-foreground"
                            }`}
                          >
                            3. Pay Amount
                          </div>
                          <div
                            className={`rounded-xl p-2.5 ${
                              selectedChannel.status === "in_development"
                                ? "bg-blue-500/20 text-blue-300 font-bold border border-blue-500/40"
                                : selectedChannel.status === "delivered"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-white/5 text-muted-foreground"
                            }`}
                          >
                            4. In Sprint
                          </div>
                          <div
                            className={`rounded-xl p-2.5 ${
                              selectedChannel.status === "delivered"
                                ? "bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40"
                                : "bg-white/5 text-muted-foreground"
                            }`}
                          >
                            5. Delivery Handoff
                          </div>
                        </div>
                      </div>

                      {/* STEP 1: DISCOVERY QUESTIONNAIRE */}
                      <div className="liquid-glass rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-neon-cyan" />
                            <h3 className="font-display text-lg font-bold">
                              1. Discovery Questionnaire from Admin
                            </h3>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {selectedChannel.questions?.length ?? 0} questions formulated
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-4">
                          Murtesa Alafi has formulated these discovery questions to tailor your formal Requirement Specification Document (RSD). Please answer thoroughly:
                        </p>

                        <div className="space-y-4">
                          {selectedChannel.questions?.map((q: any, idx: number) => (
                            <div key={q.id || idx} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                              <Label className="font-medium text-foreground text-sm flex items-center justify-between">
                                <span>{q.question}</span>
                                {q.answered && (
                                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                                    <Check className="h-3 w-3" /> Answered
                                  </span>
                                )}
                              </Label>
                              <Textarea
                                value={answersMap[q.id] || ""}
                                onChange={(e) =>
                                  setAnswersMap({ ...answersMap, [q.id]: e.target.value })
                                }
                                placeholder="Type your answer here..."
                                className="mt-2 bg-white/5 border-white/10 text-sm min-h-[70px]"
                              />
                            </div>
                          ))}

                          <Button
                            onClick={handleSubmitAnswers}
                            disabled={savingAnswers}
                            className="w-full bg-gradient-brand text-white shadow-glow"
                          >
                            {savingAnswers ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Send className="h-4 w-4 mr-2" />
                            )}
                            Submit Answers to Murtesa Alafi
                          </Button>
                        </div>
                      </div>

                      {/* STEP 2: REQUIREMENT SPECIFICATION DOCUMENT (RSD) */}
                      {selectedChannel.specification ? (
                        <div className="liquid-glass rounded-3xl p-6 md:p-8 border border-neon-cyan/40 shadow-glow">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
                            <div>
                              <span className="rounded bg-neon-cyan/15 px-2 py-0.5 text-[10px] font-bold text-neon-cyan uppercase tracking-widest">
                                Formal Document · {selectedChannel.specification.version || "v1.0"}
                              </span>
                              <h3 className="font-display text-2xl font-bold mt-1 text-foreground">
                                {selectedChannel.specification.title}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                Issued by Murtesa Alafi · Directed for {selectedChannel.client_name}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground uppercase tracking-widest">Investment</p>
                              <p className="font-display text-2xl font-bold text-gradient-brand">
                                {selectedChannel.specification.currency || "USD"} $
                                {selectedChannel.specification.total_amount?.toLocaleString() || "2,400"}
                              </p>
                            </div>
                          </div>

                          {/* Executive Summary */}
                          <div className="mt-5 space-y-2">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-neon-cyan">
                              Executive Summary
                            </h4>
                            <p className="text-sm text-foreground/90 leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/10">
                              {selectedChannel.specification.executive_summary}
                            </p>
                          </div>

                          {/* Scope of Work */}
                          {selectedChannel.specification.scope_of_work?.length > 0 && (
                            <div className="mt-5 space-y-2">
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-neon-cyan">
                                Scope of Work & Modules
                              </h4>
                              <div className="grid gap-2 sm:grid-cols-2">
                                {selectedChannel.specification.scope_of_work.map((item: string, i: number) => (
                                  <div
                                    key={i}
                                    className="flex items-center gap-2 rounded-xl bg-white/[0.02] p-2.5 text-xs text-foreground/90 border border-white/5"
                                  >
                                    <Check className="h-3.5 w-3.5 text-neon-cyan shrink-0" />
                                    <span>{item}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Deliverables & Tech Stack */}
                          <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <div>
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-neon-cyan mb-2">
                                Deliverables
                              </h4>
                              <ul className="space-y-1.5 text-xs text-muted-foreground">
                                {selectedChannel.specification.deliverables?.map((d: string, idx: number) => (
                                  <li key={idx} className="flex items-center gap-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan" /> {d}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-neon-cyan mb-2">
                                Tech Stack Architecture
                              </h4>
                              <div className="flex flex-wrap gap-1.5">
                                {selectedChannel.specification.tech_stack?.map((t: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-medium text-foreground"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Timeline & Terms */}
                          <div className="mt-5 rounded-2xl bg-white/[0.03] p-4 border border-white/10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs">
                            <div>
                              <p className="text-muted-foreground">Guaranteed Delivery Deadline:</p>
                              <p className="font-semibold text-foreground text-sm">
                                {new Date(
                                  selectedChannel.specification.delivery_deadline || Date.now() + 86400000 * 14
                                ).toLocaleDateString(undefined, { dateStyle: "full" })}
                              </p>
                            </div>
                            <div className="sm:text-right">
                              <p className="text-muted-foreground">Terms & Intellectual Property:</p>
                              <p className="font-semibold text-foreground">
                                {selectedChannel.specification.terms || "100% IP Handover upon completion"}
                              </p>
                            </div>
                          </div>

                          {/* Confirmation Action */}
                          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-white/10 pt-4">
                            {selectedChannel.specification.client_confirmed ? (
                              <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                                <BadgeCheck className="h-5 w-5" />
                                <span>Specification Confirmed & Accepted by Client</span>
                              </div>
                            ) : (
                              <Button
                                onClick={handleConfirmSpecification}
                                className="bg-gradient-brand text-white shadow-glow w-full sm:w-auto"
                              >
                                <Check className="h-4 w-4 mr-2" /> Confirm & Accept Specification
                              </Button>
                            )}

                            {/* Payment Trigger */}
                            {selectedChannel.specification.client_confirmed && !selectedChannel.payment?.paid && (
                              <Button
                                onClick={() => setCheckoutDialogOpen(true)}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-glow w-full sm:w-auto"
                              >
                                <CreditCard className="h-4 w-4 mr-2" /> Pay Specific Amount (
                                {selectedChannel.specification.currency || "USD"} $
                                {selectedChannel.specification.total_amount?.toLocaleString()})
                              </Button>
                            )}

                            {selectedChannel.payment?.paid && (
                              <Button
                                variant="outline"
                                onClick={() => setReceiptDialogOpen(true)}
                                className="border-neon-cyan/40 text-neon-cyan gap-1.5"
                              >
                                <Receipt className="h-4 w-4" /> View Payment Receipt
                              </Button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-muted-foreground">
                          <FileText className="mx-auto h-8 w-8 opacity-40 mb-2" />
                          <p className="font-medium text-foreground">Requirement Specification Document (RSD) Pending</p>
                          <p className="mt-1 text-xs">
                            Once Murtesa Alafi analyzes your answers, the formal specification with full scope, delivery timeline, and investment will appear here for your confirmation.
                          </p>
                        </div>
                      )}

                      {/* STEP 3 & 4: SPRINT COUNTDOWN & DELIVERY HANDOFF */}
                      {selectedChannel.payment?.paid && (
                        <div className="liquid-glass rounded-3xl p-6 md:p-8 border border-white/10">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Flame className="h-5 w-5 text-amber-400" />
                              <h3 className="font-display text-xl font-bold">
                                Sprint Development & Delivery Status
                              </h3>
                            </div>
                            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
                              Payment Verified
                            </span>
                          </div>

                          {/* Delivery Countdown Banner */}
                          <div className="rounded-2xl bg-gradient-brand/10 border border-white/15 p-5 text-center">
                            <p className="text-xs uppercase tracking-widest text-neon-cyan font-semibold">
                              Delivery Timeline
                            </p>
                            <h4 className="mt-1 font-display text-xl font-bold text-foreground">
                              Target Handover:{" "}
                              {new Date(
                                selectedChannel.specification?.delivery_deadline || Date.now() + 86400000 * 10
                              ).toLocaleDateString(undefined, { dateStyle: "long" })}
                            </h4>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Sprint directed by Murtesa Alafi · Systems architecture, code synthesis, design tokens & security rules.
                            </p>
                          </div>

                          {/* STEP 5: FINAL DELIVERABLES IF DELIVERED */}
                          {selectedChannel.status === "delivered" || selectedChannel.delivery?.delivered ? (
                            <div className="mt-6 space-y-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 p-6">
                              <div className="flex items-center gap-2 text-emerald-400 font-display text-lg font-bold">
                                <Award className="h-5 w-5" /> Project Successfully Delivered!
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Murtesa Alafi has delivered the complete platform and assets. Access all deliverables below:
                              </p>

                              <div className="grid gap-3 sm:grid-cols-2">
                                {selectedChannel.delivery?.live_url && (
                                  <a
                                    href={selectedChannel.delivery.live_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-xs font-semibold text-foreground hover:bg-white/10 transition-colors"
                                  >
                                    <span>🌐 Live Production URL</span>
                                    <ExternalLink className="h-4 w-4 text-neon-cyan" />
                                  </a>
                                )}
                                {selectedChannel.delivery?.github_url && (
                                  <a
                                    href={selectedChannel.delivery.github_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-xs font-semibold text-foreground hover:bg-white/10 transition-colors"
                                  >
                                    <span>💻 Source Code Repository</span>
                                    <ExternalLink className="h-4 w-4 text-neon-cyan" />
                                  </a>
                                )}
                                {selectedChannel.delivery?.figma_url && (
                                  <a
                                    href={selectedChannel.delivery.figma_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-xs font-semibold text-foreground hover:bg-white/10 transition-colors"
                                  >
                                    <span>🎨 Figma Design Workspace</span>
                                    <ExternalLink className="h-4 w-4 text-neon-cyan" />
                                  </a>
                                )}
                                {selectedChannel.delivery?.assets_url && (
                                  <a
                                    href={selectedChannel.delivery.assets_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-xs font-semibold text-foreground hover:bg-white/10 transition-colors"
                                  >
                                    <span>📦 Full Assets & Manual (.zip)</span>
                                    <Download className="h-4 w-4 text-neon-cyan" />
                                  </a>
                                )}
                              </div>

                              {selectedChannel.delivery?.handover_notes && (
                                <div className="rounded-xl bg-black/30 p-4 text-xs text-foreground/90 border border-white/10">
                                  <span className="font-semibold text-neon-cyan block mb-1">
                                    Notes from Murtesa Alafi:
                                  </span>
                                  {selectedChannel.delivery.handover_notes}
                                </div>
                              )}

                              {/* Testimonial / Feedback */}
                              <div className="mt-4 border-t border-white/10 pt-4">
                                {submittedReview ? (
                                  <p className="text-xs text-emerald-400 font-semibold">
                                    ✓ Thank you for your 5-star review!
                                  </p>
                                ) : (
                                  <div className="space-y-2">
                                    <span className="text-xs text-muted-foreground font-medium">
                                      Rate your experience with Basirah Infinity:
                                    </span>
                                    <div className="flex items-center gap-1">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                          key={star}
                                          type="button"
                                          onClick={() => setRating(star)}
                                          className={`text-lg ${
                                            star <= rating ? "text-amber-400" : "text-muted-foreground/30"
                                          }`}
                                        >
                                          ★
                                        </button>
                                      ))}
                                    </div>
                                    <Textarea
                                      value={testimonial}
                                      onChange={(e) => setTestimonial(e.target.value)}
                                      placeholder="Share a short testimonial for Murtesa Alafi & Basirah Infinity..."
                                      className="text-xs bg-white/5"
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        setSubmittedReview(true);
                                        toast.success("Thank you! Review saved.");
                                      }}
                                      className="bg-gradient-brand text-white text-xs"
                                    >
                                      Submit Review
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/[0.03] p-4 text-xs text-muted-foreground border border-white/10">
                              <span>Sprint in active progress. Deliverables will unlock automatically on handover.</span>
                              <span className="font-semibold text-neon-cyan">Estimated: 100% on schedule</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

            {/* TAB: DIRECT ORDERS */}
            <TabsContent value="orders" className="mt-6">
              <div className="liquid-glass rounded-3xl p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-display text-2xl font-bold">Your Project Orders</h2>
                    <p className="text-sm text-muted-foreground">
                      Track the delivery milestones of your identity kits, web platforms, and AI systems.
                    </p>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/order">
                      <Layers className="h-4 w-4 mr-2" /> New Order
                    </Link>
                  </Button>
                </div>

                {orders.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/15 p-12 text-center">
                    <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                    <h3 className="font-display text-lg font-semibold">No active orders yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
                      Ready to build your next brand, web experience, or automated system with Murtesa Alafi?
                    </p>
                    <Button asChild className="mt-5 bg-gradient-brand text-white shadow-glow">
                      <Link to="/order">Browse Services & Order</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((o) => {
                      const isDelivered = o.status === "delivered";
                      const isPending = o.status === "pending";
                      return (
                        <div
                          key={o.id}
                          className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:bg-white/[0.05]"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-display text-lg font-semibold">{o.service}</span>
                              <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs text-muted-foreground">
                                {o.package || "Custom"}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {o.notes || "High-fidelity digital studio deliverable."}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              Ordered on {new Date(o.created_at).toLocaleDateString()} · Amount:{" "}
                              <strong className="text-foreground">
                                {o.amount ? `$${o.amount}` : "Milestone-based"}
                              </strong>
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                                isDelivered
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : isPending
                                  ? "bg-amber-500/20 text-amber-300"
                                  : "bg-blue-500/20 text-blue-400"
                              }`}
                            >
                              {o.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB: DIRECT MESSAGES */}
            <TabsContent value="messages" className="mt-6">
              <div className="grid gap-6 lg:grid-cols-12">
                {/* Form to message admin */}
                <div className="lg:col-span-5 liquid-glass rounded-3xl p-6">
                  <h3 className="font-display text-xl font-bold">Contact Studio & Admin</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Send a private message directly to Murtesa Alafi.
                  </p>

                  <form onSubmit={sendToAdmin} className="mt-5 space-y-4">
                    <div>
                      <Label htmlFor="msg-subject" className="text-xs">Subject</Label>
                      <Input
                        id="msg-subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g. Scope expansion or custom milestone"
                        className="mt-1 bg-white/5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="msg-body" className="text-xs">Your Message</Label>
                      <Textarea
                        id="msg-body"
                        required
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Type your message to Murtesa Alafi..."
                        rows={5}
                        className="mt-1 bg-white/5"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={sending}
                      className="w-full bg-gradient-brand text-white shadow-glow"
                    >
                      {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                      Dispatch Message
                    </Button>
                  </form>
                </div>

                {/* Messages history */}
                <div className="lg:col-span-7 liquid-glass rounded-3xl p-6">
                  <h3 className="font-display text-xl font-bold">Message History</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Chronological thread of your communication with Basirah Infinity.
                  </p>

                  <div className="mt-5 space-y-3">
                    {messages.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-xs text-muted-foreground">
                        No messages yet. Send a message to get in touch!
                      </div>
                    ) : (
                      messages.map((m) => (
                        <div key={m.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-foreground">{m.subject || "No Subject"}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(m.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="mt-2 text-foreground/90 whitespace-pre-wrap">{m.body}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* DIALOG: EDIT PROFILE */}
        <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
          <DialogContent className="liquid-glass border-white/20 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Edit Client Profile</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Update your organization details and contact info for all project channels.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveProfile} className="space-y-4 py-2">
              <div>
                <Label htmlFor="prof-name" className="text-xs">Full Name</Label>
                <Input
                  id="prof-name"
                  value={profile.displayName}
                  onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                  className="mt-1 bg-white/5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="prof-comp" className="text-xs">Company / Enterprise</Label>
                <Input
                  id="prof-comp"
                  value={profile.company}
                  onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                  className="mt-1 bg-white/5"
                  placeholder="e.g. AddisTech Ventures"
                />
              </div>
              <div>
                <Label htmlFor="prof-phone" className="text-xs">Direct Phone Number</Label>
                <Input
                  id="prof-phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="mt-1 bg-white/5"
                  placeholder="+251 708 229 717"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setProfileDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={savingProfile} className="bg-gradient-brand text-white">
                  {savingProfile ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* DIALOG: NEW PROJECT CONSULTATION */}
        <Dialog open={newConsultDialogOpen} onOpenChange={setNewConsultDialogOpen}>
          <DialogContent className="liquid-glass border-white/20 sm:max-w-2xl bg-background/95 max-h-[92vh] overflow-y-auto p-6 sm:p-8">
            <DialogHeader>
              <DialogTitle className="font-display text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-neon-cyan" />
                Open Project Consultation Channel
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                Initiate a dedicated consultation channel directly with Murtesa Alafi. Your inputs are displayed and saved immediately.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateConsultation} className="space-y-4 py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="dialog-consult-name" className="text-xs font-semibold text-foreground">
                    Your Full Name <span className="text-neon-cyan">*</span>
                  </Label>
                  <Input
                    id="dialog-consult-name"
                    value={newConsultName}
                    onChange={(e) => setNewConsultName(e.target.value)}
                    placeholder="Full name"
                    className="mt-1 bg-white/5 border-white/10 text-xs font-medium text-foreground"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dialog-consult-email" className="text-xs font-semibold text-foreground">
                    Email Address <span className="text-neon-cyan">*</span>
                  </Label>
                  <Input
                    id="dialog-consult-email"
                    type="email"
                    value={newConsultEmail}
                    onChange={(e) => setNewConsultEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="mt-1 bg-white/5 border-white/10 text-xs font-medium text-foreground"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="dialog-consult-company" className="text-xs font-semibold text-foreground">
                    Company / Organization
                  </Label>
                  <Input
                    id="dialog-consult-company"
                    value={newConsultCompany}
                    onChange={(e) => setNewConsultCompany(e.target.value)}
                    placeholder="Brand or company name"
                    className="mt-1 bg-white/5 border-white/10 text-xs text-foreground"
                  />
                </div>
                <div>
                  <Label htmlFor="dialog-consult-phone" className="text-xs font-semibold text-foreground">
                    Phone / WhatsApp
                  </Label>
                  <Input
                    id="dialog-consult-phone"
                    value={newConsultPhone}
                    onChange={(e) => setNewConsultPhone(e.target.value)}
                    placeholder="+251 708 229 717"
                    className="mt-1 bg-white/5 border-white/10 text-xs text-foreground"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="consult-title" className="text-xs font-semibold text-foreground">
                  Project Title / System Requirement <span className="text-neon-cyan">*</span>
                </Label>
                <Input
                  id="consult-title"
                  value={newConsultTitle}
                  onChange={(e) => setNewConsultTitle(e.target.value)}
                  placeholder="e.g. Luxury Fintech Platform & Brand Identity"
                  className="mt-1 bg-white/5 border-white/10 text-xs font-bold text-foreground"
                  required
                />
              </div>

              <div>
                <Label htmlFor="consult-brief" className="text-xs font-semibold text-foreground">
                  Initial Brief, Goals & Vision (Optional)
                </Label>
                <Textarea
                  id="consult-brief"
                  value={newConsultBrief}
                  onChange={(e) => setNewConsultBrief(e.target.value)}
                  placeholder="Describe your primary goals, timeline, and current assets..."
                  rows={4}
                  className="mt-1 bg-white/5 border-white/10 text-xs text-foreground"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="ghost" onClick={() => setNewConsultDialogOpen(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" disabled={creatingConsult} className="bg-gradient-brand text-white font-bold shadow-glow text-xs">
                  {creatingConsult ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  Open Consultation Channel
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* DIALOG: PAYMENT CHECKOUT */}
        <Dialog open={checkoutDialogOpen} onOpenChange={setCheckoutDialogOpen}>
          <DialogContent className="liquid-glass border-white/20 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Confirm & Pay Project Investment</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Official checkout for {selectedChannel?.project_title}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="rounded-2xl bg-white/[0.04] p-4 border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Agreed Amount</p>
                  <p className="font-display text-2xl font-bold text-gradient-brand">
                    {selectedChannel?.specification?.currency || "USD"} $
                    {selectedChannel?.specification?.total_amount?.toLocaleString() || "2,400"}
                  </p>
                </div>
                <span className="text-xs rounded bg-neon-cyan/20 px-2.5 py-1 text-neon-cyan font-semibold">
                  Guaranteed Escrow
                </span>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <Label className="text-xs">Select Payment Method</Label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("telebirr")}
                    className={`rounded-xl border p-3 text-center transition-all ${
                      paymentMethod === "telebirr"
                        ? "border-neon-cyan bg-neon-cyan/15 text-foreground font-bold"
                        : "border-white/10 bg-white/5 text-muted-foreground"
                    }`}
                  >
                    📱 Telebirr
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cbe")}
                    className={`rounded-xl border p-3 text-center transition-all ${
                      paymentMethod === "cbe"
                        ? "border-neon-cyan bg-neon-cyan/15 text-foreground font-bold"
                        : "border-white/10 bg-white/5 text-muted-foreground"
                    }`}
                  >
                    🏦 CBE Birr
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`rounded-xl border p-3 text-center transition-all ${
                      paymentMethod === "card"
                        ? "border-neon-cyan bg-neon-cyan/15 text-foreground font-bold"
                        : "border-white/10 bg-white/5 text-muted-foreground"
                    }`}
                  >
                    💳 Card / Stripe
                  </button>
                </div>
              </div>

              {paymentMethod === "telebirr" && (
                <div>
                  <Label htmlFor="telebirr-no" className="text-xs">Telebirr Mobile Number</Label>
                  <Input
                    id="telebirr-no"
                    value={telebirrPhone}
                    onChange={(e) => setTelebirrPhone(e.target.value)}
                    className="mt-1 bg-white/5"
                    placeholder="+251 9..."
                  />
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Direct integration with Ethio Telecom Telebirr merchant gateway.
                  </p>
                </div>
              )}

              {paymentMethod === "card" && (
                <div>
                  <Label htmlFor="card-no" className="text-xs">Card Number</Label>
                  <Input
                    id="card-no"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="mt-1 bg-white/5"
                  />
                </div>
              )}

              {paymentMethod === "cbe" && (
                <div className="rounded-xl bg-white/5 p-3 text-xs text-muted-foreground space-y-1">
                  <p>Bank: <strong className="text-foreground">Commercial Bank of Ethiopia (CBE)</strong></p>
                  <p>Account Name: <strong className="text-foreground">Basirah Infinity / Murtesa Alafi</strong></p>
                  <p>Account Number: <code className="text-neon-cyan font-bold">1000 7082 2971 7</code></p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setCheckoutDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCompletePayment}
                disabled={processingPayment}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
              >
                {processingPayment ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Authorize & Confirm Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* DIALOG: PAYMENT RECEIPT */}
        <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
          <DialogContent className="liquid-glass border-white/20 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-xl flex items-center gap-2 text-emerald-400">
                <Receipt className="h-5 w-5" /> Official Studio Payment Receipt
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Basirah Infinity Digital Studio · Directed by Murtesa Alafi
              </DialogDescription>
            </DialogHeader>

            {selectedChannel?.payment && (
              <div className="space-y-3 rounded-2xl bg-black/40 p-4 border border-white/10 text-xs text-foreground/90 font-mono">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span>RECEIPT NO:</span>
                  <span className="font-bold text-neon-cyan">{selectedChannel.payment.receipt_number}</span>
                </div>
                <div className="flex justify-between">
                  <span>PROJECT:</span>
                  <span className="text-right">{selectedChannel.project_title}</span>
                </div>
                <div className="flex justify-between">
                  <span>CLIENT:</span>
                  <span>{selectedChannel.client_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>DATE & TIME:</span>
                  <span>{new Date(selectedChannel.payment.paid_at).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>PAYMENT METHOD:</span>
                  <span>{selectedChannel.payment.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span>TRANSACTION ID:</span>
                  <span className="truncate max-w-[150px]">{selectedChannel.payment.transaction_id}</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-2 font-bold text-sm text-gradient-brand">
                  <span>TOTAL AMOUNT PAID:</span>
                  <span>
                    {selectedChannel.payment.currency} ${selectedChannel.payment.amount_paid?.toLocaleString()}
                  </span>
                </div>
                <div className="pt-2 text-[10px] text-muted-foreground text-center">
                  DIRECTOR SIGNATURE: MURTESA ALAFI · VERIFIED DIGITAL RECEIPT
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") window.print();
                }}
                variant="outline"
                className="border-white/10"
              >
                <Download className="h-4 w-4 mr-1.5" /> Print Receipt
              </Button>
              <Button type="button" onClick={() => setReceiptDialogOpen(false)} className="bg-gradient-brand text-white">
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>
    </SiteShell>
  );
}