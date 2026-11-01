import React from "react";

interface JsonLdProps {
  data: any;
}

/**
 * Injects a valid JSON-LD script tag into the page body/DOM for search engines and AI crawlers.
 * Built with fail-safe error handling to ensure page rendering never fails.
 */
export function JsonLd({ data }: JsonLdProps) {
  if (!data) return null;

  try {
    const raw = typeof data === "string" ? data : JSON.stringify(data);
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: raw,
        }}
      />
    );
  } catch (err) {
    console.warn("Failed to serialize JSON-LD structured data:", err);
    return null;
  }
}

