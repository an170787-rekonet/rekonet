"use client";

import React, { Suspense, useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

// ------------------------------------------------------------
// ✅ Guard: Makes sure assessment_id + language exist
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
    return <div style={{ padding: 24 }}>Sending you to language selection…</div>;
  }

  return <>{children}</>;
}

// ------------------------------------------------------------
// ✅ Fetch questions from Supabase API route
// ------------------------------------------------------------
async function fetchQuestions() {
  const res = await fetch("/api/assessment/questions");
  const json = await res.json();
  return json?.questions || [];
}

// ------------------------------------------------------------
// ✅ Dynamic Question UI Component
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

  // ✅ Load questions on mount
  useEffect(() => {
    (async () => {
      const q = await fetchQuestions();
      setQuestions(q);
    })();
  }, []);

  // ✅ Still loading
  if (!questions.length) {
    return <div style={{ padding: 24 }}>Loading questions…</div>;
  }

  const q = questions[index]; // Current question

  async function saveAnswer() {
    if (!score) {
      setErr("Please select a score.");
      return;
    }

    setErr("");
    setBusy(true);

    try {
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

      // ✅ Next question
      if (index < questions.length - 1) {
        setIndex(index + 1);
        setScore(null);
        setBusy(false);
        return;
      }

      // ✅ Last question → results
      const nextQs = new URLSearchParams();
      nextQs.set("id", assessment_id);
      nextQs.set("language", language);
      router.push(`/assessment/result?${nextQs.toString()}`);

    } catch (e) {
      setErr(e.message || "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#fff" }}>
      <section className="max-w-3xl mx-auto" style={{ padding: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
          Your questions
        </h1>

        {/* Question Card */}
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
          }}
        >
          {busy
            ? "Saving…"
            : index === questions.length - 1
            ? "See results"
            : "Next question"}
        </button>
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
