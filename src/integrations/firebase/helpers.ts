// src/integrations/firebase/helpers.ts
// Robust Firebase Firestore CRUD helpers with resilient local fallback for offline/locked rules mode
import { db, auth } from "./client";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  serverTimestamp,
  type DocumentData,
  type QueryConstraint,
} from "firebase/firestore";

// ── Default Mock / Seed Data for fallback ─────────────────────────────
const INITIAL_STORAGE_DATA: Record<string, any[]> = {
  leads: [
    {
      id: "lead-1",
      name: "Selamawit Bekele",
      email: "selamawit@addistech.et",
      phone: "+251 911 234 567",
      company: "AddisTech Solutions",
      service_interest: "Web Design & Development",
      budget: "$1500 – $5000",
      message: "We need a futuristic website and branding for our fintech launch in East Africa.",
      source: "contact-form",
      tag: "web",
      status: "new",
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: "lead-2",
      name: "Tariq Mansoor",
      email: "tariq@gulfcreative.ae",
      phone: "+971 50 123 4567",
      company: "Gulf Creative Studio",
      service_interest: "AI Automation",
      budget: "$5000+",
      message: "Looking for Murtesa Alafi's team to automate our client onboarding and content pipeline.",
      source: "order_form",
      tag: "ai",
      status: "qualified",
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: "lead-3",
      name: "Hannah Vance",
      email: "hannah@lumencoaching.com",
      phone: "+1 415 890 1234",
      company: "Lumen Coaching",
      service_interest: "Branding & Identity",
      budget: "$500 – $1500",
      message: "Ready to scale our coaching brand with a luxury modern look.",
      source: "contact-form",
      tag: "branding",
      status: "contacted",
      created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    },
  ],
  orders: [
    {
      id: "order-1",
      client_name: "Tariq Mansoor",
      client_email: "tariq@gulfcreative.ae",
      service: "AI Automation",
      package: "Empire",
      amount: 4500,
      notes: "Custom AI agents & CRM integration for agency scaling.",
      status: "in_progress",
      created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    },
    {
      id: "order-2",
      client_name: "Abebe Kebede",
      client_email: "abebe@oromiaenterprises.com",
      service: "Web Design & Development",
      package: "Growth",
      amount: 1490,
      notes: "Full 5-page responsive platform with dark futuristic aesthetics.",
      status: "delivered",
      created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    },
  ],
  messages: [
    {
      id: "msg-1",
      sender_id: "client-demo",
      sender_name: "Selamawit Bekele",
      sender_email: "selamawit@addistech.et",
      subject: "Project Timeline & Discovery Call",
      body: "Hi Murtesa, we would love to schedule a kickoff discovery session this Thursday. Looking forward to partnering with Basirah Infinity!",
      from_role: "client",
      read: false,
      created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
    {
      id: "msg-2",
      sender_id: "client-demo-2",
      sender_name: "Tariq Mansoor",
      sender_email: "tariq@gulfcreative.ae",
      subject: "AI Workflow Scope Update",
      body: "Sent over the Zapier and webhook credentials for the automation flow.",
      from_role: "client",
      read: true,
      created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    },
  ],
  collaborations: [
    {
      id: "collab-1",
      name: "Dawit Yohannes",
      email: "dawit@creativespark.io",
      type: "agency",
      portfolio_url: "https://creativespark.io",
      proposal: "We are a high-growth motion graphics agency in Addis. We want to be the dedicated 3D/VFX partner for Basirah Infinity projects.",
      status: "pending",
      response_sent: false,
      created_at: new Date(Date.now() - 3600000 * 30).toISOString(),
    },
  ],
  notifications: [
    {
      id: "notif-1",
      to_email: "basirahinfinity@gmail.com",
      subject: "🚀 Welcome to Basirah Infinity Admin Portal",
      body: "All systems online. Realtime CRM, lead pipeline and order processing active.",
      kind: "system",
      status: "sent",
      sent: true,
      created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
  ],
  announcements: [
    {
      id: "ann-1",
      title: "Basirah Infinity Global Launch",
      body: "Welcome to Basirah Infinity — Founded & Directed by Murtesa Alafi. Experience the next era of digital branding, web design, and AI automation.",
      pinned: true,
      published: true,
      created_at: new Date().toISOString(),
    },
  ],
  audit_log: [
    {
      id: "audit-1",
      actor_email: "basirahinfinity@gmail.com",
      action: "system.init",
      target_type: "system",
      meta: { message: "Basirah Infinity studio ecosystem initialized." },
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  ],
  services: [
    {
      id: "srv-1",
      slug: "branding-identity",
      title: "Branding & Identity System",
      short: "Futuristic brand identity, logos, design systems, and guidelines.",
      description: "Complete visual identity crafted for exponential market authority. Includes logo suites, typography scale, color harmonics, social collateral, and 3D brand tokens.",
      price: "From $1,200",
      timeline: "7–10 days",
      icon: "Palette",
      tag: "Flagship",
      features: [
        "Logo suites (Vector, SVG, Dark/Light)",
        "Comprehensive brand book",
        "Typography & color harmonics",
        "Social media templates",
        "3D brand tokens & favicon suite"
      ],
      created_at: new Date().toISOString(),
    },
    {
      id: "srv-2",
      slug: "website-design",
      title: "High-Conversion Web Platform",
      short: "SaaS landing pages, corporate platforms, and web applications.",
      description: "Ultra high performance web applications built on modern frameworks engineered for speed, SEO, and conversions.",
      price: "From $1,800",
      timeline: "10–14 days",
      icon: "Layout",
      tag: "Popular",
      features: [
        "Custom high-fidelity UX/UI design",
        "Full-stack interactive development",
        "Mobile responsive & ultra fast",
        "Integrated CMS & lead capture",
        "SEO & Core Web Vitals optimization"
      ],
      created_at: new Date().toISOString(),
    },
    {
      id: "srv-3",
      slug: "ai-business-solutions",
      title: "AI Business Automation & Agents",
      short: "Custom AI agents, workflow automations, and LLM integrations.",
      description: "Autonomous AI agents and business automation pipelines that replace manual ops, handle 24/7 lead inquiries, synthesize data, and scale revenue.",
      price: "From $2,400",
      timeline: "14–21 days",
      icon: "Bot",
      tag: "Enterprise",
      features: [
        "Autonomous AI agent workflows",
        "Custom knowledge-base RAG pipelines",
        "CRM & Zapier/Make automations",
        "24/7 customer engagement bot",
        "Automated executive intelligence"
      ],
      created_at: new Date().toISOString(),
    },
    {
      id: "srv-4",
      slug: "social-media-growth",
      title: "Social Media & Viral Content Engine",
      short: "AI-driven content, short-form reels, and community scaling.",
      description: "Turn organic attention into inbound clients with AI-powered video editing, carousel architecture, and algorithmic growth playbooks.",
      price: "From $950 / mo",
      timeline: "Monthly Retainer",
      icon: "Megaphone",
      tag: "Growth",
      features: [
        "30 high-converting reels & posts / mo",
        "Algorithmic caption & hashtag strategy",
        "Weekly performance analytics",
        "Inbound lead dm funnel"
      ],
      created_at: new Date().toISOString(),
    },
    {
      id: "srv-5",
      slug: "strategy-growth",
      title: "Strategic Advisory & Scaling Retainer",
      short: "Positioning, monetization architecture, and technical consulting.",
      description: "Direct 1-on-1 strategic architecture with Murtesa Alafi. GTM strategy, product validation, monetization funnels, and enterprise scalability.",
      price: "From $3,500 / mo",
      timeline: "Quarterly Advisory",
      icon: "Brain",
      tag: "VIP Advisory",
      features: [
        "Direct weekly strategy sessions with Murtesa Alafi",
        "Product & pricing architecture",
        "Funnels & monetization models",
        "Priority engineering sprint allocation"
      ],
      created_at: new Date().toISOString(),
    },
  ],
  works: [
    {
      id: "work-1",
      title: "Halo Beauty Global",
      category: "Beauty · Branding & Web",
      client: "Halo Beauty Co.",
      summary: "Luxury e-commerce and visual identity relaunch resulting in a 240% sales leap within 30 days.",
      impact: "+240% Sales Growth",
      tag: "Branding & Web",
      gradient: "from-pink-500/40 to-purple-600/40",
      liveUrl: "https://halobeauty.example.com",
      featured: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "work-2",
      title: "Northwave Sovereign AI",
      category: "SaaS · Autonomous AI Workflows",
      client: "Northwave Systems",
      summary: "Replaced 3 manual operations roles with an autonomous AI agent cluster handling support and data processing.",
      impact: "78% Cost Reduction",
      tag: "AI Agents",
      gradient: "from-blue-500/40 to-cyan-500/40",
      liveUrl: "https://northwave.example.com",
      featured: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "work-3",
      title: "Lumen High-Ticket Funnel",
      category: "Education · Acquisition Architecture",
      client: "Lumen Coaching",
      summary: "High-ticket coaching sales portal and automated qualification pipeline yielding 10x qualified bookings.",
      impact: "10x Qualified Bookings",
      tag: "Funnels",
      gradient: "from-amber-500/40 to-pink-500/40",
      liveUrl: "https://lumencoaching.example.com",
      featured: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "work-4",
      title: "Orbital Studio Ecosystem",
      category: "Creative Agency · Identity & Platform",
      client: "Orbital Creative",
      summary: "Futuristic agency digital presence and portfolio showcase capturing premium enterprise clientele.",
      impact: "300% Inbound Quality",
      tag: "Identity",
      gradient: "from-violet-600/40 to-blue-500/40",
      liveUrl: "https://orbital.example.com",
      featured: false,
      created_at: new Date().toISOString(),
    },
    {
      id: "work-5",
      title: "Nimbus Wellness App",
      category: "HealthTech · Web Application",
      client: "Nimbus Tech",
      summary: "Subscription-based mindful health platform scaled from inception to 5,000 active members in 90 days.",
      impact: "5,000+ Active Users",
      tag: "Web App",
      gradient: "from-emerald-500/40 to-cyan-400/40",
      liveUrl: "https://nimbuswellness.example.com",
      featured: false,
      created_at: new Date().toISOString(),
    },
    {
      id: "work-6",
      title: "Forge Logistics Core",
      category: "Enterprise · Logistics Automation",
      client: "Forge Freight",
      summary: "End-to-end consignment tracking and dispatch automation eliminating 70% of manual dispatch friction.",
      impact: "70% Faster Dispatch",
      tag: "Enterprise",
      gradient: "from-orange-500/40 to-red-500/40",
      liveUrl: "https://forgelogistics.example.com",
      featured: false,
      created_at: new Date().toISOString(),
    },
  ],
  pricing: [
    {
      id: "tier-1",
      name: "Launch",
      price: "$499",
      period: "per project",
      description: "Ideal for new ventures, founders, and startups needing rapid, high-impact market entry.",
      popular: false,
      badge: "Fast Track",
      deliveryTime: "5–7 Business Days",
      cta: "Start Launch Project",
      features: [
        "Complete Logo Suite & Brand Color System",
        "Single-Page High-Conversion Landing Site",
        "Mobile-First Responsive Architecture",
        "5 Custom Social Media Assets & Headers",
        "Custom AI Starter Prompts & Workflow Kit"
      ],
      created_at: new Date().toISOString(),
    },
    {
      id: "tier-2",
      name: "Growth",
      price: "$1,490",
      period: "per project",
      description: "Our flagship package for scaling brands and companies demanding superior market presence.",
      popular: true,
      badge: "Most Popular",
      deliveryTime: "10–14 Business Days",
      cta: "Choose Growth Architecture",
      features: [
        "Comprehensive Brand Identity & Guidelines System",
        "5-Page High-Performance Web Application",
        "Lead Capture & CRM Integrations",
        "30 Days Custom Social Content Engine",
        "Custom AI Workflow & Lead Processing Bot",
        "Bi-Weekly Strategy & Optimization Call with Murtesa Alafi"
      ],
      created_at: new Date().toISOString(),
    },
    {
      id: "tier-3",
      name: "Empire Sovereign",
      price: "$3,800",
      period: "per project / retainer",
      description: "Full-scale digital transformation and enterprise sovereign architecture tailored to your vision.",
      popular: false,
      badge: "Enterprise",
      deliveryTime: "21–30 Business Days",
      cta: "Request Sovereign Consultation",
      features: [
        "End-to-End Enterprise Visual Identity & 3D Assets",
        "Full-Stack Web Platform or SaaS Portal",
        "Autonomous AI Agent Swarm & Deep Data Integration",
        "Dedicated Engineering Sprint & Priority Queue",
        "Direct Advisory & 24/7 Priority Channel with Murtesa Alafi",
        "100% On-Time Delivery Guarantee & SLA"
      ],
      created_at: new Date().toISOString(),
    },
  ],
  about_content: [
    {
      id: "about-main",
      founder_name: "Murtesa Alafi",
      founder_title: "Founder, Creative Director & Systems Architect",
      founder_phone: "+251 708 229 717",
      founder_email: "basirahinfinity@gmail.com",
      location: "Addis Ababa, Ethiopia · Global Operations",
      bio_p1: "As the founder and visionary director of Basirah Infinity, Murtesa Alafi fuses avant-garde visual design, software engineering, and artificial intelligence into transformative digital ecosystems.",
      bio_p2: "Based in Addis Ababa and partnering with ambitious founders and enterprises worldwide, Murtesa's philosophy is rooted in rapid execution, uncompromising craft, and systems that generate compounding enterprise value.",
      vision: "To empower visionary entrepreneurs across Africa and globally with world-class digital brands and autonomous AI systems that redefine what's possible.",
      mission: "We combine human creative mastery with high-order artificial intelligence to build software, platforms, and identities that dominate attention and monetize effortlessly.",
      stats: [
        { label: "Global Projects Delivered", value: "50+" },
        { label: "Client Satisfaction Rate", value: "99.8%" },
        { label: "Client Pipeline Powered", value: "$12M+" },
        { label: "On-Time Delivery Record", value: "100%" },
      ],
      values: [
        { title: "Visionary Innovation", description: "We leverage state-of-the-art AI systems and bleeding-edge frameworks to ship 10x faster than traditional agencies." },
        { title: "Client Empowerment", description: "We build monetizable, sovereign digital assets that clients own and control entirely." },
        { title: "Absolute Integrity", description: "Transparency, milestone security, and high fidelity in every single deliverable." },
        { title: "Compounding Impact", description: "We architect digital foundations that generate ongoing value and measurable commercial growth." },
      ],
      created_at: new Date().toISOString(),
    },
  ],
  project_channels: [
    {
      id: "channel-demo-1",
      client_id: "demo_client_1",
      client_name: "Tariq Mansoor",
      client_email: "tariq@gulfcreative.ae",
      client_company: "Gulf Creative Studio",
      client_phone: "+971 50 123 4567",
      project_title: "Autonomous AI Marketing & Client Onboarding Suite",
      status: "in_development",
      questions: [
        {
          id: "q-1",
          question: "What is the primary commercial objective and target outcome for this platform?",
          answer: "We need an automated onboarding portal for luxury brand clients in Dubai that eliminates our current 3-day manual paperwork lag.",
          answered: true,
        },
        {
          id: "q-2",
          question: "Who is the exact target customer persona and expected monthly volume?",
          answer: "High-ticket enterprise founders and marketing heads across UAE and GCC. Around 40-60 new onboarding flows monthly.",
          answered: true,
        },
        {
          id: "q-3",
          question: "Which integrations are strictly mandatory (payment gateways, CRM, webhook APIs)?",
          answer: "Stripe for international card payments, HubSpot CRM sync, and Slack real-time notifications for our directors.",
          answered: true,
        },
        {
          id: "q-4",
          question: "What is your target launch deadline and initial budget allocation?",
          answer: "Launch within 14 business days. Budget is approved up to $4,500.",
          answered: true,
        },
      ],
      specification: {
        title: "Requirement Specification Document (RSD) — AI Onboarding Suite v1.0",
        version: "v1.0 Final",
        executive_summary: "Basirah Infinity will architect and deliver a bespoke client onboarding and automated qualification system for Gulf Creative Studio.",
        scope_of_work: [
          "Bespoke luxury onboarding frontend with dark glass aesthetics",
          "Automated questionnaire & dynamic proposal generator",
          "Multi-currency Stripe payment integration & invoice generation",
          "HubSpot CRM webhook synchronization",
          "Admin notification dispatch via Slack & Email"
        ],
        deliverables: [
          "Full TypeScript/React source code repository",
          "Live deployed cloud environment with SSL",
          "Figma UI design tokens and component kit",
          "API & Admin operations manual"
        ],
        tech_stack: ["React 19", "TypeScript", "Tailwind CSS v4", "Firebase", "Stripe API", "HubSpot Webhooks"],
        timeline_days: 14,
        delivery_deadline: new Date(Date.now() + 86400000 * 12).toISOString(),
        total_amount: 4500,
        currency: "USD",
        terms: "50% sprint milestone, 100% intellectual property transfer upon final delivery signoff.",
        issued_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        client_confirmed: true,
        confirmed_at: new Date(Date.now() - 86400000 * 1.8).toISOString(),
      },
      payment: {
        paid: true,
        paid_at: new Date(Date.now() - 86400000 * 1.5).toISOString(),
        amount_paid: 4500,
        currency: "USD",
        payment_method: "Card (Stripe)",
        transaction_id: "tx_bi_789456123",
        receipt_number: "REC-BI-2026-0042",
      },
      delivery: {
        delivered: false,
        delivered_at: "",
        live_url: "https://onboard.gulfcreative.ae",
        github_url: "https://github.com/basirah-infinity/gulf-creative-suite",
        figma_url: "https://figma.com/@basirah/gulf-creative",
        assets_url: "https://drive.google.com/basirah-infinity/gulf-creative-assets.zip",
        handover_notes: "Production sprint active. Murtesa Alafi is overseeing final API testing.",
      },
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  studio_components: [
    {
      id: "cmp-custom-1",
      title: "Imperial 24K Gold Glass Morph",
      category: "miracle",
      description: "Ultra-luxury refractive golden glass surface with specular gold highlights.",
      tags: ["gold", "miracle", "glass", "luxury"],
      jsxCode: `<div className="rounded-3xl border border-amber-300/40 bg-[radial-gradient(ellipse_at_30%_0%,rgba(245,215,110,0.25)_0%,transparent_60%)] bg-[#0d0902] p-8 backdrop-blur-2xl shadow-[0_0_50px_rgba(245,215,110,0.18)]">\n  <span className="text-[10px] tracking-widest uppercase text-amber-300 font-mono">24K // SOVEREIGN_GRADE</span>\n  <h3 className="font-display text-2xl font-bold text-amber-100 mt-2">Imperial Morphism</h3>\n  <p className="text-xs text-amber-200/70 mt-2">Engineered by Murtesa Alafi for high-tier enterprise positioning.</p>\n</div>`,
      cssCode: "border: 1px solid rgba(245,215,110,0.4); background: radial-gradient(ellipse at 30% 0%, rgba(245,215,110,0.25) 0%, transparent 60%), #0d0902; backdrop-filter: blur(24px); box-shadow: 0 0 50px rgba(245,215,110,0.18);",
      previewType: "golden-morph",
      created_at: new Date().toISOString(),
    },
    {
      id: "cmp-custom-2",
      title: "Glacial Hydro Refraction Capsule",
      category: "cards",
      description: "Multi-layered water glass card with realistic ambient refraction caustics.",
      tags: ["water", "glass", "hydro", "caustic"],
      jsxCode: `<div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 via-cyan-500/5 to-black/40 p-6 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,229,255,0.15)]">\n  <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-cyan-400/20 blur-2xl pointer-events-none" />\n  <h4 className="font-display text-lg font-bold text-white">Glacial Caustic Depth</h4>\n  <p className="text-xs text-cyan-200/70 mt-2">Simulated fluid refraction for next-generation web apps.</p>\n</div>`,
      cssCode: "border: 1px solid rgba(255,255,255,0.2); background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(0,229,255,0.05) 50%, rgba(0,0,0,0.4) 100%); backdrop-filter: blur(32px);",
      previewType: "water-card",
      created_at: new Date().toISOString(),
    },
  ],
  partner_profiles: [
    {
      id: "partner-demo-1",
      partner_id: "demo_partner_1",
      partner_name: "Dawit Yohannes",
      agency_name: "Creative Spark 3D Studio",
      email: "dawit@creativespark.io",
      phone: "+251 912 345 678",
      specialization: "3D VFX & Motion Graphics",
      portfolio_url: "https://creativespark.io",
      partnership_type: "Agency Co-building & Referrals",
      status: "verified",
      commission_rate: 20,
      referral_code: "CREATIVE-SPARK-20",
      total_referred_revenue: 14500,
      commission_earned: 2900,
      pending_payout: 950,
      active_sprints: 2,
      created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
    },
  ],
};

// ── Local Storage Helper ──────────────────────────────────────────────
function getLocalCollection(col: string): any[] {
  if (typeof window === "undefined") return INITIAL_STORAGE_DATA[col] ?? [];
  try {
    const raw = localStorage.getItem(`bi_${col}`);
    if (!raw) {
      const initial = INITIAL_STORAGE_DATA[col] ?? [];
      localStorage.setItem(`bi_${col}`, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_STORAGE_DATA[col] ?? [];
  }
}

function saveLocalCollection(col: string, data: any[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`bi_${col}`, JSON.stringify(data));
  } catch (e) {
    console.error("Local storage error:", e);
  }
}

// ── Generic helpers ──────────────────────────────────────────────────

/** Fetch all docs from a collection, with optional constraints */
export async function fetchAll(
  col: string,
  constraints: QueryConstraint[] = [],
): Promise<DocumentData[]> {
  let localData = getLocalCollection(col);
  try {
    const q = query(collection(db, col), ...constraints);
    const snap = await getDocs(q);
    if (snap.docs.length > 0) {
      const remoteList = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const mergedMap = new Map<string, any>();
      for (const item of remoteList) {
        mergedMap.set(item.id, item);
      }
      for (const item of localData) {
        if (!mergedMap.has(item.id)) {
          mergedMap.set(item.id, item);
        }
      }
      const merged = Array.from(mergedMap.values());
      saveLocalCollection(col, merged);
      return merged;
    }
  } catch (err: any) {
    // If Firestore rules deny or offline, fallback to local storage
    console.warn(`Firestore read on [${col}] failed (${err?.code ?? err?.message}). Using local store.`);
  }

  return localData;
}

/** Add a doc with auto-id, adding created_at timestamp */
export async function insertDoc(col: string, data: Record<string, any>): Promise<string> {
  const newId = data.id || `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const fullDoc = {
    ...data,
    id: newId,
    created_at: data.created_at || new Date().toISOString(),
  };

  // Update local store immediately for instant UI feedback
  const local = getLocalCollection(col);
  saveLocalCollection(col, [fullDoc, ...local.filter((i) => i.id !== newId)]);

  // Attempt Firestore insert with deterministic id
  try {
    const docRef = doc(db, col, newId);
    await setDoc(docRef, {
      ...data,
      id: newId,
      created_at: serverTimestamp(),
    });
    return newId;
  } catch (err: any) {
    console.warn(`Firestore write to [${col}] failed (${err?.code ?? err?.message}). Saved locally.`);
    return newId;
  }
}

/** Batch insert multiple docs */
export async function insertMany(col: string, rows: Record<string, any>[]) {
  const local = getLocalCollection(col);
  const stamped = rows.map((r, i) => ({
    ...r,
    id: `doc_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
    created_at: new Date().toISOString(),
  }));
  saveLocalCollection(col, [...stamped, ...local]);

  try {
    const batch = writeBatch(db);
    for (const row of rows) {
      const ref = doc(collection(db, col));
      batch.set(ref, { ...row, created_at: serverTimestamp() });
    }
    await batch.commit();
  } catch (err) {
    console.warn(`Firestore batch insert into [${col}] failed. Saved locally.`);
  }
}

/** Update fields on a doc by id */
export async function updateDocById(
  col: string,
  id: string,
  data: Record<string, any>,
) {
  // Update local
  const local = getLocalCollection(col);
  const updated = local.map((item) => (item.id === id ? { ...item, ...data, updated_at: new Date().toISOString() } : item));
  saveLocalCollection(col, updated);

  try {
    await setDoc(doc(db, col, id), { ...data, updated_at: serverTimestamp() }, { merge: true });
  } catch (err) {
    console.warn(`Firestore update on [${col}/${id}] failed. Updated locally.`);
  }
}

/** Delete a doc by id */
export async function deleteDocById(col: string, id: string) {
  // Delete local
  const local = getLocalCollection(col);
  const filtered = local.filter((item) => item.id !== id);
  saveLocalCollection(col, filtered);

  try {
    await deleteDoc(doc(db, col, id));
  } catch (err) {
    console.warn(`Firestore delete on [${col}/${id}] failed. Deleted locally.`);
  }
}

/** Batch delete by ids */
export async function deleteManyByIds(col: string, ids: string[]) {
  const idSet = new Set(ids);
  const local = getLocalCollection(col);
  const filtered = local.filter((item) => !idSet.has(item.id));
  saveLocalCollection(col, filtered);

  try {
    const batch = writeBatch(db);
    ids.forEach((id) => batch.delete(doc(db, col, id)));
    await batch.commit();
  } catch (err) {
    console.warn(`Firestore batch delete on [${col}] failed. Deleted locally.`);
  }
}

/** Batch update a field on many docs */
export async function updateManyByIds(
  col: string,
  ids: string[],
  data: Record<string, any>,
) {
  const idSet = new Set(ids);
  const local = getLocalCollection(col);
  const updated = local.map((item) => (idSet.has(item.id) ? { ...item, ...data } : item));
  saveLocalCollection(col, updated);

  try {
    const batch = writeBatch(db);
    ids.forEach((id) => batch.update(doc(db, col, id), data));
    await batch.commit();
  } catch (err) {
    console.warn(`Firestore batch update on [${col}] failed. Updated locally.`);
  }
}

// ── Auth helpers ─────────────────────────────────────────────────────

export const ADMIN_PRIMARY_EMAIL = "basirahinfinity@gmail.com";

/** Get the current Firebase user or custom admin session */
export function getCurrentUser() {
  if (auth.currentUser) return auth.currentUser;
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("bi_custom_session");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {}
  }
  return null;
}

/** Wait for auth to be ready (resolves once) */
export function waitForAuth(): Promise<any> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(null);
      return;
    }
    // Check local admin session first
    const custom = getCurrentUser();
    if (custom) {
      resolve(custom);
      return;
    }
    const unsub = auth.onAuthStateChanged((user) => {
      unsub();
      resolve(user);
    });
  });
}

