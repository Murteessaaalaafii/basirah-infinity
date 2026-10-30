import { motion } from "framer-motion";
import { Play, Film, Layout, Sparkles, Box, ExternalLink, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import coverImg from "@/assets/basirah-cover.jpg";
import editing from "@/assets/showcase-editing.png";
import motionImg from "@/assets/showcase-motion.png";
import web from "@/assets/showcase-web.png";
import portfolio from "@/assets/showcase-portfolio.png";
import graphics from "@/assets/showcase-graphics.png";
import threeD from "@/assets/showcase-3d.png";
import logo from "@/assets/showcase-logo.png";
import prism from "@/assets/showcase-prism.png";

const ITEMS = [
  { src: editing, t: "Video Editing", tag: "Premiere · DaVinci", d: "Long-form & vertical edits", icon: Film, span: "md:col-span-2 md:row-span-2" },
  { src: web, t: "Web Development", tag: "Next · TanStack", d: "High-converting business sites", icon: Layout, span: "md:col-span-2" },
  { src: graphics, t: "Motion Graphics", tag: "After Effects", d: "30s reels & explainers", icon: Sparkles, span: "" },
  { src: logo, t: "Logo Reveal", tag: "Brand Identity", d: "Liquid-glass animations", icon: Box, span: "" },
  { src: portfolio, t: "UI / Portfolio", tag: "Product Design", d: "Editorial layouts", icon: Layout, span: "md:col-span-2" },
  { src: threeD, t: "3D & CGI", tag: "Blender · C4D", d: "Hero shots that pop", icon: Box, span: "" },
  { src: motionImg, t: "Color Grade", tag: "Cinematic", d: "Editorial-grade finishing", icon: Film, span: "" },
  { src: prism, t: "Visual Effects", tag: "VFX · Composit", d: "Refraction & light play", icon: Sparkles, span: "md:col-span-2" },
] as const;

export function Showcase() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-20">
      <div className="flex items-end justify-between gap-6">
        <div>
          <span className="liquid-glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] tracking-widest text-neon-cyan">
            <Play className="h-3 w-3" /> SHOWREEL
          </span>
          <h2 className="mt-3 font-display text-4xl font-bold md:text-5xl">
            Our <span className="text-gradient-brand">Work</span>, in motion.
          </h2>
          <p className="mt-2 max-w-xl text-muted-foreground">
            A liquid-glass bento of recent edits, websites, motion design and 3D craft — built by Murtesa Alafi.
          </p>
        </div>
      </div>

      {/* FLAGSHIP VISUAL COVER PREVIEW */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-8 overflow-hidden rounded-3xl border border-neon-cyan/30 liquid-glass shadow-elevated"
      >
        <div className="relative aspect-[21/9] w-full overflow-hidden bg-black group">
          <img
            src={coverImg}
            alt="Basirah Infinity Sovereign Work Suite — Murtesa Alafi"
            className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex items-end p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between w-full gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <span className="rounded-full bg-gradient-brand px-3 py-1 text-[10px] font-bold text-white uppercase tracking-widest">
                  FLAGSHIP WORK PREVIEW · MURTESA ALAFI
                </span>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-white drop-shadow">
                  Basirah Infinity Sovereign Work Suite
                </h3>
                <p className="text-xs md:text-sm text-white/80 leading-relaxed">
                  Bespoke 3D brand architecture, ultra-fast web platforms, and autonomous AI automation swarms engineered for sovereign client dominance.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <a
                  href="https://basirahinfinity.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-brand px-4 py-2.5 text-xs font-bold text-white shadow-glow hover:opacity-95 transition-opacity"
                >
                  <span>Open Live Platform</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <Link
                  to="/works"
                  className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
                >
                  <span>Full Showcase</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mt-10 grid auto-rows-[180px] grid-cols-2 gap-4 md:grid-cols-4">
        {ITEMS.map((it, i) => (
          <motion.div
            key={it.t}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
            className={`premium-border group relative overflow-hidden rounded-3xl ${it.span}`}
          >
            <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
              <img
                src={it.src}
                alt={it.t}
                className="h-full w-full object-cover opacity-80 transition-all duration-700 group-hover:scale-110 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            </div>

            {/* Play badge */}
            <div className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full assistant-glass">
              <Play className="h-4 w-4 fill-current" />
            </div>

            <div className="absolute inset-x-0 bottom-0 p-4">
              <p className="text-[10px] tracking-[0.2em] text-neon-cyan">{it.tag.toUpperCase()}</p>
              <h3 className="mt-0.5 font-display text-lg font-bold leading-tight">{it.t}</h3>
              <p className="text-xs text-white/70">{it.d}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
