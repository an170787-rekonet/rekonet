// app/assessment/language/page.jsx
"use client";

import React, { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";

const LANGS = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "pt", label: "Português" },
  { code: "es", label: "Español" },
  { code: "ta", label: "தமிழ்" },
  { code: "uk", label: "Українська" },
  { code: "ar", label: "العربية" },
];

function LanguageInner() {
  const router = useRouter();
  const sp = useSearchParams();

  // Keep any existing params (e.g., tracking) when we navigate
  const baseQs = useMemo(() => {
    const clone = new URLSearchParams(sp?.toString() || "");
    // We will overwrite the language below anyway:
    clone.delete("language");
    return clone;
  }, [sp]);

  const goto = (langCode) => {
    const qs = new URLSearchParams(baseQs);
    qs.set("language", langCode.toLowerCase());
    // ✅ Go straight to the real questions page (not the demo placeholder)
    router.push(`/assessment/questions?${qs.toString()}`);
  };

  return (
    <main style={{ minHeight: "100vh", background: "#fff" }}>
      <section className="max-w-3xl mx-auto p-6">
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
          Select Your Preferred Language
        </h1>
        <p style={{ color: "#374151", marginBottom: 16 }}>
          This helps us show supportive text under English instructions.
        </p>

        <ul style={{ display: "grid", gap: 10, listStyle: "none", padding: 0, margin: 0 }}>
          {LANGS.map((l) => (
            <li key={l.code}>
              {/* Use a real clickable element that navigates on click */}
              <button
                type="button"
                onClick={() => goto(l.code)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "12px 14px",
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  background: "#f9fafb",
                  cursor: "pointer",
                }}
              >
                {l.label}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default function LanguagePage() {
  // Wrap hooks usage in Suspense to satisfy Next’s requirement
  return (
    <Suspense fallback={<div />}>
      <LanguageInner />
    </Suspense>
  );
}
