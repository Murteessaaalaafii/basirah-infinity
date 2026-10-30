import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, X, Pin } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { fetchPublishedAnnouncements } from "@/integrations/firebase/helpers";

type Announcement = {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  created_at: string;
};

export function AnnouncementBanner() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [idx, setIdx] = useState(0);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await fetchPublishedAnnouncements(5);
        if (mounted && data) {
          // Sort pinned first, then latest
          const sorted = [...data].sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return 0;
          });
          setItems(sorted as Announcement[]);
        }
      } catch (e) {
        console.error("Failed to load announcements:", e);
      }
    }
    load();
    const interval = setInterval(load, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % items.length), 6000);
    return () => clearInterval(t);
  }, [items.length]);

  const visible = items.filter((a) => !dismissed.has(a.id));
  if (!visible.length) return null;
  const a = visible[idx % visible.length];

  return (
    <div className="mx-auto mt-4 max-w-7xl px-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={a.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="liquid-glass relative flex items-start gap-3 overflow-hidden rounded-2xl border border-neon-cyan/20 p-4 shadow-glow"
        >
          <span
            className="pointer-events-none absolute inset-0 -z-10 opacity-40"
            style={{
              background:
                "linear-gradient(120deg, color-mix(in oklab, var(--neon-cyan) 18%, transparent), transparent 50%, color-mix(in oklab, var(--neon-magenta) 18%, transparent))",
            }}
          />
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-brand text-white">
            {a.pinned ? <Pin className="h-4 w-4" /> : <Megaphone className="h-4 w-4" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-display text-sm font-semibold">{a.title}</p>
              {a.pinned && (
                <span className="rounded-full bg-neon-cyan/20 px-2 py-0.5 text-[10px] uppercase tracking-widest text-neon-cyan">
                  Pinned
                </span>
              )}
              <span className="ml-auto text-[10px] text-muted-foreground">
                {a.created_at ? new Date(a.created_at).toLocaleDateString() : ""}
              </span>
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{a.body}</p>
            <div className="mt-2 flex items-center gap-3 text-xs">
              <Link to="/about" className="text-neon-cyan hover:underline">
                Learn more →
              </Link>
              {items.length > 1 && (
                <div className="flex gap-1">
                  {items.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setIdx(i)}
                      aria-label={`Announcement ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all ${
                        i === idx % items.length
                          ? "w-6 bg-neon-cyan"
                          : "w-1.5 bg-muted-foreground/40"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setDismissed((s) => new Set(s).add(a.id))}
            className="rounded-full p-1 text-muted-foreground hover:bg-white/10"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