/** Fetch roles array from user_roles/{uid} */
export async function fetchRoles(uid: string): Promise<string[]> {
  const user = getCurrentUser();
  if (user?.email?.toLowerCase() === ADMIN_PRIMARY_EMAIL.toLowerCase()) {
    return ["admin"];
  }

  try {
    const snap = await getDoc(doc(db, "user_roles", uid));
    if (snap.exists()) {
      return (snap.data()?.roles as string[]) ?? [];
    }
  } catch (err) {
    // If permission denied
  }

  // Check local role
  if (typeof window !== "undefined") {
    const localRole = localStorage.getItem(`bi_role_${uid}`);
    if (localRole) return [localRole];
  }

  return ["client"];
}

/** Check if a user is admin */
export async function isAdmin(uid: string): Promise<boolean> {
  const user = getCurrentUser();
  if (user?.email?.toLowerCase() === ADMIN_PRIMARY_EMAIL.toLowerCase()) {
    return true;
  }
  const roles = await fetchRoles(uid);
  return roles.includes("admin");
}

// ── Specific collection shortcuts ────────────────────────────────────

export async function fetchLeads() {
  return fetchAll("leads", [orderBy("created_at", "desc")]);
}

export async function fetchOrders() {
  return fetchAll("orders", [orderBy("created_at", "desc")]);
}

