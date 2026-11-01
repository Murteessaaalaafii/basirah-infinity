import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/SiteShell";
import { JsonLd } from "@/components/JsonLd";
import { buildRouteSeo, getBreadcrumbSchema, BRAND_NAME, PRIMARY_EMAIL, SITE_URL } from "@/lib/seo";
import { Scale, CheckCircle2, FileText, ArrowLeft, Shield } from "lucide-react";

export const Route = createFileRoute("/terms")({
  head: () =>
    buildRouteSeo({
      title: "Terms of Service — Basirah Infinity | Directed by Murtesa Alafi",
      description:
        "Official terms of service, engagement agreements, intellectual property rights, and service conditions for Basirah Infinity clients and partners.",
      path: "/terms",
      keywords: ["terms of service", "service agreement", "Basirah Infinity terms", "Murtesa Alafi agency terms"],
    }),
  component: TermsPage,
});

function TermsPage() {
  const breadcrumbs = getBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Terms of Service", path: "/terms" },
  ]);

  return (
    <SiteShell>
      <JsonLd data={breadcrumbs} />

      <main className="relative py-20 px-6 max-w-4xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-neon-cyan hover:underline mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
        </Link>

        <div className="flex items-center gap-3 text-neon-cyan mb-3">
          <Scale className="h-6 w-6" />
          <span className="text-xs font-mono tracking-widest uppercase">Legal Agreement & Operations</span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
          Terms of Service
        </h1>
        <p className="mt-3 text-sm text-muted-foreground font-mono">
          Last Updated: November 1, 2026 · Effective Immediately
        </p>

        <div className="mt-12 space-y-10 text-sm leading-relaxed text-muted-foreground border-t border-white/10 pt-8">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-neon-cyan" /> 1. Agreement to Terms
            </h2>
            <p>
              By accessing, browsing, or utilizing the services provided by Basirah Infinity ("we," "our," or "us"), founded and directed by Murtesa Alafi, you agree to be bound by these Terms of Service. If you do not agree to these terms, you should not access or use our platforms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-neon-cyan" /> 2. Scope of Services
            </h2>
            <p>
              Basirah Infinity provides high-tier digital services including but not limited to brand identity architecture, custom web platform development, AI workflow automation, short-form viral video production, and agency partner alliances. The detailed scope, milestones, and deliverables of each project are defined in project proposals or client service agreements.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">3. Intellectual Property Rights</h2>
            <p>
              Upon receipt of full payment for contracted services, the client is granted full ownership and commercial rights to final delivered creative assets (logos, custom web code, marketing content). Basirah Infinity retains the right to display non-confidential project deliverables within its professional portfolio and promotional case studies, unless an explicit non-disclosure agreement (NDA) is executed.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">4. Client Responsibilities & Collaboration</h2>
            <p>
              Clients agree to provide accurate project assets, timely feedback, and necessary credentials required for project execution. Delays in providing necessary feedback or assets may adjust agreed milestone completion timelines.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">5. Payments, Deposits & Refunds</h2>
            <p>
              Custom engagements require an agreed initial deposit prior to kickoff, with remaining payments structured upon milestone approvals. Because our agency delivers custom, labor-intensive creative engineering, completed milestones are non-refundable once approved by the client.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Shield className="h-5 w-5 text-neon-cyan" /> 6. Partner Network Guidelines
            </h2>
            <p>
              Members of the Basirah Infinity Verified Partner Network agree to uphold ethical business standards. Referral commissions (standard 20% on qualified contracts) are disbursed upon contract signing and receipt of client payments.
            </p>
          </section>

          <section className="space-y-3 border-t border-white/10 pt-6">
            <h2 className="text-xl font-bold text-foreground">7. Inquiries & Legal Notices</h2>
            <p>
              For legal inquiries, contract clarifications, or partnership agreements, reach out directly to:
            </p>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-1 font-mono text-xs text-foreground">
              <p>Basirah Infinity — Legal & Executive Operations</p>
              <p>Founder & Director: Murtesa Alafi</p>
              <p>Email: <a href={`mailto:${PRIMARY_EMAIL}`} className="text-neon-cyan underline">{PRIMARY_EMAIL}</a></p>
              <p>Website: <a href={SITE_URL} className="text-neon-cyan underline">{SITE_URL}</a></p>
            </div>
          </section>
        </div>
      </main>
    </SiteShell>
  );
}

