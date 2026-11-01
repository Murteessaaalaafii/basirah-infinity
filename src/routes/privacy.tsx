import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/SiteShell";
import { JsonLd } from "@/components/JsonLd";
import { buildRouteSeo, getBreadcrumbSchema, BRAND_NAME, PRIMARY_EMAIL, SITE_URL } from "@/lib/seo";
import { Shield, Lock, FileText, ArrowLeft, Mail } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  head: () =>
    buildRouteSeo({
      title: "Privacy Policy — Basirah Infinity | Directed by Murtesa Alafi",
      description:
        "Learn how Basirah Infinity protects your data, respects your privacy, and safeguards user information across all digital agency platforms and consultation services.",
      path: "/privacy",
      keywords: ["privacy policy", "data protection", "Basirah Infinity privacy", "Murtesa Alafi studio privacy"],
    }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const breadcrumbs = getBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Privacy Policy", path: "/privacy" },
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
          <Shield className="h-6 w-6" />
          <span className="text-xs font-mono tracking-widest uppercase">Privacy & Data Governance</span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-muted-foreground font-mono">
          Last Updated: November 1, 2026 · Effective Immediately
        </p>

        <div className="mt-12 space-y-10 text-sm leading-relaxed text-muted-foreground border-t border-white/10 pt-8">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Lock className="h-5 w-5 text-neon-cyan" /> 1. Commitment to Privacy
            </h2>
            <p>
              Basirah Infinity ("we," "our," or "us"), founded and directed by Murtesa Alafi, operates{" "}
              <a href={SITE_URL} className="text-neon-cyan underline">
                {SITE_URL}
              </a>
              . We are deeply committed to safeguarding the privacy and security of visitors, clients, and partners. This policy outlines our principles regarding the collection, processing, and protection of personal data.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-neon-cyan" /> 2. Information We Collect
            </h2>
            <p>We only collect information necessary to provide high-quality digital services, consultations, and portal accounts:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong>Contact Information:</strong> Name, email address, phone number, and company name when submitting order inquiries, consultation requests, or partner applications.</li>
              <li><strong>Account Credentials:</strong> Email and authentication tokens managed securely via Firebase Authentication when accessing client or partner portals.</li>
              <li><strong>Project Specifications:</strong> Creative briefs, brand assets, technical requirements, and feedback submitted for project execution.</li>
              <li><strong>Technical Metadata:</strong> Anonymized browser information, device type, and session logs to improve site speed and accessibility.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">3. How Information Is Used</h2>
            <p>Personal information is utilized strictly to:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Fulfill design, branding, web engineering, and AI automation contracts.</li>
              <li>Provide direct communication and project milestone updates via our consultation channels.</li>
              <li>Process verified partner commissions and referral tracking.</li>
              <li>Ensure the security, integrity, and performance of our infrastructure.</li>
            </ul>
            <p className="pt-1">
              We never sell, rent, or trade personal information to third-party data brokers or advertisers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">4. Data Security & Storage</h2>
            <p>
              We implement enterprise-grade security protocols, including SSL/TLS encryption for all data in transit, strict Firestore access controls, and sandboxed execution environments. Access to client data is strictly restricted to authorized team personnel under non-disclosure obligations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">5. Cookies & Local Storage</h2>
            <p>
              Our website uses strictly necessary cookies and local storage tokens for user authentication session management and theme preferences. We do not use intrusive third-party cross-site tracking cookies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">6. Your Rights</h2>
            <p>
              Under global data protection standards (including GDPR and CCPA principles), you have the right to request access, correction, or permanent deletion of your personal data held by Basirah Infinity.
            </p>
          </section>

          <section className="space-y-3 border-t border-white/10 pt-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Mail className="h-5 w-5 text-neon-cyan" /> 7. Contact Us
            </h2>
            <p>
              If you have any questions regarding this Privacy Policy or wish to exercise your data rights, please contact our privacy compliance team directly:
            </p>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-1 font-mono text-xs text-foreground">
              <p>Basirah Infinity — Privacy Administration</p>
              <p>Director: Murtesa Alafi</p>
              <p>Email: <a href={`mailto:${PRIMARY_EMAIL}`} className="text-neon-cyan underline">{PRIMARY_EMAIL}</a></p>
              <p>Location: Addis Ababa, Ethiopia · Worldwide</p>
            </div>
          </section>
        </div>
      </main>
    </SiteShell>
  );
}