export async function fetchMessages() {
  return fetchAll("messages", [orderBy("created_at", "desc")]);
}

export async function fetchCollaborations() {
  return fetchAll("collaborations", [orderBy("created_at", "desc")]);
}

export async function fetchNotifications(max = 200) {
  return fetchAll("notifications", [
    orderBy("created_at", "desc"),
    limit(max),
  ]);
}

export async function fetchAnnouncements() {
  return fetchAll("announcements", [orderBy("created_at", "desc")]);
}

export async function fetchPublishedAnnouncements(max = 5) {
  const all = await fetchAnnouncements();
  return all.filter((a) => a.published !== false).slice(0, max);
}

export async function fetchAuditLog(max = 50) {
  return fetchAll("audit_log", [orderBy("created_at", "desc"), limit(max)]);
}

export async function fetchLabAssets(max = 40) {
  return fetchAll("lab_assets", [orderBy("created_at", "desc"), limit(max)]);
}

/** Log an audit entry */
export async function logAudit(
  action: string,
  target_type?: string,
  target_id?: string,
  meta: any = {},
) {
  const user = getCurrentUser();
  await insertDoc("audit_log", {
    actor_id: user?.uid ?? "admin",
    actor_email: user?.email ?? ADMIN_PRIMARY_EMAIL,
    action,
    target_type: target_type ?? null,
    target_id: target_id ?? null,
    meta,
  });
}

