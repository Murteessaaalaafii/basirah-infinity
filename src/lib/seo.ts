// ==============================================================================
// Basirah Infinity — Enterprise SEO & Generative Engine Optimization Engine
// Architected for Google, Bing, Perplexity, ChatGPT Search, Gemini & AI Answers
// Directed by Murtesa Alafi · https://basirahinfinity.com
// ==============================================================================

export const SITE_URL = "https://basirahinfinity.com";
export const BRAND_NAME = "Basirah Infinity";
export const FOUNDER_NAME = "Murtesa Alafi";
export const PRIMARY_EMAIL = "basirahinfinity@gmail.com";
export const PRIMARY_PHONE = "+251 708 229 717";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;
export const DEFAULT_LOGO_IMAGE = `${SITE_URL}/logo.jpg`;

export const SOCIAL_PROFILES = [
  "https://www.linkedin.com/in/murteessaa-alaafii",
  "https://www.facebook.com/murteessaa.ilma.alaafii",
];

export interface SeoConfig {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
  type?: "website" | "article" | "profile";
  noIndex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
}

/**
 * Generates standardized, complete meta tags and link elements for TanStack Router routes.
 */
export function buildRouteSeo(config: SeoConfig) {
  const canonicalUrl = `${SITE_URL}${config.path === "/" ? "" : config.path}`;
  const ogImage = config.image || DEFAULT_OG_IMAGE;
  const robotsDirective = config.noIndex
    ? "noindex, nofollow, noarchive"
    : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

  const metaList: Array<Record<string, string>> = [
    { title: config.title },
    { name: "description", content: config.description },
    { name: "robots", content: robotsDirective },
    { name: "googlebot", content: robotsDirective },
    { name: "author", content: FOUNDER_NAME },
    { name: "publisher", content: BRAND_NAME },
    { name: "theme-color", content: "#03060a" },

    // Open Graph
    { property: "og:site_name", content: BRAND_NAME },
    { property: "og:title", content: config.title },
    { property: "og:description", content: config.description },
    { property: "og:url", content: canonicalUrl },
    { property: "og:type", content: config.type || "website" },
    { property: "og:image", content: ogImage },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: `${config.title} — ${BRAND_NAME}` },
    { property: "og:locale", content: "en_US" },

    // Twitter / X Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: config.title },
    { name: "twitter:description", content: config.description },
    { name: "twitter:image", content: ogImage },
    { name: "twitter:creator", content: "@murtesaalafi" },
    { name: "twitter:site", content: "@basirahinfinity" },
  ];

  if (config.keywords && config.keywords.length > 0) {
    metaList.push({ name: "keywords", content: config.keywords.join(", ") });
  }

  if (config.publishedTime) {
    metaList.push({ property: "article:published_time", content: config.publishedTime });
  }

  if (config.modifiedTime) {
    metaList.push({ property: "article:modified_time", content: config.modifiedTime });
  }

  const linksList: Array<Record<string, string>> = [
    { rel: "canonical", href: canonicalUrl },
  ];

  return {
    meta: metaList,
    links: linksList,
  };
}

// ------------------------------------------------------------------------------
// JSON-LD STRUCTURED DATA SCHEMAS (SCHEMA.ORG STANDARDS)
// ------------------------------------------------------------------------------

/**
 * Root Organization Schema
 */
export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: BRAND_NAME,
    alternateName: ["Nexora Digital Studio", "Basirah Digital Studio"],
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      "@id": `${SITE_URL}/#logo`,
      url: DEFAULT_LOGO_IMAGE,
      caption: `${BRAND_NAME} Logo`,
    },
    image: DEFAULT_OG_IMAGE,
    description:
      "Basirah Infinity is an AI-powered creative and digital technology studio founded and directed by Murtesa Alafi. Specializing in branding, web platforms, autonomous AI workflows, and viral content pipelines.",
    founder: {
      "@type": "Person",
      "@id": `${SITE_URL}/#founder`,
      name: FOUNDER_NAME,
      jobTitle: "Founder & Creative Director",
      url: `${SITE_URL}/about`,
      sameAs: SOCIAL_PROFILES,
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Addis Ababa",
      addressCountry: "ET",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: PRIMARY_PHONE,
        contactType: "customer service",
        email: PRIMARY_EMAIL,
        availableLanguage: ["English", "Oromo", "Amharic"],
      },
    ],
    sameAs: SOCIAL_PROFILES,
    knowsAbout: [
      "Artificial Intelligence Systems",
      "Brand Architecture",
      "Web Development",
      "Generative Engine Optimization",
      "Creative Workflows",
    ],
  };
}

