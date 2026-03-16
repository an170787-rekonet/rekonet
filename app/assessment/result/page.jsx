// app/assessment/result/page.jsx
"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

// Reuse your results components (added in Recovery v11)
import SummaryBand from "../../components/results/SummaryBand";
import GapChips from "../../components/results/GapChips";
import RoleRecommendations from "../../components/results/RoleRecommendations";

// Keep dynamic so we don't prerender with unknown params
export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/* Small local helpers (inlined so this file works standalone)                */
/* -------------------------------------------------------------------------- */

function ProgressBar({ value, max }) {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  return (
    <div
      className="w-full h-2"
      style={{ background: "#e5e7eb", borderRadius: 9999, overflow: "hidden" }}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full"
        style={{
          width: `${pct}%`,
          background: "#22c55e",
          transition: "width 240ms ease",
        }}
      />
    </div>
  );
}

function StepShell({
  stepIndex,
  totalSteps,
  title,
  subtitle,
  children,
  primaryLabel = "Continue",
  onPrimary,
  secondaryLabel,
  onSecondary,
  footer,
  disabled = false,
}) {
  return (
    <section
      aria-label={`Step ${stepIndex + 1} of ${totalSteps}`}
      className="max-w-3xl mx-auto p-4"
    >
      <header className="mb-4">
        <p style={{ color: "#4b5563", fontSize: 14 }}>
          Step {stepIndex + 1} of {totalSteps}
        </p>
        <h2 style={{ fontSize: 24, fontWeight: 600, marginTop: 6 }}>{title}</h2>
        {subtitle && <p style={{ color: "#374151", marginTop: 8 }}>{subtitle}</p>}
      </header>

      <div
        className="shadow-sm"
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 16,
        }}
      >
        {children}
      </div>

      <div className="mt-4" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {onPrimary && (
          <button
            onClick={onPrimary}
            disabled={disabled}
            style={{
              background: "#000",
              color: "#fff",
              borderRadius: 8,
              padding: "10px 16px",
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.6 : 1,
            }}
          >
            {primaryLabel}
          </button>
        )}
        {onSecondary && (
          <button
            onClick={onSecondary}
            style={{
              background: "#fff",
              color: "#111827",
              borderRadius: 8,
              padding: "10px 16px",
              border: "1px solid #d1d5db",
              cursor: "pointer",
            }}
          >
            {secondaryLabel}
          </button>
        )}
      </div>

      {footer && (
        <div className="mt-3" style={{ color: "#4b5563", fontSize: 14 }}>
          {footer}
        </div>
      )}
    </section>
  );
}

function DetailsDisclosure({ title, children }) {
  return (
    <details
      className="max-w-3xl mx-auto"
      style={{
        marginTop: 16,
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 16,
      }}
    >
      <summary className="cursor-pointer" style={{ fontSize: 18, fontWeight: 500 }}>
        {title}
      </summary>
      <div style={{ marginTop: 12 }}>{children}</div>
    </details>
  );
}

function useJourneyProgress(keyBase, initial = 0) {
  const key = `${keyBase || "rekonet_results"}:step`;
  const [step, setStep] = useState(initial);

  useEffect(() => {
    // Restore from localStorage
    try {
      const saved = Number(window.localStorage.getItem(key));
      if (!Number.isNaN(saved) && saved >= 0) setStep(saved);
    } catch (_) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyBase]);

  useEffect(() => {
    // Persist to localStorage
    try {
      window.localStorage.setItem(key, String(step));
    } catch (_) {}
  }, [key, step]);

  return [step, setStep];
}

/* -------------------------------------------------------------------------- */
/* The guided Results flow                                                    */
/* -------------------------------------------------------------------------- */

