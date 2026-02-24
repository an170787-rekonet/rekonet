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
    timerRef.current = setTimeout(
      () => setTimeLeft((s) => s - 1),
      1000
    );
    return () => clearTimeout(timerRef.current);
  }, [started, timeLeft]);

  function startTimer() {
    setStarted(true);
    setTimeLeft(DURATION_SEC);
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
      return "Great STAR structure — clear impact/result.";
    }
    if (words.length < MIN_WORDS) {
      return "Add more detail to follow STAR (Situation, Task, Action, Result).";
    }
    return "Good start — now add the impact/result to complete STAR.";
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

  if (loading) return <div className="p-6">Loading…</div>;

  const totalMax = questions.length * MAX_PER_Q;

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  return (
    <section
      dir={dir}
      className="max-w-3xl mx-auto p-6 space-y-6"
    >
      {/* Header Card */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 space-y-3">
        <h1 className="text-2xl font-semibold text-gray-800">
          {t(language, "interview.title")}
        </h1>

        <p className="text-gray-600 text-sm">
          {t(language, "interview.intro")}
        </p>

        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg px-4 py-2 text-sm">
          {t(language, "interview.guidance_en_only")}
        </div>

        {/* Timer */}
        <div className="flex items-center gap-3 pt-2">
          <div className="font-medium text-gray-700">
            Time left:
          </div>
          <div className="font-mono bg-gray-100 px-4 py-1 rounded-md text-gray-800">
            {minutes}:{seconds}
          </div>

          {!started ? (
            <button
              onClick={startTimer}
              className="ml-auto px-4 py-1.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              Start
            </button>
          ) : (
            <button
              onClick={resetTimer}
              className="ml-auto px-4 py-1.5 bg-gray-400 text-white font-medium rounded-lg hover:bg-gray-500"
            >
              Reset
            </button>
          )}
        </div>

        {/* Timer progress bar */}
        <div className="w-full h-2 mt-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            style={{ width: `${(timeLeft / DURATION_SEC) * 100}%` }}
            className={`
              h-full transition-all duration-200
              ${timeLeft < 20 ? "bg-red-500" :
                timeLeft < 40 ? "bg-yellow-400" :
                "bg-blue-600"}
            `}
          />
        </div>
      </div>

      {/* Questions */}
      {questions.map((q, i) => (
        <div
          key={q.id}
          className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 space-y-3"
        >
          <h2 className="text-lg font-semibold text-gray-800">
            Q{i + 1}. {q.question}
          </h2>

          <textarea
            value={answers[q.id] || ""}
            onChange={(e) => handleChange(q.id, e.target.value)}
            className="
              w-full min-h-[120px] p-4 rounded-lg 
              border border-gray-300 
              focus:outline-none focus:ring-2 focus:ring-blue-500 
              text-gray-800 resize-none
            "
            placeholder="Write your answer here (English)…"
          />

          {/* Word count */}
          <div className="text-sm text-gray-500">
            {wordCounts[q.id] || 0} words • Aim for {MIN_WORDS}+ to follow STAR.
          </div>

          {/* Feedback */}
          {feedback[q.id] && (
            <div className="
              bg-green-50 border border-green-200 
              text-green-800 rounded-lg px-4 py-2 text-sm
            ">
              {feedback[q.id]}
            </div>
          )}
        </div>
      ))}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={saving}
        className="
          w-full py-3 rounded-lg 
          bg-blue-600 text-white font-semibold 
          hover:bg-blue-700 disabled:opacity-50
        "
      >
        {t(language, "interview.submit")}
      </button>

      {/* Score */}
      {score !== null && (
        <div className="text-center text-lg font-semibold text-gray-800">
          {t(language, "interview.score")}: {score} / {totalMax}
        </div>
      )}

      {/* Recent attempts */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6">
        <h3 className="text-md font-semibold text-gray-800 mb-2">
          Recent attempts
        </h3>

        {recent.length === 0 ? (
          <div className="text-gray-500">No attempts yet.</div>
        ) : (
          <ul className="list-disc ml-5 text-gray-700 space-y-1">
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