// ── Admin account seed ───────────────────────────────────────────────

/** Ensure admin role doc exists for a given uid */
export async function ensureAdminRole(uid: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(`bi_role_${uid}`, "admin");
  }
  try {
    const ref = doc(db, "user_roles", uid);
    await setDoc(ref, { roles: ["admin"], email: ADMIN_PRIMARY_EMAIL, created_at: new Date().toISOString() }, { merge: true });
  } catch (e) {
    // silently continue with local store
  }
}

/** Create a user_roles doc for a regular user */
export async function ensureUserRole(
  uid: string,
  data: { displayName?: string; email?: string; company?: string },
) {
  if (typeof window !== "undefined") {
    localStorage.setItem(`bi_role_${uid}`, "client");
  }
  try {
    const ref = doc(db, "user_roles", uid);
    await setDoc(ref, {
      roles: ["client"],
      displayName: data.displayName ?? null,
      email: data.email ?? null,
      company: data.company ?? null,
      created_at: new Date().toISOString(),
    }, { merge: true });
  } catch (e) {
    // silently continue with local store
  }
}

// ── Services CMS ─────────────────────────────────────────────────────

export async function fetchServices() {
  return fetchAll("services", [orderBy("created_at", "asc")]);
}

export async function saveService(serviceData: Record<string, any>) {
  if (serviceData.id) {
    await updateDocById("services", serviceData.id, {
      ...serviceData,
      updated_at: new Date().toISOString(),
    });
    return serviceData.id;
  }
  return insertDoc("services", {
    ...serviceData,
    created_at: new Date().toISOString(),
  });
}

