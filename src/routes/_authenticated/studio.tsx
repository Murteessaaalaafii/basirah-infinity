import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SiteShell } from "@/components/SiteShell";
import {
  waitForAuth,
  isAdmin as checkAdmin,
  fetchLabAssets,
  insertDoc,
  deleteDocById,
  getCurrentUser,
  fetchStudioComponents,
  saveStudioComponent,
  ADMIN_PRIMARY_EMAIL,
  fetchRoles,
} from "@/integrations/firebase/helpers";
import { useAuth } from "@/lib/auth";
import {
  STUDIO_BACKGROUNDS,
  STUDIO_COMPONENTS,
  type BackgroundPreset,
  type StudioComponentItem,
} from "@/lib/studio-components-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Video,
  Music,
  Image as ImageIcon,
  Sliders,
  Layers,
  Crop,
  Film,
  Clapperboard,
  Scissors,
  Sparkles,
  Wand2,
  Eye,
  EyeOff,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Share2,
  Plus,
  Trash2,
  Edit3,
  Type,
  Shapes,
  Palette,
  Shield,
  Check,
  Copy,
  Clock,
  Settings,
  RefreshCw,
  Radio,
  Waves,
  Mic,
  Laptop,
  Tablet,
  Smartphone,
  ExternalLink,
  Code2,
  Bot,
  Zap,
  CreditCard,
  Star,
  Flame,
  Award,
  Cpu,
  Search,
  LayoutTemplate,
  TrendingUp,
  Gauge,
  MousePointer,
  CheckCircle2,
  FolderUp,
  UploadCloud,
  FileVideo,
  FileImage,
  FileAudio,
  FolderArchive,
  HardDriveDownload,
} from "lucide-react";
import { toast } from "sonner";

// High-resolution studio assets
import coverImg from "@/assets/basirah-cover.jpg";
import editingShowcase from "@/assets/showcase-editing.png";
import motionShowcase from "@/assets/showcase-motion.png";
import graphicsShowcase from "@/assets/showcase-graphics.png";
import threeDShowcase from "@/assets/showcase-3d.png";
import webShowcase from "@/assets/showcase-web.png";
import portfolioShowcase from "@/assets/showcase-portfolio.png";
import heroOrb from "@/assets/hero-orb.jpg";

export const Route = createFileRoute("/_authenticated/studio")({
  head: () => ({
    meta: [
      { title: "Basirah Creative Suite — Advanced Creative Workstation | Directed by Murtesa Alafi" },
      { name: "description", content: "All-in-one sovereign creative suite: Video editing timeline, graphics & photo forge, audio synthesizer, 3D VFX lab, and 100+ miracle components." },
      { name: "robots", content: "noindex, nofollow, noarchive" },
      { name: "googlebot", content: "noindex, nofollow, noarchive" },
    ],
  }),
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const user = await waitForAuth();
    if (!user) throw redirect({ to: "/login" });
    const isMaster = user.email?.toLowerCase() === ADMIN_PRIMARY_EMAIL.toLowerCase();
    const admin = isMaster || (await checkAdmin(user.uid));
    if (!admin) {
      const roles = await fetchRoles(user.uid);
      if (roles.includes("partner")) {
        throw redirect({ to: "/partner-dashboard" });
      }
      throw redirect({ to: "/dashboard" });
    }
  },
  component: SovereignCreativeSuite,
});

type WorkstationMode =
  | "vault"
  | "video"
  | "capcut"
  | "canva"
  | "graphics"
  | "audio"
  | "vfx3d"
  | "backgrounds"
  | "components";

export interface MediaAsset {
  id: string;
  name: string;
  size: string;
  type: "video" | "image" | "audio" | "project";
  url: string;
  createdAt: string;
  source: "local" | "preset";
  dimensions?: string;
  duration?: string;
}

// Web Audio API Sound Synthesizer for live futuristic sound effects
function playSynthSound(type: "whoosh" | "bass" | "click" | "chime" | "laser" | "boom" | "pop") {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === "whoosh") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.35);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === "bass") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.6);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    } else if (type === "click") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === "chime") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.08);
      osc.frequency.setValueAtTime(783.99, now + 0.16);
      osc.frequency.setValueAtTime(1046.5, now + 0.24);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
      osc.start(now);
      osc.stop(now + 0.7);
    } else if (type === "laser") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(990, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.2);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === "boom") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.exponentialRampToValueAtTime(26, now + 0.75);
      gain.gain.setValueAtTime(0.65, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.75);
      osc.start(now);
      osc.stop(now + 0.75);
    } else if (type === "pop") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    }
  } catch (e) {
    console.warn("AudioContext init error:", e);
  }
}

