import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";
import showreel from "@/assets/showreel.mp4.asset.json";

interface Props {
  label?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function ShowreelModal({
  label = "Watch Showreel",
  variant = "outline",
  size = "lg",
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <PlayCircle className="h-4 w-4" /> {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="liquid-glass max-w-4xl border-white/10 bg-background/80 p-2 sm:p-3">
        <DialogTitle className="sr-only">Murtesa Alafi Website Showreel</DialogTitle>
        <div className="relative overflow-hidden rounded-2xl">
          <video
            src={(showreel as { url: string }).url}
            controls
            autoPlay
            playsInline
            className="aspect-video w-full bg-black"
          />
        </div>
        <p className="px-2 pb-2 pt-1 text-center text-[11px] tracking-[0.3em] text-neon-cyan">
          MURTESA ALAFI · NEXT ERA OF DIGITAL GROWTH
        </p>
      </DialogContent>
    </Dialog>
  );
}