export async function deleteService(id: string) {
  return deleteDocById("services", id);
}

// ── Works CMS ────────────────────────────────────────────────────────

export async function fetchWorks() {
  return fetchAll("works", [orderBy("created_at", "asc")]);
}

export async function saveWork(workData: Record<string, any>) {
  if (workData.id) {
    await updateDocById("works", workData.id, {
      ...workData,
      updated_at: new Date().toISOString(),
    });
    return workData.id;
  }
  return insertDoc("works", {
    ...workData,
    created_at: new Date().toISOString(),
  });
}

export async function deleteWork(id: string) {
  return deleteDocById("works", id);
}

// ── Pricing CMS ──────────────────────────────────────────────────────

export async function fetchPricingTiers() {
  return fetchAll("pricing", [orderBy("created_at", "asc")]);
}

export async function savePricingTier(tierData: Record<string, any>) {
  if (tierData.id) {
    await updateDocById("pricing", tierData.id, {
      ...tierData,
      updated_at: new Date().toISOString(),
    });
    return tierData.id;
  }
  return insertDoc("pricing", {
    ...tierData,
    created_at: new Date().toISOString(),
  });
}

export async function deletePricingTier(id: string) {
  return deleteDocById("pricing", id);
}

// ── About Content CMS ────────────────────────────────────────────────

