import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ChatWidget } from "./ChatWidget";
import siteBg from "@/assets/site-bg.jpg";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen text-foreground">
      <div
        className="pointer-events-none fixed inset-0 -z-20 bg-cover bg-center"
        style={{ backgroundImage: `url(${siteBg})` }}
      />
      <div className="pointer-events-none fixed inset-0 -z-10" style={{ backgroundImage: "var(--bg-overlay)" }} />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-mesh opacity-50" />
      <Header />
      <main>{children}</main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
