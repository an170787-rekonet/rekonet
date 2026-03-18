// app/assessment/language/page.jsx
"use client";

import React, { Suspense, useMemo, useState } from "react";
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

  const [busyCode, setBusyCode] = useState(null); // which language is loading
  const [error, setError] = useState("");

  // Keep any existing params (e.g., utm tracking), but we'll overwrite language
  // and ensure assessment_id is set by our API call.
  const baseQs = useMemo(() => {
    const clone = new URLSearchParams(sp?.toString() || "");
    clone.delete("language");
    clone.delete("assessment_id");
    return clone;
  }, [sp]);

  async function startAssessment(langCode) {
    setError("");
    setBusyCode(langCode);

    try {
      // 1) Create a real assessment (rescue step B)
      const res = await fetch("/api/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: langCode.toLowerCase() }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `Failed to create assessment (${res.status})`);
      }

      const { assessment_id } = await res.json();

      if (!assessment_id) {
        throw new Error("No assessment_id returned from /api/assessment");
      }

      // 2) Build the final query string using REAL '&'
      const qs = new URLSearchParams(baseQs);
      qs.set("assessment_id", assessment_id);
      qs.set("language", langCode.toLowerCase());

      // 3) Navigate to questions (rescue step C)
      router.push(`/assessment/questions?${qs.toString()}`);
    } catch (e) {
      console.error(e);
      setError(
        e?.message ||
          "Sorry, we couldn’t start the assessment. Please try again."
      );
      setBusyCode(null);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#fff" }}>
      <section className="max-w-3xl mx-auto p-6">
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
          Select Your Preferred Language
        </h1>
        <p style={{ color: "#374151", marginBottom: 16 }}>
          This helps us show supportive text under English instructions.
        </p>

        {error ? (
          <div
            role="alert"
            style={{
              marginBottom: 16,
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #fecaca",
              background: "#fef2f2",
              color: "#991b1b",
            }}
          >
            {error}
          </div>
        ) : null}

        <ul
          style={{
            display: "grid",
            gap: 10,
            listStyle: "none",
            padding: 0,
            margin: 0,
          }}
        >
          {LANGS.map((l) => {
            const isBusy = busyCode === l.code;
            return (
              <li key={l.code}>
                <button
                  type="button"
                  onClick={() => (isBusy ? null : startAssessment(l.code))}
                  disabled={isBusy}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "12px 14px",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    background: isBusy ? "#e5e7eb" : "#f9fafb",
                    cursor: isBusy ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span>{l.label}</span>
                  <span
                    aria-hidden="true"
                    style={{
                      fontSize: 12,
                      color: "#6b7280",
                      paddingLeft: 10,
                    }}
                  >
                    {isBusy ? "Starting…" : "Start"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}

export default function LanguagePage() {
  // Keep Suspense to satisfy Next app router conventions
  return (
    <Suspense fallback={<div />}>
      <LanguageInner />
    </Suspense>
  );
}