export async function fetchAboutContent() {
  const all = await fetchAll("about_content");
  if (all.length > 0) return all[0];
  const initial = INITIAL_STORAGE_DATA.about_content?.[0] ?? {};
  return initial;
}

export async function saveAboutContent(data: Record<string, any>) {
  const current = await fetchAboutContent();
  const id = current?.id || "about-main";
  await updateDocById("about_content", id, {
    ...data,
    updated_at: new Date().toISOString(),
  });
  return id;
}

// ── Project Channels & Requirement Specification Hub ────────────────

export async function fetchProjectChannels() {
  return fetchAll("project_channels", [orderBy("created_at", "desc")]);
}

export async function getProjectChannel(id: string) {
  const all = await fetchProjectChannels();
  return all.find((c) => c.id === id) || null;
}

export async function createProjectChannel(data: {
  client_id: string;
  client_name: string;
  client_email: string;
  client_company?: string;
  client_phone?: string;
  project_title: string;
  initial_brief?: string;
}) {
  const defaultQuestions = [
    {
      id: "q-1",
      question: "1. What is the core commercial objective and primary outcome you want this project to achieve?",
      answer: "",
      answered: false,
    },
    {
      id: "q-2",
      question: "2. Who is your primary target audience or customer demographic (geography, industry, tier)?",
      answer: "",
      answered: false,
    },
    {
      id: "q-3",
      question: "3. What specific features and integrations are required (e.g. Auth, Telebirr/Stripe, AI automations, CRM)?",
      answer: "",
      answered: false,
    },
    {
      id: "q-4",
      question: "4. What is your expected launch deadline and target investment range?",
      answer: "",
      answered: false,
    },
    {
      id: "q-5",
      question: "5. Do you have existing brand assets, domain names, or Figma wireframes, or should Basirah Infinity craft everything from scratch?",
      answer: "",
      answered: false,
    },
  ];

  const channelDoc = {
    client_id: data.client_id,
    client_name: data.client_name,
    client_email: data.client_email,
    client_company: data.client_company || "Client Enterprise",
    client_phone: data.client_phone || "+251 708 229 717",
    project_title: data.project_title || "Digital Ecosystem Consultation",
    initial_brief: data.initial_brief || "",
    status: "discovery",
    questions: defaultQuestions,
    specification: null,
    payment: null,
    delivery: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const id = await insertDoc("project_channels", channelDoc);
  await logAudit("channel.create", "channel", id, { title: data.project_title, client: data.client_email });
  return id;
}

export async function updateProjectChannel(id: string, updates: Record<string, any>) {
  await updateDocById("project_channels", id, {
    ...updates,
    updated_at: new Date().toISOString(),
  });
}

// ── User Profile Helpers ─────────────────────────────────────────────

export async function fetchUserProfile(uid: string) {
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem(`bi_profile_${uid}`);
    if (raw) {
      try { return JSON.parse(raw); } catch (e) {}
    }
  }
  try {
    const snap = await getDoc(doc(db, "user_profiles", uid));
    if (snap.exists()) return snap.data();
  } catch (e) {}
  return null;
}

