"use client";
import React, { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export const dynamic = "force-dynamic";
// ✅ Real question list (temporary until we load from database)
const QUESTIONS = [
  {
    id: "cv-1",
    category: "cv",
    text: "I feel confident writing the main parts of my CV."
  },
  {
    id: "interview-1",
    category: "interview",
    text: "I feel confident answering common interview questions."
  },
  {
    id: "jobsearch-1",
    category: "jobsearch",
    text: "I know where to look for jobs that suit my skills."
  }
];
// --------------------------------------------------------------
// Guard — keeps the user in the correct assessment flow
// --------------------------------------------------------------
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

// --------------------------------------------------------------
// SimpleQuestions — TEMP single‑question UI with REAL answer saving
// --------------------------------------------------------------
function SimpleQuestions() {
  const sp = useSearchParams();
  const router = useRouter();
  const qs = useMemo(() => new URLSearchParams(sp?.toString() || ""), [sp]);

  const assessment_id = qs.get("assessment_id");
  const language = (qs.get("language") || "en").toLowerCase();

  // TEMP single question with category="confidence"
  const question_id = "q1-confidence";
  const category = "confidence";

  const [score, setScore] = useState("3");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function saveAndContinue() {
    try {
      setBusy(true);
      setErr("");

      // ✅ REAL ANSWER SUBMISSION
      const res = await fetch("/api/assessment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessment_id,
          question_id,
          category,
          score: Number(score)
        })
      });

      const json = await res.json();

      if (!json?.ok) {
        throw new Error(json?.error || "Failed to save answer");
      }

      // ✅ After saving → navigate to results
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
          Quick check‑in
        </h1>
        <p style={{ color: "#374151", marginBottom: 12 }}>
          No wrong answers — this helps us support your next steps.
        </p>

        {/* Question */}
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
              <label
                key={n}
                style={{ display: "flex", gap: 6, alignItems: "center" }}
              >
                <input
                  type="radio"
                  name="q1"
                  value={String(n)}
                  checked={score === String(n)}
                  onChange={(e) => setScore(e.target.value)}
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

        {/* Submit Answer */}
        <button
          type="button"
          onClick={busy ? undefined : saveAndContinue}
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
          {busy ? "Saving…" : "See my next steps"}
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
