"use client";

import React, { Suspense, useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

// ------------------------------------------------------------
// ✅ Guard — ensures assessment_id + language exist
// ------------------------------------------------------------
function Guard({ children }) {
  const sp = useSearchParams();
  const router = useRouter();
  const qs = useMemo(() => new URLSearchParams(sp?.toString() || ""), [sp]);

  const id = qs.get("assessment_id");
  const lang = qs.get("language");

  if (!id || !lang) {
    if (typeof window !== "undefined") {
      router.replace("/assessment/language");
    }
    return (
      <div style={{ padding: 24 }}>
        Sending you to language selection…
      </div>
    );
  }

  return <>{children}</>;
}

// ------------------------------------------------------------
// ✅ API loader — fetch real questions from Supabase
// ------------------------------------------------------------
async function fetchQuestions() {
  const res = await fetch("/api/assessment/questions");
  const json = await res.json();
  return json?.questions || [];
}

// ------------------------------------------------------------
// ✅ Main Assessment Component (with Progress Bar + Back Button)
// ------------------------------------------------------------
function DynamicQuestions() {
  const sp = useSearchParams();
  const router = useRouter();
  const qs = useMemo(() => new URLSearchParams(sp?.toString() || ""), [sp]);

  const assessment_id = qs.get("assessment_id");
  const language = (qs.get("language") || "en").toLowerCase();

  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // ✅ Load questions
  useEffect(() => {
    (async () => {
      const q = await fetchQuestions();
      setQuestions(q);
    })();
  }, []);

  // ✅ Scroll to top when question changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [index]);

  // ✅ Show loading state
  if (!questions.length) {
    return <div style={{ padding: 24 }}>Loading questions…</div>;
  }

  const q = questions[index];
  const total = questions.length;
  const progress = Math.round(((index + 1) / total) * 100);

  async function saveAnswer() {
    if (!score) {
      setErr("Please select a score.");
      return;
    }

    setErr("");
    setBusy(true);

    try {
      // ✅ Save answer to backend
      const res = await fetch("/api/assessment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessment_id,
          question_id: q.id,
          category: q.category,
          score: Number(score),
        }),
      });

      const json = await res.json();
      if (!json.ok) {
        throw new Error(json.error || "Could not save answer.");
      }

      // ✅ Move forward
      if (index < total - 1) {
        setIndex(index + 1);
        setScore(null);
        setBusy(false);
        return;
      }

      // ✅ Finished → Results
      const nextQs = new URLSearchParams();
      nextQs.set("id", assessment_id);
      nextQs.set("language", language);
      router.push(`/assessment/result?${nextQs.toString()}`);

    } catch (e) {
      setErr(e.message || "Something went wrong.");
      setBusy(false);
    }
  }

  function goBack() {
    if (index === 0) return;
    setIndex(index - 1);
    setScore(null);
    setErr("");
  }

  return (
    <main style={{ minHeight: "100vh", background: "#fff" }}>
      <section className="max-w-3xl mx-auto" style={{ padding: 24 }}>

        {/* ✅ Progress Bar */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              height: 8,
              background: "#e5e7eb",
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "#3b82f6",
                transition: "width 0.3s ease",
              }}
            />
          </div>
          <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
            {index + 1} of {total} questions
          </p>
        </div>

        {/* ✅ Question Card */}
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <p style={{ marginBottom: 12 }}>
            {index + 1}. {q.text}
          </p>

          <div style={{ display: "flex", gap: 12 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <label
                key={n}
                style={{ display: "flex", gap: 6, alignItems: "center" }}
              >
                <input
                  type="radio"
                  name="score"
                  value={n}
                  checked={score === String(n)}
                  onChange={(e) => setScore(e.target.value)}
                />
                <span>{n}</span>
              </label>
            ))}
          </div>
        </div>

        {/* ✅ Error message */}
        {err && (
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
        )}

        {/* ✅ Buttons row */}
        <div style={{ display: "flex", gap: 12 }}>
          {/* Back button */}
          <button
            type="button"
            onClick={index === 0 ? undefined : goBack}
            disabled={index === 0}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              background: index === 0 ? "#f3f4f6" : "#fff",
              color: "#374151",
              cursor: index === 0 ? "not-allowed" : "pointer",
              fontWeight: 500,
            }}
          >
            Back
          </button>

          {/* Next / Save button */}
          <button
            type="button"
            onClick={busy ? undefined : saveAnswer}
            disabled={busy}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #2563eb",
              background: busy ? "#93c5fd" : "#3b82f6",
              color: "#fff",
              cursor: busy ? "not-allowed" : "pointer",
              fontWeight: 600,
              flexGrow: 1,
            }}
          >
            {busy
              ? "Saving…"
              : index === total - 1
              ? "See results"
              : "Next question"}
          </button>
        </div>

      </section>
    </main>
  );
}

// ------------------------------------------------------------
// ✅ Page Wrapper
// ------------------------------------------------------------
export default function QuestionsPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <Guard>
        <DynamicQuestions />
      </Guard>
    </Suspense>
  );
}
