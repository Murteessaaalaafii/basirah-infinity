import { motion } from "framer-motion";
import portrait from "@/assets/murtesa-portrait.png";

export function PortraitShowcase() {
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-md">
      {/* static luxury glow halo (no rotating circles) */}
      <div className="absolute inset-[6%] rounded-3xl bg-gradient-brand opacity-30 blur-2xl" />
      <div className="absolute inset-[4%] rounded-3xl border border-primary/30" />
      <div className="absolute inset-[10%] rounded-3xl border border-accent/30" />
      {/* glass frame */}
      <div className="premium-border absolute inset-x-[10%] bottom-[4%] top-[18%] overflow-hidden rounded-[2rem]">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/25 via-accent/10 to-transparent" />
      </div>
      <motion.img
        src={portrait}
        alt="Murtesa Alafi"
        className="absolute bottom-[4%] left-1/2 w-[78%] -translate-x-1/2 drop-shadow-2xl"
        style={{ animation: "portrait-float 7s ease-in-out infinite", maskImage: "linear-gradient(to bottom, black 80%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, black 80%, transparent)" }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        draggable={false}
      />
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
        className="absolute bottom-[8%] right-0"
      >
        <div className="liquid-glass rounded-2xl px-4 py-2">
        <p className="font-display text-sm font-bold text-gradient-brand">Murtesa Alafi</p>
        <p className="text-[10px] tracking-widest text-muted-foreground">FOUNDER · CREATIVE DIRECTOR</p>
        </div>
      </motion.div>
    </div>
  );
}