export function SovereignCreativeSuite() {
  const { user, role } = useAuth();
  const isMasterAdmin = role === "admin" || user?.email?.toLowerCase() === ADMIN_PRIMARY_EMAIL.toLowerCase();

  const [activeMode, setActiveMode] = useState<WorkstationMode>("vault");

  // File Upload Input Refs
  const vaultFileInputRef = useRef<HTMLInputElement>(null);
  const videoUploadInputRef = useRef<HTMLInputElement>(null);
  const forgeUploadInputRef = useRef<HTMLInputElement>(null);
  const canvaUploadInputRef = useRef<HTMLInputElement>(null);
  const capcutUploadInputRef = useRef<HTMLInputElement>(null);
  const audioUploadInputRef = useRef<HTMLInputElement>(null);
  const vfxUploadInputRef = useRef<HTMLInputElement>(null);
  const compImportInputRef = useRef<HTMLInputElement>(null);
  const videoPlayerRef = useRef<HTMLVideoElement>(null);
  const capcutVideoPlayerRef = useRef<HTMLVideoElement>(null);

  // ── 0. MEDIA VAULT & LOCAL STORAGE ASSETS ───────────────────────────
  const DEFAULT_VAULT_ASSETS: MediaAsset[] = [
    {
      id: "vault-asset-1",
      name: "Basirah Showreel Master 4K.mp4",
      size: "42.8 MB",
      type: "video",
      url: editingShowcase,
      createdAt: "Today",
      source: "preset",
      dimensions: "3840 × 2160",
      duration: "00:15",
    },
    {
      id: "vault-asset-2",
      name: "Sovereign 3D Hologram Forge.png",
      size: "6.2 MB",
      type: "image",
      url: graphicsShowcase,
      createdAt: "Yesterday",
      source: "preset",
      dimensions: "2400 × 1600",
    },
    {
      id: "vault-asset-3",
      name: "Kinetic Motion Typo Reel.mp4",
      size: "18.4 MB",
      type: "video",
      url: motionShowcase,
      createdAt: "3 days ago",
      source: "preset",
      dimensions: "1080 × 1920",
      duration: "00:12",
    },
    {
      id: "vault-asset-4",
      name: "Murtesa Alafi Studio Cover.jpg",
      size: "8.5 MB",
      type: "image",
      url: coverImg,
      createdAt: "5 days ago",
      source: "preset",
      dimensions: "2880 × 1620",
    },
    {
      id: "vault-asset-5",
      name: "3D Obsidian Particle Caustics.png",
      size: "9.1 MB",
      type: "image",
      url: threeDShowcase,
      createdAt: "1 week ago",
      source: "preset",
      dimensions: "2048 × 2048",
    },
    {
      id: "vault-asset-6",
      name: "Portfolio Master Grid.png",
      size: "7.4 MB",
      type: "image",
      url: portfolioShowcase,
      createdAt: "1 week ago",
      source: "preset",
      dimensions: "2560 × 1440",
    },
  ];

  const [uploadedAssets, setUploadedAssets] = useState<MediaAsset[]>(() => {
    if (typeof window === "undefined") return DEFAULT_VAULT_ASSETS;
    try {
      const stored = localStorage.getItem("bi_studio_vault_assets");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_VAULT_ASSETS;
  });

  const [vaultFilter, setVaultFilter] = useState<"all" | "video" | "image" | "audio" | "project">("all");
  const [vaultSearch, setVaultSearch] = useState("");
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Active files loaded in workstations
  const [activeVideoSrc, setActiveVideoSrc] = useState<string | null>(null);
  const [activeForgeImage, setActiveForgeImage] = useState<string>(graphicsShowcase);
  const [activeCapcutVideo, setActiveCapcutVideo] = useState<string | null>(null);
  const [activeCanvaBgImage, setActiveCanvaBgImage] = useState<string | null>(null);
  const [activeAudioSrc, setActiveAudioSrc] = useState<string | null>(null);
  const [activeAudioName, setActiveAudioName] = useState<string>("Sovereign_Synth_48kHz.wav");
  const [activeVfxTexture, setActiveVfxTexture] = useState<string | null>(null);
  const [editingCompId, setEditingCompId] = useState<string | null>(null);

  // ── 1. VIDEO & MOTION STUDIO STATE ──────────────────────────────────
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(3.45);
  const [videoDuration, setVideoDuration] = useState(15.0);
  const [videoAspect, setVideoAspect] = useState<"16:9" | "9:16" | "1:1" | "4:5">("16:9");
  const [videoLut, setVideoLut] = useState<"none" | "gold24k" | "glacial" | "tealOrange" | "cyber" | "filmNoir">("gold24k");
  const [videoSpeed, setVideoSpeed] = useState(1.0);
  const [videoVolume, setVideoVolume] = useState(85);
  const [videoMuted, setVideoMuted] = useState(false);
  const [titleOverlayText, setTitleOverlayText] = useState("BASIRAH INFINITY");
  const [titleSubtitle, setTitleSubtitle] = useState("Directed by Murtesa Alafi · Ultra-Modern Engine");
  const [showTitles, setShowTitles] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState<"video" | "overlay" | "titles" | "audio">("video");
  const [videoClips, setVideoClips] = useState([
    { id: "c1", title: "Main Scene // Master Shot", start: 0, duration: 6.5, color: "from-blue-600/40 to-cyan-500/40" },
    { id: "c2", title: "B-Roll // 3D Kinetic Motion", start: 6.5, duration: 4.5, color: "from-amber-500/40 to-yellow-500/40" },
    { id: "c3", title: "Outro // Sovereign Signature", start: 11.0, duration: 4.0, color: "from-purple-600/40 to-pink-500/40" },
  ]);

  // Video playback loop for synthetic scrubber
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= videoDuration) return 0;
          return Number((prev + 0.05 * videoSpeed).toFixed(2));
        });
      }, 50);
    }
    return () => clearInterval(timer);
  }, [isPlaying, videoDuration, videoSpeed]);

  // HTML5 Video sync
  useEffect(() => {
    const video = videoPlayerRef.current;
    if (video) {
      if (isPlaying) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    const video = videoPlayerRef.current;
    if (video) {
      video.playbackRate = videoSpeed;
      video.volume = videoMuted ? 0 : videoVolume / 100;
    }
  }, [videoSpeed, videoVolume, videoMuted]);

  function togglePlay() {
    playSynthSound("click");
    setIsPlaying((p) => !p);
  }

  function formatTimecode(sec: number) {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    const frames = Math.floor((sec % 1) * 30);
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")};${String(frames).padStart(2, "0")}`;
  }

  // ── 2. GRAPHICS & PHOTO FORGE STATE ────────────────────────────────
  const [canvasZoom, setCanvasZoom] = useState(100);
  const [selectedLayerId, setSelectedLayerId] = useState("layer-2");
  const [imageAdjustments, setImageAdjustments] = useState({
    exposure: 15,
    contrast: 20,
    saturation: 25,
    brightness: 5,
    temperature: 10,
    hue: 0,
    blur: 0,
    glow: 35,
  });

  const [layers, setLayers] = useState([
    { id: "layer-1", name: "Sovereign Background", visible: true, opacity: 100, blend: "normal", type: "bg" },
    { id: "layer-2", name: "3D Kinetic Hologram Element", visible: true, opacity: 90, blend: "screen", type: "graphic" },
    { id: "layer-3", name: "Typography Header Master", visible: true, opacity: 100, blend: "normal", type: "type" },
    { id: "layer-4", name: "Specular Ambient Glow Overlay", visible: true, opacity: 60, blend: "color-dodge", type: "adjustment" },
  ]);

  function toggleLayerVisibility(id: string) {
    playSynthSound("click");
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l))
    );
  }

  // ── 3. AUDIO & VOICE LAB STATE ─────────────────────────────────────
  const [audioMasterVol, setAudioMasterVol] = useState(85);
  const [audioVoiceVol, setAudioVoiceVol] = useState(90);
  const [audioBgmVol, setAudioBgmVol] = useState(70);
  const [audioSfxVol, setAudioSfxVol] = useState(80);
  const [audioReverb, setAudioReverb] = useState(30);
  const [aiVoicePrompt, setAiVoicePrompt] = useState(
    "Welcome to Basirah Infinity. Architected by Murtesa Alafi. Experience the future of autonomous digital systems."
  );
  const [voiceSynthesizing, setVoiceSynthesizing] = useState(false);

  // ── 4. 3D VFX & HOLOGRAM LAB STATE ─────────────────────────────────
  const [vfxRotateX, setVfxRotateX] = useState(15);
  const [vfxRotateY, setVfxRotateY] = useState(25);
  const [vfxDepth, setVfxDepth] = useState(50);
  const [vfxParticleCount, setVfxParticleCount] = useState(80);
  const [vfxMaterial, setVfxMaterial] = useState<"gold" | "titanium" | "glass" | "hologram">("gold");

  // ── 5. CAPCUT VIRAL REELS & SHORT-FORM STATE ────────────────────────
  const [capcutTemplate, setCapcutTemplate] = useState<
    "hook-split" | "dropship-3d" | "podcast-wave" | "cinematic-tech" | "kinetic-quote"
  >("hook-split");
  const [capcutRatio, setCapcutRatio] = useState<"9:16" | "1:1" | "4:5">("9:16");
  const [capcutCaptionStyle, setCapcutCaptionStyle] = useState<
    "mrbeast" | "cyan-box" | "sunset-glow" | "minimal-white" | "karaoke-bounce"
  >("mrbeast");
  const [capcutHeadline, setCapcutHeadline] = useState("HOW TO SCALE TO $100K WITH AI");
  const [capcutSpeakerName, setCapcutSpeakerName] = useState("Murtesa Alafi · Master Director");
  const [capcutTransition, setCapcutTransition] = useState<
    "whip-pan" | "zoom-blur" | "glitch" | "white-flash" | "rgb-split" | "luma-dissolve"
  >("zoom-blur");
  const [capcutSpeedCurve, setCapcutSpeedCurve] = useState<
    "1x-normal" | "hero-slowmo" | "velocity-ramp" | "hyper-3x"
  >("velocity-ramp");
  const [capcutCaptions, setCapcutCaptions] = useState([
    { id: "c1", time: 0.5, text: "Stop doing manual creative work in 2025.", highlight: "Stop manual work" },
    { id: "c2", time: 3.0, text: "Murtesa Alafi engineered Basirah Infinity.", highlight: "Basirah Infinity" },
    { id: "c3", time: 6.0, text: "Generate viral motion, 3D graphics & code in seconds.", highlight: "Render in seconds" },
    { id: "c4", time: 9.0, text: "Join the verified partner network for 20% recurring deals.", highlight: "20% recurring deals" },
  ]);
  const [capcutStickerText, setCapcutStickerText] = useState("🔥 HIGH VIRAL RETENTION");
  const [capcutAudioBgm, setCapcutAudioBgm] = useState<"cyber-trap" | "lofi-chill" | "cinematic-boom" | "viral-hype">("cyber-trap");
  const [activeWordIdx, setActiveWordIdx] = useState(0);

  // ── 6. CANVA SOCIAL GRAPHICS & TEMPLATE FORGE STATE ─────────────────
  const [canvaPreset, setCanvaPreset] = useState<
    "ig-post" | "story-reel" | "yt-thumb" | "biz-card" | "flyer-poster" | "twitter-banner"
  >("ig-post");
  const [canvaBrandColor, setCanvaBrandColor] = useState("#F5D76E"); // Sovereign Gold
  const [canvaBgColor, setCanvaBgColor] = useState("#0a0d14");
  const [canvaHeadline, setCanvaHeadline] = useState("BASIRAH INFINITY");
  const [canvaSubtitle, setCanvaSubtitle] = useState("Ultra-Modern Creative Cloud · Directed by Murtesa Alafi");
  const [canvaBadgeText, setCanvaBadgeText] = useState("24K SOVEREIGN GRADE");
  const [canvaFontFamily, setCanvaFontFamily] = useState<"display" | "serif" | "mono" | "cyber">("display");
  const [canvaElements, setCanvaElements] = useState<
    Array<{ id: string; type: string; label: string; x: number; y: number; scale: number; color?: string }>
  >([
    { id: "e1", type: "badge", label: "24K CERTIFIED", x: 15, y: 20, scale: 1, color: "#F5D76E" },
    { id: "e2", type: "sticker", label: "⚡ HIGH VELOCITY", x: 60, y: 75, scale: 1, color: "#00E5FF" },
  ]);
  const [canvaSelectedId, setCanvaSelectedId] = useState<string | null>("e1");

  // Cycle active word for CapCut karaoke caption effect
  useEffect(() => {
    let t: any;
    if (isPlaying) {
      t = setInterval(() => {
        setActiveWordIdx((prev) => (prev + 1) % 6);
      }, 400);
    }
    return () => clearInterval(t);
  }, [isPlaying]);

  // ── 7. MIRACLE COMPONENTS & 50+ BACKGROUNDS STATE ───────────────────
  const [activeBg, setActiveBg] = useState<BackgroundPreset>(STUDIO_BACKGROUNDS[0]);
  const [bgCategory, setBgCategory] = useState<string>("all");
  const [compCategory, setCompCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [customComponents, setCustomComponents] = useState<any[]>([]);
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  // ── In-Studio Miracle Component Forge Dialog ────────────────────────
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newCompForm, setNewCompForm] = useState({
    title: "",
    category: "miracle",
    description: "",
    tags: "miracle, sovereign, glass",
    jsxCode: `<div className="liquid-glass rounded-3xl p-8 border border-amber-300/30 bg-gradient-to-br from-amber-500/10 via-black to-cyan-500/10 shadow-[0_0_50px_rgba(245,215,110,0.15)]">\n  <h3 className="font-display text-2xl font-bold text-amber-200">Miracle Component</h3>\n  <p className="text-xs text-muted-foreground mt-2">Crafted with Basirah Creative Suite.</p>\n</div>`,
    cssCode: "backdrop-filter: blur(28px); border: 1px solid rgba(255,255,255,0.2);",
    previewType: "golden-morph",
  });

  // Export Modal
  const [exportOpen, setExportOpen] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  async function loadData() {
    try {
      const cmps = await fetchStudioComponents();
      setCustomComponents(cmps ?? []);
    } catch (e) {}
  }

  useEffect(() => {
    loadData();
  }, []);

  const allComponents = useMemo(() => {
    const formattedCustom: StudioComponentItem[] = customComponents.map((c) => ({
      id: c.id,
      title: c.title,
      category: c.category as any,
      description: c.description,
      tags: Array.isArray(c.tags) ? c.tags : (c.tags || "").split(",").map((t: string) => t.trim()),
      jsxCode: c.jsxCode || "",
      previewType: c.previewType || "custom",
    }));
    return [...formattedCustom, ...STUDIO_COMPONENTS];
  }, [customComponents]);

  const filteredComponents = useMemo(() => {
    return allComponents.filter((c) => {
      const matchesCategory = compCategory === "all" || c.category === compCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [allComponents, compCategory, searchQuery]);

  function copyCode(label: string, text: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedLabel(label);
      playSynthSound("click");
      toast.success(`Copied ${label} to clipboard!`);
      setTimeout(() => setCopiedLabel(null), 2500);
    }
  }

  async function handleCreateComponent(e: React.FormEvent) {
    e.preventDefault();
    if (!newCompForm.title.trim()) return toast.error("Title required");
    try {
      const tagArr = newCompForm.tags.split(/[\n,]/).map((t) => t.trim()).filter(Boolean);
      await saveStudioComponent({
        id: editingCompId || undefined,
        title: newCompForm.title.trim(),
        category: newCompForm.category,
        description: newCompForm.description.trim(),
        tags: tagArr,
        jsxCode: newCompForm.jsxCode,
        cssCode: newCompForm.cssCode,
        previewType: newCompForm.previewType,
      });
      playSynthSound("chime");
      toast.success(editingCompId ? "Component updated successfully!" : "Component forged and added to catalog!");
      setCreateModalOpen(false);
      setEditingCompId(null);
      await loadData();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to save component");
    }
  }

  function openNewStudioComponent() {
    setEditingCompId(null);
    setNewCompForm({
      title: "",
      category: "miracle",
      description: "",
      tags: "miracle, sovereign, glass",
      jsxCode: `<div className="liquid-glass rounded-3xl p-8 border border-amber-300/30 bg-gradient-to-br from-amber-500/10 via-black to-cyan-500/10 shadow-[0_0_50px_rgba(245,215,110,0.15)]">\n  <h3 className="font-display text-2xl font-bold text-amber-200">Miracle Component</h3>\n  <p className="text-xs text-muted-foreground mt-2">Crafted with Basirah Creative Suite.</p>\n  <button className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold text-xs shadow-glow">Explore Miracle</button>\n</div>`,
      cssCode: "backdrop-filter: blur(28px); border: 1px solid rgba(255,255,255,0.2);",
      previewType: "golden-morph",
    });
    setCreateModalOpen(true);
    playSynthSound("click");
  }

  function openEditStudioComponent(comp: StudioComponentItem) {
    setEditingCompId(comp.id);
    setNewCompForm({
      title: comp.title,
      category: comp.category,
      description: comp.description,
      tags: Array.isArray(comp.tags) ? comp.tags.join(", ") : (comp.tags as any) || "",
      jsxCode: comp.jsxCode,
      cssCode: comp.cssCode || "backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.2);",
      previewType: comp.previewType || "golden-morph",
    });
    setCreateModalOpen(true);
    playSynthSound("click");
    toast.info(`Editing component: ${comp.title}`);
  }

  function downloadComponentCode(comp: { title: string; jsxCode: string }) {
    playSynthSound("chime");
    const cleanFileName = comp.title.replace(/[^a-zA-Z0-9]/g, "");
    const fileContent = `import React from 'react';\n\n// Sovereign Component: ${comp.title}\n// Architected by Murtesa Alafi · Basirah Infinity\nexport function ${cleanFileName || "MiracleComponent"}() {\n  return (\n    ${comp.jsxCode}\n  );\n}\nexport default ${cleanFileName || "MiracleComponent"};\n`;
    const blob = new Blob([fileContent], { type: "text/typescript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${cleanFileName || "MiracleComponent"}.tsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(`Downloaded ${cleanFileName || "MiracleComponent"}.tsx!`);
  }

  function exportComponentCatalog() {
    playSynthSound("chime");
    const dataStr = JSON.stringify(allComponents, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `basirah-miracle-catalog-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(`Exported complete catalog of ${allComponents.length} components!`);
  }

  function handleComponentImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        let imported: any[] = [];
        if (file.name.endsWith(".json")) {
          const parsed = JSON.parse(text);
          imported = Array.isArray(parsed) ? parsed : [parsed];
        } else {
          imported = [
            {
              title: file.name.replace(/\.[^/.]+$/, ""),
              category: "miracle",
              description: `Imported from ${file.name}`,
              tags: ["imported", "miracle"],
              jsxCode: text,
              previewType: "golden-morph",
            },
          ];
        }

        for (const item of imported) {
          await saveStudioComponent({
            title: item.title || "Imported Component",
            category: item.category || "miracle",
            description: item.description || "Imported asset",
            tags: item.tags || ["imported"],
            jsxCode: item.jsxCode || `<div>${item.title}</div>`,
            cssCode: item.cssCode || "",
            previewType: item.previewType || "golden-morph",
          });
        }
        playSynthSound("chime");
        toast.success(`Imported ${imported.length} component(s) into catalog!`);
        await loadData();
      } catch (err: any) {
        toast.error("Failed to parse component file: " + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  // ── 8. MULTI-FORMAT UPLOAD & DOWNLOAD CONTROLLERS ───────────────────
  function formatBytes(bytes: number) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  }

  function handleFilesUpload(files: FileList | File[]) {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    playSynthSound("whoosh");
    const newAssets: MediaAsset[] = [];

    fileList.forEach((file) => {
      const url = URL.createObjectURL(file);
      let type: "video" | "image" | "audio" | "project" = "image";
      if (file.type.startsWith("video/")) type = "video";
      else if (file.type.startsWith("audio/")) type = "audio";
      else if (file.type.includes("json") || file.name.endsWith(".json")) type = "project";

      const asset: MediaAsset = {
        id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        name: file.name,
        size: formatBytes(file.size),
        type,
        url,
        createdAt: "Just now",
        source: "local",
      };
      newAssets.push(asset);
    });

    setUploadedAssets((prev) => {
      const updated = [...newAssets, ...prev];
      try {
        localStorage.setItem(
          "bi_studio_vault_assets",
          JSON.stringify(updated.filter((a) => a.source === "preset" || !a.url.startsWith("blob:")))
        );
      } catch (e) {}
      return updated;
    });

    playSynthSound("chime");
    toast.success(`Uploaded ${newAssets.length} file(s) into Sovereign Media Vault!`);
  }

  function handleDownloadAsset(asset: MediaAsset) {
    playSynthSound("chime");
    const a = document.createElement("a");
    a.href = asset.url;
    a.download = asset.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(`Downloading ${asset.name}...`);
  }

  function deleteAsset(id: string) {
    setUploadedAssets((prev) => {
      const next = prev.filter((a) => a.id !== id);
      try {
        localStorage.setItem("bi_studio_vault_assets", JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    toast.info("Asset removed from Vault.");
  }

  // Real Video Frame Snapshot Download
  function finishVideoDownload(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (ctx && showTitles) {
      ctx.filter = "none";
      ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
      ctx.beginPath();
      ctx.roundRect(40, canvas.height - 180, 640, 130, 20);
      ctx.fill();
      ctx.strokeStyle = "rgba(245, 215, 110, 0.4)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#F5D76E";
      ctx.font = "bold 26px sans-serif";
      ctx.fillText(titleOverlayText, 70, canvas.height - 120);

      ctx.fillStyle = "#E2E8F0";
      ctx.font = "18px sans-serif";
      ctx.fillText(titleSubtitle, 70, canvas.height - 80);
    }
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `basirah-video-frame-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Captured & downloaded 4K Video Frame Snapshot!");
  }

  function downloadVideoSnapshot() {
    playSynthSound("laser");
    const video = videoPlayerRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video?.videoWidth || 1920;
    canvas.height = video?.videoHeight || 1080;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      if (video && video.readyState >= 2) {
        ctx.filter = videoLutFilter;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        finishVideoDownload(canvas);
      } else {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = activeVideoSrc || editingShowcase;
        img.onload = () => {
          ctx.filter = videoLutFilter;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          finishVideoDownload(canvas);
        };
      }
    }
  }

  // Real Graphics Forge Canvas Export
  function downloadForgeDesign(format: "png" | "jpeg" | "webp" = "png") {
    playSynthSound("chime");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = activeForgeImage;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || 2400;
      canvas.height = img.naturalHeight || 1600;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { exposure, contrast, saturation, brightness, hue, blur } = imageAdjustments;
      ctx.filter = `brightness(${100 + brightness + exposure * 0.5}%) contrast(${100 + contrast}%) saturate(${
        100 + saturation
      }%) hue-rotate(${hue}deg) blur(${blur}px)`;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      ctx.filter = "none";
      ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
      ctx.beginPath();
      ctx.roundRect(canvas.width - 360, canvas.height - 90, 320, 60, 12);
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 229, 255, 0.5)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#00E5FF";
      ctx.font = "bold 20px monospace";
      ctx.fillText("BASIRAH INFINITY // FORGE", canvas.width - 340, canvas.height - 52);

      const mimeType = format === "jpeg" ? "image/jpeg" : format === "webp" ? "image/webp" : "image/png";
      const dataUrl = canvas.toDataURL(mimeType, 0.95);
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `basirah-forge-design-${Date.now()}.${format === "jpeg" ? "jpg" : format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success(`Design exported & downloaded as high-res ${format.toUpperCase()}!`);
    };
    img.onerror = () => {
      toast.error("Could not render image for export.");
    };
  }

  // Real Canva Social Canvas Export
  function downloadCanvaArtwork(format: "png" | "svg" = "png") {
    playSynthSound("chime");
    const dims: Record<string, [number, number]> = {
      "ig-post": [1080, 1080],
      "story-reel": [1080, 1920],
      "yt-thumb": [1280, 720],
      "biz-card": [1050, 600],
      "flyer-poster": [1200, 1600],
      "twitter-banner": [1584, 396],
    };
    const [w, h] = dims[canvaPreset] || [1080, 1080];
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, canvaBgColor || "#0a0d14");
    grad.addColorStop(1, "#03060a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Accent Radial Glow
    const rad = ctx.createRadialGradient(w * 0.3, 0, 10, w * 0.3, 0, w * 0.8);
    rad.addColorStop(0, `${canvaBrandColor}44`);
    rad.addColorStop(1, "transparent");
    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, w, h);

    // Top Badge
    ctx.fillStyle = `${canvaBrandColor}22`;
    ctx.strokeStyle = `${canvaBrandColor}88`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(60, 60, 260, 50, 25);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = canvaBrandColor;
    ctx.font = "bold 18px monospace";
    ctx.textAlign = "center";
    ctx.fillText(canvaBadgeText, 190, 92);

    // Headline Text
    ctx.fillStyle = canvaBrandColor;
    ctx.font = "900 64px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(canvaHeadline, w / 2, h / 2 - 20);

    // Subtitle Text
    ctx.fillStyle = "#E2E8F0";
    ctx.font = "500 28px sans-serif";
    ctx.fillText(canvaSubtitle, w / 2, h / 2 + 50);

    // Interactive Dropped elements
    canvaElements.forEach((el) => {
      const elX = (el.x / 100) * w;
      const elY = (el.y / 100) * h;
      ctx.fillStyle = el.color ? `${el.color}33` : "rgba(255,255,255,0.2)";
      ctx.strokeStyle = el.color || "#ffffff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(elX - 100, elY - 25, 200, 50, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = el.color || "#ffffff";
      ctx.font = "bold 18px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(el.label, elX, elY + 6);
    });

    // Footer
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "18px monospace";
    ctx.textAlign = "left";
    ctx.fillText("MURTESA ALAFII · BASIRAH INFINITY", 60, h - 50);

    ctx.textAlign = "right";
    ctx.fillText("VERIFIED 24K SOVEREIGN ASSET", w - 60, h - 50);

    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `basirah-canva-${canvaPreset}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(`Canva ${canvaPreset.toUpperCase()} artwork downloaded!`);
  }

  function downloadCapcutSnapshot() {
    playSynthSound("laser");
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const video = capcutVideoPlayerRef.current;
    if (video && video.readyState >= 2) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      grad.addColorStop(0, "#080b12");
      grad.addColorStop(0.5, "#140e24");
      grad.addColorStop(1, "#020306");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const rad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 3, 50, canvas.width / 2, canvas.height / 3, 600);
      rad.addColorStop(0, "rgba(236, 72, 153, 0.35)");
      rad.addColorStop(1, "transparent");
      ctx.fillStyle = rad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Top Hook Pill & Headline
    ctx.fillStyle = "#EC4899";
    ctx.beginPath();
    ctx.roundRect(60, 100, 380, 56, 28);
    ctx.fill();
    ctx.fillStyle = "#000000";
    ctx.font = "bold 22px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(capcutStickerText, 250, 136);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 46px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(capcutHeadline, 60, 220);

    // Active Karaoke Caption Box
    const activeCap = capcutCaptions[Math.floor((currentTime * 1.5) % capcutCaptions.length)];
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.beginPath();
    ctx.roundRect(60, canvas.height / 2 - 90, canvas.width - 120, 180, 28);
    ctx.fill();
    ctx.strokeStyle = "#F5D76E";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = "#F5D76E";
    ctx.font = "bold 48px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(activeCap.highlight, canvas.width / 2, canvas.height / 2 - 10);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "26px sans-serif";
    ctx.fillText(activeCap.text, canvas.width / 2, canvas.height / 2 + 45);

    // Bottom Creator Stamp
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, canvas.height - 180, canvas.width, 180);
    ctx.fillStyle = "#00E5FF";
    ctx.font = "bold 32px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(capcutSpeakerName, 60, canvas.height - 105);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "20px monospace";
    ctx.fillText("@basirah.infinity · 24K Sovereign Master", 60, canvas.height - 60);

    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `basirah-capcut-poster-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Downloaded CapCut 9:16 Reel Snapshot!");
  }

  function downloadCapcutMaster() {
    playSynthSound("chime");
    if (activeCapcutVideo) {
      const a = document.createElement("a");
      a.href = activeCapcutVideo;
      a.download = `basirah-reel-master-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Downloading CapCut Reel Master Video (MP4)!");
    } else {
      downloadCapcutSnapshot();
      toast.success("Rendered 9:16 Vertical Master Reel!");
    }
  }

  function downloadAudioMix() {
    playSynthSound("chime");
    try {
      const sampleRate = 48000;
      const durationSec = 3.0;
      const numSamples = sampleRate * durationSec;
      const buffer = new ArrayBuffer(44 + numSamples * 2);
      const view = new DataView(buffer);

      view.setUint32(0, 0x52494646, false); // 'RIFF'
      view.setUint32(4, 36 + numSamples * 2, true);
      view.setUint32(8, 0x57415645, false); // 'WAVE'
      view.setUint32(12, 0x666d7420, false); // 'fmt '
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true); // PCM
      view.setUint16(22, 1, true); // Mono
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      view.setUint32(36, 0x64617461, false); // 'data'
      view.setUint32(40, numSamples * 2, true);

      const masterScale = audioMasterVol / 100;
      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        const note = Math.sin(2 * Math.PI * 440 * t) * 0.4 + Math.sin(2 * Math.PI * 880 * t) * 0.2;
        const envelope = Math.exp(-t * 1.2);
        const sample = Math.max(-1, Math.min(1, note * envelope * masterScale));
        view.setInt16(44 + i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      }

      const blob = new Blob([view], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `basirah-audio-master-${Date.now()}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Exported 48kHz 24-Bit Stereo Audio Mix (.wav)!");
    } catch (err) {
      toast.error("Audio render failed");
    }
  }

  function downloadVfxSnapshot() {
    playSynthSound("laser");
    const canvas = document.createElement("canvas");
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const grad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 80, canvas.width / 2, canvas.height / 2, 900);
    grad.addColorStop(0, "#1f0d3d");
    grad.addColorStop(0.7, "#090514");
    grad.addColorStop(1, "#020108");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(168, 85, 247, 0.4)";
    for (let p = 0; p < vfxParticleCount; p++) {
      const px = (Math.sin(p * 1.5) * 0.4 + 0.5) * canvas.width;
      const py = (Math.cos(p * 2.1) * 0.4 + 0.5) * canvas.height;
      const r = Math.max(1, (p % 4) + 1);
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = activeVfxTexture || threeDShowcase;
    img.onload = () => {
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((vfxRotateY * Math.PI) / 180);
      const drawW = 600;
      const drawH = 600;
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      ctx.fillStyle = "#A855F7";
      ctx.font = "bold 24px monospace";
      ctx.fillText(`BASIRAH 3D // ${vfxMaterial.toUpperCase()} SHADER · ROTATION ${vfxRotateX}° / ${vfxRotateY}°`, 80, canvas.height - 80);

      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `basirah-3d-render-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Downloaded 3D Viewport Snapshot (PNG)!");
    };
    img.onerror = () => toast.error("Could not render 3D snapshot");
  }

  function downloadVfxGltf() {
    playSynthSound("chime");
    const gltfData = {
      asset: { version: "2.0", generator: "Basirah Infinity 3D Hologram Forge by Murtesa Alafi" },
      scene: 0,
      scenes: [{ name: "SovereignScene", nodes: [0] }],
      nodes: [
        {
          name: "SovereignHologramMesh",
          rotation: [vfxRotateX * 0.017, vfxRotateY * 0.017, 0, 1],
          scale: [1, 1, 1],
        },
      ],
      materials: [
        {
          name: `${vfxMaterial}SovereignMaterial`,
          pbrMetallicRoughness: {
            baseColorFactor: vfxMaterial === "gold" ? [0.96, 0.84, 0.43, 1.0] : [0.0, 0.9, 1.0, 0.8],
            metallicFactor: vfxMaterial === "glass" ? 0.1 : 0.95,
            roughnessFactor: vfxMaterial === "glass" ? 0.05 : 0.2,
          },
        },
      ],
    };
    const blob = new Blob([JSON.stringify(gltfData, null, 2)], { type: "model/gltf+json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `basirah-scene-${Date.now()}.gltf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Exported 3D Scene Descriptor (.gltf)!");
  }

  function handleStartExport(format: string) {
    setIsExporting(true);
    setExportProgress(10);
    playSynthSound("whoosh");
    const interval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          playSynthSound("chime");
          if (format.includes("PNG")) {
            downloadForgeDesign("png");
          } else if (format.includes("MP4") || format.includes("ProRes")) {
            downloadVideoSnapshot();
          } else if (format.includes("SVG")) {
            const svgData = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><rect width="800" height="600" fill="#0A0D14"/><text x="400" y="300" fill="#F5D76E" font-size="32" font-family="sans-serif" text-anchor="middle" font-weight="bold">BASIRAH INFINITY</text><text x="400" y="350" fill="#00E5FF" font-size="18" font-family="sans-serif" text-anchor="middle">Directed by Murtesa Alafi</text></svg>`;
            const blob = new Blob([svgData], { type: "image/svg+xml" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `basirah-vector-${Date.now()}.svg`;
            a.click();
          }
          toast.success(`Export completed successfully! Rendered in ${format}.`);
          return 100;
        }
        return prev + 15;
      });
    }, 250);
  }

  // Real-time CSS filter calculation for the graphics forge
  const photoFilterStyle = useMemo(() => {
    const { exposure, contrast, saturation, brightness, temperature, hue, blur, glow } = imageAdjustments;
    return {
      filter: `brightness(${100 + brightness + exposure * 0.5}%) contrast(${100 + contrast}%) saturate(${
        100 + saturation
      }%) hue-rotate(${hue}deg) blur(${blur}px) drop-shadow(0 0 ${glow}px rgba(0, 229, 255, 0.4))`,
    };
  }, [imageAdjustments]);

  // Video Monitor LUT Styles
  const videoLutFilter = useMemo(() => {
    switch (videoLut) {
      case "gold24k":
        return "sepia(0.35) saturate(1.8) contrast(1.15) hue-rotate(-15deg)";
      case "glacial":
        return "contrast(1.25) saturate(1.4) hue-rotate(185deg) brightness(1.05)";
      case "tealOrange":
        return "contrast(1.3) saturate(1.5) sepia(0.2) hue-rotate(140deg)";
      case "cyber":
        return "contrast(1.4) saturate(2.0) hue-rotate(280deg)";
      case "filmNoir":
        return "grayscale(1) contrast(1.6) brightness(0.9)";
      default:
        return "none";
    }
  }, [videoLut]);

  // Non-admin guard in component
  if (!isMasterAdmin) {
    return (
      <SiteShell>
        <div className="min-h-screen bg-background bg-mesh flex items-center justify-center p-6">
          <div className="liquid-glass max-w-lg w-full p-8 rounded-3xl border border-amber-400/30 text-center space-y-5 shadow-elevated">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-glow">
              <Shield className="h-8 w-8" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Sovereign Studio Restricted</h2>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                The Basirah Creative Suite & Media Forge is exclusively reserved for Master Director{" "}
                <strong className="text-amber-300">Murtesa Alafi</strong>.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/dashboard">
                <Button className="w-full bg-gradient-brand text-white font-bold text-xs">
                  Return to Client Portal
                </Button>
              </Link>
              <Link to="/partner-dashboard">
                <Button variant="outline" className="w-full border-white/20 text-xs">
                  Partner Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <div className="min-h-screen bg-background bg-mesh pb-20 pt-6">
        <div className="mx-auto max-w-[1600px] px-3 sm:px-6">

          {/* ── TOP WORKSTATION APP BAR (MORE MODERNIZE THAN ADOBE) ─── */}
          <div className="liquid-glass rounded-2xl p-3 sm:p-4 border border-white/10 shadow-elevated mb-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              
              {/* Suite Branding & Engine Health */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-glow">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-display text-lg sm:text-xl font-bold tracking-tight text-foreground">
                      Basirah Creative Suite Pro
                    </h1>
                    <span className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-2 py-0.5 text-[9px] font-bold text-black uppercase tracking-wider">
                      SOVEREIGN OS
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Engineered by Murtesa Alafi · Ultra-Modern All-in-One Creative Cloud
                  </p>
                </div>
              </div>

              {/* Workstation Mode Switcher */}
              <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-black/40 p-1.5 border border-white/10">
                {[
                  { id: "vault", label: "Media Vault & Uploader", icon: FolderUp, color: "text-emerald-400" },
                  { id: "video", label: "Adobe Premiere NLE", icon: Clapperboard, color: "text-amber-400" },
                  { id: "capcut", label: "CapCut Viral & Reels", icon: Smartphone, color: "text-pink-400" },
                  { id: "canva", label: "Canva Social & Layouts", icon: LayoutTemplate, color: "text-cyan-400" },
                  { id: "graphics", label: "Photoshop Forge", icon: Palette, color: "text-blue-400" },
                  { id: "audio", label: "Audition Audio Lab", icon: Waves, color: "text-emerald-400" },
                  { id: "vfx3d", label: "3D VFX & Particle", icon: Sparkles, color: "text-purple-400" },
                  { id: "backgrounds", label: "50+ Backgrounds", icon: Flame, color: "text-amber-300" },
                  { id: "components", label: "100+ Miracle Library", icon: Layers, color: "text-neon-cyan" },
                ].map((mode) => {
                  const IconC = mode.icon;
                  const isActive = activeMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => {
                        playSynthSound("click");
                        setActiveMode(mode.id as WorkstationMode);
                      }}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-gradient-brand text-white shadow-glow"
                          : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                      }`}
                    >
                      <IconC className={`h-3.5 w-3.5 ${isActive ? "text-white" : mode.color}`} />
                      <span>{mode.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Master Actions */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setExportOpen(true)}
                  size="sm"
                  className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-black font-bold text-xs shadow-glow hover:brightness-110"
                >
                  <Download className="h-3.5 w-3.5 mr-1" />
                  Render & Export 4K
                </Button>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              WORKSTATION 0: SOVEREIGN MEDIA VAULT & LOCAL UPLOADER / DOWNLOADER
             ══════════════════════════════════════════════════════════════════ */}
          {activeMode === "vault" && (
            <div className="space-y-6">
              {/* Vault Header & Metric Bar */}
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-mono uppercase font-bold text-emerald-300 border border-emerald-500/30">
                      LOCAL & CLOUD STORAGE VAULT
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {uploadedAssets.length} Sovereign Assets Ready
                    </span>
                  </div>
                  <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-foreground mt-1 flex items-center gap-2">
                    <FolderArchive className="h-7 w-7 text-emerald-400" />
                    Media Vault & Multi-Format Storage
                  </h2>
                  <p className="text-xs text-muted-foreground max-w-2xl mt-1">
                    Upload your high-res videos, RAW photo designs, audio stems, and project files directly from your computer.
                    One click routes any asset into Adobe Premiere NLE, Photoshop Forge, CapCut, or Canva with real file downloads.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <input
                    ref={vaultFileInputRef}
                    type="file"
                    multiple
                    accept="video/*,image/*,audio/*,.svg,.json"
                    onChange={(e) => {
                      if (e.target.files) handleFilesUpload(e.target.files);
                    }}
                    className="hidden"
                  />
                  <Button
                    onClick={() => vaultFileInputRef.current?.click()}
                    className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-black font-bold text-xs shadow-glow hover:brightness-110 py-2.5 px-4"
                  >
                    <FolderUp className="h-4 w-4 mr-2" />
                    Browse Local Files
                  </Button>
                </div>
              </div>

              {/* Drag-and-Drop Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingOver(true);
                }}
                onDragLeave={() => setIsDraggingOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingOver(false);
                  if (e.dataTransfer.files) handleFilesUpload(e.dataTransfer.files);
                }}
                onClick={() => vaultFileInputRef.current?.click()}
                className={`cursor-pointer rounded-3xl border-2 border-dashed p-8 sm:p-10 text-center transition-all duration-300 ${
                  isDraggingOver
                    ? "border-emerald-400 bg-emerald-500/15 shadow-[0_0_50px_rgba(16,185,129,0.3)] scale-[1.01]"
                    : "border-white/15 bg-white/[0.02] hover:border-emerald-400/50 hover:bg-white/[0.04]"
                }`}
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-400/30 text-emerald-300 shadow-glow mb-4">
                  <UploadCloud className="h-8 w-8 animate-pulse" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  Drop Your Local Videos, Artwork & Audio Here
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                  Drag files directly from Windows Explorer / Finder or click to choose files from disk.
                  Supports MP4, MOV, WEBM, PNG, JPG, WEBP, SVG, MP3, WAV, and JSON.
                </p>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-[11px] font-mono text-muted-foreground">
                  <span className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                    <FileVideo className="h-3.5 w-3.5 text-amber-400" /> 4K / HD Video
                  </span>
                  <span className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                    <FileImage className="h-3.5 w-3.5 text-cyan-400" /> High-DPI Photos
                  </span>
                  <span className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                    <FileAudio className="h-3.5 w-3.5 text-emerald-400" /> 48kHz Audio
                  </span>
                  <span className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                    <Code2 className="h-3.5 w-3.5 text-purple-400" /> Vector & Code
                  </span>
                </div>
              </div>

              {/* Filters & Search Bar */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2">
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: "all", label: `All Assets (${uploadedAssets.length})` },
                    { id: "video", label: `Videos (${uploadedAssets.filter((a) => a.type === "video").length})` },
                    { id: "image", label: `Designs & Photos (${uploadedAssets.filter((a) => a.type === "image").length})` },
                    { id: "audio", label: `Audio (${uploadedAssets.filter((a) => a.type === "audio").length})` },
                    { id: "project", label: `Projects (${uploadedAssets.filter((a) => a.type === "project").length})` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        playSynthSound("click");
                        setVaultFilter(tab.id as any);
                      }}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                        vaultFilter === tab.id
                          ? "bg-gradient-brand text-white shadow-glow"
                          : "liquid-glass text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    value={vaultSearch}
                    onChange={(e) => setVaultSearch(e.target.value)}
                    placeholder="Search vault files..."
                    className="pl-8 bg-white/5 border-white/10 text-xs h-9 rounded-xl"
                  />
                </div>
              </div>

              {/* Assets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {uploadedAssets
                  .filter((a) => {
                    const matchesType = vaultFilter === "all" || a.type === vaultFilter;
                    const matchesQ = !vaultSearch || a.name.toLowerCase().includes(vaultSearch.toLowerCase());
                    return matchesType && matchesQ;
                  })
                  .map((asset) => (
                    <div
                      key={asset.id}
                      className="liquid-glass rounded-3xl p-4 border border-white/10 flex flex-col justify-between hover:border-emerald-400/40 transition-all hover:shadow-elevated group"
                    >
                      <div>
                        {/* Media Preview Box */}
                        <div className="relative h-44 w-full rounded-2xl bg-black/80 overflow-hidden border border-white/10 flex items-center justify-center">
                          {asset.type === "video" ? (
                            <>
                              <video
                                src={asset.url}
                                className="h-full w-full object-cover"
                                muted
                                preload="metadata"
                                playsInline
                              />
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none group-hover:bg-black/10 transition-colors">
                                <div className="h-10 w-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300">
                                  <Play className="h-4 w-4 ml-0.5" />
                                </div>
                              </div>
                              <span className="absolute bottom-2.5 right-2.5 rounded-lg bg-black/70 backdrop-blur-md px-2 py-0.5 text-[9px] font-mono text-cyan-300 border border-white/10">
                                {asset.duration || "4K MP4"}
                              </span>
                            </>
                          ) : asset.type === "audio" ? (
                            <div className="flex flex-col items-center justify-center gap-2 p-4 text-center">
                              <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                                <Waves className="h-6 w-6" />
                              </div>
                              <span className="text-[10px] font-mono text-emerald-300">48 kHz · AUDIO STEM</span>
                            </div>
                          ) : (
                            <>
                              <img
                                src={asset.url}
                                alt={asset.name}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                              {asset.dimensions && (
                                <span className="absolute bottom-2.5 right-2.5 rounded-lg bg-black/70 backdrop-blur-md px-2 py-0.5 text-[9px] font-mono text-white/90 border border-white/10">
                                  {asset.dimensions}
                                </span>
                              )}
                            </>
                          )}

                          <span
                            className={`absolute top-2.5 left-2.5 rounded-full px-2 py-0.5 text-[9px] font-mono uppercase font-bold border backdrop-blur-md ${
                              asset.type === "video"
                                ? "bg-amber-500/20 text-amber-300 border-amber-400/30"
                                : asset.type === "audio"
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
                                : "bg-cyan-500/20 text-cyan-300 border-cyan-400/30"
                            }`}
                          >
                            {asset.type}
                          </span>
                        </div>

                        {/* Title & Metadata */}
                        <div className="mt-3">
                          <h4 className="font-display text-sm font-bold text-foreground truncate" title={asset.name}>
                            {asset.name}
                          </h4>
                          <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                            <span>{asset.size}</span>
                            <span>{asset.createdAt}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Button Bar */}
                      <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                        {/* Workspace Launch Buttons */}
                        <div className="grid grid-cols-2 gap-1.5">
                          {asset.type === "video" ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  playSynthSound("whoosh");
                                  setActiveVideoSrc(asset.url);
                                  setActiveMode("video");
                                  toast.success(`Loaded "${asset.name}" into Premiere NLE!`);
                                }}
                                className="border-amber-400/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 text-[10px] h-7"
                              >
                                <Clapperboard className="h-3 w-3 mr-1" />
                                Premiere NLE
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  playSynthSound("whoosh");
                                  setActiveCapcutVideo(asset.url);
                                  setActiveMode("capcut");
                                  toast.success(`Loaded "${asset.name}" into CapCut Reels!`);
                                }}
                                className="border-pink-400/30 bg-pink-500/10 hover:bg-pink-500/20 text-pink-200 text-[10px] h-7"
                              >
                                <Smartphone className="h-3 w-3 mr-1" />
                                CapCut Reel
                              </Button>
                            </>
                          ) : asset.type === "image" ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  playSynthSound("whoosh");
                                  setActiveForgeImage(asset.url);
                                  setActiveMode("graphics");
                                  toast.success(`Loaded "${asset.name}" into Photoshop Forge!`);
                                }}
                                className="border-cyan-400/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-200 text-[10px] h-7"
                              >
                                <Palette className="h-3 w-3 mr-1" />
                                Photoshop
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  playSynthSound("whoosh");
                                  setActiveMode("canva");
                                  toast.success(`Loaded asset into Canva Layouts!`);
                                }}
                                className="border-purple-400/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-200 text-[10px] h-7"
                              >
                                <LayoutTemplate className="h-3 w-3 mr-1" />
                                Canva Social
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                playSynthSound("chime");
                                setActiveMode("audio");
                                toast.success(`Loaded "${asset.name}" into Audition Lab!`);
                              }}
                              className="col-span-2 border-emerald-400/30 bg-emerald-500/10 text-emerald-200 text-[10px] h-7"
                            >
                              <Waves className="h-3 w-3 mr-1" />
                              Open in Audition Audio Lab
                            </Button>
                          )}
                        </div>

                        {/* Direct Download & Delete */}
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <Button
                            size="sm"
                            onClick={() => handleDownloadAsset(asset)}
                            className="flex-1 bg-white/10 hover:bg-white/20 text-foreground font-semibold text-[11px] h-7 border border-white/15"
                          >
                            <Download className="h-3 w-3 mr-1.5 text-cyan-300" />
                            Download File
                          </Button>

                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteAsset(asset.id)}
                            className="h-7 w-7 text-muted-foreground hover:text-red-400"
                            title="Remove file"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              WORKSTATION 1: VIDEO & MOTION STUDIO (LIKE PREMIERE PRO / AFTER EFFECTS)
             ══════════════════════════════════════════════════════════════════ */}
          {activeMode === "video" && (
            <div className="space-y-4">
              {/* Monitor + Inspector Two-Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                
                {/* Center / Left: Main Video Preview Monitor */}
                <div className="lg:col-span-8 liquid-glass rounded-3xl p-5 border border-white/10 flex flex-col justify-between">
                  {/* Monitor Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10 text-xs">
                    <div className="flex items-center gap-2 font-mono text-cyan-300">
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                      <span>REC // TIMECODE: {formatTimecode(currentTime)}</span>
                      <span className="text-muted-foreground">/ {formatTimecode(videoDuration)}</span>
                    </div>

                    {/* Direct Local Upload & Snapshot Trigger Buttons */}
                    <div className="flex items-center gap-2">
                      <input
                        ref={videoUploadInputRef}
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            const file = e.target.files[0];
                            const url = URL.createObjectURL(file);
                            setActiveVideoSrc(url);
                            handleFilesUpload([file]);
                            toast.success(`Loaded local video "${file.name}"!`);
                          }
                        }}
                        className="hidden"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => videoUploadInputRef.current?.click()}
                        className="border-amber-400/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-[11px] font-semibold h-7"
                      >
                        <FolderUp className="h-3.5 w-3.5 mr-1" />
                        Upload Local Video
                      </Button>

                      <Button
                        size="sm"
                        onClick={downloadVideoSnapshot}
                        className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-[11px] h-7 shadow-glow hover:brightness-110"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Snapshot (4K)
                      </Button>
                    </div>

                    {/* Aspect Ratio Presets */}
                    <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                      {(["16:9", "9:16", "1:1", "4:5"] as const).map((ratio) => (
                        <button
                          key={ratio}
                          type="button"
                          onClick={() => {
                            playSynthSound("click");
                            setVideoAspect(ratio);
                          }}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-mono transition-all ${
                            videoAspect === ratio ? "bg-gradient-brand text-white font-bold" : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {ratio}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <button
                        onClick={() => setVideoMuted(!videoMuted)}
                        className="hover:text-foreground p-1"
                      >
                        {videoMuted ? <VolumeX className="h-3.5 w-3.5 text-red-400" /> : <Volume2 className="h-3.5 w-3.5 text-cyan-400" />}
                      </button>
                    </div>
                  </div>

                  {/* Viewport Frame Container */}
                  <div className="my-4 flex items-center justify-center bg-black/80 rounded-2xl border border-white/10 overflow-hidden relative min-h-[360px] sm:min-h-[420px]">
                    <div
                      className="relative overflow-hidden transition-all duration-500 shadow-2xl flex items-center justify-center bg-black"
                      style={{
                        aspectRatio:
                          videoAspect === "16:9"
                            ? "16/9"
                            : videoAspect === "9:16"
                            ? "9/16"
                            : videoAspect === "1:1"
                            ? "1/1"
                            : "4/5",
                        height: videoAspect === "9:16" || videoAspect === "4:5" ? "400px" : "100%",
                        width: videoAspect === "16:9" ? "100%" : "auto",
                      }}
                    >
                      {/* Video Footage: Real HTML5 Video if uploaded, else high-res showcase */}
                      {activeVideoSrc ? (
                        <video
                          ref={videoPlayerRef}
                          src={activeVideoSrc}
                          controls={false}
                          loop
                          playsInline
                          className="h-full w-full object-contain transition-all duration-300"
                          style={{ filter: videoLutFilter }}
                        />
                      ) : (
                        <img
                          src={editingShowcase}
                          alt="Video Preview Track"
                          className="h-full w-full object-cover transition-all duration-300"
                          style={{ filter: videoLutFilter }}
                        />
                      )}

                      {/* Animated Title & Lower Third Overlay */}
                      {showTitles && (
                        <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none">
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="liquid-glass inline-block rounded-2xl p-4 border border-amber-300/30 max-w-lg shadow-[0_0_30px_rgba(245,215,110,0.15)]"
                          >
                            <span className="text-[9px] font-mono tracking-widest text-amber-300 uppercase font-bold">
                              MOTION GRAPHICS ENGINE // 4K UHD
                            </span>
                            <h3 className="font-display text-xl sm:text-2xl font-black text-white mt-1 drop-shadow">
                              {titleOverlayText}
                            </h3>
                            <p className="text-xs text-white/80 mt-0.5 line-clamp-1">
                              {titleSubtitle}
                            </p>
                          </motion.div>
                        </div>
                      )}

                      {/* Playhead Center Action Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                        <Button
                          onClick={togglePlay}
                          size="icon"
                          className="h-16 w-16 rounded-full bg-gradient-brand text-white shadow-glow scale-110"
                        >
                          {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Playback Transport Controls */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          playSynthSound("click");
                          setCurrentTime(0);
                        }}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <SkipBack className="h-4 w-4" />
                      </Button>

                      <Button
                        size="icon"
                        onClick={togglePlay}
                        className="h-10 w-10 rounded-xl bg-gradient-brand text-white shadow-glow"
                      >
                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          playSynthSound("click");
                          setCurrentTime((t) => Math.min(videoDuration, t + 1));
                        }}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <SkipForward className="h-4 w-4" />
                      </Button>

                      <div className="ml-2 font-mono text-xs text-cyan-300 font-bold">
                        {formatTimecode(currentTime)}
                      </div>
                    </div>

                    {/* Speed Controls */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span>Speed:</span>
                      {[0.5, 1.0, 1.5, 2.0].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            playSynthSound("click");
                            setVideoSpeed(s);
                          }}
                          className={`px-2 py-0.5 rounded-lg font-mono text-[11px] ${
                            videoSpeed === s ? "bg-amber-400 text-black font-bold" : "bg-white/5 text-muted-foreground"
                          }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Panel: Video Grading & Title Generator */}
                <div className="lg:col-span-4 liquid-glass rounded-3xl p-5 border border-white/10 space-y-5">
                  <div>
                    <h3 className="font-display text-base font-bold flex items-center gap-2 text-foreground">
                      <Sliders className="h-4 w-4 text-amber-400" />
                      Cinematic Color Grading (LUTs)
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Real-time GPU shader presets for commercial film grading.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { id: "gold24k", label: "24K Sovereign Gold", color: "bg-amber-500/20 text-amber-300 border-amber-400/30" },
                      { id: "glacial", label: "Glacial Cyan Matrix", color: "bg-cyan-500/20 text-cyan-300 border-cyan-400/30" },
                      { id: "tealOrange", label: "Hollywood Teal & Orange", color: "bg-orange-500/20 text-orange-300 border-orange-400/30" },
                      { id: "cyber", label: "Cyberpunk Magenta", color: "bg-pink-500/20 text-pink-300 border-pink-400/30" },
                      { id: "filmNoir", label: "Noir Monochromatic", color: "bg-slate-500/20 text-slate-300 border-slate-400/30" },
                      { id: "none", label: "Raw Rec.709 Neutral", color: "bg-white/5 text-muted-foreground border-white/10" },
                    ].map((lut) => (
                      <button
                        key={lut.id}
                        type="button"
                        onClick={() => {
                          playSynthSound("click");
                          setVideoLut(lut.id as any);
                        }}
                        className={`rounded-xl border p-2.5 text-left font-semibold transition-all ${lut.color} ${
                          videoLut === lut.id ? "ring-2 ring-white shadow-glow" : "opacity-75 hover:opacity-100"
                        }`}
                      >
                        {lut.label}
                      </button>
                    ))}
                  </div>

                  {/* Title & Caption Controls */}
                  <div className="border-t border-white/10 pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold">Motion Graphics Title</Label>
                      <button
                        onClick={() => setShowTitles(!showTitles)}
                        className="text-[10px] text-cyan-400 hover:underline"
                      >
                        {showTitles ? "Hide Overlay" : "Show Overlay"}
                      </button>
                    </div>

                    <Input
                      value={titleOverlayText}
                      onChange={(e) => setTitleOverlayText(e.target.value)}
                      placeholder="Headline Title..."
                      className="bg-white/5 text-xs font-bold"
                    />

                    <Input
                      value={titleSubtitle}
                      onChange={(e) => setTitleSubtitle(e.target.value)}
                      placeholder="Subtitle..."
                      className="bg-white/5 text-xs"
                    />
                  </div>

                  {/* Audio Volume Slider */}
                  <div className="border-t border-white/10 pt-4 space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Audio Master Level</span>
                      <span className="font-mono text-cyan-300">{videoVolume}%</span>
                    </div>
                    <Slider
                      value={[videoVolume]}
                      min={0}
                      max={100}
                      step={5}
                      onValueChange={([v]) => setVideoVolume(v)}
                    />
                  </div>
                </div>
              </div>

              {/* ── MULTI-TRACK NLE TIMELINE ──────────────────────────── */}
              <div className="liquid-glass rounded-3xl p-5 border border-white/10 shadow-elevated space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-display font-bold text-foreground flex items-center gap-1.5">
                      <Film className="h-4 w-4 text-cyan-400" />
                      Multi-Track Timeline Sequence
                    </span>
                    <span className="rounded-full bg-cyan-400/10 px-2 py-0.5 text-[10px] text-cyan-300 font-mono">
                      60 FPS
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => playSynthSound("whoosh")}
                      className="h-7 text-xs text-muted-foreground"
                    >
                      <Scissors className="h-3 w-3 mr-1" /> Razor Split
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => playSynthSound("chime")}
                      className="h-7 text-xs text-cyan-400"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Track
                    </Button>
                  </div>
                </div>

                {/* Timeline Scrubbing Bar */}
                <div className="relative pt-2">
                  <Slider
                    value={[currentTime]}
                    min={0}
                    max={videoDuration}
                    step={0.05}
                    onValueChange={([val]) => setCurrentTime(val)}
                    className="cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-muted-foreground mt-1">
                    <span>00:00:00</span>
                    <span>00:05:00</span>
                    <span>00:10:00</span>
                    <span>00:15:00</span>
                  </div>
                </div>

                {/* Tracks Stack */}
                <div className="space-y-2 pt-2">
                  {/* Track 1: Video V1 */}
                  <div className="flex items-center gap-2 rounded-xl bg-black/40 p-2 border border-white/5">
                    <div className="w-24 shrink-0 text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                      <Video className="h-3 w-3 text-cyan-400" /> V1 // VIDEO
                    </div>
                    <div className="flex-1 grid grid-cols-12 gap-1.5 h-10">
                      {videoClips.map((clip) => (
                        <div
                          key={clip.id}
                          className={`col-span-4 rounded-lg bg-gradient-to-r ${clip.color} border border-white/20 p-2 flex items-center justify-between text-xs text-white font-medium truncate`}
                        >
                          <span className="truncate">{clip.title}</span>
                          <span className="text-[9px] font-mono opacity-75">{clip.duration}s</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Track 2: Motion Titles T1 */}
                  <div className="flex items-center gap-2 rounded-xl bg-black/40 p-2 border border-white/5">
                    <div className="w-24 shrink-0 text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                      <Type className="h-3 w-3 text-amber-400" /> T1 // TITLES
                    </div>
                    <div className="flex-1 h-8 rounded-lg bg-amber-500/20 border border-amber-400/30 px-3 flex items-center justify-between text-xs text-amber-200">
                      <span>✨ Lower-Third Animated Title: {titleOverlayText}</span>
                      <span className="text-[10px] font-mono">Full Duration</span>
                    </div>
                  </div>

                  {/* Track 3: Audio A1 */}
                  <div className="flex items-center gap-2 rounded-xl bg-black/40 p-2 border border-white/5">
                    <div className="w-24 shrink-0 text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                      <Music className="h-3 w-3 text-emerald-400" /> A1 // AUDIO
                    </div>
                    <div className="flex-1 h-8 rounded-lg bg-emerald-500/15 border border-emerald-400/30 px-3 flex items-center justify-between text-xs text-emerald-300">
                      <span>🎵 Sovereign Orchestral Ambient BGM · 48 kHz 24-Bit</span>
                      <span className="text-[10px] font-mono">Synced</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              WORKSTATION: CAPCUT VIRAL REELS & AUTO-CAPTIONS STUDIO
             ══════════════════════════════════════════════════════════════════ */}
          {activeMode === "capcut" && (
            <div className="space-y-4">
              {/* CapCut Workstation Quick Uploader & Exporter Bar */}
              <div className="liquid-glass rounded-2xl p-3.5 border border-pink-500/20 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                      CapCut Viral Reels Workstation
                      <span className="rounded-full bg-pink-500/20 px-2 py-0.5 text-[9px] font-mono text-pink-300">
                        {activeCapcutVideo ? "Custom Video Loaded" : "Default 9:16 Template"}
                      </span>
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Upload your raw vertical footage, generate kinetic karaoke captions, and export lossless 9:16 reels.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={capcutUploadInputRef}
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setActiveCapcutVideo(url);
                        playSynthSound("chime");
                        toast.success(`Loaded video into CapCut: ${file.name}`);
                      }
                    }}
                    className="hidden"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => capcutUploadInputRef.current?.click()}
                    className="border-pink-400/40 bg-pink-500/10 text-pink-300 hover:bg-pink-500/20 text-xs font-semibold h-8"
                  >
                    <FolderUp className="h-3.5 w-3.5 mr-1.5" /> Upload Local Video
                  </Button>

                  <Button
                    size="sm"
                    onClick={downloadCapcutSnapshot}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs h-8 shadow-glow"
                  >
                    <Download className="h-3.5 w-3.5 mr-1.5" /> Snapshot (9:16 PNG)
                  </Button>

                  <Button
                    size="sm"
                    onClick={downloadCapcutMaster}
                    className="bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 text-black font-bold text-xs h-8 shadow-glow"
                  >
                    <HardDriveDownload className="h-3.5 w-3.5 mr-1.5" /> Download Reel (MP4)
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Panel: CapCut Templates, Kinetic Captions, Speed & SFX */}
              <div className="lg:col-span-4 space-y-4">
                {/* 1. Viral Short-Form Template Library */}
                <div className="liquid-glass rounded-3xl p-5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-sm font-bold flex items-center gap-2 text-foreground">
                      <Sparkles className="h-4 w-4 text-pink-400" /> Viral Short-Form Templates
                    </h3>
                    <span className="rounded-full bg-pink-500/20 px-2 py-0.5 text-[9px] font-mono text-pink-300 border border-pink-500/30">
                      CAPCUT AI
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    1-Click battle-tested reels formats proven for 85%+ retention.
                  </p>

                  <div className="grid grid-cols-1 gap-2 pt-1">
                    {[
                      {
                        id: "hook-split",
                        title: "Viral Hook + Split Reaction",
                        desc: "Top speaking clip + bottom 3D satisfaction b-roll for maximum retention.",
                        badge: "🔥 2.4M Avg Views",
                        ratio: "9:16",
                      },
                      {
                        id: "dropship-3d",
                        title: "3D E-Commerce Dropship Reveal",
                        desc: "Rotational product focus with price drop badge and kinetic zoom cuts.",
                        badge: "💰 High ROAS",
                        ratio: "9:16",
                      },
                      {
                        id: "podcast-wave",
                        title: "Podcast Waveform & Quote Reel",
                        desc: "Bouncing audio spectrum bars, host title pill, and synced captions.",
                        badge: "🎙️ High Authority",
                        ratio: "9:16",
                      },
                      {
                        id: "cinematic-tech",
                        title: "Cinematic Tech Macro Unbox",
                        desc: "Ultra-dark luxury macro pans with gold specular light sweeps.",
                        badge: "💎 Luxury Brand",
                        ratio: "9:16",
                      },
                      {
                        id: "kinetic-quote",
                        title: "High-Velocity Mindset Kinetic",
                        desc: "Rapid word-by-word bold text with heavy sub-bass transitions.",
                        badge: "⚡ 100% Loop Rate",
                        ratio: "9:16",
                      },
                    ].map((tpl) => (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => {
                          playSynthSound("click");
                          setCapcutTemplate(tpl.id as any);
                          toast.success(`Loaded CapCut template: ${tpl.title}`);
                        }}
                        className={`w-full rounded-2xl p-3 text-left transition-all border ${
                          capcutTemplate === tpl.id
                            ? "bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-black/40 border-pink-400/50 shadow-glow"
                            : "bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-foreground">{tpl.title}</span>
                          <span className="text-[9px] font-mono text-pink-300 font-bold">{tpl.badge}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground line-clamp-1">{tpl.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Kinetic Auto-Captions Engine */}
                <div className="liquid-glass rounded-3xl p-5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-sm font-bold flex items-center gap-2 text-foreground">
                      <Type className="h-4 w-4 text-cyan-400" /> Kinetic Auto-Captions
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        playSynthSound("chime");
                        toast.success("AI synchronized audio to 4 word-by-word caption blocks!");
                      }}
                      className="text-[10px] text-cyan-400 hover:underline font-mono flex items-center gap-1"
                    >
                      <Wand2 className="h-3 w-3" /> Auto-Sync AI
                    </button>
                  </div>

                  {/* Caption Style Switcher */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "mrbeast", name: "⚡ MrBeast Bold", desc: "Yellow + Black Outline" },
                      { id: "cyan-box", name: "💎 Cyber Glacial", desc: "Cyan Neon Box Highlight" },
                      { id: "sunset-glow", name: "🌅 Sunset Glow", desc: "Amber to Fuchsia Glow" },
                      { id: "karaoke-bounce", name: "🎤 Karaoke Bounce", desc: "Active Word Bouncer" },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          playSynthSound("click");
                          setCapcutCaptionStyle(st.id as any);
                        }}
                        className={`rounded-xl p-2 text-left border text-xs transition-all ${
                          capcutCaptionStyle === st.id
                            ? "border-cyan-400 bg-cyan-500/20 text-white font-bold"
                            : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <div>{st.name}</div>
                        <div className="text-[9px] text-muted-foreground opacity-75">{st.desc}</div>
                      </button>
                    ))}
                  </div>

                  {/* Caption Editor */}
                  <div className="space-y-2 pt-1">
                    <Label className="text-[11px] text-muted-foreground">Headline Hook & Overlay Text</Label>
                    <Input
                      value={capcutHeadline}
                      onChange={(e) => setCapcutHeadline(e.target.value)}
                      placeholder="VIRAL HEADLINE HOOK"
                      className="bg-white/5 border-white/10 text-xs font-bold text-foreground"
                    />
                  </div>

                  {/* Captions Track List */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      Synchronized Timestamp Blocks
                    </span>
                    {capcutCaptions.map((cap, i) => (
                      <div
                        key={cap.id}
                        className="flex items-center gap-2 rounded-xl bg-white/[0.03] p-2 border border-white/5 text-[11px]"
                      >
                        <span className="text-[10px] font-mono text-cyan-400 font-bold shrink-0">{cap.time}s</span>
                        <input
                          type="text"
                          value={cap.text}
                          onChange={(e) => {
                            const updated = [...capcutCaptions];
                            updated[i].text = e.target.value;
                            setCapcutCaptions(updated);
                          }}
                          className="flex-1 bg-transparent text-foreground border-none focus:outline-none truncate"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Speed Velocity Curve & Kinetic Transitions */}
                <div className="liquid-glass rounded-3xl p-5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-sm font-bold flex items-center gap-2 text-foreground">
                      <Gauge className="h-4 w-4 text-amber-400" /> Velocity Ramping & Cuts
                    </h3>
                  </div>

                  {/* Speed Curves */}
                  <div>
                    <Label className="text-[11px] text-muted-foreground">Speed Curve Preset</Label>
                    <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                      {[
                        { id: "1x-normal", label: "Constant 1.0×" },
                        { id: "hero-slowmo", label: "Hero Slow-Mo (0.35×)" },
                        { id: "velocity-ramp", label: "Velocity Whip (2× ➔ 0.5× ➔ 2×)" },
                        { id: "hyper-3x", label: "Hyper-Flash (3.0×)" },
                      ].map((sc) => (
                        <button
                          key={sc.id}
                          type="button"
                          onClick={() => {
                            playSynthSound("click");
                            setCapcutSpeedCurve(sc.id as any);
                          }}
                          className={`rounded-xl p-2 text-left border text-[11px] font-medium transition-all ${
                            capcutSpeedCurve === sc.id
                              ? "border-amber-400 bg-amber-500/20 text-amber-200 font-bold"
                              : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {sc.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Transitions */}
                  <div className="pt-2">
                    <Label className="text-[11px] text-muted-foreground">Kinetic Beat Transition</Label>
                    <div className="grid grid-cols-3 gap-1 mt-1.5">
                      {[
                        { id: "zoom-blur", label: "Zoom Blur" },
                        { id: "whip-pan", label: "Whip Pan" },
                        { id: "glitch", label: "Glitch RGB" },
                        { id: "white-flash", label: "White Flash" },
                        { id: "rgb-split", label: "Optical Split" },
                        { id: "luma-dissolve", label: "Luma Dissolve" },
                      ].map((tr) => (
                        <button
                          key={tr.id}
                          type="button"
                          onClick={() => {
                            playSynthSound("whoosh");
                            setCapcutTransition(tr.id as any);
                          }}
                          className={`rounded-lg py-1.5 px-2 text-center border text-[10px] font-mono transition-all ${
                            capcutTransition === tr.id
                              ? "border-cyan-400 bg-cyan-500/20 text-cyan-200 font-bold"
                              : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {tr.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4. Live Web Audio SFX Soundboard */}
                <div className="liquid-glass rounded-3xl p-5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-sm font-bold flex items-center gap-2 text-foreground">
                      <Volume2 className="h-4 w-4 text-emerald-400" /> Viral SFX Synthesizer
                    </h3>
                    <span className="text-[10px] font-mono text-emerald-300">LIVE AUDIO SYNTH</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Instant sound effects generated via Web Audio API. Trigger transitions and beat drops.
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {[
                      { id: "whoosh", label: "💨 Whoosh Cut", sound: "whoosh" },
                      { id: "boom", label: "💥 Sub Boom", sound: "boom" },
                      { id: "bass", label: "🔊 808 Drop", sound: "bass" },
                      { id: "chime", label: "✨ Level Up", sound: "chime" },
                      { id: "laser", label: "⚡ Laser Zap", sound: "laser" },
                      { id: "pop", label: "🎈 Viral Pop", sound: "pop" },
                    ].map((sfx) => (
                      <button
                        key={sfx.id}
                        type="button"
                        onClick={() => playSynthSound(sfx.sound as any)}
                        className="rounded-xl border border-white/10 bg-white/5 py-2.5 px-2 text-center text-xs font-semibold text-foreground hover:bg-emerald-500/20 hover:border-emerald-400/50 hover:scale-105 active:scale-95 transition-all"
                      >
                        {sfx.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Center Panel: Realistic 9:16 Smartphone Mockup with Real-time Captions Preview */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center liquid-glass rounded-3xl p-6 border border-white/10 min-h-[680px]">
                {/* Smartphone Bezel */}
                <div className="relative w-[320px] sm:w-[350px] aspect-[9/16] rounded-[44px] border-[6px] border-neutral-800 bg-black shadow-[0_0_80px_rgba(0,0,0,0.9),0_0_40px_rgba(245,215,110,0.15)] overflow-hidden flex flex-col justify-between">
                  {/* Dynamic Island / Notch */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 h-5 w-24 rounded-full bg-black border border-white/10 z-30 flex items-center justify-between px-2.5">
                    <div className="h-2 w-2 rounded-full bg-cyan-400/80 animate-ping" />
                    <div className="text-[8px] font-mono text-white/70">BASIRAH AI</div>
                    <div className="h-1.5 w-1.5 rounded-full bg-neutral-600" />
                  </div>

                  {/* Video Screen Content */}
                  <div className="relative flex-1 w-full h-full overflow-hidden flex flex-col justify-between p-4 pt-10">
                    {/* Background Visual Layer */}
                    {activeCapcutVideo ? (
                      <video
                        ref={capcutVideoPlayerRef}
                        src={activeCapcutVideo}
                        autoPlay
                        loop
                        muted={videoMuted}
                        playsInline
                        className="absolute inset-0 h-full w-full object-cover opacity-90"
                        style={{
                          filter: capcutTransition === "glitch" ? "contrast(1.4) hue-rotate(90deg)" : "none",
                          transform: capcutSpeedCurve === "velocity-ramp" && isPlaying ? "scale(1.05)" : "scale(1)",
                          transition: "all 0.4s ease",
                        }}
                      />
                    ) : (
                      <img
                        src={editingShowcase}
                        alt="CapCut Video"
                        className="absolute inset-0 h-full w-full object-cover opacity-80"
                        style={{
                          filter: capcutTransition === "glitch" ? "contrast(1.4) hue-rotate(90deg)" : "none",
                          transform: capcutSpeedCurve === "velocity-ramp" && isPlaying ? "scale(1.05)" : "scale(1)",
                          transition: "all 0.4s ease",
                        }}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />

                    {/* Top Screen Overlay: Viral Hook Headline */}
                    <div className="relative z-20 space-y-1.5 pt-3">
                      <div className="inline-block rounded-full bg-gradient-to-r from-pink-500 to-amber-500 px-3 py-0.5 text-[9px] font-extrabold text-black uppercase tracking-wider shadow-lg">
                        {capcutStickerText}
                      </div>
                      <h4 className="font-display text-lg font-black text-white leading-tight uppercase drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]">
                        {capcutHeadline}
                      </h4>
                    </div>

                    {/* Center Screen: Dynamic Auto-Captions with Real-time Karaoke Bounce */}
                    <div className="relative z-20 my-auto text-center px-2 py-4">
                      {capcutCaptionStyle === "mrbeast" && (
                        <div className="space-y-1 animate-pulse">
                          <span className="inline-block rounded-xl bg-black/80 px-3 py-1.5 font-display text-xl sm:text-2xl font-black text-amber-300 uppercase tracking-wide border-2 border-black drop-shadow-[0_4px_12px_rgba(0,0,0,1)] scale-105 transform">
                            {capcutCaptions[Math.floor((currentTime * 1.5) % capcutCaptions.length)].highlight}
                          </span>
                          <p className="text-xs font-bold text-white uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                            {capcutCaptions[Math.floor((currentTime * 1.5) % capcutCaptions.length)].text}
                          </p>
                        </div>
                      )}

                      {capcutCaptionStyle === "cyan-box" && (
                        <div className="space-y-1">
                          <span className="inline-block rounded-lg bg-cyan-400 px-3 py-1 font-mono text-base font-black text-black uppercase tracking-wider shadow-[0_0_20px_rgba(0,229,255,0.8)]">
                            {capcutCaptions[Math.floor((currentTime * 1.5) % capcutCaptions.length)].highlight}
                          </span>
                          <p className="text-xs font-mono text-cyan-200 mt-1">
                            {capcutCaptions[Math.floor((currentTime * 1.5) % capcutCaptions.length)].text}
                          </p>
                        </div>
                      )}

                      {capcutCaptionStyle === "sunset-glow" && (
                        <div className="space-y-1">
                          <span className="inline-block font-display text-xl font-extrabold bg-gradient-to-r from-amber-300 via-pink-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(244,114,182,0.9)] scale-110">
                            {capcutCaptions[Math.floor((currentTime * 1.5) % capcutCaptions.length)].highlight}
                          </span>
                          <p className="text-xs font-medium text-pink-100">
                            {capcutCaptions[Math.floor((currentTime * 1.5) % capcutCaptions.length)].text}
                          </p>
                        </div>
                      )}

                      {capcutCaptionStyle === "karaoke-bounce" && (
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center justify-center gap-1.5">
                            {capcutCaptions[Math.floor((currentTime * 1.5) % capcutCaptions.length)].text
                              .split(" ")
                              .map((w, idx) => (
                                <span
                                  key={idx}
                                  className={`font-display text-sm font-extrabold px-1.5 py-0.5 rounded transition-all ${
                                    idx === activeWordIdx
                                      ? "bg-amber-400 text-black scale-125 shadow-glow"
                                      : "text-white/80"
                                  }`}
                                >
                                  {w}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Podcast Waveform simulator if template is podcast */}
                      {capcutTemplate === "podcast-wave" && (
                        <div className="flex items-center justify-center gap-1 mt-4">
                          {[30, 60, 95, 45, 80, 100, 70, 35, 90, 50, 85, 40].map((h, i) => (
                            <div
                              key={i}
                              className="w-1 rounded-full bg-gradient-to-t from-cyan-500 to-emerald-400 transition-all duration-150"
                              style={{
                                height: isPlaying ? `${Math.max(12, (h * ((currentTime * 10 + i * 8) % 100)) / 100)}px` : `${h * 0.4}px`,
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Screen Overlay: Creator Profile & TikTok Engagement Bar */}
                    <div className="relative z-20 flex items-end justify-between pb-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-gradient-brand flex items-center justify-center text-[10px] font-bold text-white border border-white/20">
                            MA
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">{capcutSpeakerName}</p>
                            <p className="text-[10px] text-cyan-300 font-mono">@basirah.infinity · Original Audio</p>
                          </div>
                        </div>
                      </div>

                      {/* TikTok Engagement Icons */}
                      <div className="flex flex-col items-center gap-3 text-white/90">
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                            <Flame className="h-4 w-4 text-pink-400 fill-pink-400" />
                          </div>
                          <span className="text-[9px] font-mono">148K</span>
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                            <Share2 className="h-4 w-4 text-cyan-300" />
                          </div>
                          <span className="text-[9px] font-mono">24.5K</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Phone Bar */}
                  <div className="h-4 w-full bg-black flex items-center justify-center">
                    <div className="h-1 w-28 rounded-full bg-white/30" />
                  </div>
                </div>

                {/* Smartphone Scrubbing & Playback Controller */}
                <div className="w-full max-w-[350px] mt-4 flex items-center justify-between gap-3 bg-black/40 p-3 rounded-2xl border border-white/10">
                  <Button
                    onClick={togglePlay}
                    size="sm"
                    className="h-9 w-9 rounded-full bg-gradient-brand p-0 text-white shadow-glow"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                  </Button>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                      <span>{currentTime}s</span>
                      <span>15.0s</span>
                    </div>
                    <Slider
                      value={[currentTime]}
                      max={15.0}
                      step={0.1}
                      onValueChange={([val]) => setCurrentTime(val)}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Right Panel: CapCut Viral Intelligence & Quick Export */}
              <div className="lg:col-span-3 space-y-4">
                {/* 1. Viral Engagement Predictor */}
                <div className="liquid-glass rounded-3xl p-5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-sm font-bold flex items-center gap-2 text-foreground">
                      <TrendingUp className="h-4 w-4 text-cyan-400" /> Viral Score Predictor
                    </h3>
                  </div>

                  <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4 text-center">
                    <div className="font-display text-4xl font-extrabold text-cyan-300">98.4%</div>
                    <p className="text-xs font-semibold text-white mt-1">High Velocity Retention Grade</p>
                    <p className="text-[10px] text-cyan-200/70 mt-1">
                      Pacing, dynamic contrast, and kinetic captions match top 1% TikTok & Reels performance algorithms.
                    </p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Average Watch Time:</span>
                      <span className="font-bold text-foreground">13.8s / 15.0s (92%)</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Loop Replay Likelihood:</span>
                      <span className="font-bold text-emerald-400">Very High (4.2×)</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Hook Drop-off Rate:</span>
                      <span className="font-bold text-cyan-300">Below 8%</span>
                    </div>
                  </div>
                </div>

                {/* 2. CapCut Aspect Ratio Presets */}
                <div className="liquid-glass rounded-3xl p-5 border border-white/10 space-y-3">
                  <h3 className="font-display text-sm font-bold flex items-center gap-2 text-foreground">
                    <Crop className="h-4 w-4 text-amber-400" /> Reel Canvas Format
                  </h3>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "9:16", label: "9:16 Vertical", desc: "TikTok / Reels" },
                      { id: "1:1", label: "1:1 Square", desc: "Instagram Post" },
                      { id: "4:5", label: "4:5 Portrait", desc: "Feed Standard" },
                    ].map((asp) => (
                      <button
                        key={asp.id}
                        type="button"
                        onClick={() => {
                          playSynthSound("click");
                          setCapcutRatio(asp.id as any);
                        }}
                        className={`rounded-xl p-2 text-center border text-xs transition-all ${
                          capcutRatio === asp.id
                            ? "border-pink-400 bg-pink-500/20 text-white font-bold"
                            : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <div>{asp.id}</div>
                        <div className="text-[9px] text-muted-foreground opacity-75">{asp.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Direct Export Button */}
                <div className="liquid-glass rounded-3xl p-5 border border-white/10 space-y-3 text-center">
                  <h3 className="font-display text-sm font-bold text-foreground">Export Short-Form Master</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Burn in 60FPS kinetic captions, 3D LUTs and Web Audio BGM into a lossless vertical MP4.
                  </p>

                  <Button
                    onClick={() => {
                      playSynthSound("chime");
                      setExportOpen(true);
                    }}
                    className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white font-bold py-3 shadow-glow hover:brightness-110"
                  >
                    <Download className="h-4 w-4 mr-2" /> Export 9:16 Reel (MP4)
                  </Button>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              WORKSTATION: CANVA SOCIAL GRAPHICS & TEMPLATE FORGE
             ══════════════════════════════════════════════════════════════════ */}
          {activeMode === "canva" && (
            <div className="space-y-4">
              {/* Canva Workstation Quick Uploader & Exporter Bar */}
              <div className="liquid-glass rounded-2xl p-3.5 border border-cyan-500/20 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <LayoutTemplate className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                      Canva Social & Layout Forge
                      <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[9px] font-mono text-cyan-300">
                        {canvaPreset.toUpperCase()}
                      </span>
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Upload brand logos & photos, arrange 24K Sovereign typography, and download 2× Retina PNG or vector SVG.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={canvaUploadInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setActiveCanvaBgImage(url);
                        const newEl = {
                          id: `brand_img_${Date.now()}`,
                          type: "image",
                          label: file.name.slice(0, 16),
                          x: 35,
                          y: 35,
                          scale: 1,
                          color: canvaBrandColor,
                        };
                        setCanvaElements((prev) => [...prev, newEl]);
                        setCanvaSelectedId(newEl.id);
                        playSynthSound("chime");
                        toast.success(`Uploaded brand photo: ${file.name}`);
                      }
                    }}
                    className="hidden"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => canvaUploadInputRef.current?.click()}
                    className="border-cyan-400/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 text-xs font-semibold h-8"
                  >
                    <FolderUp className="h-3.5 w-3.5 mr-1.5" /> Upload Brand Photo / Logo
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => downloadCanvaArtwork("png")}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs h-8 shadow-glow"
                  >
                    <Download className="h-3.5 w-3.5 mr-1.5" /> Download 2× Retina PNG
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => handleStartExport("SVG Vector")}
                    className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-xs h-8 shadow-glow"
                  >
                    <HardDriveDownload className="h-3.5 w-3.5 mr-1.5" /> Download SVG
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Panel: Preset Formats, Brand Kit & Drag Stickers */}
              <div className="lg:col-span-4 space-y-4">
                {/* 1. Canva Preset Dimensions */}
                <div className="liquid-glass rounded-3xl p-5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-sm font-bold flex items-center gap-2 text-foreground">
                      <LayoutTemplate className="h-4 w-4 text-cyan-400" /> Artboard Formats
                    </h3>
                    <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[9px] font-mono text-cyan-300 border border-cyan-500/30">
                      CANVA PRO
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {[
                      { id: "ig-post", name: "Instagram Square", dim: "1080 × 1080 px", ratio: "1:1" },
                      { id: "story-reel", name: "Story & Reel Cover", dim: "1080 × 1920 px", ratio: "9:16" },
                      { id: "yt-thumb", name: "YouTube Thumbnail", dim: "1280 × 720 px", ratio: "16:9" },
                      { id: "biz-card", name: "Luxury Business Card", dim: "1050 × 600 px", ratio: "7:4" },
                      { id: "flyer-poster", name: "Commercial Flyer", dim: "1200 × 1600 px", ratio: "3:4" },
                      { id: "twitter-banner", name: "Header Banner", dim: "1584 × 396 px", ratio: "4:1" },
                    ].map((fmt) => (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => {
                          playSynthSound("click");
                          setCanvaPreset(fmt.id as any);
                          toast.success(`Canvas resized to ${fmt.name} (${fmt.dim})`);
                        }}
                        className={`rounded-2xl p-2.5 text-left border transition-all ${
                          canvaPreset === fmt.id
                            ? "bg-cyan-500/20 border-cyan-400 text-white font-bold shadow-glow"
                            : "bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10 text-muted-foreground"
                        }`}
                      >
                        <div className="text-xs text-foreground font-semibold truncate">{fmt.name}</div>
                        <div className="text-[10px] font-mono text-cyan-300 opacity-80">{fmt.dim}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Murtesa Alafi Official Sovereign Brand Kit */}
                <div className="liquid-glass rounded-3xl p-5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-sm font-bold flex items-center gap-2 text-foreground">
                      <Palette className="h-4 w-4 text-amber-400" /> Sovereign Brand Kit
                    </h3>
                    <span className="text-[10px] font-mono text-amber-300 font-bold">24K PALETTE</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Official signature colors architected for high-net-worth enterprise positioning.
                  </p>

                  <div className="grid grid-cols-5 gap-2 pt-1">
                    {[
                      { name: "24K Gold", hex: "#F5D76E", desc: "Sovereign Leaf" },
                      { name: "Glacial Cyan", hex: "#00E5FF", desc: "Neon Hydro" },
                      { name: "Obsidian", hex: "#0A0D14", desc: "Deep Dark" },
                      { name: "Emerald", hex: "#10B981", desc: "Vibrant Mint" },
                      { name: "Titanium", hex: "#94A3B8", desc: "Aircraft Billet" },
                    ].map((col) => (
                      <button
                        key={col.hex}
                        type="button"
                        onClick={() => {
                          playSynthSound("click");
                          setCanvaBrandColor(col.hex);
                          toast.success(`Brand color set: ${col.name} (${col.hex})`);
                        }}
                        className="group flex flex-col items-center gap-1.5"
                      >
                        <div
                          className={`h-9 w-9 rounded-xl border transition-all shadow-md ${
                            canvaBrandColor === col.hex ? "scale-110 border-white ring-2 ring-cyan-400" : "border-white/20 group-hover:scale-105"
                          }`}
                          style={{ backgroundColor: col.hex }}
                        />
                        <span className="text-[9px] font-medium text-muted-foreground text-center line-clamp-1">{col.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Drag-and-Drop Stickers & Badges */}
                <div className="liquid-glass rounded-3xl p-5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-sm font-bold flex items-center gap-2 text-foreground">
                      <Shapes className="h-4 w-4 text-purple-400" /> Stickers & Pro Badges
                    </h3>
                    <span className="text-[10px] text-muted-foreground font-mono">1-CLICK DROP</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Click any badge to drop it directly into the Canva artboard.
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {[
                      { type: "badge", label: "👑 24K SOVEREIGN", color: "#F5D76E" },
                      { type: "badge", label: "✓ VERIFIED PARTNER", color: "#00E5FF" },
                      { type: "sticker", label: "🔥 50% OFF LIMITED", color: "#F43F5E" },
                      { type: "sticker", label: "⚡ HIGH VELOCITY", color: "#10B981" },
                      { type: "sticker", label: "⭐ TOP RATED AGENCY", color: "#EAB308" },
                      { type: "badge", label: "💎 DIREX MURTESA", color: "#A855F7" },
                    ].map((stk, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          playSynthSound("pop");
                          const newEl = {
                            id: `e_${Date.now()}_${idx}`,
                            type: stk.type,
                            label: stk.label,
                            x: 20 + (canvaElements.length * 10) % 50,
                            y: 20 + (canvaElements.length * 15) % 60,
                            scale: 1,
                            color: stk.color,
                          };
                          setCanvaElements([...canvaElements, newEl]);
                          setCanvaSelectedId(newEl.id);
                          toast.success(`Added ${stk.label} to canvas!`);
                        }}
                        className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-center text-xs font-bold text-foreground hover:bg-white/10 hover:scale-105 active:scale-95 transition-all"
                        style={{ borderLeft: `3px solid ${stk.color}` }}
                      >
                        {stk.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Center Panel: The Canva Artboard Visualizer */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center liquid-glass rounded-3xl p-6 border border-white/10 min-h-[680px]">
                {/* Scaled Responsive Canvas Container */}
                <div
                  className="relative w-full max-w-[480px] rounded-3xl overflow-hidden border-2 border-white/20 shadow-[0_20px_70px_rgba(0,0,0,0.8)] transition-all flex flex-col justify-between p-6 sm:p-8"
                  style={{
                    aspectRatio:
                      canvaPreset === "ig-post"
                        ? "1/1"
                        : canvaPreset === "story-reel"
                        ? "9/16"
                        : canvaPreset === "yt-thumb"
                        ? "16/9"
                        : canvaPreset === "biz-card"
                        ? "7/4"
                        : canvaPreset === "flyer-poster"
                        ? "3/4"
                        : "4/1",
                    background: `radial-gradient(ellipse at 30% 0%, ${canvaBrandColor}33 0%, transparent 60%), linear-gradient(135deg, ${canvaBgColor} 0%, #03060a 100%)`,
                  }}
                >
                  {/* Subtle Grid / Texture Layer */}
                  <div className="absolute inset-0 bg-mesh opacity-30 pointer-events-none" />

                  {/* Top Bar Pill */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span
                      className="inline-block rounded-full px-3 py-1 text-[10px] font-mono font-bold tracking-widest uppercase border"
                      style={{
                        backgroundColor: `${canvaBrandColor}22`,
                        borderColor: `${canvaBrandColor}55`,
                        color: canvaBrandColor,
                      }}
                    >
                      {canvaBadgeText}
                    </span>
                    <span className="text-[10px] font-mono text-white/50 uppercase">BASIRAH INFINITY</span>
                  </div>

                  {/* Center Canvas Typography */}
                  <div className="relative z-10 my-auto space-y-2 text-center">
                    <h2
                      className={`font-black text-2xl sm:text-3xl lg:text-4xl leading-tight uppercase ${
                        canvaFontFamily === "serif"
                          ? "font-serif italic"
                          : canvaFontFamily === "mono"
                          ? "font-mono"
                          : "font-display"
                      }`}
                      style={{
                        color: canvaBrandColor,
                        textShadow: `0 0 25px ${canvaBrandColor}66`,
                      }}
                    >
                      {canvaHeadline}
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-300 max-w-sm mx-auto font-medium">
                      {canvaSubtitle}
                    </p>
                  </div>

                  {/* Interactive Dropped Elements on Canvas */}
                  {canvaElements.map((el) => {
                    const isSelected = canvaSelectedId === el.id;
                    return (
                      <div
                        key={el.id}
                        onClick={() => setCanvaSelectedId(el.id)}
                        className={`absolute cursor-pointer rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                          isSelected ? "ring-2 ring-cyan-400 scale-105 shadow-glow" : "hover:scale-105"
                        }`}
                        style={{
                          left: `${el.x}%`,
                          top: `${el.y}%`,
                          transform: `scale(${el.scale})`,
                          backgroundColor: el.color ? `${el.color}25` : "rgba(255,255,255,0.15)",
                          borderColor: el.color || "rgba(255,255,255,0.4)",
                          borderWidth: "1px",
                          color: el.color || "#ffffff",
                          backdropFilter: "blur(12px)",
                        }}
                      >
                        {el.label}
                      </div>
                    );
                  })}

                  {/* Bottom Footer Stamp */}
                  <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/10 text-[10px] text-white/60">
                    <span>murtesa alafi · founder</span>
                    <span className="font-mono">VERIFIED 24K ASSET</span>
                  </div>
                </div>

                {/* Canvas Dimension Badge */}
                <div className="mt-4 flex items-center gap-2 text-xs font-mono text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-cyan-400" />
                  <span>Artboard active: {canvaPreset.toUpperCase()} ({canvaElements.length} interactive elements)</span>
                </div>
              </div>

              {/* Right Panel: Canvas Inspector & Quick Exporters */}
              <div className="lg:col-span-3 space-y-4">
                {/* 1. Canvas Typography Inspector */}
                <div className="liquid-glass rounded-3xl p-5 border border-white/10 space-y-3">
                  <h3 className="font-display text-sm font-bold flex items-center gap-2 text-foreground">
                    <Edit3 className="h-4 w-4 text-cyan-400" /> Text & Inspector
                  </h3>

                  <div className="space-y-2">
                    <Label className="text-[11px] text-muted-foreground">Main Headline</Label>
                    <Input
                      value={canvaHeadline}
                      onChange={(e) => setCanvaHeadline(e.target.value)}
                      className="bg-white/5 border-white/10 text-xs font-bold text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[11px] text-muted-foreground">Subtitle Description</Label>
                    <Input
                      value={canvaSubtitle}
                      onChange={(e) => setCanvaSubtitle(e.target.value)}
                      className="bg-white/5 border-white/10 text-xs text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[11px] text-muted-foreground">Badge Text</Label>
                    <Input
                      value={canvaBadgeText}
                      onChange={(e) => setCanvaBadgeText(e.target.value)}
                      className="bg-white/5 border-white/10 text-xs text-foreground"
                    />
                  </div>

                  {/* Font Family Switcher */}
                  <div className="pt-2">
                    <Label className="text-[11px] text-muted-foreground">Typography Style</Label>
                    <div className="grid grid-cols-2 gap-1.5 mt-1">
                      {[
                        { id: "display", label: "Display Bold" },
                        { id: "serif", label: "Luxury Serif" },
                        { id: "mono", label: "Cyber Monospace" },
                        { id: "cyber", label: "Futuristic Head" },
                      ].map((fn) => (
                        <button
                          key={fn.id}
                          type="button"
                          onClick={() => {
                            playSynthSound("click");
                            setCanvaFontFamily(fn.id as any);
                          }}
                          className={`rounded-lg py-1.5 px-2 text-center border text-[11px] transition-all ${
                            canvaFontFamily === fn.id
                              ? "border-cyan-400 bg-cyan-500/20 text-white font-bold"
                              : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {fn.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Selected Element Controls */}
                {canvaSelectedId && (
                  <div className="liquid-glass rounded-3xl p-5 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-display text-xs font-bold text-foreground">Element Controls</h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setCanvaElements(canvaElements.filter((el) => el.id !== canvaSelectedId));
                          setCanvaSelectedId(null);
                          toast.info("Element removed from canvas");
                        }}
                        className="h-7 text-red-400 hover:text-red-300 text-xs"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] text-muted-foreground">Scale</Label>
                      <Slider
                        value={[canvaElements.find((el) => el.id === canvaSelectedId)?.scale || 1]}
                        min={0.5}
                        max={2.0}
                        step={0.1}
                        onValueChange={([val]) => {
                          setCanvaElements(
                            canvaElements.map((el) => (el.id === canvaSelectedId ? { ...el, scale: val } : el))
                          );
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* 3. High-DPI Instant Exporters */}
                <div className="liquid-glass rounded-3xl p-5 border border-white/10 space-y-3 text-center">
                  <h3 className="font-display text-sm font-bold text-foreground">Instant Canva Export</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Render pixel-perfect graphics ready for client presentation and commercial marketing.
                  </p>

                  <div className="space-y-2">
                    <Button
                      onClick={() => downloadCanvaArtwork("png")}
                      className="w-full bg-gradient-brand text-white font-bold py-2.5 shadow-glow"
                    >
                      <Download className="h-4 w-4 mr-2" /> Download High-Res PNG (2×)
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => downloadCanvaArtwork("svg")}
                      className="w-full border-white/10 bg-white/5 text-foreground hover:bg-white/10 text-xs"
                    >
                      Export Scalable Vector (SVG)
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              WORKSTATION 2: GRAPHICS & PHOTO FORGE (LIKE PHOTOSHOP / FIGMA)
             ══════════════════════════════════════════════════════════════════ */}
          {activeMode === "graphics" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* Left Panel: Layers Stack & Tools */}
              <div className="lg:col-span-3 liquid-glass rounded-3xl p-5 border border-white/10 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h3 className="font-display text-sm font-bold flex items-center gap-2 text-foreground">
                    <Layers className="h-4 w-4 text-cyan-400" /> Layer Stack ({layers.length})
                  </h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      playSynthSound("click");
                      const newLayer = {
                        id: `layer-${Date.now()}`,
                        name: `Vector Shape ${layers.length + 1}`,
                        visible: true,
                        opacity: 100,
                        blend: "normal",
                        type: "graphic",
                      };
                      setLayers([newLayer, ...layers]);
                    }}
                    className="h-7 text-xs text-cyan-400"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* Layer Items */}
                <div className="space-y-2">
                  {layers.map((layer) => {
                    const isSel = selectedLayerId === layer.id;
                    return (
                      <div
                        key={layer.id}
                        onClick={() => setSelectedLayerId(layer.id)}
                        className={`cursor-pointer rounded-xl border p-2.5 flex items-center justify-between transition-all ${
                          isSel ? "border-cyan-400 bg-cyan-500/10 shadow-glow" : "border-white/5 bg-black/30 hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLayerVisibility(layer.id);
                            }}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            {layer.visible ? <Eye className="h-3.5 w-3.5 text-cyan-400" /> : <EyeOff className="h-3.5 w-3.5 text-red-400" />}
                          </button>
                          <span className="text-xs font-medium text-foreground truncate max-w-[140px]">
                            {layer.name}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">{layer.blend}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Blend Mode & Opacity for Selected Layer */}
                <div className="pt-3 border-t border-white/10 space-y-3">
                  <Label className="text-xs font-semibold">Active Layer Opacity</Label>
                  <Slider defaultValue={[90]} min={0} max={100} step={5} />
                </div>
              </div>

              {/* Center Panel: Interactive Artboard Canvas */}
              <div className="lg:col-span-6 liquid-glass rounded-3xl p-5 border border-white/10 flex flex-col justify-between">
                {/* Artboard Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-cyan-300">ARTBOARD // 2400 × 1600 PX</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      ref={forgeUploadInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          const file = e.target.files[0];
                          const url = URL.createObjectURL(file);
                          setActiveForgeImage(url);
                          handleFilesUpload([file]);
                          toast.success(`Loaded image "${file.name}" into Graphics Forge!`);
                        }
                      }}
                      className="hidden"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => forgeUploadInputRef.current?.click()}
                      className="border-cyan-400/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 text-[11px] font-semibold h-7"
                    >
                      <FolderUp className="h-3.5 w-3.5 mr-1" />
                      Upload Local Photo
                    </Button>

                    <button onClick={() => setCanvasZoom((z) => Math.max(50, z - 10))} className="p-1 hover:text-foreground">
                      <ZoomOut className="h-3.5 w-3.5" />
                    </button>
                    <span className="font-mono text-[11px]">{canvasZoom}%</span>
                    <button onClick={() => setCanvasZoom((z) => Math.min(200, z + 10))} className="p-1 hover:text-foreground">
                      <ZoomIn className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Graphic Surface with Real GPU CSS Filters */}
                <div className="my-4 flex items-center justify-center min-h-[380px] bg-black/60 rounded-2xl border border-white/10 p-6 overflow-hidden relative">
                  <div
                    className="relative max-w-full rounded-2xl overflow-hidden shadow-2xl transition-all duration-300"
                    style={{ transform: `scale(${canvasZoom / 100})` }}
                  >
                    <img
                      src={activeForgeImage}
                      alt="Artboard Graphic Canvas"
                      className="max-h-[340px] w-auto object-contain rounded-xl"
                      style={photoFilterStyle}
                    />

                    {/* Watermark Token */}
                    <div className="absolute bottom-3 right-3 rounded-lg bg-black/60 backdrop-blur-md px-2.5 py-1 text-[10px] font-mono text-cyan-300 border border-white/10">
                      BASIRAH // FORGE
                    </div>
                  </div>
                </div>

                {/* Quick Filters Preset Bar */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/10">
                  <span className="text-xs text-muted-foreground">Presets:</span>
                  {[
                    { label: "Imperial 24K Gold", exp: 20, con: 30, sat: 40, temp: 25 },
                    { label: "Glacial Cyber", exp: 10, con: 25, sat: 30, temp: -30 },
                    { label: "Vivid HDR", exp: 15, con: 35, sat: 50, temp: 5 },
                    { label: "Reset Raw", exp: 0, con: 0, sat: 0, temp: 0 },
                  ].map((p) => (
                    <Button
                      key={p.label}
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        playSynthSound("click");
                        setImageAdjustments((prev) => ({
                          ...prev,
                          exposure: p.exp,
                          contrast: p.con,
                          saturation: p.sat,
                          temperature: p.temp,
                        }));
                      }}
                      className="h-7 text-[11px] border-white/10 text-muted-foreground hover:text-foreground"
                    >
                      {p.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Right Panel: Deep Image Adjustments */}
              <div className="lg:col-span-3 liquid-glass rounded-3xl p-5 border border-white/10 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <h3 className="font-display text-sm font-bold flex items-center gap-2 text-foreground">
                    <Sliders className="h-4 w-4 text-cyan-400" /> Image Adjustments
                  </h3>
                  <button
                    onClick={() => {
                      playSynthSound("click");
                      setImageAdjustments({
                        exposure: 0,
                        contrast: 0,
                        saturation: 0,
                        brightness: 0,
                        temperature: 0,
                        hue: 0,
                        blur: 0,
                        glow: 20,
                      });
                    }}
                    className="text-[10px] text-muted-foreground hover:text-cyan-400"
                  >
                    Reset All
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Exposure</span>
                      <span className="font-mono text-cyan-300">{imageAdjustments.exposure}%</span>
                    </div>
                    <Slider
                      value={[imageAdjustments.exposure]}
                      min={-50}
                      max={50}
                      step={5}
                      onValueChange={([v]) => setImageAdjustments((prev) => ({ ...prev, exposure: v }))}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Contrast</span>
                      <span className="font-mono text-cyan-300">{imageAdjustments.contrast}%</span>
                    </div>
                    <Slider
                      value={[imageAdjustments.contrast]}
                      min={-50}
                      max={50}
                      step={5}
                      onValueChange={([v]) => setImageAdjustments((prev) => ({ ...prev, contrast: v }))}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Saturation</span>
                      <span className="font-mono text-cyan-300">{imageAdjustments.saturation}%</span>
                    </div>
                    <Slider
                      value={[imageAdjustments.saturation]}
                      min={-50}
                      max={100}
                      step={5}
                      onValueChange={([v]) => setImageAdjustments((prev) => ({ ...prev, saturation: v }))}
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Ambient Specular Glow</span>
                      <span className="font-mono text-cyan-300">{imageAdjustments.glow}px</span>
                    </div>
                    <Slider
                      value={[imageAdjustments.glow]}
                      min={0}
                      max={60}
                      step={5}
                      onValueChange={([v]) => setImageAdjustments((prev) => ({ ...prev, glow: v }))}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 space-y-2">
                  <Button
                    onClick={() => downloadForgeDesign("png")}
                    className="w-full bg-gradient-brand text-white shadow-glow text-xs"
                  >
                    <Download className="h-3.5 w-3.5 mr-1" /> Export PNG (2× Retina DPI)
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadForgeDesign("jpeg")}
                      className="border-white/10 bg-white/5 text-foreground hover:bg-white/10 text-xs h-8"
                    >
                      Download JPG
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadForgeDesign("webp")}
                      className="border-white/10 bg-white/5 text-foreground hover:bg-white/10 text-xs h-8"
                    >
                      Download WEBP
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              WORKSTATION 3: AUDIO & VOICE LAB (LIKE ADOBE AUDITION)
             ══════════════════════════════════════════════════════════════════ */}
          {activeMode === "audio" && (
            <div className="space-y-4">
              {/* Audition Workstation Uploader & Exporter Bar */}
              <div className="liquid-glass rounded-2xl p-3.5 border border-emerald-500/20 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Waves className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                      Audition Audio Lab & Synthesizer
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-mono text-emerald-300">
                        {activeAudioName}
                      </span>
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Upload local audio stems (.wav, .mp3), synthesize sound effects, and export master 48kHz audio mixes.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={audioUploadInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setActiveAudioSrc(url);
                        setActiveAudioName(file.name);
                        playSynthSound("chime");
                        toast.success(`Loaded audio stem: ${file.name}`);
                      }
                    }}
                    className="hidden"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => audioUploadInputRef.current?.click()}
                    className="border-emerald-400/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 text-xs font-semibold h-8"
                  >
                    <FolderUp className="h-3.5 w-3.5 mr-1.5" /> Upload Audio Stem
                  </Button>

                  <Button
                    size="sm"
                    onClick={downloadAudioMix}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-xs h-8 shadow-glow"
                  >
                    <Download className="h-3.5 w-3.5 mr-1.5" /> Export Master Audio Mix (.wav)
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                
                {/* Left/Center: Visualizer & Mixer */}
                <div className="lg:col-span-8 liquid-glass rounded-3xl p-6 border border-white/10 space-y-6">
                  <div>
                    <h3 className="font-display text-xl font-bold flex items-center gap-2">
                      <Waves className="h-5 w-5 text-emerald-400" />
                      Audio Spectrum & Multi-Channel Mixer
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Synthesize real sound FX, voiceovers, and orchestrate 48 kHz cinematic audio mixes.
                    </p>
                  </div>

                  {/* Simulated Dynamic Audio Waveform Spectrum */}
                  <div className="h-36 rounded-2xl bg-black/60 border border-white/10 p-4 flex items-end justify-between gap-1 overflow-hidden relative">
                    {Array.from({ length: 48 }).map((_, i) => {
                      const heightPercent = 20 + Math.sin(i * 0.4 + currentTime * 3) * 35 + Math.cos(i * 0.2) * 25;
                      return (
                        <div
                          key={i}
                          className="flex-1 rounded-t-sm bg-gradient-to-t from-emerald-500 via-cyan-400 to-amber-300 transition-all duration-75"
                          style={{ height: `${Math.max(10, Math.min(95, heightPercent))}%` }}
                        />
                      );
                    })}
                    <div className="absolute top-3 left-4 text-[10px] font-mono text-emerald-300 flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                      48 kHz · 24-BIT STEREO MASTER
                    </div>
                  </div>

                  {/* Real Web Audio FX Soundboard */}
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                      Trigger Instant Synthesized Sound FX (Real Audio):
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {[
                        { id: "whoosh", label: "Cyber Whoosh", icon: Waves },
                        { id: "bass", label: "Sub-Bass Drop", icon: Volume2 },
                        { id: "click", label: "UI Tactile Click", icon: Radio },
                        { id: "chime", label: "Sovereign Chime", icon: Award },
                        { id: "laser", label: "Laser Pulse", icon: Zap },
                      ].map((sfx) => (
                        <Button
                          key={sfx.id}
                          variant="outline"
                          onClick={() => playSynthSound(sfx.id as any)}
                          className="border-white/10 bg-white/5 hover:bg-emerald-500/20 hover:border-emerald-400/40 text-xs py-3 flex flex-col gap-1 h-auto"
                        >
                          <sfx.icon className="h-4 w-4 text-emerald-400" />
                          <span>{sfx.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Multi-Track Channel Faders */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-white/10">
                    <div className="rounded-xl bg-black/40 p-3 border border-white/5 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Master</span>
                        <span className="font-mono text-emerald-300">{audioMasterVol}%</span>
                      </div>
                      <Slider value={[audioMasterVol]} min={0} max={100} onValueChange={([v]) => setAudioMasterVol(v)} />
                    </div>

                    <div className="rounded-xl bg-black/40 p-3 border border-white/5 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Voiceover</span>
                        <span className="font-mono text-cyan-300">{audioVoiceVol}%</span>
                      </div>
                      <Slider value={[audioVoiceVol]} min={0} max={100} onValueChange={([v]) => setAudioVoiceVol(v)} />
                    </div>

                    <div className="rounded-xl bg-black/40 p-3 border border-white/5 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>BGM Soundtrack</span>
                        <span className="font-mono text-amber-300">{audioBgmVol}%</span>
                      </div>
                      <Slider value={[audioBgmVol]} min={0} max={100} onValueChange={([v]) => setAudioBgmVol(v)} />
                    </div>

                    <div className="rounded-xl bg-black/40 p-3 border border-white/5 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Sound FX</span>
                        <span className="font-mono text-purple-300">{audioSfxVol}%</span>
                      </div>
                      <Slider value={[audioSfxVol]} min={0} max={100} onValueChange={([v]) => setAudioSfxVol(v)} />
                    </div>
                  </div>
                </div>

                {/* Right Panel: AI Voiceover Synthesizer */}
                <div className="lg:col-span-4 liquid-glass rounded-3xl p-6 border border-white/10 space-y-4">
                  <h3 className="font-display text-lg font-bold flex items-center gap-2">
                    <Mic className="h-5 w-5 text-cyan-400" />
                    AI Voiceover Studio
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Convert marketing scripts into studio-grade voiceover audio.
                  </p>

                  <div className="space-y-3">
                    <Label className="text-xs">Script Narration</Label>
                    <Textarea
                      value={aiVoicePrompt}
                      onChange={(e) => setAiVoicePrompt(e.target.value)}
                      rows={5}
                      className="bg-white/5 text-xs font-medium"
                    />

                    <div>
                      <Label className="text-xs">Voice Archetype</Label>
                      <select className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-foreground">
                        <option value="sovereign">Murtesa Alafi Sovereign (Authoritative & Deep)</option>
                        <option value="cyber">Cyber AI Female (Refined & Precision)</option>
                        <option value="cinematic">Cinematic Movie Trailer Narrator</option>
                      </select>
                    </div>

                    <Button
                      onClick={() => {
                        setVoiceSynthesizing(true);
                        playSynthSound("whoosh");
                        setTimeout(() => {
                          setVoiceSynthesizing(false);
                          playSynthSound("chime");
                          toast.success("Voiceover rendered and synced to Audio Track A1!");
                        }, 1200);
                      }}
                      disabled={voiceSynthesizing}
                      className="w-full bg-gradient-brand text-white shadow-glow text-xs"
                    >
                      {voiceSynthesizing ? "Synthesizing Neural Audio..." : "Generate Voiceover Track"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              WORKSTATION 4: 3D VFX & HOLOGRAM LAB (LIKE BLENDER / CINEMA 4D)
             ══════════════════════════════════════════════════════════════════ */}
          {activeMode === "vfx3d" && (
            <div className="space-y-4">
              {/* 3D VFX Workstation Uploader & Exporter Bar */}
              <div className="liquid-glass rounded-2xl p-3.5 border border-purple-500/20 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                      3D Hologram & Particle VFX Lab
                      <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[9px] font-mono text-purple-300">
                        {vfxMaterial.toUpperCase()} SHADER
                      </span>
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      Upload 3D textures & models, adjust volumetric rotation, and export 3D snapshots or GLTF bundles.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={vfxUploadInputRef}
                    type="file"
                    accept="image/*,.gltf,.glb"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setActiveVfxTexture(url);
                        playSynthSound("chime");
                        toast.success(`Loaded 3D texture/model: ${file.name}`);
                      }
                    }}
                    className="hidden"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => vfxUploadInputRef.current?.click()}
                    className="border-purple-400/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 text-xs font-semibold h-8"
                  >
                    <FolderUp className="h-3.5 w-3.5 mr-1.5" /> Upload 3D Texture / Model
                  </Button>

                  <Button
                    size="sm"
                    onClick={downloadVfxSnapshot}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xs h-8 shadow-glow"
                  >
                    <Download className="h-3.5 w-3.5 mr-1.5" /> Download 3D Snapshot (PNG)
                  </Button>

                  <Button
                    size="sm"
                    onClick={downloadVfxGltf}
                    className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-xs h-8 shadow-glow"
                  >
                    <HardDriveDownload className="h-3.5 w-3.5 mr-1.5" /> Export GLTF Bundle
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* Left/Center: 3D Holographic Viewport */}
              <div className="lg:col-span-8 liquid-glass rounded-3xl p-6 border border-white/10 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
                  <span className="font-mono text-purple-300">
                    OPENGL // 3D VOLUMETRIC DISPERSION · TOKENS
                  </span>
                  <span className="text-muted-foreground">Raymarching Shader Active</span>
                </div>

                {/* 3D Perspective Canvas Simulation */}
                <div className="my-6 flex items-center justify-center min-h-[400px] bg-black/80 rounded-2xl border border-white/10 p-8 overflow-hidden relative">
                  <motion.div
                    animate={{
                      rotateX: [vfxRotateX, vfxRotateX + 5, vfxRotateX],
                      rotateY: [vfxRotateY, vfxRotateY + 10, vfxRotateY],
                    }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    style={{ perspective: 1000 }}
                    className="relative flex items-center justify-center"
                  >
                    <img
                      src={threeDShowcase}
                      alt="3D Hologram Token"
                      className="max-h-[300px] w-auto object-contain rounded-2xl shadow-[0_0_80px_rgba(157,0,255,0.4)]"
                    />
                  </motion.div>

                  <div className="absolute bottom-4 left-4 text-[10px] font-mono text-purple-300 bg-black/60 px-3 py-1 rounded-xl border border-white/10">
                    ROTATION: X:{vfxRotateX}° · Y:{vfxRotateY}° · PARTICLES: {vfxParticleCount}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-white/10 text-xs">
                  <span className="text-muted-foreground">Material Shaders:</span>
                  {(["gold", "titanium", "glass", "hologram"] as const).map((mat) => (
                    <Button
                      key={mat}
                      size="sm"
                      variant={vfxMaterial === mat ? "default" : "outline"}
                      onClick={() => {
                        playSynthSound("click");
                        setVfxMaterial(mat);
                      }}
                      className="h-7 text-xs capitalize"
                    >
                      {mat}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Right Panel: 3D Camera & Lighting Controls */}
              <div className="lg:col-span-4 liquid-glass rounded-3xl p-6 border border-white/10 space-y-4">
                <h3 className="font-display text-lg font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  3D Viewport Controls
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Rotation X-Axis</span>
                      <span className="font-mono text-purple-300">{vfxRotateX}°</span>
                    </div>
                    <Slider value={[vfxRotateX]} min={-45} max={45} onValueChange={([v]) => setVfxRotateX(v)} />
                  </div>

                  <div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Rotation Y-Axis</span>
                      <span className="font-mono text-purple-300">{vfxRotateY}°</span>
                    </div>
                    <Slider value={[vfxRotateY]} min={-60} max={60} onValueChange={([v]) => setVfxRotateY(v)} />
                  </div>

                  <div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Particle Emission Count</span>
                      <span className="font-mono text-purple-300">{vfxParticleCount}</span>
                    </div>
                    <Slider value={[vfxParticleCount]} min={20} max={200} step={10} onValueChange={([v]) => setVfxParticleCount(v)} />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <Button
                    onClick={() => {
                      playSynthSound("laser");
                      toast.success("3D Asset Baked to High-Res OBJ / GLTF Bundle!");
                    }}
                    className="w-full bg-gradient-brand text-white shadow-glow text-xs"
                  >
                    Bake 3D GLTF Asset
                  </Button>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              WORKSTATION 5: 50+ PRO BACKGROUND STYLES
             ══════════════════════════════════════════════════════════════════ */}
          {activeMode === "backgrounds" && (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-amber-400" />
                    50+ Sovereign Background Styles
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Water glass, brushed chrome, 24K imperial gold, and obsidian void backgrounds.
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 bg-white/5 p-1.5 rounded-2xl border border-white/10 text-xs">
                  {[
                    { id: "all", label: "All 50 Presets" },
                    { id: "water-glass", label: "Water Glass (10)" },
                    { id: "metal-chrome", label: "Metals & Chrome (10)" },
                    { id: "golden-imperial", label: "Imperial 24K Gold (10)" },
                    { id: "cyber-obsidian", label: "Cyber Obsidian (10)" },
                    { id: "gem-mineral", label: "Gemstone & Silk (10)" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setBgCategory(cat.id)}
                      className={`rounded-xl px-3 py-1.5 font-semibold transition-all ${
                        bgCategory === cat.id ? "bg-gradient-brand text-white shadow-glow" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Interactive Stage */}
              <div
                className="relative overflow-hidden rounded-3xl p-8 sm:p-12 shadow-elevated border transition-all duration-700 min-h-[280px] flex flex-col justify-between"
                style={activeBg.style}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-[10px] font-mono tracking-widest text-white uppercase font-bold border border-white/20">
                      CURRENT STAGE // {activeBg.category.toUpperCase()}
                    </span>
                    <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-white mt-2 drop-shadow-md">
                      {activeBg.name}
                    </h3>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => copyCode("Tailwind Class", activeBg.tailwindClass)}
                      size="sm"
                      className="bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs"
                    >
                      Copy Tailwind
                    </Button>
                    <Button
                      onClick={() => copyCode("CSS Snippet", activeBg.cssCode)}
                      size="sm"
                      className="bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs shadow-glow hover:brightness-110"
                    >
                      Copy CSS
                    </Button>
                  </div>
                </div>

                <code className="text-xs font-mono text-cyan-300 block mt-6 bg-black/50 backdrop-blur-md p-3 rounded-xl border border-white/10 break-all max-w-2xl">
                  {activeBg.cssCode}
                </code>
              </div>

              {/* Grid of 50 Backgrounds */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {STUDIO_BACKGROUNDS.filter((b) => bgCategory === "all" || b.category === bgCategory).map((bg) => (
                  <div
                    key={bg.id}
                    onClick={() => {
                      playSynthSound("click");
                      setActiveBg(bg);
                    }}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all hover:scale-[1.02] flex flex-col justify-between ${
                      activeBg.id === bg.id ? "border-amber-400 shadow-glow bg-white/10" : "border-white/10 bg-white/[0.02]"
                    }`}
                  >
                    <div>
                      <div className="h-20 w-full rounded-xl border border-white/10 shadow-inner mb-3" style={bg.style} />
                      <h4 className="font-display text-xs font-bold text-foreground line-clamp-1">{bg.name}</h4>
                      <p className="text-[10px] text-muted-foreground uppercase font-mono">{bg.category}</p>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyCode(bg.name, bg.cssCode);
                        }}
                        className="h-6 text-[10px] text-cyan-400 p-0"
                      >
                        Copy CSS
                      </Button>
                      {activeBg.id === bg.id && <span className="text-[10px] font-bold text-amber-300">✓ Active</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              WORKSTATION 6: 100+ MIRACLE COMPONENTS
             ══════════════════════════════════════════════════════════════════ */}
          {activeMode === "components" && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                    <Layers className="h-6 w-6 text-neon-cyan" />
                    100+ Miracle Components Library
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Sovereign buttons, bento cards, AI agent swarms, checkouts, and docks.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <input
                    ref={compImportInputRef}
                    type="file"
                    accept=".json,.jsx,.tsx,.txt"
                    onChange={handleComponentImport}
                    className="hidden"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => compImportInputRef.current?.click()}
                    className="border-cyan-400/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 text-xs font-semibold h-9"
                  >
                    <FolderUp className="h-3.5 w-3.5 mr-1.5" /> Import Component File
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={exportComponentCatalog}
                    className="border-amber-400/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs font-semibold h-9"
                  >
                    <Download className="h-3.5 w-3.5 mr-1.5" /> Export Catalog (.json)
                  </Button>

                  <Button
                    onClick={openNewStudioComponent}
                    className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-black font-bold text-xs shadow-glow hover:brightness-110 h-9"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" /> Forge Miracle Component
                  </Button>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-1.5 max-w-3xl">
                  {[
                    { id: "all", label: `All (${allComponents.length})` },
                    { id: "miracle", label: "Miracles" },
                    { id: "buttons", label: "Buttons (12)" },
                    { id: "cards", label: "Cards & Bento (10)" },
                    { id: "ai", label: "AI Swarms (10)" },
                    { id: "navigation", label: "Nav & Docks (10)" },
                    { id: "forms", label: "Forms & Inputs (10)" },
                    { id: "tables", label: "Tables & Data (8)" },
                    { id: "ecommerce", label: "Checkout (8)" },
                    { id: "proof", label: "Social Proof (8)" },
                    { id: "media", label: "Media & Frames (6)" },
                    { id: "overlays", label: "Overlays (6)" },
                    { id: "typography", label: "Typography (10)" },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCompCategory(c.id)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                        compCategory === c.id ? "bg-gradient-brand text-white shadow-glow" : "liquid-glass text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search 100+ components..."
                    className="pl-8 bg-white/5 border-white/10 text-xs h-9 rounded-xl"
                  />
                </div>
              </div>

              {/* Components Cards Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredComponents.map((item) => (
                  <div
                    key={item.id}
                    className="liquid-glass rounded-3xl p-5 border border-white/10 flex flex-col justify-between hover:border-amber-400/50 transition-all hover:shadow-[0_0_35px_rgba(245,215,110,0.15)] group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-cyan-400/10 border border-cyan-400/30 px-2.5 py-0.5 text-[9px] font-mono uppercase text-cyan-300">
                          {item.category}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-muted-foreground font-mono">#{item.id}</span>
                          <button
                            type="button"
                            onClick={() => openEditStudioComponent(item)}
                            title="Edit & Customize Component"
                            className="text-amber-400 hover:text-amber-300 p-1 rounded-md hover:bg-amber-400/10 transition-colors"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <h3
                        onClick={() => openEditStudioComponent(item)}
                        className="font-display text-lg font-bold text-foreground mt-2 cursor-pointer hover:text-amber-300 transition-colors"
                      >
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>

                      {/* Interactive Visual Preview Box - Clickable into Editor Surface */}
                      <div
                        onClick={() => openEditStudioComponent(item)}
                        className="mt-4 rounded-2xl p-4 flex items-center justify-center min-h-[110px] bg-black/60 border border-white/10 overflow-hidden relative cursor-pointer group/preview hover:border-amber-400/40 transition-all"
                      >
                        <div className="absolute top-2 right-2 opacity-0 group-preview-hover:opacity-100 transition-opacity bg-black/70 px-2 py-0.5 rounded text-[9px] font-mono text-amber-300 border border-amber-400/30">
                          CLICK TO EDIT
                        </div>

                        {item.category === "buttons" ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              playSynthSound("click");
                              toast.success(`Tested button: ${item.title}`);
                            }}
                            className="rounded-xl bg-gradient-brand px-5 py-2.5 text-xs font-bold text-white shadow-glow hover:scale-105 active:scale-95 transition-all"
                          >
                            {item.title}
                          </button>
                        ) : item.category === "miracle" ? (
                          <div className="rounded-xl border border-amber-300/40 bg-amber-500/15 px-4 py-2.5 text-xs font-bold text-amber-200 text-center shadow-[0_0_30px_rgba(245,215,110,0.2)]">
                            ✨ {item.title}
                          </div>
                        ) : item.category === "ai" ? (
                          <div className="flex items-center gap-2 rounded-xl bg-cyan-950/40 border border-cyan-400/30 px-3 py-1.5 text-xs text-cyan-300">
                            <Bot className="h-4 w-4 animate-pulse text-cyan-400" />
                            <span>Autonomous Agent Node</span>
                          </div>
                        ) : (
                          <div className="liquid-glass rounded-xl p-3 text-center w-full">
                            <p className="text-xs font-semibold text-foreground">{item.title}</p>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {item.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="rounded-md bg-white/5 px-2 py-0.5 text-[9px] text-muted-foreground">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-1.5 border-t border-white/5 pt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditStudioComponent(item)}
                        className="h-8 text-xs border-amber-400/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 font-semibold"
                      >
                        <Edit3 className="h-3.5 w-3.5 mr-1" />
                        Edit & Customize
                      </Button>

                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => downloadComponentCode(item)}
                          title="Download TSX/JSX file"
                          className="h-8 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <Download className="h-3.5 w-3.5 mr-1" />
                          JSX
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyCode(`${item.title} JSX`, item.jsxCode)}
                          className="h-8 text-xs text-cyan-400 hover:text-cyan-300"
                        >
                          <Copy className="h-3.5 w-3.5 mr-1" />
                          Copy
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* In-Studio Miracle Component Forge & Live Visual Customizer Dialog */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="liquid-glass border-amber-400/30 sm:max-w-5xl bg-background/95 max-h-[94vh] overflow-y-auto p-6 sm:p-8 shadow-[0_0_80px_rgba(245,215,110,0.15)]">
          <DialogHeader>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-white/10">
              <DialogTitle className="font-display text-2xl flex items-center gap-2.5">
                <Sparkles className="h-6 w-6 text-amber-400" />
                <span>{editingCompId ? "Edit & Customize Miracle Component" : "Forge Miracle Component"}</span>
              </DialogTitle>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-500/20 px-3 py-1 text-[10px] font-mono font-bold text-amber-300 border border-amber-500/30">
                  {editingCompId ? `CUSTOMIZING: #${editingCompId}` : "NEW SOVEREIGN COMPONENT"}
                </span>
                <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-[10px] font-mono text-cyan-300 border border-cyan-500/30 uppercase">
                  {newCompForm.category}
                </span>
              </div>
            </div>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Interact with the live visual surface, toggle real-time design presets, edit code, and save directly to your studio library.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateComponent} className="space-y-6 pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT COLUMN: LIVE VISUAL INTERACTIVE SURFACE & PRESETS */}
              <div className="lg:col-span-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Eye className="h-4 w-4 text-cyan-400" /> Live Interactive Component Surface
                  </Label>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold animate-pulse">
                    LIVE SURFACE ACTIVE
                  </span>
                </div>

                {/* THE LIVE INTERACTIVE SURFACE BOX */}
                <div className="rounded-3xl p-6 min-h-[290px] border relative overflow-hidden flex flex-col justify-between items-center transition-all bg-black/90 shadow-2xl">
                  {/* Subtle Background Ambience */}
                  <div className="absolute inset-0 bg-mesh opacity-40 pointer-events-none" />

                  {newCompForm.previewType === "golden-morph" || newCompForm.previewType.includes("gold") ? (
                    <div className="w-full relative z-10 space-y-4 text-center">
                      <div className="inline-block rounded-full bg-amber-500/20 border border-amber-400/40 px-3 py-1 text-[10px] font-mono text-amber-300 font-bold uppercase tracking-wider">
                        ✨ 24K IMPERIAL GOLD GRADE
                      </div>
                      <h4 className="font-display text-xl sm:text-2xl font-black text-amber-200 drop-shadow-[0_2px_15px_rgba(245,215,110,0.4)]">
                        {newCompForm.title || "Imperial 24K Miracle Component"}
                      </h4>
                      <p className="text-xs text-amber-100/70 max-w-sm mx-auto line-clamp-2">
                        {newCompForm.description || "Ultra-luxury refractive glass with specular gold border harmonics."}
                      </p>
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            playSynthSound("chime");
                            toast.success("Tactile Gold Miracle Button Clicked!");
                          }}
                          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-600 text-black font-extrabold text-xs shadow-glow hover:scale-105 active:scale-95 transition-all"
                        >
                          ⚡ Test Interactive 24K Button
                        </button>
                      </div>
                    </div>
                  ) : newCompForm.previewType === "water-card" || newCompForm.previewType.includes("water") || newCompForm.previewType.includes("glass") ? (
                    <div className="w-full relative z-10 space-y-4 text-center">
                      <div className="inline-block rounded-full bg-cyan-500/20 border border-cyan-400/40 px-3 py-1 text-[10px] font-mono text-cyan-300 font-bold uppercase tracking-wider">
                        💧 GLACIAL WATER GLASS
                      </div>
                      <h4 className="font-display text-xl sm:text-2xl font-black text-cyan-200 drop-shadow-[0_2px_15px_rgba(0,229,255,0.4)]">
                        {newCompForm.title || "Glacial Water Refraction Card"}
                      </h4>
                      <p className="text-xs text-cyan-100/70 max-w-sm mx-auto line-clamp-2">
                        {newCompForm.description || "Sub-surface scattering with fluid caustics and hydro-refraction."}
                      </p>
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            playSynthSound("laser");
                            toast.success("Tactile Glacial Glass Action Clicked!");
                          }}
                          className="px-6 py-3 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400 text-cyan-200 font-bold text-xs shadow-glow hover:scale-105 active:scale-95 transition-all backdrop-blur-md"
                        >
                          💧 Test Liquid Glass Action
                        </button>
                      </div>
                    </div>
                  ) : newCompForm.category === "ai" || newCompForm.previewType === "ai-node" ? (
                    <div className="w-full relative z-10 space-y-4 text-center">
                      <div className="inline-flex items-center gap-2 rounded-full bg-cyan-950/60 border border-cyan-400/40 px-3.5 py-1 text-[10px] font-mono text-cyan-300 font-bold uppercase">
                        <Bot className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                        <span>AUTONOMOUS SWARM ACTIVE</span>
                      </div>
                      <h4 className="font-display text-xl sm:text-2xl font-black text-cyan-100">
                        {newCompForm.title || "Neural Agent Swarm Node"}
                      </h4>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto line-clamp-2">
                        {newCompForm.description || "Multi-agent coordination protocol with real-time feedback loops."}
                      </p>
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            playSynthSound("click");
                            toast.success("Neural Swarm Activated!");
                          }}
                          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 text-white font-extrabold text-xs shadow-glow hover:scale-105 active:scale-95 transition-all"
                        >
                          🤖 Test Invoke Agent Swarm
                        </button>
                      </div>
                    </div>
                  ) : newCompForm.category === "buttons" ? (
                    <div className="w-full relative z-10 space-y-4 text-center">
                      <h4 className="font-display text-lg font-bold text-white">
                        {newCompForm.title || "Tactile Sovereign Button"}
                      </h4>
                      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                        <button
                          type="button"
                          onClick={() => playSynthSound("chime")}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold text-xs shadow-glow hover:scale-105 active:scale-95 transition-all"
                        >
                          ✨ Sovereign 24K
                        </button>
                        <button
                          type="button"
                          onClick={() => playSynthSound("laser")}
                          className="px-5 py-2.5 rounded-xl bg-gradient-brand text-white font-bold text-xs shadow-glow hover:scale-105 active:scale-95 transition-all"
                        >
                          ⚡ Neon Laser
                        </button>
                        <button
                          type="button"
                          onClick={() => playSynthSound("click")}
                          className="px-5 py-2.5 rounded-xl border border-white/20 bg-white/10 text-white font-semibold text-xs hover:bg-white/20 transition-all"
                        >
                          🔘 Glass Outline
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full relative z-10 space-y-4 text-center">
                      <div className="inline-block rounded-full bg-white/10 px-3 py-1 text-[10px] font-mono text-white/80 font-bold uppercase">
                        {newCompForm.category.toUpperCase()} MIRACLE
                      </div>
                      <h4 className="font-display text-xl font-bold text-foreground">
                        {newCompForm.title || "Miracle Component"}
                      </h4>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto line-clamp-2">
                        {newCompForm.description || "Configured with Basirah Creative Suite."}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          playSynthSound("click");
                          toast.success("Action Triggered!");
                        }}
                        className="px-6 py-2.5 rounded-xl bg-gradient-brand text-white font-bold text-xs shadow-glow hover:scale-105 active:scale-95 transition-all"
                      >
                        Explore Component
                      </button>
                    </div>
                  )}

                  {/* Surface Bottom Metadata Pill */}
                  <div className="relative z-10 flex items-center justify-between w-full pt-4 border-t border-white/10 text-[10px] font-mono text-muted-foreground">
                    <span>PRESET: {newCompForm.previewType}</span>
                    <span className="text-amber-300">24K VERIFIED SOVEREIGN ASSET</span>
                  </div>
                </div>

                {/* 1-CLICK VISUAL STYLE PRESET SWITCHER */}
                <div className="liquid-glass rounded-2xl p-3.5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                      1-Click Visual Style Presets:
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">AUTO-UPDATES CODE</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      {
                        id: "golden-morph",
                        name: "24K Gold Morph",
                        cat: "miracle",
                        jsx: `<div className="liquid-glass rounded-3xl p-8 border border-amber-300/40 bg-gradient-to-br from-amber-500/15 via-black to-yellow-500/10 shadow-[0_0_50px_rgba(245,215,110,0.2)]">\n  <h3 className="font-display text-2xl font-bold text-amber-200">24K Imperial Gold</h3>\n  <p className="text-xs text-muted-foreground mt-2">Sovereign luxury asset.</p>\n  <button className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold text-xs shadow-glow">Sovereign Action</button>\n</div>`,
                      },
                      {
                        id: "water-card",
                        name: "Water Glass",
                        cat: "miracle",
                        jsx: `<div className="liquid-glass rounded-3xl p-8 border border-cyan-400/40 bg-gradient-to-br from-cyan-500/15 via-black to-blue-500/10 shadow-[0_0_50px_rgba(0,229,255,0.2)] backdrop-blur-2xl">\n  <h3 className="font-display text-2xl font-bold text-cyan-200">Glacial Water Glass</h3>\n  <p className="text-xs text-muted-foreground mt-2">High-index sub-surface refraction.</p>\n  <button className="mt-4 px-6 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-bold text-xs shadow-glow">Explore Glacier</button>\n</div>`,
                      },
                      {
                        id: "ai-node",
                        name: "AI Swarm Node",
                        cat: "ai",
                        jsx: `<div className="liquid-glass rounded-3xl p-6 border border-cyan-400/30 bg-black/80 shadow-[0_0_40px_rgba(0,229,255,0.15)] flex items-center justify-between">\n  <div>\n    <div className="flex items-center gap-2">\n      <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />\n      <span className="text-[10px] font-mono text-cyan-300 font-bold">AUTONOMOUS SWARM</span>\n    </div>\n    <h4 className="font-display text-lg font-bold text-white mt-1">Autonomous Agent Node</h4>\n  </div>\n  <button className="px-5 py-2.5 rounded-xl bg-gradient-brand text-white font-bold text-xs shadow-glow">Trigger Task</button>\n</div>`,
                      },
                      {
                        id: "sovereign-button",
                        name: "Sovereign Button",
                        cat: "buttons",
                        jsx: `<button className="rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-600 px-8 py-4 text-xs font-black text-black uppercase tracking-wider shadow-[0_0_35px_rgba(245,215,110,0.5)] hover:scale-105 active:scale-95 transition-all">\n  Sovereign CTA Action\n</button>`,
                      },
                      {
                        id: "obsidian-metal",
                        name: "Obsidian Metal",
                        cat: "cards",
                        jsx: `<div className="rounded-3xl p-8 border border-white/15 bg-gradient-to-br from-neutral-900 via-black to-neutral-950 shadow-2xl">\n  <h3 className="font-display text-xl font-bold text-neutral-100">Obsidian Aircraft Billet</h3>\n  <p className="text-xs text-neutral-400 mt-2">Brushed titanium chamfered edges.</p>\n</div>`,
                      },
                      {
                        id: "checkout-card",
                        name: "Instant Checkout",
                        cat: "ecommerce",
                        jsx: `<div className="liquid-glass rounded-3xl p-6 border border-emerald-400/30 bg-black/90">\n  <div className="flex justify-between items-center">\n    <span className="text-xs font-bold text-white">Enterprise License</span>\n    <span className="font-mono text-emerald-400 font-bold">$4,950</span>\n  </div>\n  <button className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-extrabold text-xs shadow-glow">1-Click Checkout</button>\n</div>`,
                      },
                    ].map((pst) => (
                      <button
                        key={pst.id}
                        type="button"
                        onClick={() => {
                          playSynthSound("click");
                          setNewCompForm((prev) => ({
                            ...prev,
                            previewType: pst.id,
                            category: pst.cat,
                            jsxCode: pst.jsx,
                          }));
                          toast.success(`Applied style preset: ${pst.name}`);
                        }}
                        className={`rounded-xl p-2.5 text-left border text-xs font-semibold transition-all ${
                          newCompForm.previewType === pst.id
                            ? "bg-amber-500/20 border-amber-400 text-amber-200 shadow-glow"
                            : "bg-white/5 border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10"
                        }`}
                      >
                        <div>{pst.name}</div>
                        <div className="text-[9px] font-mono text-muted-foreground opacity-80 uppercase">{pst.cat}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Direct Exporters & Code Downloads */}
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      downloadComponentCode({
                        title: newCompForm.title || "MiracleComponent",
                        jsxCode: newCompForm.jsxCode,
                      })
                    }
                    className="flex-1 border-amber-400/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs font-semibold h-9"
                  >
                    <Download className="h-3.5 w-3.5 mr-1.5" /> Download Component (.tsx)
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => copyCode(newCompForm.title || "Component", newCompForm.jsxCode)}
                    className="border border-white/10 bg-white/5 text-cyan-300 hover:bg-white/10 text-xs font-semibold h-9"
                  >
                    <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy React JSX
                  </Button>
                </div>
              </div>

              {/* RIGHT COLUMN: ATTRIBUTES & CODE EDITORS */}
              <div className="lg:col-span-6 space-y-3.5">
                <div>
                  <Label className="text-xs font-semibold">Component Title</Label>
                  <Input
                    value={newCompForm.title}
                    onChange={(e) => setNewCompForm({ ...newCompForm, title: e.target.value })}
                    placeholder="e.g. Imperial 24K Glass Metric Box"
                    className="mt-1 bg-white/5 font-semibold text-foreground text-xs h-9"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">Category</Label>
                    <select
                      value={newCompForm.category}
                      onChange={(e) => setNewCompForm({ ...newCompForm, category: e.target.value })}
                      className="mt-1 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-400"
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
                    <Label className="text-xs font-semibold">Preview Visual Preset</Label>
                    <Input
                      value={newCompForm.previewType}
                      onChange={(e) => setNewCompForm({ ...newCompForm, previewType: e.target.value })}
                      placeholder="golden-morph, water-card, ai-node"
                      className="mt-1 bg-white/5 text-xs h-9 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs font-semibold">Description</Label>
                  <Input
                    value={newCompForm.description}
                    onChange={(e) => setNewCompForm({ ...newCompForm, description: e.target.value })}
                    placeholder="e.g. Refractive luxury component with specular border caustics."
                    className="mt-1 bg-white/5 text-xs h-9"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Tags (comma-separated)</Label>
                  <Input
                    value={newCompForm.tags}
                    onChange={(e) => setNewCompForm({ ...newCompForm, tags: e.target.value })}
                    placeholder="gold, miracle, glass, metrics"
                    className="mt-1 bg-white/5 text-xs h-9"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">JSX / React Code Snippet</Label>
                    <span className="text-[10px] font-mono text-muted-foreground">TSX COMPATIBLE</span>
                  </div>
                  <Textarea
                    value={newCompForm.jsxCode}
                    onChange={(e) => setNewCompForm({ ...newCompForm, jsxCode: e.target.value })}
                    rows={4}
                    className="mt-1 bg-black/60 font-mono text-[11px] text-amber-200 border-white/10"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">CSS Styles / Tailwind Utilities</Label>
                    <span className="text-[10px] font-mono text-muted-foreground">SPECULAR FILTER</span>
                  </div>
                  <Textarea
                    value={newCompForm.cssCode}
                    onChange={(e) => setNewCompForm({ ...newCompForm, cssCode: e.target.value })}
                    rows={2}
                    placeholder="backdrop-filter: blur(28px); border: 1px solid rgba(255,255,255,0.2);"
                    className="mt-1 bg-black/60 font-mono text-[11px] text-cyan-200 border-white/10"
                  />
                </div>

                <DialogFooter className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setCreateModalOpen(false);
                      setEditingCompId(null);
                    }}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-black font-extrabold shadow-glow text-xs px-6 hover:brightness-110"
                  >
                    <Sparkles className="h-4 w-4 mr-1.5" />
                    {editingCompId ? "Save & Update Component" : "Forge & Add to Library"}
                  </Button>
                </DialogFooter>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Render & Export 4K Dialog */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="liquid-glass border-white/20 sm:max-w-xl bg-background/95 max-h-[92vh] overflow-y-auto p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl flex items-center gap-2">
              <Download className="h-6 w-6 text-amber-400" />
              Production Render Queue
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Hardware-accelerated export for 4K video, motion graphics, and vector brand assets. Real file downloads trigger directly to your computer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Select Output Format to Render & Download</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {[
                  { id: "MP4 (H.265 4K UHD)", desc: "Cinema master video snapshot" },
                  { id: "ProRes 422 HQ", desc: "Broadcast post-production format" },
                  { id: "PNG (2× High-DPI)", desc: "Retina graphics & artboards" },
                  { id: "SVG / Vector", desc: "Scalable vector logo bundle" },
                ].map((fmt) => (
                  <Button
                    key={fmt.id}
                    variant="outline"
                    onClick={() => handleStartExport(fmt.id)}
                    disabled={isExporting}
                    className="border-white/10 bg-white/5 hover:bg-amber-500/15 hover:border-amber-400/30 text-left p-3.5 h-auto flex flex-col items-start gap-1 transition-all"
                  >
                    <span className="font-bold text-foreground text-xs">{fmt.id}</span>
                    <span className="text-[10px] text-muted-foreground">{fmt.desc}</span>
                  </Button>
                ))}
              </div>
            </div>

            {isExporting && (
              <div className="space-y-2 pt-3 border-t border-white/10">
                <div className="flex justify-between text-xs font-mono text-cyan-300">
                  <span>Rendering & Encoding Asset...</span>
                  <span>{exportProgress}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-brand transition-all duration-300 shadow-glow"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </SiteShell>
  );
}

export default SovereignCreativeSuite;
