"use client";
import React, { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export const dynamic = "force-dynamic"; // keep dynamic during stabilisation

function Guard({ children }) {
  const sp = useSearchParams();
  const router = useRouter();
  const qs = useMemo(() => new URLSearchParams(sp?.toString() || ""), [sp]);

  const id = qs.get("assessment_id");
  const lang = qs.get("language");

  if (!id || !lang) {
    if (typeof window !== "undefined") router.replace("/assessment/language");
    return (
      <div style={{ padding: 24 }}>
        Sending you to language selection…
      </div>
    );
  }

  return <>{children}</>;
}

// --- TEMP Questions UI (placeholder so the page isn’t blank) ---
function SimpleQuestions() {
  const sp = useSearchParams();
  const router = useRouter();
  const qs = useMemo(() => new URLSearchParams(sp?.toString() || ""), [sp]);
  const assessment_id = qs.get("assessment_id");
  const language = (qs.get("language") || "en").toLowerCase();

  const [value, setValue] = useState("3");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function continueToResults() {
    try {
      setBusy(true);
      setErr("");

      // OPTIONAL: if you already have an answers API, you can POST here.
      // This keeps it super-simple for now: we just navigate to the results page.
      const nextQs = new URLSearchParams();
      nextQs.set("id", assessment_id);
      nextQs.set("language", language);
      router.push(`/assessment/result?${nextQs.toString()}`);
    } catch (e) {
      setErr(e?.message || "Sorry, something went wrong.");
      setBusy(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#fff" }}>
      <section className="max-w-3xl mx-auto" style={{ padding: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
          Quick check-in
        </h1>
        <p style={{ color: "#374151", marginBottom: 12 }}>
          No wrong answers — this helps us show the right next steps.
        </p>

        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <p style={{ marginBottom: 8 }}>
            How confident do you feel about taking your next small step?
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <label key={n} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input
                  type="radio"
                  name="q1"
                  value={String(n)}
                  checked={value === String(n)}
                  onChange={(e) => setValue(e.target.value)}
                />
                <span>{n}</span>
              </label>
            ))}
          </div>
        </div>

        {err ? (
          <div
            role="alert"
            style={{
              marginBottom: 12,
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #fecaca",
              background: "#fef2f2",
              color: "#991b1b",
            }}
          >
            {err}
          </div>
        ) : null}

        <button
          type="button"
          onClick={busy ? undefined : continueToResults}
          disabled={busy}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #2563eb",
            background: busy ? "#93c5fd" : "#3b82f6",
            color: "#fff",
            cursor: busy ? "not-allowed" : "pointer",
            fontWeight: 600,
          }}
        >
          {busy ? "Working…" : "See my next steps"}
        </button>

        <p style={{ color: "#6b7280", marginTop: 10, fontSize: 12 }}>
          Assessment ID: {assessment_id} • Language: {language}
        </p>
      </section>
    </main>
  );
}

export default function QuestionsPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: 24 }}>
          Loading your questions…
        </div>
      }
    >
      <Guard>
        <SimpleQuestions />
      </Guard>
    </Suspense>
  );
}