export async function saveUserProfile(uid: string, profileData: Record<string, any>) {
  if (typeof window !== "undefined") {
    localStorage.setItem(`bi_profile_${uid}`, JSON.stringify(profileData));
  }
  try {
    await setDoc(doc(db, "user_profiles", uid), {
      ...profileData,
      updated_at: new Date().toISOString(),
    }, { merge: true });
  } catch (e) {}
}

// ── Studio Components CMS ────────────────────────────────────────────

export async function fetchStudioComponents() {
  const list = await fetchAll("studio_components");
  const normalized = list.map((c: any) => ({
    ...c,
    title: c.title || c.name || "Custom Component",
    name: c.name || c.title || "Custom Component",
    category: c.category || "cards",
    type: c.type || c.previewType || c.preview || "custom",
    previewType: c.previewType || c.preview || c.type || "custom",
    preview: c.preview || c.previewType || c.type || "custom",
    code: c.code || c.jsxCode || "",
    jsxCode: c.jsxCode || c.code || "",
    cssCode: c.cssCode || "",
    description: c.description || "",
    tags: Array.isArray(c.tags)
      ? c.tags
      : typeof c.tags === "string"
      ? c.tags.split(/[\n,]/).map((t: string) => t.trim()).filter(Boolean)
      : [],
    created_at: c.created_at || new Date().toISOString(),
  }));

  return normalized.sort((a, b) => {
    const da = new Date(a.created_at || 0).getTime();
    const db = new Date(b.created_at || 0).getTime();
    return db - da;
  });
}