/**
 * Founder Person Schema
 */
export function getPersonSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/#founder`,
    name: FOUNDER_NAME,
    url: `${SITE_URL}/about`,
    jobTitle: "Creative Director & AI Systems Architect",
    image: `${SITE_URL}/murtesa-portrait.png`,
    worksFor: {
      "@id": `${SITE_URL}/#organization`,
    },
    sameAs: SOCIAL_PROFILES,
    alumniOf: "Digital Systems & Software Engineering",
    knowsAbout: [
      "AI Workflow Automation",
      "Design Systems",
      "Full-Stack Web Architecture",
      "Brand Engineering",
      "Generative Engine Optimization (GEO)",
    ],
  };
}

/**
 * WebSite Schema
 */
export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: BRAND_NAME,
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    inLanguage: "en-US",
  };
}

/**
 * BreadcrumbList Schema
 */
export function getBreadcrumbSchema(
  items?: Array<{ name: string; path?: string; item?: string }>
) {
  const safeItems = Array.isArray(items) ? items : [];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: safeItems.map((item, index) => {
      const url =
        item.item ||
        (item.path ? `${SITE_URL}${item.path.startsWith("/") ? "" : "/"}${item.path}` : SITE_URL);
      return {
        "@type": "ListItem",
        position: index + 1,
        name: item.name || `Page ${index + 1}`,
        item: url,
      };
    }),
  };
}

/**
 * FAQPage Schema
 */
export function getFaqSchema(
  faqs?: Array<{ question?: string; q?: string; answer?: string; a?: string }>
) {
  const safeFaqs = Array.isArray(faqs) ? faqs : [];
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: safeFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question || faq.q || "",
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer || faq.a || "",
      },
    })),
  };
}

const DEFAULT_SCHEMA_SERVICES = [
  {
    title: "Brand Architecture & Identity",
    description: "Comprehensive visual identity design, logo suites, and typography guidelines.",
    price: "499",
  },
  {
    title: "High-Performance Web Platforms",
    description: "Custom responsive web applications built with React 19, TypeScript, and modern edge architecture.",
    price: "899",
  },
  {
    title: "Autonomous AI & Workflow Systems",
    description: "Custom intelligent agents, automated lead capture pipelines, and CRM automations.",
    price: "1290",
  },
  {
    title: "Social Media & Viral Growth Engine",
    description: "Data-driven organic content strategies, short-form video production, and viral growth systems.",
    price: "399",
  },
  {
    title: "Cinematic Content & Motion Studio",
    description: "High-definition 3D graphics, motion graphic showreels, and cinematic video assets.",
    price: "349",
  },
  {
    title: "Strategic Growth & Enterprise Consulting",
    description: "Direct executive architecture sessions with Murtesa Alafi to scale digital assets.",
    price: "690",
  },
];

/**
 * Services List Schema
 */
export function getServicesSchema(
  services?: Array<{ title?: string; name?: string; description?: string; short?: string; price?: string }>
) {
  const list = Array.isArray(services) && services.length > 0 ? services : DEFAULT_SCHEMA_SERVICES;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: list.map((svc, index) => {
      const title = svc.title || svc.name || "Digital Service";
      const desc = svc.description || svc.short || "Digital service by Basirah Infinity.";
      const rawPrice = svc.price ? String(svc.price).replace(/[^0-9]/g, "") : "999";
      return {
        "@type": "Service",
        position: index + 1,
        name: title,
        description: desc,
        provider: {
          "@id": `${SITE_URL}/#organization`,
        },
        offers: {
          "@type": "Offer",
          price: rawPrice || "999",
          priceCurrency: "USD",
        },
      };
    }),
  };
}

/**
 * SoftwareApplication Schema for Basirah Creative Suite
 */
export function getSoftwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Basirah Creative Suite",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    browserRequirements: "Requires HTML5/WebGL modern web browser",
    description:
      "All-in-one sovereign creative suite combining multi-track NLE video editing, graphics forge, viral reels engine, audio synthesizer, 3D hologram lab, and 100+ miracle UI components.",
    creator: {
      "@id": `${SITE_URL}/#founder`,
    },
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/OnlineOnly",
    },
  };
}

