"use client";

import { useEffect, useState } from "react";

export default function AssessmentPage() {
  // TODO: replace with a real auth user id once auth is added
  const userId = "demo-user-id";

  const [profile, setProfile] = useState({ preferred_language: "en" });
  const [questions, setQuestions] = useState([]);
  const [optionsByQ, setOptionsByQ] = useState({});
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Get the user's preferred language
        const p = await fetch("/api/assessment/profile")
          .then((r) => r.json())
          .catch(() => null);
        if (p?.preferred_language) setProfile(p);

        // Get questions + options
        const q = await fetch("/api/assessment/questions").then((r) => r.json());
        setQuestions(q.questions || []);
        setOptionsByQ(q.optionsByQ || {});
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function setAnswer(q, value) {
    setAnswers((prev) => ({ ...prev, [q.id]: { question_id: q.id, ...value } }));
  }

  async function submit() {
    try {
      const res = await fetch("/api/assessment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, answers: Object.values(answers) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Submission failed");

      // Redirect to the correct track’s Week 0
      const path = data.recommended_path || "standard";
      window.location.href = `/program/${path}/week-0`;
    } catch (e) {
      alert(e.message);
    }
  }

  if (loading) return <main style={{ padding: 40 }}>Loading…</main>;

  const lang = profile?.preferred_language || "en";

  return (
    <main style={{ padding: 40, maxWidth: 760, margin: "0 auto" }}>
      <h1>Assessment</h1>
      <p>Answer the questions below. We’ll tailor your 90‑day plan.</p>

      {questions.map((q) => {
        const opts = optionsByQ[q.id] || [];
        let translated = null;
        try {
          translated = q.translated ? JSON.parse(q.translated)[lang] : null;
        } catch {
          // ignore JSON parse errors if translated is empty/not valid JSON yet
        }

        return (
          <section
            key={q.id}
            style={{ margin: "24px 0", paddingBottom: 16, borderBottom: "1px solid #eee" }}
          >
            <h3 style={{ marginBottom: 8 }}>{q.question_text}</h3>

            {lang !== "en" && translated && (
              <p style={{ color: "#555", marginTop: 0 }}>{translated}</p>
            )}

            {q.question_type === "multiple_choice" ? (
              <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                {opts.map((o) => (
                  <li key={o.id} style={{ margin: "8px 0" }}>
                    <label style={{ cursor: "pointer" }}>
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        onChange={() => setAnswer(q, { selected_option_id: o.id })}
                        style={{ marginRight: 8 }}
                      />
                      {o.option_text}
                    </label>
                  </li>
                ))}
              </ul>
            ) : (
              <textarea
                rows={3}
                onChange={(e) => setAnswer(q, { free_text_response: e.target.value })}
                placeholder="Type your answer here…"
                style={{ width: "100%", padding: 8, fontSize: 14 }}
              />
            )}
          </section>
        );
      })}

      <button
        onClick={submit}
        style={{
          padding: "12px 18px",
          fontSize: 16,
          borderRadius: 8,
          border: "1px solid #ccc",
        }}
      >
        Submit assessment
      </button>
    </main>
  );
}