export async function saveStudioComponent(compData: Record<string, any>) {
  const compId = compData.id || `cmp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const title = (compData.title || compData.name || "Untitled Component").trim();
  const code = compData.jsxCode || compData.code || "";
  const preview = compData.previewType || compData.preview || compData.type || "custom";
  const tags = Array.isArray(compData.tags)
    ? compData.tags
    : typeof compData.tags === "string"
    ? compData.tags.split(/[\n,]/).map((t: string) => t.trim()).filter(Boolean)
    : [];

  const normalized = {
    id: compId,
    title,
    name: title,
    category: compData.category || "cards",
    type: preview,
    previewType: preview,
    preview,
    code,
    jsxCode: code,
    cssCode: compData.cssCode || "",
    description: (compData.description || "").trim(),
    tags,
    updated_at: new Date().toISOString(),
  };

  if (compData.id) {
    await updateDocById("studio_components", compData.id, normalized);
    return compData.id;
  }

  const fullNew = {
    ...normalized,
    created_at: compData.created_at || new Date().toISOString(),
  };
  return insertDoc("studio_components", fullNew);
}

export async function deleteStudioComponent(id: string) {
  return deleteDocById("studio_components", id);
}

// ── Partner System CMS & Profiles ───────────────────────────────────

export async function fetchPartnerProfiles() {
  const list = await fetchAll("partner_profiles");
  return list.sort((a, b) => {
    const da = new Date(a.created_at || 0).getTime();
    const db = new Date(b.created_at || 0).getTime();
    return db - da;
  });
}

export async function fetchPartnerProfile(uid: string) {
  const all = await fetchPartnerProfiles();
  return all.find((p) => p.partner_id === uid || p.id === uid) || null;
}

export async function savePartnerProfile(uid: string, data: Record<string, any>) {
  const existing = await fetchPartnerProfile(uid);
  const displayName = data.name || data.partner_name || data.displayName || "Partner";
  const agencyName = data.company || data.agency_name || data.agencyName || "Creative Studio";
  const payload = {
    ...data,
    partner_id: uid,
    name: displayName,
    partner_name: displayName,
    displayName: displayName,
    company: agencyName,
    agency_name: agencyName,
    agencyName: agencyName,
    email: data.email || "",
    specialization: data.specialization || "Full-Stack Development",
    portfolio_url: data.portfolio_url || data.portfolioUrl || "",
    portfolioUrl: data.portfolio_url || data.portfolioUrl || "",
    partnership_type: data.partnership_type || data.partnershipType || "Co-building & Client Referrals",
    partnershipType: data.partnership_type || data.partnershipType || "Co-building & Client Referrals",
    status: data.status || "verified",
    commission_rate: Number(data.commission_rate ?? 20),
    referral_code: data.referral_code || `BI-${displayName.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 8)}-20`,
    total_referred_revenue: Number(data.total_referred_revenue ?? 0),
    commission_earned: Number(data.commission_earned ?? 0),
    pending_payout: Number(data.pending_payout ?? 0),
    active_sprints: Number(data.active_sprints ?? 0),
    updated_at: new Date().toISOString(),
  };

  if (existing?.id) {
    await updateDocById("partner_profiles", existing.id, payload);
    return existing.id;
  }
  return insertDoc("partner_profiles", {
    ...payload,
    created_at: new Date().toISOString(),
  });
}

export async function ensurePartnerRole(
  uid: string,
  data: {
    displayName?: string;
    email?: string;
    agencyName?: string;
    specialization?: string;
    portfolioUrl?: string;
    partnershipType?: string;
  }
) {
  if (typeof window !== "undefined") {
    localStorage.setItem(`bi_role_${uid}`, "partner");
  }
  try {
    const ref = doc(db, "user_roles", uid);
    await setDoc(ref, {
      roles: ["partner"],
      displayName: data.displayName ?? null,
      email: data.email ?? null,
      company: data.agencyName ?? null,
      agencyName: data.agencyName ?? null,
      specialization: data.specialization ?? null,
      portfolioUrl: data.portfolioUrl ?? null,
      partnershipType: data.partnershipType ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { merge: true });
  } catch (e) {}

  await savePartnerProfile(uid, {
    displayName: data.displayName,
    name: data.displayName,
    partner_name: data.displayName,
    email: data.email,
    agencyName: data.agencyName,
    agency_name: data.agencyName,
    company: data.agencyName,
    specialization: data.specialization,
    portfolioUrl: data.portfolioUrl,
    portfolio_url: data.portfolioUrl,
    partnershipType: data.partnershipType,
    partnership_type: data.partnershipType,
  });
}

// ── Guaranteed Local Registration Fallback Store ─────────────────────
// Ensures users can always register and log in, even if Firebase Auth encounters sandbox/pop-up restrictions

export interface FallbackUserRecord {
  uid: string;
  email: string;
  password?: string;
  displayName: string;
  role: "admin" | "client" | "partner" | "assistant";
  company?: string;
  created_at: string;
}

export function saveRegisteredUserFallback(user: FallbackUserRecord) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("bi_registered_users");
    const list: FallbackUserRecord[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter((u) => u.email.toLowerCase() !== user.email.toLowerCase());
    filtered.push(user);
    localStorage.setItem("bi_registered_users", JSON.stringify(filtered));
  } catch (e) {}
}

export function findRegisteredUserFallback(email: string): FallbackUserRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("bi_registered_users");
    if (!raw) return null;
    const list: FallbackUserRecord[] = JSON.parse(raw);
    return list.find((u) => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
  } catch (e) {
    return null;
  }
}

// Re-exports for convenience
export { orderBy, where, limit, doc, getDoc, setDoc, collection, query } from "firebase/firestore";
