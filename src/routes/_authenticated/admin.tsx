import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { SiteShell } from "@/components/SiteShell";
import {
  waitForAuth,
  isAdmin as checkAdmin,
  fetchLeads,
  fetchOrders,
  fetchMessages,
  fetchCollaborations,
  fetchNotifications,
  fetchAnnouncements,
  fetchAuditLog,
  insertDoc,
  insertMany,
  updateDocById,
  deleteDocById,
  deleteManyByIds,
  updateManyByIds,
  logAudit,
  getCurrentUser,
  ADMIN_PRIMARY_EMAIL,
  fetchServices,
  saveService,
  deleteService,
  fetchWorks,
  saveWork,
  deleteWork,
  fetchPricingTiers,
  savePricingTier,
  deletePricingTier,
  fetchAboutContent,
  saveAboutContent,
  fetchProjectChannels,
  updateProjectChannel,
  fetchStudioComponents,
  saveStudioComponent,
  deleteStudioComponent,
} from "@/integrations/firebase/helpers";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Users,
  Inbox,
  ShoppingBag,
  Handshake,
  TrendingUp,
  Sparkles,
  Phone,
  Trash2,
  CheckCircle2,
  XCircle,
  Send,
  Mail,
  Megaphone,
  Activity,
  Wand2,
  Pin,
  PinOff,
  LayoutDashboard,
  FileCheck2,
  Palette,
  Briefcase,
  DollarSign,
  Info,
  Layers,
  Plus,
  Edit,
  ExternalLink,
  Award,
  Check,
  CreditCard,
  Download,
  Flame,
  FileText,
  BadgeCheck,
  Shield,
  Loader2,
  Code2,
  Box,
  Cpu,
  FolderUp,
  Eye,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Console — Basirah Infinity | Directed by Murtesa Alafi" },
      { name: "description", content: "Executive control panel: CMS, client channels, RSD generator, CRM, orders, pricing, and system administration." },
    ],
  }),
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const user = await waitForAuth();
    if (!user) throw redirect({ to: "/login" });
    const admin = await checkAdmin(user.uid);
    if (!admin) throw redirect({ to: "/dashboard" });
  },
  component: AdminPage,
});

const LEAD_STATUSES = ["new", "contacted", "qualified", "won", "lost"];
const ORDER_STATUSES = ["pending", "in_progress", "delivered", "cancelled"];

function fmtDate(d: any): string {
  if (!d) return "";
  if (d.toDate) return d.toDate().toLocaleDateString();
  return new Date(d).toLocaleDateString();
}
function fmtDateTime(d: any): string {
  if (!d) return "";
  if (d.toDate) return d.toDate().toLocaleString();
  return new Date(d).toLocaleString();
}

