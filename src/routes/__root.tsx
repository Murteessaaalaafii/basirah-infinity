import React, { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import {
  getOrganizationSchema,
  getPersonSchema,
  getWebSiteSchema,
  SITE_URL,
} from "@/lib/seo";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();

  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "An unexpected rendering error occurred.";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        {errorMessage && (
          <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-left font-mono text-xs text-red-300 overflow-auto max-h-36">
            {errorMessage}
          </div>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Basirah Infinity — By Murtesa Alafi | Digital Studio & AI Systems" },
      {
        name: "description",
        content:
          "Basirah Infinity is an AI-powered digital agency founded & owned by Murtesa Alafi. High-impact branding, web platforms, and automated workflow ecosystems.",
      },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { name: "googlebot", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { name: "author", content: "Murtesa Alafi" },
      { name: "publisher", content: "Basirah Infinity" },
      { name: "application-name", content: "Basirah Infinity" },
      { name: "apple-mobile-web-app-title", content: "Basirah" },
      { name: "theme-color", content: "#03060a" },
      { name: "color-scheme", content: "dark light" },

      // Open Graph Metadata
      { property: "og:site_name", content: "Basirah Infinity" },
      { property: "og:title", content: "Basirah Infinity — By Murtesa Alafi" },
      {
        property: "og:description",
        content: "AI-powered branding, high-conversion websites, and automated workflow ecosystems by Murtesa Alafi.",
      },
      { property: "og:url", content: SITE_URL },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_US" },
      { property: "og:image", content: `${SITE_URL}/og-image.jpg` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Basirah Infinity — Directed by Murtesa Alafi" },

      // Twitter / X Card
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@basirahinfinity" },
      { name: "twitter:creator", content: "@murtesaalafi" },
      { name: "twitter:title", content: "Basirah Infinity — By Murtesa Alafi" },
      { name: "twitter:description", content: "AI-powered branding, websites, content & automation by Murtesa Alafi." },
      { name: "twitter:image", content: `${SITE_URL}/og-image.jpg` },

      // Webmaster Tools Verification Meta Tags
      { name: "google-site-verification", content: "GSC_VERIFICATION_PLACEHOLDER_TOKEN" },
      { name: "msvalidate.01", content: "BING_VERIFICATION_PLACEHOLDER_TOKEN" },
    ],
    links: [
      { rel: "canonical", href: SITE_URL },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Manrope:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  let rootSchemaString = "";
  try {
    const rootSchemaGraph = {
      "@context": "https://schema.org",
      "@graph": [
        getOrganizationSchema(),
        getPersonSchema(),
        getWebSiteSchema(),
      ],
    };
    rootSchemaString = JSON.stringify(rootSchemaGraph);
  } catch (e) {
    console.warn("Failed to serialize root schema graph:", e);
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        {rootSchemaString && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: rootSchemaString,
            }}
          />
        )}
        <script dangerouslySetInnerHTML={{ __html: "try{if(localStorage.getItem('theme')==='light')document.documentElement.classList.add('light')}catch(e){}" }} />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  // Lazy-load AuthProvider only on client to avoid SSR issues with Firebase
  const [AuthProvider, setAuthProvider] = useState<React.ComponentType<{ children: React.ReactNode }> | null>(null);

  useEffect(() => {
    import("@/lib/auth").then((mod) => setAuthProvider(() => mod.AuthProvider));
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {AuthProvider ? (
        <AuthProvider>
          <Outlet />
        </AuthProvider>
      ) : (
        <Outlet />
      )}
    </QueryClientProvider>
  );
}
