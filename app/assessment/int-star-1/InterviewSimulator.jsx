"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { t, dirFor } from "../../../lib/i18n/t";

const DURATION_SEC = 90;
const MIN_WORDS = 20;
const MAX_PER_Q = 6;

export default function InterviewSimulator({ assessmentId, language = "en-GB" }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [feedback, setFeedback] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DURATION_SEC);
  const timerRef = useRef(null);

  const [recent, setRecent] = useState([]);

  const dir = dirFor(language);

  useEffect(() => {
    async function load() {
      const q = await fetch("/api/interview/questions");
      const jq = await q.json();
      if (jq.ok) setQuestions(jq.data || []);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    loadAttempts();
  }, [assessmentId]);

  async function loadAttempts() {
    if (!assessmentId) return;
    const r = await fetch(
      `/api/interview/attempt?assessment_id=${encodeURIComponent(
        assessmentId
      )}&limit=3`,
      { cache: "no-store" }
    );
    const j = await r.json();
    if (j?.ok) setRecent(j.data || []);
  }

  useEffect(() => {
    if (!started) return;
    if (timeLeft <= 0) return;
    timerRef.current = setTimeout(() => {
      setTimeLeft((s) => s - 1);
    }, 1000);
    return () => clearTimeout(timerRef.current);
  }, [started, timeLeft]);

  function startTimer() {
    if (!started) {
      setStarted(true);
      setTimeLeft(DURATION_SEC);
    }
  }

  function resetTimer() {
    setStarted(false);
    setTimeLeft(DURATION_SEC);
    clearTimeout(timerRef.current);
  }

  function handleChange(qid, text) {
    setAnswers((prev) => ({ ...prev, [qid]: text }));
  }

  const wordCounts = useMemo(() => {
    const wc = {};
    for (const q of questions) {
      const text = answers[q.id] || "";
      wc[q.id] = text.trim() ? text.trim().split(/\s+/).length : 0;
    }
    return wc;
  }, [questions, answers]);

  function makeFeedback(text = "") {
    const words = text.trim().split(/\s+/).filter(Boolean);
    const hasResult = /result|outcome|impact|because|so that|\d/.test(
      text.toLowerCase()
    );

    if (words.length >= MIN_WORDS && hasResult) {
      return "Good structure — clear impact/result.";
    }
    if (words.length < MIN_WORDS) {
      return "Add more detail (Situation, Task, Action, Result).";
    }
    return "Add the result/impact to complete STAR.";
  }

  async function handleSubmit() {
    setSaving(true);
    resetTimer();

    let total = 0;
    const fb = {};

    for (let q of questions) {
      const text = answers[q.id] || "";
      const words = wordCounts[q.id] || 0;
      const hasSTAR = words >= MIN_WORDS;
      const thisScore = hasSTAR ? MAX_PER_Q : 2;

      total += thisScore;
      fb[q.id] = makeFeedback(text);

      await fetch("/api/interview/attempt", {
        method: "POST",
        body: JSON.stringify({
          assessment_id: assessmentId,
          question_id: q.id,
          answer: text,
          score: thisScore,
        }),
      });
    }

    setFeedback(fb);
    setScore(total);
    await loadAttempts();
    setSaving(false);
  }

  if (loading) return <div>Loading…</div>;

  const totalMax = questions.length * MAX_PER_Q;

  return (
    <section dir={dir} style={{ padding: 12 }}>
      <h2>Interview Simulator</h2>

      <p>Use the STAR method when answering. Aim for {MIN_WORDS}+ words.</p>

      {/* Timer */}
      <div
        style={{
          display: "flex",
          gap: 10,
          padding: "8px 10px",
          borderRadius: 8,
          border: "1px solid #ddd",
          marginBottom: 10,
        }}
      >
        <strong>Time left:</strong>
        <span>
          {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
          {String(timeLeft % 60).padStart(2, "0")}
        </span>

        {!started ? (
          <button onClick={startTimer}>Start</button>
        ) : (
          <button onClick={resetTimer}>Reset</button>
        )}
      </div>

      {/* Questions */}
      {questions.map((q, i) => (
        <div key={q.id} style={{ marginTop: 16 }}>
          <strong>{`Q${i + 1}. ${q.question}`}</strong>

          <textarea
            style={{
              width: "100%",
              minHeight: 120,
              marginTop: 6,
              padding: 10,
              borderRadius: 6,
              border: "1px solid #ddd",
            }}
            value={answers[q.id] || ""}
            onChange={(e) => handleChange(q.id, e.target.value)}
          />

          <div style={{ marginTop: 6, color: "#555" }}>
            {wordCounts[q.id] || 0} words • Aim for {MIN_WORDS}+
          </div>

          {feedback[q.id] && (
            <div
              style={{
                marginTop: 6,
                padding: "6px 8px",
                background: "#DCFCE7",
                border: "1px solid #86EFAC",
                borderRadius: 6,
              }}
            >
              {feedback[q.id]}
            </div>
          )}
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={saving}
        style={{
          marginTop: 20,
          padding: "10px 14px",
          background: "#2563EB",
          color: "#fff",
          borderRadius: 8,
          fontWeight: 600,
        }}
      >
        Submit answers
      </button>

      {score !== null && (
        <div style={{ marginTop: 12, fontWeight: 700 }}>
          Total score: {score} / {totalMax}
        </div>
      )}

      {/* Recent attempts */}
      <div style={{ marginTop: 20 }}>
        <h4>Recent attempts</h4>
        {recent.length === 0 ? (
          <div style={{ color: "#999" }}>No attempts yet.</div>
        ) : (
          <ul>
            {recent.map((a) => (
              <li key={a.id}>
                {new Date(a.created_at).toLocaleString()} — score {a.score}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