function AdminPage() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "channels"
    | "components"
    | "services"
    | "works"
    | "pricing"
    | "about"
    | "orders"
    | "leads"
    | "messages"
    | "collabs"
    | "announcements"
    | "audit"
  >("overview");

  // Core Data States
  const [leads, setLeads] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [collabs, setCollabs] = useState<any[]>([]);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [audit, setAudit] = useState<any[]>([]);

  // Dynamic CMS States
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [worksList, setWorksList] = useState<any[]>([]);
  const [pricingList, setPricingList] = useState<any[]>([]);
  const [aboutData, setAboutData] = useState<any>({});
  const [channelsList, setChannelsList] = useState<any[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<any | null>(null);
  const [componentsList, setComponentsList] = useState<any[]>([]);
  const [componentFilter, setComponentFilter] = useState("all");

  // Component Dialog & Form State
  const [componentDialogOpen, setComponentDialogOpen] = useState(false);
  const [componentForm, setComponentForm] = useState({
    id: "",
    title: "",
    category: "buttons",
    description: "",
    tags: "button, cta, glass",
    jsxCode: `<button className="liquid-glass rounded-2xl px-6 py-3 font-semibold text-white shadow-glow hover:scale-105 transition-all">Action</button>`,
    cssCode: "backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.15);",
    previewType: "glass-button",
  });

  // Dialogs & Modals
  const [inboxOpen, setInboxOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);
  const [campaignOpen, setCampaignOpen] = useState(false);
  const [annOpen, setAnnOpen] = useState(false);
  const [replyTo, setReplyTo] = useState<any | null>(null);
  const [replyBody, setReplyBody] = useState("");

  // Lead CRM state
  const [openLead, setOpenLead] = useState<any | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [orderFor, setOrderFor] = useState<any | null>(null);
  const [orderForm, setOrderForm] = useState({
    service: "Web Design & Development",
    package: "Growth",
    amount: "",
    notes: "",
  });

  // Services CMS Dialog State
  const [serviceDialogOpen, setServiceDialogOpen] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    id: "",
    title: "",
    short: "",
    description: "",
    price: "",
    timeline: "",
    icon: "Palette",
    tag: "Popular",
    features: "",
  });

  // Works CMS Dialog State
  const [workDialogOpen, setWorkDialogOpen] = useState(false);
  const workImageUploadInputRef = useRef<HTMLInputElement>(null);
  const [workForm, setWorkForm] = useState({
    id: "",
    title: "",
    category: "",
    client: "",
    summary: "",
    impact: "",
    tag: "Branding",
    gradient: "from-blue-500/40 to-cyan-500/40",
    liveUrl: "https://example.com",
    featured: true,
    imageUrl: "",
  });

  // Pricing CMS Dialog State
  const [pricingDialogOpen, setPricingDialogOpen] = useState(false);
  const [pricingForm, setPricingForm] = useState({
    id: "",
    name: "",
    price: "",
    period: "per project",
    description: "",
    popular: false,
    badge: "Most Popular",
    deliveryTime: "10 Business Days",
    cta: "Get Started",
    features: "",
  });

  // About CMS Form State
  const [savingAbout, setSavingAbout] = useState(false);

  // Channel RSD Generator State
  const [rsdDialogOpen, setRsdDialogOpen] = useState(false);
  const [rsdForm, setRsdForm] = useState({
    title: "Requirement Specification Document (RSD) v1.0",
    version: "v1.0 Final",
    executive_summary: "",
    scope_of_work: "",
    deliverables: "",
    tech_stack: "React 19, TypeScript, Tailwind v4, TanStack, Firebase",
    timeline_days: 14,
    delivery_deadline: "",
    total_amount: 2400,
    currency: "USD",
    terms: "50% upfront milestone, full IP ownership transfer upon completion.",
  });

  // Question formulation for Client Channel
  const [newQuestionText, setNewQuestionText] = useState("");

  // Deliverables Handoff State
  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);
  const [deliveryForm, setDeliveryForm] = useState({
    live_url: "",
    github_url: "",
    figma_url: "",
    assets_url: "",
    handover_notes: "",
  });

  // Campaign State
  const [campSubject, setCampSubject] = useState("");
  const [campBody, setCampBody] = useState("");
  const [campAudience, setCampAudience] = useState<"all" | "selected" | "new" | "qualified">("all");
  const [sending, setSending] = useState(false);

  // Announcement State
  const [annTitle, setAnnTitle] = useState("");
  const [annBody, setAnnBody] = useState("");
  const [annPinned, setAnnPinned] = useState(false);

  async function loadAll() {
    try {
      const [l, o, m, c, n, a, ad, srv, wrk, prc, abt, chn, cmps] = await Promise.all([
        fetchLeads(),
        fetchOrders(),
        fetchMessages(),
        fetchCollaborations(),
        fetchNotifications(),
        fetchAnnouncements(),
        fetchAuditLog(),
        fetchServices(),
        fetchWorks(),
        fetchPricingTiers(),
        fetchAboutContent(),
        fetchProjectChannels(),
        fetchStudioComponents(),
      ]);
      setLeads(l);
      setOrders(o);
      setMessages(m);
      setCollabs(c);
      setNotifs(n);
      setAnnouncements(a);
      setAudit(ad);
      setServicesList(srv);
      setWorksList(wrk);
      setPricingList(prc);
      setAboutData(abt || {});
      setChannelsList(chn);
      setComponentsList(cmps);

      if (chn.length > 0 && !selectedChannel) {
        setSelectedChannel(chn[0]);
      } else if (selectedChannel) {
        const refreshed = chn.find((item) => item.id === selectedChannel.id);
        if (refreshed) setSelectedChannel(refreshed);
      }
    } catch (e) {
      console.error("Admin loadAll error:", e);
    }
  }

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 15000);
    return () => clearInterval(interval);
  }, []);

  // ── Studio Components CMS Handlers ──────────────────────────────────

  function openAddComponent() {
    setComponentForm({
      id: "",
      title: "",
      category: "buttons",
      description: "",
      tags: "button, cta, glass",
      jsxCode: `<button className="liquid-glass rounded-2xl px-6 py-3 font-semibold text-white shadow-glow hover:scale-105 transition-all">Action</button>`,
      cssCode: "backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.15);",
      previewType: "glass-button",
    });
    setComponentDialogOpen(true);
  }

  function openEditComponent(c: any) {
    setComponentForm({
      id: c.id,
      title: c.title || "",
      category: c.category || "buttons",
      description: c.description || "",
      tags: Array.isArray(c.tags) ? c.tags.join(", ") : (c.tags || ""),
      jsxCode: c.jsxCode || "",
      cssCode: c.cssCode || "",
      previewType: c.previewType || "glass-button",
    });
    setComponentDialogOpen(true);
  }

  async function handleSaveComponent(e: React.FormEvent) {
    e.preventDefault();
    if (!componentForm.title.trim()) return toast.error("Component title is required");
    try {
      const tagArr = componentForm.tags
        .split(/[\n,]/)
        .map((t) => t.trim())
        .filter(Boolean);

      await saveStudioComponent({
        ...(componentForm.id ? { id: componentForm.id } : {}),
        title: componentForm.title.trim(),
        category: componentForm.category,
        description: componentForm.description.trim(),
        tags: tagArr,
        jsxCode: componentForm.jsxCode,
        cssCode: componentForm.cssCode,
        previewType: componentForm.previewType,
      });

      toast.success(componentForm.id ? "Component updated in Studio!" : "New component created in Studio catalog!");
      logAudit("component.save", "studio_component", componentForm.id || undefined, { title: componentForm.title });
      setComponentDialogOpen(false);
      await loadAll();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to save component");
    }
  }

  async function handleDeleteComponent(id: string) {
    if (!confirm("Are you sure you want to delete this component?")) return;
    try {
      await deleteStudioComponent(id);
      toast.success("Component deleted from Studio catalog");
      logAudit("component.delete", "studio_component", id);
      await loadAll();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to delete component");
    }
  }

  // ── Services CMS Handlers ───────────────────────────────────────────

  function openAddService() {
    setServiceForm({
      id: "",
      title: "",
      short: "",
      description: "",
      price: "From $1,500",
      timeline: "7–14 days",
      icon: "Palette",
      tag: "Popular",
      features: "High-fidelity design, Responsive development, SEO optimization",
    });
    setServiceDialogOpen(true);
  }

  function openEditService(s: any) {
    setServiceForm({
      id: s.id,
      title: s.title || "",
      short: s.short || "",
      description: s.description || "",
      price: s.price || "",
      timeline: s.timeline || "",
      icon: s.icon || "Palette",
      tag: s.tag || "Popular",
      features: Array.isArray(s.features) ? s.features.join("\n") : (s.features || ""),
    });
    setServiceDialogOpen(true);
  }

  async function handleSaveService(e: React.FormEvent) {
    e.preventDefault();
    if (!serviceForm.title.trim()) return toast.error("Service title required");
    try {
      const featArr = serviceForm.features
        .split(/[\n,]/)
        .map((f) => f.trim())
        .filter(Boolean);

      await saveService({
        ...(serviceForm.id ? { id: serviceForm.id } : {}),
        title: serviceForm.title.trim(),
        short: serviceForm.short.trim(),
        description: serviceForm.description.trim(),
        price: serviceForm.price.trim(),
        timeline: serviceForm.timeline.trim(),
        icon: serviceForm.icon,
        tag: serviceForm.tag,
        features: featArr,
      });

      toast.success(serviceForm.id ? "Service updated!" : "New service created!");
      logAudit("service.save", "service", serviceForm.id || undefined, { title: serviceForm.title });
      setServiceDialogOpen(false);
      await loadAll();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to save service");
    }
  }

  async function handleDeleteService(id: string) {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      await deleteService(id);
      toast.success("Service removed");
      logAudit("service.delete", "service", id);
      await loadAll();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to delete service");
    }
  }

  // ── Works CMS Handlers ──────────────────────────────────────────────

  function openAddWork() {
    setWorkForm({
      id: "",
      title: "",
      category: "Web & AI System",
      client: "Global Client",
      summary: "",
      impact: "+200% Conversions",
      tag: "Web App",
      gradient: "from-blue-500/40 to-cyan-500/40",
      liveUrl: "https://example.com",
      featured: true,
      imageUrl: "",
    });
    setWorkDialogOpen(true);
  }

  function openEditWork(w: any) {
    setWorkForm({
      id: w.id,
      title: w.title || "",
      category: w.category || "",
      client: w.client || "",
      summary: w.summary || "",
      impact: w.impact || "",
      tag: w.tag || "Branding",
      gradient: w.gradient || "from-blue-500/40 to-cyan-500/40",
      liveUrl: w.liveUrl || "",
      featured: w.featured ?? true,
      imageUrl: w.imageUrl || "",
    });
    setWorkDialogOpen(true);
  }

  async function handleSaveWork(e: React.FormEvent) {
    e.preventDefault();
    if (!workForm.title.trim()) return toast.error("Work title required");
    try {
      await saveWork({
        ...(workForm.id ? { id: workForm.id } : {}),
        title: workForm.title.trim(),
        category: workForm.category.trim(),
        client: workForm.client.trim(),
        summary: workForm.summary.trim(),
        impact: workForm.impact.trim(),
        tag: workForm.tag.trim(),
        gradient: workForm.gradient.trim(),
        liveUrl: workForm.liveUrl.trim(),
        featured: workForm.featured,
        imageUrl: workForm.imageUrl,
      });

      toast.success(workForm.id ? "Project updated!" : "Project added to portfolio!");
      logAudit("work.save", "work", workForm.id || undefined, { title: workForm.title });
      setWorkDialogOpen(false);
      await loadAll();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to save work");
    }
  }

  async function handleDeleteWork(id: string) {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteWork(id);
      toast.success("Project removed");
      logAudit("work.delete", "work", id);
      await loadAll();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to delete work");
    }
  }

  // ── Pricing CMS Handlers ────────────────────────────────────────────

  function openAddPricing() {
    setPricingForm({
      id: "",
      name: "",
      price: "$1,490",
      period: "per project",
      description: "",
      popular: false,
      badge: "Fast Track",
      deliveryTime: "10 Business Days",
      cta: "Choose Package",
      features: "Feature 1\nFeature 2\nFeature 3",
    });
    setPricingDialogOpen(true);
  }

  function openEditPricing(p: any) {
    setPricingForm({
      id: p.id,
      name: p.name || "",
      price: p.price || "",
      period: p.period || "per project",
      description: p.description || "",
      popular: p.popular || false,
      badge: p.badge || "Popular",
      deliveryTime: p.deliveryTime || "14 Business Days",
      cta: p.cta || "Select Package",
      features: Array.isArray(p.features) ? p.features.join("\n") : (p.features || ""),
    });
    setPricingDialogOpen(true);
  }

  async function handleSavePricing(e: React.FormEvent) {
    e.preventDefault();
    if (!pricingForm.name.trim()) return toast.error("Package name required");
    try {
      const featArr = pricingForm.features
        .split(/[\n,]/)
        .map((f) => f.trim())
        .filter(Boolean);

      await savePricingTier({
        ...(pricingForm.id ? { id: pricingForm.id } : {}),
        name: pricingForm.name.trim(),
        price: pricingForm.price.trim(),
        period: pricingForm.period.trim(),
        description: pricingForm.description.trim(),
        popular: pricingForm.popular,
        badge: pricingForm.badge.trim(),
        deliveryTime: pricingForm.deliveryTime.trim(),
        cta: pricingForm.cta.trim(),
        features: featArr,
      });

      toast.success(pricingForm.id ? "Pricing package updated!" : "Pricing package created!");
      logAudit("pricing.save", "pricing", pricingForm.id || undefined, { name: pricingForm.name });
      setPricingDialogOpen(false);
      await loadAll();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to save pricing");
    }
  }

  async function handleDeletePricing(id: string) {
    if (!confirm("Are you sure you want to delete this pricing package?")) return;
    try {
      await deletePricingTier(id);
      toast.success("Pricing package removed");
      logAudit("pricing.delete", "pricing", id);
      await loadAll();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to delete pricing");
    }
  }

  // ── About Content CMS Handlers ──────────────────────────────────────

  async function handleSaveAbout(e: React.FormEvent) {
    e.preventDefault();
    setSavingAbout(true);
    try {
      await saveAboutContent(aboutData);
      toast.success("About & Founder story updated! Public page refreshed.");
      logAudit("about.save", "about_content", undefined, { founder: aboutData.founder_name });
      await loadAll();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to save About content");
    } finally {
      setSavingAbout(false);
    }
  }

  // ── Client Channels & RSD Generator Handlers ────────────────────────

  async function handleAddQuestionToChannel() {
    if (!selectedChannel || !newQuestionText.trim()) return;
    try {
      const newQ = {
        id: `q-${Date.now()}`,
        question: newQuestionText.trim(),
        answer: "",
        answered: false,
      };
      const updatedQs = [...(selectedChannel.questions || []), newQ];
      await updateProjectChannel(selectedChannel.id, {
        questions: updatedQs,
        status: "discovery",
      });
      setNewQuestionText("");
      toast.success("Question dispatched to client portal!");
      await loadAll();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to add question");
    }
  }

  function openRsdGenerator() {
    if (!selectedChannel) return;
    const defaultDelivery = new Date(Date.now() + 86400000 * 14).toISOString().split("T")[0];
    setRsdForm({
      title: `Requirement Specification Document (RSD) — ${selectedChannel.project_title}`,
      version: "v1.0 Final",
      executive_summary: `Basirah Infinity will architect and deliver a bespoke digital platform and sovereign ecosystem for ${selectedChannel.client_name} (${selectedChannel.client_company}).`,
      scope_of_work:
        "High-fidelity UI/UX design with dark luxury aesthetics\nFull-stack reactive web platform\nPayment gateway integration (Telebirr / Stripe)\nAutomated lead capture & CRM synchronization\nEnd-to-end security & production deployment",
      deliverables:
        "Full source code repository\nLive production deployment with SSL\nFigma master component library\nAdministrator handover guide",
      tech_stack: "React 19, TypeScript, Tailwind v4, TanStack Start, Firebase, Stripe/Telebirr",
      timeline_days: 14,
      delivery_deadline: defaultDelivery,
      total_amount: 2400,
      currency: "USD",
      terms: "50% sprint milestone, 100% intellectual property transfer upon final delivery signoff.",
    });
    setRsdDialogOpen(true);
  }

  async function handleSendRSD(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedChannel) return;
    try {
      const scopeArr = rsdForm.scope_of_work
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const delivArr = rsdForm.deliverables
        .split("\n")
        .map((d) => d.trim())
        .filter(Boolean);
      const techArr = rsdForm.tech_stack
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const specDoc = {
        title: rsdForm.title,
        version: rsdForm.version,
        executive_summary: rsdForm.executive_summary,
        scope_of_work: scopeArr,
        deliverables: delivArr,
        tech_stack: techArr,
        timeline_days: Number(rsdForm.timeline_days),
        delivery_deadline: new Date(rsdForm.delivery_deadline).toISOString(),
        total_amount: Number(rsdForm.total_amount),
        currency: rsdForm.currency,
        terms: rsdForm.terms,
        issued_at: new Date().toISOString(),
        client_confirmed: false,
        confirmed_at: null,
      };

      await updateProjectChannel(selectedChannel.id, {
        specification: specDoc,
        status: "specification_sent",
      });

      // Send automated notification to client
      await insertDoc("notifications", {
        to_email: selectedChannel.client_email,
        subject: `Requirement Specification Document (RSD) Ready: ${selectedChannel.project_title}`,
        body: `Hello ${selectedChannel.client_name},\n\nMurtesa Alafi has formulated your formal Requirement Specification Document (RSD) for ${selectedChannel.project_title}.\n\nPlease log in to your Basirah Infinity client portal to review, confirm, and authorize the project sprint.\n\n— Basirah Infinity Studio`,
        kind: "specification-ready",
        status: "sent",
        sent: true,
      });

      toast.success("Requirement Specification Document (RSD) sent to client!");
      logAudit("channel.send_rsd", "channel", selectedChannel.id, { title: rsdForm.title });
      setRsdDialogOpen(false);
      await loadAll();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to send RSD");
    }
  }

  function openDeliveryDialog() {
    if (!selectedChannel) return;
    setDeliveryForm({
      live_url: selectedChannel.delivery?.live_url || "https://",
      github_url: selectedChannel.delivery?.github_url || "https://github.com/basirah-infinity/",
      figma_url: selectedChannel.delivery?.figma_url || "https://figma.com/@basirah/",
      assets_url: selectedChannel.delivery?.assets_url || "https://drive.google.com/basirah-infinity-deliverables.zip",
      handover_notes:
        selectedChannel.delivery?.handover_notes ||
        "Project sprint completed with 100% test coverage and production optimization. All keys and assets transferred to client.",
    });
    setDeliveryDialogOpen(true);
  }

  async function handleDeliverProject(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedChannel) return;
    try {
      const deliveryData = {
        delivered: true,
        delivered_at: new Date().toISOString(),
        live_url: deliveryForm.live_url.trim(),
        github_url: deliveryForm.github_url.trim(),
        figma_url: deliveryForm.figma_url.trim(),
        assets_url: deliveryForm.assets_url.trim(),
        handover_notes: deliveryForm.handover_notes.trim(),
      };

      await updateProjectChannel(selectedChannel.id, {
        delivery: deliveryData,
        status: "delivered",
      });

      // Update associated order if present
      const relatedOrder = orders.find(
        (o) => o.client_email === selectedChannel.client_email || o.service === selectedChannel.project_title
      );
      if (relatedOrder) {
        await updateDocById("orders", relatedOrder.id, { status: "delivered" });
      }

      // Notify client
      await insertDoc("notifications", {
        to_email: selectedChannel.client_email,
        subject: `🚀 Project Delivered: ${selectedChannel.project_title}`,
        body: `Congratulations ${selectedChannel.client_name}!\n\nMurtesa Alafi has completed and officially delivered ${selectedChannel.project_title}.\n\nAccess your live system, GitHub source repository, Figma designs, and asset package directly inside your client portal.\n\n— Murtesa Alafi, Director at Basirah Infinity`,
        kind: "project-delivered",
        status: "sent",
        sent: true,
      });

      toast.success("Project deliverables handed over to client!");
      logAudit("channel.deliver", "channel", selectedChannel.id, { live_url: deliveryForm.live_url });
      setDeliveryDialogOpen(false);
      await loadAll();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to deliver project");
    }
  }

  // ── Existing Lead CRM & Orders Handlers ──────────────────────────────

  async function setLeadStatus(id: string, status: string) {
    try {
      await updateDocById("leads", id, { status });
      toast.success(`Lead → ${status}`);
      logAudit("lead.status", "lead", id, { status });
      loadAll();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function deleteLead(id: string) {
    try {
      await deleteDocById("leads", id);
      toast.success("Lead deleted");
      logAudit("lead.delete", "lead", id);
      loadAll();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function bulkAction(action: "delete" | "won" | "lost" | "qualified" | "contacted") {
    if (!selected.size) return toast.error("Select leads first");
    const ids = Array.from(selected);
    try {
      if (action === "delete") {
        await deleteManyByIds("leads", ids);
        toast.success(`Deleted ${ids.length}`);
        logAudit("lead.bulk_delete", "lead", undefined, { count: ids.length });
      } else {
        await updateManyByIds("leads", ids, { status: action });
        toast.success(`${ids.length} → ${action}`);
        logAudit("lead.bulk_status", "lead", undefined, { count: ids.length, status: action });
      }
      setSelected(new Set());
      loadAll();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function setOrderStatus(id: string, status: string) {
    try {
      await updateDocById("orders", id, { status });
      toast.success(`Order → ${status}`);
      logAudit("order.status", "order", id, { status });
      loadAll();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function createOrderFromLead() {
    if (!orderFor) return;
    try {
      await insertDoc("orders", {
        lead_id: orderFor.id,
        client_name: orderFor.name,
        client_email: orderFor.email,
        service: orderForm.service,
        package: orderForm.package,
        amount: orderForm.amount ? Number(orderForm.amount) : null,
        notes: orderForm.notes || `Created from lead: ${orderFor.email}`,
        status: "pending",
      });
      toast.success("Order created from lead");
      logAudit("order.create_from_lead", "lead", orderFor.id, { service: orderForm.service });
      setOrderFor(null);
      setOrderForm({ service: "Web Design & Development", package: "Growth", amount: "", notes: "" });
      loadAll();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function markMessageRead(id: string) {
    try {
      await updateDocById("messages", id, { read: true });
      loadAll();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function sendReply() {
    if (!replyTo || !replyBody.trim()) return;
    try {
      await insertDoc("notifications", {
        to_email: replyTo.sender_email,
        subject: `Re: ${replyTo.subject || "Your message to Basirah Infinity"}`,
        body: replyBody,
        kind: "admin-reply",
        status: "queued",
        sent: false,
      });
      await updateDocById("messages", replyTo.id, { read: true });
      toast.success("Reply dispatched and recorded.");
      logAudit("message.reply", "message", replyTo.id);
      setReplyTo(null);
      setReplyBody("");
      loadAll();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function setCollabStatus(id: string, status: string, email: string, name: string) {
    try {
      const updates: any = { status };
      if (status === "approved" || status === "rejected") updates.response_sent = true;
      await updateDocById("collaborations", id, updates);
      if (status === "approved" || status === "rejected") {
        await insertDoc("notifications", {
          to_email: email,
          subject: `Your Basirah Infinity collaboration request — ${status}`,
          body:
            status === "approved"
              ? `Hi ${name},\n\nGreat news — we'd love to collaborate. Murtesa Alafi will reach out shortly to set things up.\n\n— Basirah Infinity Studio`
              : `Hi ${name},\n\nThanks for your interest in Basirah Infinity. We'll keep your details on file.\n\n— Basirah Infinity Studio`,
          kind: "collab-response",
          status: "queued",
          sent: false,
        });
      }
      toast.success(`Collaboration → ${status}`);
      logAudit("collab.status", "collab", id, { status });
      loadAll();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function postAnnouncement() {
    if (!annTitle.trim() || !annBody.trim()) return toast.error("Title and body required");
    const user = getCurrentUser();
    try {
      await insertDoc("announcements", {
        title: annTitle,
        body: annBody,
        pinned: annPinned,
        published: true,
        created_by: user?.uid ?? null,
      });
      toast.success("Announcement published");
      logAudit("announcement.create", "announcement", undefined, { title: annTitle });
      setAnnOpen(false);
      setAnnTitle("");
      setAnnBody("");
      setAnnPinned(false);
      loadAll();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  async function togglePin(a: any) {
    await updateDocById("announcements", a.id, { pinned: !a.pinned });
    loadAll();
  }

  async function deleteAnn(id: string) {
    await deleteDocById("announcements", id);
    logAudit("announcement.delete", "announcement", id);
    loadAll();
  }

  const unread = useMemo(() => messages.filter((m) => !m.read).length, [messages]);
  const activeChannelsCount = useMemo(
    () => channelsList.filter((c) => c.status !== "delivered").length,
    [channelsList]
  );

  const kpis = [
    { l: "Channels", v: channelsList.length, icon: FileCheck2 },
    { l: "Live Orders", v: orders.length, icon: ShoppingBag },
    { l: "Services CMS", v: servicesList.length, icon: Palette },
    { l: "Portfolio Works", v: worksList.length, icon: Briefcase },
  ];

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* HEADER BAR */}
        <div className="liquid-glass rounded-3xl p-6 shadow-elevated">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-neon-cyan/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-widest text-neon-cyan border border-neon-cyan/30">
                  Director Console · Murtesa Alafi
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Live Systems
                </span>
              </div>
              <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl text-foreground">
                Basirah Infinity <span className="text-gradient-brand">Command Center</span>
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">
                All-in-one Executive CMS: Services, Works, About, Orders, Pricing & Client Consultation Channels.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" onClick={loadAll}>
                <TrendingUp className="h-4 w-4 mr-1.5" /> Refresh
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/studio">
                  <Sparkles className="h-4 w-4 mr-1.5" /> Studio
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/lab">
                  <Wand2 className="h-4 w-4 mr-1.5" /> AI Lab
                </Link>
              </Button>
              <Button size="sm" variant="outline" onClick={() => setAnnOpen(true)}>
                <Megaphone className="h-4 w-4 mr-1.5" /> Announce
              </Button>
            </div>
          </div>
        </div>

        {/* TOP-DOWN LEFT SIDEBAR & MAIN WORKSPACE */}
        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          {/* LEFT-SIDE TOP-DOWN CONTROL PANEL */}
          <aside className="lg:col-span-3 space-y-2">
            <div className="liquid-glass rounded-3xl p-4 shadow-glow">
              <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Navigation & CMS
              </p>

              {/* Vertical Stack of Top-Down Buttons */}
              <nav className="flex flex-col space-y-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("overview")}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                    activeTab === "overview"
                      ? "bg-gradient-brand text-white shadow-glow"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <LayoutDashboard className="h-4 w-4" /> Overview & Metrics
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("channels")}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                    activeTab === "channels"
                      ? "bg-gradient-brand text-white shadow-glow"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <FileCheck2 className="h-4 w-4 text-neon-cyan" /> Client Channels & RSD
                  </span>
                  <span className="rounded-full bg-neon-cyan/20 px-2 py-0.5 text-[10px] text-neon-cyan">
                    {channelsList.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("components")}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                    activeTab === "components"
                      ? "bg-gradient-brand text-white shadow-glow"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Code2 className="h-4 w-4 text-amber-400" /> Studio Components & Miracles
                  </span>
                  <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] text-amber-300">
                    {componentsList.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("services")}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                    activeTab === "services"
                      ? "bg-gradient-brand text-white shadow-glow"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Palette className="h-4 w-4" /> Edit Services
                  </span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">
                    {servicesList.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("works")}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                    activeTab === "works"
                      ? "bg-gradient-brand text-white shadow-glow"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Briefcase className="h-4 w-4" /> Edit Works & Showcase
                  </span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">
                    {worksList.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("pricing")}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                    activeTab === "pricing"
                      ? "bg-gradient-brand text-white shadow-glow"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <DollarSign className="h-4 w-4" /> Edit Pricing Plans
                  </span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">
                    {pricingList.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("about")}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                    activeTab === "about"
                      ? "bg-gradient-brand text-white shadow-glow"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Info className="h-4 w-4" /> Edit About & Story
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("orders")}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                    activeTab === "orders"
                      ? "bg-gradient-brand text-white shadow-glow"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <ShoppingBag className="h-4 w-4" /> Orders & Milestones
                  </span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">
                    {orders.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("leads")}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                    activeTab === "leads"
                      ? "bg-gradient-brand text-white shadow-glow"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Users className="h-4 w-4" /> Leads & Inquiries
                  </span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">
                    {leads.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("messages")}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                    activeTab === "messages"
                      ? "bg-gradient-brand text-white shadow-glow"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Inbox className="h-4 w-4" /> Direct Messages
                  </span>
                  {unread > 0 && (
                    <span className="rounded-full bg-neon-magenta px-2 py-0.5 text-[10px] text-white font-bold">
                      {unread}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("collabs")}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                    activeTab === "collabs"
                      ? "bg-gradient-brand text-white shadow-glow"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Handshake className="h-4 w-4" /> Collaborations
                  </span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">
                    {collabs.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("announcements")}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                    activeTab === "announcements"
                      ? "bg-gradient-brand text-white shadow-glow"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Megaphone className="h-4 w-4" /> Announcements
                  </span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">
                    {announcements.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("audit")}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                    activeTab === "audit"
                      ? "bg-gradient-brand text-white shadow-glow"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Activity className="h-4 w-4" /> Security Audit
                  </span>
                </button>
              </nav>
            </div>
          </aside>

          {/* RIGHT-SIDE CONTENT WORKSPACE */}
          <main className="lg:col-span-9 space-y-6">
            {/* TAB: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {kpis.map((k) => (
                    <div key={k.l} className="liquid-glass rounded-2xl p-5 border border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          {k.l}
                        </span>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand text-white">
                          <k.icon className="h-4 w-4" />
                        </div>
                      </div>
                      <p className="mt-3 font-display text-3xl font-bold text-foreground">{k.v}</p>
                    </div>
                  ))}
                </div>

                {/* Quick Shortcuts */}
                <div className="liquid-glass rounded-3xl p-6">
                  <h3 className="font-display text-lg font-bold">Quick Executive Actions</h3>
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    <Button onClick={() => setActiveTab("channels")} className="bg-gradient-brand text-white">
                      <FileCheck2 className="h-4 w-4 mr-1.5" /> Client Consultation Channels
                    </Button>
                    <Button onClick={openAddService} variant="outline" className="border-white/10">
                      <Plus className="h-4 w-4 mr-1.5" /> Add Service
                    </Button>
                    <Button onClick={openAddWork} variant="outline" className="border-white/10">
                      <Plus className="h-4 w-4 mr-1.5" /> Add Portfolio Work
                    </Button>
                    <Button onClick={openAddPricing} variant="outline" className="border-white/10">
                      <Plus className="h-4 w-4 mr-1.5" /> Add Pricing Tier
                    </Button>
                  </div>
                </div>

                {/* Recent Channels Overview */}
                <div className="liquid-glass rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-lg font-bold">Recent Client Consultation Channels</h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setActiveTab("channels")}
                      className="text-xs text-neon-cyan"
                    >
                      View All Channels →
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {channelsList.slice(0, 3).map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setSelectedChannel(c);
                          setActiveTab("channels");
                        }}
                        className="cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 hover:bg-white/[0.05] transition-all"
                      >
                        <div>
                          <p className="font-display font-semibold text-foreground text-sm">{c.project_title}</p>
                          <p className="text-xs text-muted-foreground">
                            Client: {c.client_name} ({c.client_email})
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="rounded-full bg-neon-cyan/15 px-2.5 py-0.5 text-xs text-neon-cyan font-semibold">
                            {c.status}
                          </span>
                          <span className="text-xs font-semibold text-foreground">
                            {c.specification?.total_amount ? `$${c.specification.total_amount}` : "Drafting"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: CLIENT CHANNELS & RSD GENERATOR */}
            {activeTab === "channels" && (
              <div className="space-y-6">
                <div className="liquid-glass rounded-3xl p-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="font-display text-2xl font-bold">Client Consultation & RSD Hub</h2>
                      <p className="text-xs text-muted-foreground">
                        Manage interactive client questionnaires, author Requirement Specification Documents (RSD), track payments, and hand over deliverables.
                      </p>
                    </div>
                    {selectedChannel && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={openRsdGenerator}
                          className="bg-gradient-brand text-white shadow-glow"
                        >
                          <FileText className="h-4 w-4 mr-1.5" /> Author / Send RSD
                        </Button>
                        <Button
                          size="sm"
                          onClick={openDeliveryDialog}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white"
                        >
                          <Award className="h-4 w-4 mr-1.5" /> Deliver Project
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-12">
                  {/* Left: Channel Selector */}
                  <div className="lg:col-span-4 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
                      Active Channels ({channelsList.length})
                    </p>
                    {channelsList.map((c) => {
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
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="font-display text-sm font-bold text-foreground line-clamp-1">
                              {c.project_title}
                            </h4>
                            <span className="text-[10px] rounded-full bg-white/10 px-2 py-0.5 text-muted-foreground uppercase">
                              {c.status}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {c.client_name} ({c.client_company})
                          </p>
                          <p className="text-[11px] text-neon-cyan font-semibold mt-2">
                            {c.specification?.total_amount ? `$${c.specification.total_amount}` : "Spec not sent"}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right: Active Channel Control Panel */}
                  {selectedChannel && (
                    <div className="lg:col-span-8 space-y-6">
                      {/* Channel Info */}
                      <div className="liquid-glass rounded-3xl p-6">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-neon-cyan">
                              Active Client Channel
                            </span>
                            <h3 className="font-display text-2xl font-bold mt-1 text-foreground">
                              {selectedChannel.project_title}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              Client: {selectedChannel.client_name} · Email: {selectedChannel.client_email} · Phone: {selectedChannel.client_phone}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="inline-block rounded-full bg-gradient-brand/20 border border-white/20 px-3 py-1 text-xs font-semibold text-foreground">
                              Status: {selectedChannel.status.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Questionnaire Section */}
                        <div className="mt-6">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-neon-cyan">
                              Discovery Questions & Client Answers
                            </h4>
                          </div>

                          <div className="space-y-3">
                            {selectedChannel.questions?.map((q: any, idx: number) => (
                              <div
                                key={q.id || idx}
                                className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-xs"
                              >
                                <p className="font-semibold text-foreground">{q.question}</p>
                                <div className="mt-2 rounded-xl bg-black/30 p-3 border border-white/5">
                                  <span className="text-[10px] text-muted-foreground uppercase block mb-1">
                                    Client Answer:
                                  </span>
                                  {q.answer ? (
                                    <p className="text-foreground whitespace-pre-wrap">{q.answer}</p>
                                  ) : (
                                    <span className="text-amber-400/80 italic">Awaiting answer from client...</span>
                                  )}
                                </div>
                              </div>
                            ))}

                            {/* Add Question to Client */}
                            <div className="flex gap-2 pt-2">
                              <Input
                                value={newQuestionText}
                                onChange={(e) => setNewQuestionText(e.target.value)}
                                placeholder="Formulate an additional discovery question for this client..."
                                className="bg-white/5 text-xs"
                              />
                              <Button
                                size="sm"
                                onClick={handleAddQuestionToChannel}
                                className="bg-gradient-brand text-white shrink-0"
                              >
                                Send Question
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Specification Summary if Issued */}
                        {selectedChannel.specification && (
                          <div className="mt-6 rounded-2xl bg-white/[0.03] border border-neon-cyan/30 p-5">
                            <div className="flex items-center justify-between border-b border-white/10 pb-3">
                              <div>
                                <span className="text-[10px] text-neon-cyan font-bold uppercase">
                                  Landed Specification Document
                                </span>
                                <h4 className="font-display text-lg font-bold">
                                  {selectedChannel.specification.title}
                                </h4>
                              </div>
                              <div className="text-right">
                                <span className="font-display text-xl font-bold text-gradient-brand">
                                  ${selectedChannel.specification.total_amount?.toLocaleString()}
                                </span>
                                <p className="text-[10px] text-muted-foreground">
                                  {selectedChannel.specification.client_confirmed ? (
                                    <span className="text-emerald-400 font-semibold">✓ Confirmed by Client</span>
                                  ) : (
                                    <span className="text-amber-400 font-semibold">Pending Client Confirmation</span>
                                  )}
                                </p>
                              </div>
                            </div>

                            <p className="mt-3 text-xs text-muted-foreground">
                              {selectedChannel.specification.executive_summary}
                            </p>
                          </div>
                        )}

                        {/* Payment Verification */}
                        {selectedChannel.payment?.paid && (
                          <div className="mt-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 p-4 text-xs text-foreground flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-emerald-400 flex items-center gap-1.5">
                                <BadgeCheck className="h-4 w-4" /> Payment Authorized & Verified
                              </p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                Receipt: {selectedChannel.payment.receipt_number} · Method: {selectedChannel.payment.payment_method}
                              </p>
                            </div>
                            <span className="font-mono font-bold text-sm text-foreground">
                              ${selectedChannel.payment.amount_paid?.toLocaleString()}
                            </span>
                          </div>
                        )}

                        {/* Delivery Info */}
                        {selectedChannel.delivery?.delivered && (
                          <div className="mt-6 rounded-2xl bg-blue-950/20 border border-blue-500/30 p-4 text-xs">
                            <p className="font-semibold text-blue-400 flex items-center gap-1.5">
                              <Award className="h-4 w-4" /> Project Delivered to Client Portal
                            </p>
                            <p className="text-muted-foreground mt-1">
                              Live: {selectedChannel.delivery.live_url} · GitHub: {selectedChannel.delivery.github_url}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: STUDIO COMPONENTS CMS */}
            {activeTab === "components" && (
              <div className="space-y-6">
                <div className="liquid-glass rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-white/10">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-display text-2xl font-bold">Studio Components & Miracle Forge</h2>
                      <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
                        PRO STUDIO CMS
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Create, edit, and curate components for the Basirah Infinity Studio. All components created here sync immediately to the Studio catalog.
                    </p>
                  </div>
                  <Button onClick={openAddComponent} className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-black font-bold shadow-glow hover:brightness-110">
                    <Plus className="h-4 w-4 mr-1.5" /> Create New Component
                  </Button>
                </div>

                {/* Category Filter Pills */}
                <div className="flex flex-wrap gap-1.5 bg-white/5 p-2 rounded-2xl border border-white/10">
                  {[
                    { id: "all", label: "All Components" },
                    { id: "miracle", label: "Miracles" },
                    { id: "buttons", label: "Buttons & CTAs" },
                    { id: "cards", label: "Cards & Bento" },
                    { id: "ai", label: "AI Swarms" },
                    { id: "navigation", label: "Navigation & Docks" },
                    { id: "forms", label: "Forms & Inputs" },
                    { id: "tables", label: "Tables & Data" },
                    { id: "ecommerce", label: "E-Commerce" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setComponentFilter(cat.id)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                        componentFilter === cat.id
                          ? "bg-gradient-brand text-white shadow-glow"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Components Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {componentsList
                    .filter((c) => componentFilter === "all" || c.category === componentFilter)
                    .map((c) => (
                      <div
                        key={c.id}
                        className="liquid-glass rounded-3xl p-5 border border-white/10 flex flex-col justify-between hover:border-amber-400/30 transition-all"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="rounded-full bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 text-[9px] font-mono uppercase text-amber-300">
                              {c.category}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {c.id.slice(0, 12)}
                            </span>
                          </div>

                          <h3 className="mt-3 font-display text-lg font-bold text-foreground">
                            {c.title}
                          </h3>
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                            {c.description || "Interactive pro component engineered for Basirah Infinity."}
                          </p>

                          {/* Live Preview Miniature Box */}
                          <div className="mt-3 rounded-2xl border border-white/10 bg-black/40 p-4 flex items-center justify-center min-h-[90px]">
                            {c.category === "buttons" ? (
                              <button className="rounded-xl bg-gradient-brand px-4 py-2 text-xs font-bold text-white shadow-glow">
                                {c.title}
                              </button>
                            ) : c.category === "miracle" ? (
                              <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-300 text-center">
                                ✨ {c.title}
                              </div>
                            ) : (
                              <div className="liquid-glass rounded-xl p-3 text-center w-full">
                                <span className="text-xs font-semibold text-foreground">{c.title}</span>
                              </div>
                            )}
                          </div>

                          {/* Tags */}
                          {c.tags && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {(Array.isArray(c.tags) ? c.tags : [c.tags]).slice(0, 3).map((t: string, i: number) => (
                                <span key={i} className="rounded-md bg-white/5 px-1.5 py-0.5 text-[9px] text-muted-foreground">
                                  #{t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="mt-4 flex items-center justify-end gap-2 border-t border-white/10 pt-3">
                          <Button size="sm" variant="outline" onClick={() => openEditComponent(c)} className="h-8 text-xs">
                            <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteComponent(c.id)} className="h-8 text-xs text-red-400 hover:text-red-300">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>

                {componentsList.filter((c) => componentFilter === "all" || c.category === componentFilter).length === 0 && (
                  <div className="liquid-glass rounded-3xl p-12 text-center border border-dashed border-white/15">
                    <Code2 className="mx-auto h-10 w-10 text-amber-400 mb-3" />
                    <h3 className="font-display text-lg font-bold">No components in this category</h3>
                    <p className="text-xs text-muted-foreground mt-1">Click the button below to forge a new component.</p>
                    <Button onClick={openAddComponent} className="mt-4 bg-gradient-brand text-white text-xs">
                      <Plus className="h-4 w-4 mr-1.5" /> Create Component
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* TAB: SERVICES CMS */}
            {activeTab === "services" && (
              <div className="space-y-6">
                <div className="liquid-glass rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl font-bold">Services Management (Live CMS)</h2>
                    <p className="text-xs text-muted-foreground">
                      Add, edit, or delete studio services. Updates immediately reflect on the public /services page.
                    </p>
                  </div>
                  <Button onClick={openAddService} className="bg-gradient-brand text-white shadow-glow">
                    <Plus className="h-4 w-4 mr-1.5" /> Add New Service
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {servicesList.map((s) => (
                    <div
                      key={s.id}
                      className="liquid-glass rounded-3xl p-6 border border-white/10 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="rounded-full bg-neon-cyan/20 px-2.5 py-0.5 text-[10px] font-semibold text-neon-cyan uppercase">
                            {s.tag || "Flagship"}
                          </span>
                          <span className="font-display text-sm font-bold text-foreground">{s.price}</span>
                        </div>
                        <h3 className="mt-3 font-display text-xl font-bold text-foreground">{s.title}</h3>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{s.short || s.description}</p>

                        <div className="mt-4 space-y-1">
                          {s.features?.slice(0, 3).map((f: string, i: number) => (
                            <p key={i} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                              <Check className="h-3 w-3 text-neon-cyan shrink-0" /> {f}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-end gap-2 border-t border-white/10 pt-4">
                        <Button size="sm" variant="outline" onClick={() => openEditService(s)}>
                          <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteService(s.id)} className="text-red-400 hover:text-red-300">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: WORKS CMS */}
            {activeTab === "works" && (
              <div className="space-y-6">
                <div className="liquid-glass rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl font-bold">Portfolio & Works Showcase (Live CMS)</h2>
                    <p className="text-xs text-muted-foreground">
                      Add, edit, or delete showcase items. Instantly updates the /works page.
                    </p>
                  </div>
                  <Button onClick={openAddWork} className="bg-gradient-brand text-white shadow-glow">
                    <Plus className="h-4 w-4 mr-1.5" /> Add New Project
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {worksList.map((w) => (
                    <div
                      key={w.id}
                      className="liquid-glass rounded-3xl overflow-hidden border border-white/10 flex flex-col justify-between"
                    >
                      <div className={`h-24 bg-gradient-to-br ${w.gradient || "from-blue-500/40 to-cyan-500/40"} p-4 flex items-start justify-between`}>
                        <span className="rounded-full bg-black/40 px-2.5 py-0.5 text-[10px] font-semibold text-white">
                          {w.tag}
                        </span>
                        <span className="text-[10px] text-white/80 font-mono">{w.client}</span>
                      </div>
                      <div className="p-5 flex-1">
                        <p className="text-[10px] text-neon-cyan uppercase font-semibold">{w.category}</p>
                        <h3 className="font-display text-lg font-bold text-foreground mt-0.5">{w.title}</h3>
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{w.summary}</p>
                        <p className="mt-3 text-xs font-semibold text-gradient-brand">Impact: {w.impact}</p>
                      </div>

                      <div className="p-4 border-t border-white/10 flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditWork(w)}>
                          <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteWork(w.id)} className="text-red-400 hover:text-red-300">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: PRICING CMS */}
            {activeTab === "pricing" && (
              <div className="space-y-6">
                <div className="liquid-glass rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl font-bold">Pricing Packages CMS</h2>
                    <p className="text-xs text-muted-foreground">
                      Configure service tiers and rates. Instantly updates the /pricing page.
                    </p>
                  </div>
                  <Button onClick={openAddPricing} className="bg-gradient-brand text-white shadow-glow">
                    <Plus className="h-4 w-4 mr-1.5" /> Add Pricing Tier
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {pricingList.map((p) => (
                    <div
                      key={p.id}
                      className={`liquid-glass rounded-3xl p-6 flex flex-col justify-between ${
                        p.popular ? "ring-2 ring-primary shadow-glow" : "border border-white/10"
                      }`}
                    >
                      <div>
                        {p.popular && (
                          <span className="rounded-full bg-gradient-brand px-2.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-widest block w-fit mb-2">
                            {p.badge || "MOST POPULAR"}
                          </span>
                        )}
                        <h3 className="font-display text-xl font-bold text-foreground">{p.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{p.description}</p>
                        <p className="font-display text-3xl font-bold text-gradient-brand mt-4">{p.price}</p>
                        <p className="text-[10px] text-muted-foreground">{p.period || "per project"}</p>

                        <div className="mt-4 space-y-1.5">
                          {p.features?.map((f: string, i: number) => (
                            <p key={i} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                              <Check className="h-3 w-3 text-neon-cyan shrink-0" /> {f}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-end gap-2 border-t border-white/10 pt-4">
                        <Button size="sm" variant="outline" onClick={() => openEditPricing(p)}>
                          <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeletePricing(p.id)} className="text-red-400 hover:text-red-300">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: ABOUT CMS */}
            {activeTab === "about" && (
              <div className="space-y-6">
                <div className="liquid-glass rounded-3xl p-6">
                  <h2 className="font-display text-2xl font-bold">About & Founder Story CMS</h2>
                  <p className="text-xs text-muted-foreground">
                    Update Murtesa Alafi's founder biography, agency vision, core stats, and mission values. Syncs to /about page.
                  </p>

                  <form onSubmit={handleSaveAbout} className="mt-6 space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label className="text-xs">Founder Name</Label>
                        <Input
                          value={aboutData.founder_name || "Murtesa Alafi"}
                          onChange={(e) => setAboutData({ ...aboutData, founder_name: e.target.value })}
                          className="mt-1 bg-white/5"
                          required
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Founder Title & Role</Label>
                        <Input
                          value={aboutData.founder_title || "Founder, Creative Director & Systems Architect"}
                          onChange={(e) => setAboutData({ ...aboutData, founder_title: e.target.value })}
                          className="mt-1 bg-white/5"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label className="text-xs">Direct Phone</Label>
                        <Input
                          value={aboutData.founder_phone || "+251 708 229 717"}
                          onChange={(e) => setAboutData({ ...aboutData, founder_phone: e.target.value })}
                          className="mt-1 bg-white/5"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Direct Studio Email</Label>
                        <Input
                          value={aboutData.founder_email || "basirahinfinity@gmail.com"}
                          onChange={(e) => setAboutData({ ...aboutData, founder_email: e.target.value })}
                          className="mt-1 bg-white/5"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Founder Biography (Paragraph 1)</Label>
                      <Textarea
                        value={aboutData.bio_p1 || ""}
                        onChange={(e) => setAboutData({ ...aboutData, bio_p1: e.target.value })}
                        rows={3}
                        className="mt-1 bg-white/5 text-xs"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Founder Biography (Paragraph 2)</Label>
                      <Textarea
                        value={aboutData.bio_p2 || ""}
                        onChange={(e) => setAboutData({ ...aboutData, bio_p2: e.target.value })}
                        rows={3}
                        className="mt-1 bg-white/5 text-xs"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Studio Core Vision</Label>
                      <Textarea
                        value={aboutData.vision || ""}
                        onChange={(e) => setAboutData({ ...aboutData, vision: e.target.value })}
                        rows={2}
                        className="mt-1 bg-white/5 text-xs"
                      />
                    </div>

                    <Button type="submit" disabled={savingAbout} className="bg-gradient-brand text-white shadow-glow">
                      {savingAbout ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                      Save & Publish About Content
                    </Button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB: ORDERS MANAGEMENT */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <div className="liquid-glass rounded-3xl p-6">
                  <h2 className="font-display text-2xl font-bold">Client Orders & Milestones</h2>
                  <p className="text-xs text-muted-foreground">
                    Update order progress, amounts, notes, and deliverable status.
                  </p>

                  <div className="mt-6 space-y-3">
                    {orders.length === 0 ? (
                      <p className="text-center py-8 text-xs text-muted-foreground">No orders recorded yet.</p>
                    ) : (
                      orders.map((o) => (
                        <div
                          key={o.id}
                          className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-display font-bold text-foreground text-base">{o.service}</h4>
                              <span className="rounded bg-white/10 px-2 py-0.5 text-xs text-muted-foreground">
                                {o.package || "Custom"}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Client: <strong className="text-foreground">{o.client_name}</strong> ({o.client_email})
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Amount: <strong className="text-foreground">{o.amount ? `$${o.amount}` : "Milestone"}</strong> · Date: {fmtDate(o.created_at)}
                            </p>
                            {o.notes && <p className="text-[11px] text-foreground/80 mt-1 italic">{o.notes}</p>}
                          </div>

                          <div className="flex items-center gap-2">
                            {ORDER_STATUSES.map((st) => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => setOrderStatus(o.id, st)}
                                className={`rounded-xl px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider transition-all ${
                                  o.status === st
                                    ? "bg-gradient-brand text-white shadow-glow"
                                    : "bg-white/5 text-muted-foreground hover:bg-white/10"
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: LEADS CRM */}
            {activeTab === "leads" && (
              <div className="space-y-6">
                <div className="liquid-glass rounded-3xl p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div>
                      <h2 className="font-display text-2xl font-bold">Leads & Inquiries CRM</h2>
                      <p className="text-xs text-muted-foreground">Captured from contact forms and direct inquiries.</p>
                    </div>

                    {selected.size > 0 && (
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => bulkAction("qualified")}>
                          Mark Qualified
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => bulkAction("delete")}>
                          Delete ({selected.size})
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {leads.map((l) => (
                      <div
                        key={l.id}
                        className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={selected.has(l.id)}
                            onCheckedChange={() => {
                              const next = new Set(selected);
                              next.has(l.id) ? next.delete(l.id) : next.add(l.id);
                              setSelected(next);
                            }}
                          />
                          <div>
                            <p className="font-semibold text-foreground text-sm">{l.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {l.email} · {l.phone || "No phone"} · {l.company || "No company"}
                            </p>
                            <p className="text-xs text-foreground/80 mt-1">{l.message}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={l.status || "new"}
                            onChange={(e) => setLeadStatus(l.id, e.target.value)}
                            className="bg-black/40 border border-white/15 rounded-xl px-2 py-1 text-xs text-foreground"
                          >
                            {LEAD_STATUSES.map((st) => (
                              <option key={st} value={st} className="bg-card text-foreground">
                                {st}
                              </option>
                            ))}
                          </select>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteLead(l.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: DIRECT MESSAGES */}
            {activeTab === "messages" && (
              <div className="space-y-6">
                <div className="liquid-glass rounded-3xl p-6">
                  <h2 className="font-display text-2xl font-bold">Direct Client Messages</h2>
                  <p className="text-xs text-muted-foreground">Inbound communications sent from client dashboards.</p>

                  <div className="mt-5 space-y-3">
                    {messages.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-6 text-center">No messages in inbox.</p>
                    ) : (
                      messages.map((m) => (
                        <div
                          key={m.id}
                          className={`rounded-2xl border p-4 transition-all ${
                            m.read ? "border-white/10 bg-white/[0.02]" : "border-neon-cyan/40 bg-neon-cyan/5"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-display font-semibold text-sm text-foreground">
                              {m.sender_name} ({m.sender_email})
                            </span>
                            <span className="text-[10px] text-muted-foreground">{fmtDateTime(m.created_at)}</span>
                          </div>
                          <p className="text-xs font-semibold text-neon-cyan mt-1">{m.subject}</p>
                          <p className="text-xs text-foreground/90 mt-2 whitespace-pre-wrap">{m.body}</p>

                          <div className="mt-3 flex items-center justify-end gap-2 border-t border-white/5 pt-2">
                            {!m.read && (
                              <Button size="sm" variant="ghost" onClick={() => markMessageRead(m.id)}>
                                Mark Read
                              </Button>
                            )}
                            <Button
                              size="sm"
                              onClick={() => {
                                setReplyTo(m);
                                setReplyBody(`Hi ${m.sender_name},\n\n`);
                              }}
                              className="bg-gradient-brand text-white text-xs"
                            >
                              Reply
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: COLLABORATIONS */}
            {activeTab === "collabs" && (
              <div className="space-y-6">
                <div className="liquid-glass rounded-3xl p-6">
                  <h2 className="font-display text-2xl font-bold">Agency & Talent Collaborations</h2>
                  <p className="text-xs text-muted-foreground">Partnership applications submitted via /collaborate.</p>

                  <div className="mt-5 space-y-3">
                    {collabs.map((c) => (
                      <div
                        key={c.id}
                        className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <p className="font-semibold text-foreground text-sm">{c.name} ({c.type})</p>
                          <p className="text-muted-foreground">{c.email} · {c.portfolio_url}</p>
                          <p className="text-foreground/90 mt-1">{c.proposal}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-white/10 px-2 py-0.5 uppercase text-[10px]">{c.status}</span>
                          <Button
                            size="sm"
                            onClick={() => setCollabStatus(c.id, "approved", c.email, c.name)}
                            className="bg-emerald-500 text-white"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setCollabStatus(c.id, "rejected", c.email, c.name)}
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ANNOUNCEMENTS */}
            {activeTab === "announcements" && (
              <div className="space-y-6">
                <div className="liquid-glass rounded-3xl p-6 flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-2xl font-bold">Studio Announcements</h2>
                    <p className="text-xs text-muted-foreground">Broadcast updates to the public banner and client portal.</p>
                  </div>
                  <Button onClick={() => setAnnOpen(true)} className="bg-gradient-brand text-white">
                    <Plus className="h-4 w-4 mr-1.5" /> New Announcement
                  </Button>
                </div>

                <div className="space-y-3">
                  {announcements.map((a) => (
                    <div
                      key={a.id}
                      className="liquid-glass rounded-2xl p-4 border border-white/10 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-foreground text-sm">{a.title}</h4>
                          {a.pinned && (
                            <span className="rounded bg-neon-cyan/20 px-2 py-0.5 text-[10px] text-neon-cyan font-bold">
                              PINNED
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground mt-1">{a.body}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => togglePin(a)}>
                          {a.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteAnn(a.id)} className="text-red-400">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: AUDIT TRAIL */}
            {activeTab === "audit" && (
              <div className="space-y-6">
                <div className="liquid-glass rounded-3xl p-6">
                  <h2 className="font-display text-2xl font-bold">Security & Activity Audit Trail</h2>
                  <p className="text-xs text-muted-foreground">Immutable audit logs for administrative actions.</p>

                  <div className="mt-5 space-y-2 font-mono text-xs">
                    {audit.map((ad) => (
                      <div
                        key={ad.id}
                        className="rounded-xl border border-white/5 bg-black/30 p-3 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-neon-cyan">{ad.action}</span> ·{" "}
                          <span className="text-muted-foreground">{ad.actor_email}</span>
                          {ad.meta && (
                            <p className="text-[10px] text-foreground/70 mt-0.5">{JSON.stringify(ad.meta)}</p>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0">{fmtDateTime(ad.created_at)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* DIALOG: STUDIO COMPONENT CMS MODAL */}
        <Dialog open={componentDialogOpen} onOpenChange={setComponentDialogOpen}>
          <DialogContent className="liquid-glass border-white/20 sm:max-w-3xl bg-background/95 max-h-[92vh] overflow-y-auto p-6 sm:p-8">
            <DialogHeader>
              <DialogTitle className="font-display text-xl flex items-center gap-2">
                <Code2 className="h-5 w-5 text-amber-400" />
                {componentForm.id ? "Edit Studio Component" : "Create New Miracle Component"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Craft a new component for the Basirah Infinity Studio. Supports custom JSX code, Tailwind, and CSS styling.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveComponent} className="space-y-4 py-2">
              <div>
                <Label className="text-xs font-semibold">Component Title</Label>
                <Input
                  value={componentForm.title}
                  onChange={(e) => setComponentForm({ ...componentForm, title: e.target.value })}
                  placeholder="e.g. Imperial 24K Liquid Gold Glass Box"
                  className="mt-1 bg-white/5"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Category</Label>
                  <select
                    value={componentForm.category}
                    onChange={(e) => setComponentForm({ ...componentForm, category: e.target.value })}
                    className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  >
                    <option value="miracle" className="bg-black">Miracle Special</option>
                    <option value="buttons" className="bg-black">Buttons & CTAs</option>
                    <option value="cards" className="bg-black">Cards & Bento</option>
                    <option value="ai" className="bg-black">AI Swarms & Autonomy</option>
                    <option value="navigation" className="bg-black">Navigation & Docks</option>
                    <option value="forms" className="bg-black">Forms & Inputs</option>
                    <option value="tables" className="bg-black">Tables & Data</option>
                    <option value="ecommerce" className="bg-black">E-Commerce & Checkout</option>
                    <option value="proof" className="bg-black">Social Proof</option>
                  </select>
                </div>

                <div>
                  <Label className="text-xs font-semibold">Preview Visual Style</Label>
                  <Input
                    value={componentForm.previewType}
                    onChange={(e) => setComponentForm({ ...componentForm, previewType: e.target.value })}
                    placeholder="e.g. golden-morph, water-card, button"
                    className="mt-1 bg-white/5 text-xs"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold">Description</Label>
                <Input
                  value={componentForm.description}
                  onChange={(e) => setComponentForm({ ...componentForm, description: e.target.value })}
                  placeholder="e.g. Ultra-luxury refractive glass with specular gold border harmonics."
                  className="mt-1 bg-white/5 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Tags (comma-separated)</Label>
                <Input
                  value={componentForm.tags}
                  onChange={(e) => setComponentForm({ ...componentForm, tags: e.target.value })}
                  placeholder="gold, miracle, glass, button, cta"
                  className="mt-1 bg-white/5 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">JSX / React Code Snippet</Label>
                <Textarea
                  value={componentForm.jsxCode}
                  onChange={(e) => setComponentForm({ ...componentForm, jsxCode: e.target.value })}
                  rows={4}
                  placeholder={`<div className="liquid-glass p-6 rounded-3xl">...</div>`}
                  className="mt-1 bg-white/5 font-mono text-xs"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">CSS Styles / Tailwind Utilities</Label>
                <Textarea
                  value={componentForm.cssCode}
                  onChange={(e) => setComponentForm({ ...componentForm, cssCode: e.target.value })}
                  rows={2}
                  placeholder="backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.2);"
                  className="mt-1 bg-white/5 font-mono text-xs"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="ghost" onClick={() => setComponentDialogOpen(false)} className="text-xs">
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-brand text-white shadow-glow text-xs">
                  {componentForm.id ? "Update Component" : "Save & Publish Component"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* DIALOG: SERVICE CMS MODAL */}
        <Dialog open={serviceDialogOpen} onOpenChange={setServiceDialogOpen}>
          <DialogContent className="liquid-glass border-white/20 sm:max-w-2xl bg-background/95 max-h-[92vh] overflow-y-auto p-6 sm:p-8">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                {serviceForm.id ? "Edit Service" : "Add New Service"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Configuring this service will immediately update the live /services page.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveService} className="space-y-4 py-2">
              <div>
                <Label className="text-xs">Service Title</Label>
                <Input
                  value={serviceForm.title}
                  onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                  placeholder="e.g. Autonomous AI Workflow Suite"
                  className="mt-1 bg-white/5"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Starting Price</Label>
                  <Input
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                    placeholder="From $1,800"
                    className="mt-1 bg-white/5"
                  />
                </div>
                <div>
                  <Label className="text-xs">Timeline</Label>
                  <Input
                    value={serviceForm.timeline}
                    onChange={(e) => setServiceForm({ ...serviceForm, timeline: e.target.value })}
                    placeholder="10–14 days"
                    className="mt-1 bg-white/5"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Short Description</Label>
                <Input
                  value={serviceForm.short}
                  onChange={(e) => setServiceForm({ ...serviceForm, short: e.target.value })}
                  placeholder="Brief 1-sentence value proposition"
                  className="mt-1 bg-white/5"
                />
              </div>

              <div>
                <Label className="text-xs">Detailed Description</Label>
                <Textarea
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  rows={3}
                  className="mt-1 bg-white/5 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs">Deliverable Features (one per line)</Label>
                <Textarea
                  value={serviceForm.features}
                  onChange={(e) => setServiceForm({ ...serviceForm, features: e.target.value })}
                  placeholder="High-fidelity UX/UI\nCustom API synthesis\nProduction Deployment"
                  rows={3}
                  className="mt-1 bg-white/5 text-xs"
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setServiceDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-brand text-white">
                  Save Service
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* DIALOG: WORK CMS MODAL */}
        <Dialog open={workDialogOpen} onOpenChange={setWorkDialogOpen}>
          <DialogContent className="liquid-glass border-white/20 sm:max-w-2xl bg-background/95 max-h-[92vh] overflow-y-auto p-6 sm:p-8">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                {workForm.id ? "Edit Portfolio Work" : "Add Portfolio Work"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                This project will appear dynamically on /works.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveWork} className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Project Title</Label>
                  <Input
                    value={workForm.title}
                    onChange={(e) => setWorkForm({ ...workForm, title: e.target.value })}
                    className="mt-1 bg-white/5"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs">Client Name</Label>
                  <Input
                    value={workForm.client}
                    onChange={(e) => setWorkForm({ ...workForm, client: e.target.value })}
                    className="mt-1 bg-white/5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Category</Label>
                  <Input
                    value={workForm.category}
                    onChange={(e) => setWorkForm({ ...workForm, category: e.target.value })}
                    className="mt-1 bg-white/5"
                  />
                </div>
                <div>
                  <Label className="text-xs">Impact Metric</Label>
                  <Input
                    value={workForm.impact}
                    onChange={(e) => setWorkForm({ ...workForm, impact: e.target.value })}
                    placeholder="+240% Sales Growth"
                    className="mt-1 bg-white/5"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Case Summary / Client Quote</Label>
                <Textarea
                  value={workForm.summary}
                  onChange={(e) => setWorkForm({ ...workForm, summary: e.target.value })}
                  rows={2}
                  className="mt-1 bg-white/5 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs">Live URL / Demo Link</Label>
                <Input
                  value={workForm.liveUrl}
                  onChange={(e) => setWorkForm({ ...workForm, liveUrl: e.target.value })}
                  className="mt-1 bg-white/5"
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setWorkDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-brand text-white">
                  Save Project
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* DIALOG: PRICING CMS MODAL */}
        <Dialog open={pricingDialogOpen} onOpenChange={setPricingDialogOpen}>
          <DialogContent className="liquid-glass border-white/20 sm:max-w-2xl bg-background/95 max-h-[92vh] overflow-y-auto p-6 sm:p-8">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                {pricingForm.id ? "Edit Pricing Tier" : "Add Pricing Tier"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Sets package prices on /pricing.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSavePricing} className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Package Name</Label>
                  <Input
                    value={pricingForm.name}
                    onChange={(e) => setPricingForm({ ...pricingForm, name: e.target.value })}
                    className="mt-1 bg-white/5"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs">Price</Label>
                  <Input
                    value={pricingForm.price}
                    onChange={(e) => setPricingForm({ ...pricingForm, price: e.target.value })}
                    placeholder="$1,490"
                    className="mt-1 bg-white/5"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Description</Label>
                <Input
                  value={pricingForm.description}
                  onChange={(e) => setPricingForm({ ...pricingForm, description: e.target.value })}
                  className="mt-1 bg-white/5"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Delivery Time</Label>
                  <Input
                    value={pricingForm.deliveryTime}
                    onChange={(e) => setPricingForm({ ...pricingForm, deliveryTime: e.target.value })}
                    placeholder="10–14 Business Days"
                    className="mt-1 bg-white/5"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Checkbox
                    checked={pricingForm.popular}
                    onCheckedChange={(c) => setPricingForm({ ...pricingForm, popular: Boolean(c) })}
                  />
                  <Label className="text-xs font-semibold">Mark as Most Popular</Label>
                </div>
              </div>

              <div>
                <Label className="text-xs">Package Features (one per line)</Label>
                <Textarea
                  value={pricingForm.features}
                  onChange={(e) => setPricingForm({ ...pricingForm, features: e.target.value })}
                  rows={4}
                  className="mt-1 bg-white/5 text-xs"
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setPricingDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-brand text-white">
                  Save Tier
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* DIALOG: AUTHOR REQUIREMENT SPECIFICATION DOCUMENT (RSD) */}
        <Dialog open={rsdDialogOpen} onOpenChange={setRsdDialogOpen}>
          <DialogContent className="liquid-glass border-white/20 sm:max-w-3xl bg-background/95 max-h-[92vh] overflow-y-auto p-6 sm:p-8">
            <DialogHeader>
              <DialogTitle className="font-display text-xl flex items-center gap-2">
                <FileText className="h-5 w-5 text-neon-cyan" /> Author Requirement Specification Document (RSD)
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Compose and formulate the official project specification for {selectedChannel?.client_name}.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSendRSD} className="space-y-4 py-2">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Label className="text-xs">Document Title</Label>
                  <Input
                    value={rsdForm.title}
                    onChange={(e) => setRsdForm({ ...rsdForm, title: e.target.value })}
                    className="mt-1 bg-white/5"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs">Version</Label>
                  <Input
                    value={rsdForm.version}
                    onChange={(e) => setRsdForm({ ...rsdForm, version: e.target.value })}
                    className="mt-1 bg-white/5"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Executive Summary</Label>
                <Textarea
                  value={rsdForm.executive_summary}
                  onChange={(e) => setRsdForm({ ...rsdForm, executive_summary: e.target.value })}
                  rows={3}
                  className="mt-1 bg-white/5 text-xs"
                  required
                />
              </div>

              <div>
                <Label className="text-xs">Scope of Work & Modules (one per line)</Label>
                <Textarea
                  value={rsdForm.scope_of_work}
                  onChange={(e) => setRsdForm({ ...rsdForm, scope_of_work: e.target.value })}
                  rows={4}
                  className="mt-1 bg-white/5 text-xs"
                  required
                />
              </div>

              <div>
                <Label className="text-xs">Deliverables (one per line)</Label>
                <Textarea
                  value={rsdForm.deliverables}
                  onChange={(e) => setRsdForm({ ...rsdForm, deliverables: e.target.value })}
                  rows={3}
                  className="mt-1 bg-white/5 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Investment Amount ($)</Label>
                  <Input
                    type="number"
                    value={rsdForm.total_amount}
                    onChange={(e) => setRsdForm({ ...rsdForm, total_amount: Number(e.target.value) })}
                    className="mt-1 bg-white/5"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs">Timeline (Days)</Label>
                  <Input
                    type="number"
                    value={rsdForm.timeline_days}
                    onChange={(e) => setRsdForm({ ...rsdForm, timeline_days: Number(e.target.value) })}
                    className="mt-1 bg-white/5"
                  />
                </div>
                <div>
                  <Label className="text-xs">Delivery Deadline</Label>
                  <Input
                    type="date"
                    value={rsdForm.delivery_deadline}
                    onChange={(e) => setRsdForm({ ...rsdForm, delivery_deadline: e.target.value })}
                    className="mt-1 bg-white/5"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Tech Stack (comma separated)</Label>
                <Input
                  value={rsdForm.tech_stack}
                  onChange={(e) => setRsdForm({ ...rsdForm, tech_stack: e.target.value })}
                  className="mt-1 bg-white/5"
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setRsdDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-brand text-white shadow-glow">
                  Send Specification Document to Client
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* DIALOG: DELIVER PROJECT HANDOFF */}
        <Dialog open={deliveryDialogOpen} onOpenChange={setDeliveryDialogOpen}>
          <DialogContent className="liquid-glass border-white/20 sm:max-w-2xl bg-background/95 max-h-[92vh] overflow-y-auto p-6 sm:p-8">
            <DialogHeader>
              <DialogTitle className="font-display text-xl flex items-center gap-2 text-emerald-400">
                <Award className="h-5 w-5" /> Deliver Project to Client
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Handoff all production links, source repositories, and design workspaces.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleDeliverProject} className="space-y-4 py-2">
              <div>
                <Label className="text-xs">Live Staging / Production URL</Label>
                <Input
                  value={deliveryForm.live_url}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, live_url: e.target.value })}
                  placeholder="https://clientproject.com"
                  className="mt-1 bg-white/5"
                  required
                />
              </div>

              <div>
                <Label className="text-xs">GitHub / Source Code Repository</Label>
                <Input
                  value={deliveryForm.github_url}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, github_url: e.target.value })}
                  placeholder="https://github.com/..."
                  className="mt-1 bg-white/5"
                />
              </div>

              <div>
                <Label className="text-xs">Figma Design Workspace</Label>
                <Input
                  value={deliveryForm.figma_url}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, figma_url: e.target.value })}
                  placeholder="https://figma.com/@..."
                  className="mt-1 bg-white/5"
                />
              </div>

              <div>
                <Label className="text-xs">Assets Bundle Download (.zip URL)</Label>
                <Input
                  value={deliveryForm.assets_url}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, assets_url: e.target.value })}
                  placeholder="https://drive.google.com/..."
                  className="mt-1 bg-white/5"
                />
              </div>

              <div>
                <Label className="text-xs">Handover Notes from Murtesa Alafi</Label>
                <Textarea
                  value={deliveryForm.handover_notes}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, handover_notes: e.target.value })}
                  rows={3}
                  className="mt-1 bg-white/5 text-xs"
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setDeliveryDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold">
                  Complete Handover & Notify Client
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* DIALOG: REPLY TO MESSAGE */}
        {replyTo && (
          <Dialog open={Boolean(replyTo)} onOpenChange={() => setReplyTo(null)}>
            <DialogContent className="liquid-glass border-white/20 sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-display text-lg">Reply to {replyTo.sender_name}</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Direct reply to {replyTo.sender_email}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <Textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  rows={6}
                  className="bg-white/5 text-xs"
                />
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setReplyTo(null)}>
                  Cancel
                </Button>
                <Button onClick={sendReply} className="bg-gradient-brand text-white">
                  Send Reply
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* DIALOG: ANNOUNCEMENT */}
        <Dialog open={annOpen} onOpenChange={setAnnOpen}>
          <DialogContent className="liquid-glass border-white/20 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-lg">Broadcast Announcement</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Publish a banner visible across the entire platform.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label className="text-xs">Title</Label>
                <Input
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g. Basirah Infinity Spring Sprint 2026"
                  className="mt-1 bg-white/5"
                />
              </div>
              <div>
                <Label className="text-xs">Message</Label>
                <Textarea
                  value={annBody}
                  onChange={(e) => setAnnBody(e.target.value)}
                  rows={3}
                  className="mt-1 bg-white/5 text-xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={annPinned} onCheckedChange={(c) => setAnnPinned(Boolean(c))} />
                <Label className="text-xs">Pin Announcement to Top Banner</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setAnnOpen(false)}>
                Cancel
              </Button>
              <Button onClick={postAnnouncement} className="bg-gradient-brand text-white">
                Publish
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SiteShell>
  );
}