function ResultsGuidedInner() {
  const sp = useSearchParams();

  // Read assessment id from the URL (support multiple keys)
  const assessmentId = useMemo(() => {
    return (
      sp.get("id") || // primary key
      sp.get("uuid") || // fallback
      sp.get("assessment_id") || // legacy fallback
      sp.get("assessmentId") || // legacy fallback
      ""
    );
  }, [sp]);

  // Read language (default to en)
  const language = useMemo(
    () => (sp.get("language") || sp.get("lang") || "en").toLowerCase(),
    [sp]
  );

  // Persist step progress per assessment to avoid cross‑talk
  const [step, setStep] = useJourneyProgress(
    assessmentId ? `results:${assessmentId}` : "results",
    0
  );

  const totalSteps = 6;

  const next = useCallback(() => setStep((s) => Math.min(totalSteps - 1, s + 1)), [setStep]);
  const back = useCallback(() => setStep((s) => Math.max(0, s - 1)), [setStep]);

  // --- TODO: Replace this with your REAL data mapping ---
  // If you paste your result object shape (or the fetch from ResultView),
  // I’ll patch this to live values (level/score/roles/pathway) in minutes.
  const result = {
    level: "Level 1",
    score: 25, // optional, used only for supportive copy
    goalTitle: "Customer Service Assistant",
    roleSuggestions: [
      { id: "rsa", title: "Retail Assistant" },
      { id: "reception", title: "Reception Assistant" },
    ],
    pathway: [
      {
        id: "p1",
        label: "Add a short ‘Why I like working with people’ example",
        href: "/recorder",
        actionText: "Record (30–60s)",
      },
      {
        id: "p2",
        label: "Show a coordination win",
        href: "/recorder",
        actionText: "Add evidence",
      },
      { id: "p3", label: "ATS CV tune (10 min)", href: "/cv", actionText: "Open" },
    ],
  };

  function roleToJobsUrl(title) {
    const q = encodeURIComponent(title);
    // You already stabilised Indeed UK links earlier; swap this for your helper when ready.
    return `https://uk.indeed.com/jobs?q=${q}&fromage=7&sort=date`;
  }

  const header = (
    <div className="max-w-3xl mx-auto p-4">
      <ProgressBar value={step + 1} max={totalSteps} />
      {assessmentId ? (
        <p style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
          Assessment: {assessmentId} • Language: {language.toUpperCase()}
        </p>
      ) : (
        <p style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
          Language: {language.toUpperCase()}
        </p>
      )}
    </div>
  );

  return (
    <main style={{ background: "#f9fafb", minHeight: "100vh", paddingBottom: 64 }}>
      {header}

      {/* STEP 1 — Affirmation */}
      {step === 0 && (
        <StepShell
          stepIndex={0}
          totalSteps={totalSteps}
          title="You’re doing brilliantly"
          subtitle="You’ve already covered part of the journey. Let’s take the next small step together."
          primaryLabel="Show my next step"
          onPrimary={next}
        >
          <div
            style={{
              borderRadius: 12,
              padding: 16,
              background: "#eff6ff",
              border: "1px solid #dbeafe",
            }}
          >
            <SummaryBand level={result.level} score={result.score} nextId="actions" />
          </div>
        </StepShell>
      )}

      {/* STEP 2 — Micro‑step #1 */}
      {step === 1 && (
        <StepShell
          stepIndex={1}
          totalSteps={totalSteps}
          title="Add a short ‘Why I like working with people’ example"
          subtitle="30–60 seconds is perfect. You’re just showing your people focus."
          primaryLabel="Open recorder"
          onPrimary={() => (window.location.href = "/recorder")}
          secondaryLabel="I’ve added it"
          onSecondary={next}
          footer={
            <span>
              After you add it, click <strong>“I’ve added it”</strong> to move forward.
            </span>
          }
        >
          <GapChips
            id="actions"
            title="Gentle prompts (choose one)"
            items={[
              {
                id: "g1",
                label: "A time you helped a customer or colleague",
                hint: "What did you do? What changed?",
              },
              {
                id: "g2",
                label: "How you listen first, then respond",
                hint: "One sentence is enough.",
              },
              { id: "g3", label: "What you enjoy about people‑facing roles" },
            ]}
          />
        </StepShell>
      )}

      {/* STEP 3 — Micro‑step #2 */}
      {step === 2 && (
        <StepShell
          stepIndex={2}
          totalSteps={totalSteps}
          title="Show a coordination win"
          subtitle="Pick one example where you kept things organised and on time."
          primaryLabel="Add evidence"
          onPrimary={() => (window.location.href = "/recorder")}
          secondaryLabel="I’ve added it"
          onSecondary={next}
          footer={
            <span>
              You can review your clips anytime on{" "}
              <a href="/evidence" style={{ textDecoration: "underline" }}>
                your evidence list
              </a>
              .
            </span>
          }
        >
          <p style={{ color: "#374151", margin: 0 }}>
            Aim for one short example. If you already recorded it, great—mark it done and
            continue.
          </p>
        </StepShell>
      )}

      {/* STEP 4 — Micro‑step #3 (optional CV tune) */}
      {step === 3 && (
        <StepShell
          stepIndex={3}
          totalSteps={totalSteps}
          title="ATS CV tune (10 min)"
          subtitle="Polish a few keywords to align with job descriptions."
          primaryLabel="Open CV tools"
          onPrimary={() => (window.location.href = "/cv")}
          secondaryLabel="Skip for now"
          onSecondary={next}
        >
          <p style={{ color: "#374151", margin: 0 }}>
            This is optional. Even a tiny improvement boosts matches.
          </p>
        </StepShell>
      )}

      {/* STEP 5 — Roles well‑suited right now + Pathway */}
      {step === 4 && (
        <StepShell
          stepIndex={4}
          totalSteps={totalSteps}
          title="You’re on the right track"
          subtitle="Here are roles that fit your CV today—plus a supportive pathway towards your main goal."
          primaryLabel="Continue"
          onPrimary={next}
          secondaryLabel="Back"
          onSecondary={back}
        >
          <div
            style={{
              borderRadius: 12,
              padding: 16,
              background: "#ecfdf5",
              border: "1px solid #d1fae5",
              marginBottom: 16,
            }}
          >
            <RoleRecommendations
              score={result.score}
              goalTitle={result.goalTitle || "your main career goal"}
              currentRoles={result.roleSuggestions}
              pathway={result.pathway}
            />
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {(result.roleSuggestions || []).map((r) => (
              <div
                key={r.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  background: "#fff",
                  padding: 12,
                }}
              >
                <div style={{ fontWeight: 500 }}>{r.title}</div>
                <a
                  href={r.link || roleToJobsUrl(r.title)}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: "underline", fontSize: 14 }}
                >
                  View live roles
                </a>
              </div>
            ))}
          </div>
        </StepShell>
      )}

      {/* STEP 6 — Optional extended insights + Celebrate */}
      {step === 5 && (
        <StepShell
          stepIndex={5}
          totalSteps={totalSteps}
          title="Great work — your next short activity is ready"
          subtitle="You kept a steady pace. Small steps build momentum."
          primaryLabel="Finish for now"
          onPrimary={() => (window.location.href = "/")}
          secondaryLabel="Back"
          onSecondary={back}
        >
          <p style={{ color: "#374151", marginTop: 0, marginBottom: 16 }}>
            If you want, explore these optional sections. You can come back anytime.
          </p>

          <DetailsDisclosure title="CV insights & upload">
            <p style={{ color: "#374151" }}>
              Drop in your CV (PDF/DOC/DOCX) for personalised insights.
            </p>
            <a href="/cv" style={{ textDecoration: "underline" }}>
              Open CV tools
            </a>
          </DetailsDisclosure>

          <DetailsDisclosure title="Availability (working pattern)">
            <p style={{ color: "#374151" }}>
              Set the days and times that suit you best. This helps shape matches.
            </p>
            <a href="/availability" style={{ textDecoration: "underline" }}>
              Open availability form
            </a>
          </DetailsDisclosure>

          <DetailsDisclosure title="External courses & resources">
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              <li>
                <a href="https://alison.com" target="_blank" rel="noreferrer">
                  Alison — free sector‑aligned courses
                </a>
              </li>
              <li>
                <a href="https://www.futurelearn.com" target="_blank" rel="noreferrer">
                  FutureLearn — short career‑building courses
                </a>
              </li>
            </ul>
          </DetailsDisclosure>

          <div
            className="mt-6"
            style={{
              marginTop: 16,
              padding: 16,
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              background: "#fff",
            }}
          >
            <p style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>🎉 You’ve unlocked your next step</p>
            <p style={{ color: "#374151", marginTop: 6 }}>
              When you return, we’ll pick up exactly where you paused.
            </p>
          </div>
        </StepShell>
      )}
    </main>
  );
}

function ResultPageWithSuspense() {
  // Suspense wrapper is required when using useSearchParams in a Client Component
  return (
    <Suspense fallback={<div />}>
      <ResultsGuidedInner />
    </Suspense>
  );
}

export default ResultPageWithSuspense;
``
