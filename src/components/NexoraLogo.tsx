import logoSrc from "@/assets/ma-logo.jpg";
import { Link } from "@tanstack/react-router";

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
  animated?: boolean;
  asLink?: boolean;
}

export function NexoraLogo({
  size = 42,
  showWordmark = true,
  className = "",
  animated = true,
  asLink = true,
}: LogoProps) {
  const inner = (
    <div className={`group flex items-center gap-3.5 ${className}`}>
      <div
        className="relative shrink-0"
        style={{ width: size, height: size }}
      >
        {/* static glowing ring (no rotation) */}
        {animated && (
          <span
            className="absolute -inset-1 rounded-2xl opacity-70 blur-[6px] transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--neon-cyan,190 100% 60%)), hsl(var(--neon-magenta,300 100% 65%)))",
            }}
          />
        )}
        <div
          className="relative h-full w-full overflow-hidden rounded-xl ring-1 ring-white/20 shadow-glow"
          style={{ width: size, height: size }}
        >
          <img
            src={logoSrc}
            alt="Basirah Infinity — Murtesa Alafi"
            width={size}
            height={size}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            draggable={false}
          />
          {animated && (
            <span
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.6) 50%, transparent 70%)",
                backgroundSize: "250% 100%",
                animation: "shine 3.5s ease-in-out infinite",
                mixBlendMode: "overlay",
              }}
            />
          )}
        </div>
      </div>
      {showWordmark && (
        <div className="flex flex-col leading-tight">
          <span className="font-display text-xl font-extrabold tracking-tight text-foreground transition-colors group-hover:text-neon-cyan">
            BASIRAH INFINITY
          </span>
          <span className="text-[9.5px] font-semibold tracking-[0.25em] text-neon-cyan/90 uppercase">
            OWNER: MURTESA ALAFI
          </span>
        </div>
      )}
    </div>
  );

  if (!asLink) return inner;
  return (
    <Link to="/" aria-label="Basirah Infinity — Home" className="inline-flex">
      {inner}
    </Link>
  );
}
