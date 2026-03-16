// app/assessment/result/page.jsx
"use client";

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Reuse your results components (added in Recovery v11)
import SummaryBand from "../../components/results/SummaryBand";
import GapChips from "../../components/results/GapChips";
import RoleRecommendations from "../../components/results/RoleRecommendations";

// Keep dynamic so we don't prerender with unknown params
export const dynamic = "force-dynamic";

/* ============================================================================
   0) Result fetch + normalization (wire this to your real API)
   ========================================================================== */

//  🔧 Set this to your actual results endpoint.
//  Keep only the one that exists in your app, e.g., ["/api/assessment/result"].
const ENDPOINTS = [
  "/api/assessment/result",
  "/api/results/by-assessment",
  "/api/results",
];

function normalizeResult(raw) {
  const get = (obj, ...keys) =>
    keys.reduce((v, k) => (v == null ? v : v[k]), obj);

  const level =
    raw?.level ??
    get(raw, "result", "level") ??
    get(raw, "summary", "level") ??
    null;

  const score =
    raw?.score ??
    get(raw, "result", "score") ??
    get(raw, "progress", "score") ??
    null;

  const goalTitle =
    raw?.goalTitle ??
    get(raw, "goal", "title") ??
    raw?.targetRole ??
    null;

  const roleSuggestions =
    raw?.roleSuggestions ??
    get(raw, "roles", "current") ??
    get(raw, "roles", "suggested") ??
    [];

  const normalizedRoles = (roleSuggestions || []).map((r, idx) => {
    if (typeof r === "string") return { id: `r${idx}`, title: r };
    return {
      id: r.id ?? `r${idx}`,
      title: r.title ?? r.name ?? "Role",
      link: r.link ?? r.url ?? undefined,
    };
  });

  const pathwayRaw = raw?.pathway ?? raw?.nextSteps ?? raw?.actions ?? [];
  const pathway =
    (pathwayRaw || []).map((p, idx) => {
      if (typeof p === "string") return { id: `p${idx}`, label: p };
      return {
        id: p.id ?? `p${idx}`,
        label: p.label ?? p.title ?? "Next step",
        hint: p.hint,
        href: p.href ?? p.link,
        actionText: p.actionText ?? p.cta ?? undefined,
      };
    }) || [];

  return {
    level,
    score,
    goalTitle,
    roleSuggestions: normalizedRoles,
    pathway,
  };
}

function useResult(assessmentId, language) {
  const [state, setState] = useState({
    loading: true,
    error: null,
    result: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!assessmentId) {
        setState({ loading: false, error: null, result: null });
        return;
      }
      setState((s) => ({ ...s, loading: true, error: null }));

      for (const base of ENDPOINTS) {
        try {
          const url = new URL(base, window.location.origin);
          url.searchParams.set("assessmentId", assessmentId);
          url.searchParams.set("language", language || "en");

          const res = await fetch(url.toString(), {
            method: "GET",
            headers: { "Cache-Control": "no-store" },
          });
          if (!res.ok) continue;

          const data = await res.json();
          const raw = data?.result ?? data;
          const normalized = normalizeResult(raw);

          if (!cancelled) {
            setState({ loading: false, error: null, result: normalized });
          }
          return;
        } catch {
          continue;
        }
      }

      if (!cancelled) {
        setState({
          loading: false,
          error:
            "Could not load results. Please confirm the results API route.",
          result: null,
        });
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [assessmentId, language]);

  return state; // { loading, error, result }
}

/* ============================================================================
   1) Local UI helpers (inline for single-file drop-in)
   ========================================================================== */

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
    try {
      const saved = Number(window.localStorage.getItem(key));
      if (!Number.isNaN(saved) && saved >= 0) setStep(saved);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyBase]);

  useEffect(() => {
    try {
      window.localStorage.setItem(key, String(step));
    } catch {}
  }, [key, step]);

  return [step, setStep];
}

/* ============================================================================
   2) The guided Results flow (now backed by real data via useResult)
   ========================================================================== */

function ResultsGuidedInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Preserve the current query string (e.g., ?language=it)
  const qs = sp.toString();
  const withQS = useCallback(
    (href) => (qs ? `${href}?${qs}` : href),
    [qs]
  );

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

  // Load REAL result for this assessment
  const { loading, error, result } = useResult(assessmentId, language);

  const totalSteps = 6;
  const next = useCallback(
    () => setStep((s) => Math.min(totalSteps - 1, s + 1)),
    [setStep]
  );
  const back = useCallback(() => setStep((s) => Math.max(0, s - 1)), [setStep]);

  function roleToJobsUrl(title) {
    const q = encodeURIComponent(title);
    return `https://uk.indeed.com/jobs?q=${q}&fromage=7&sort=date`;
  }

  // Safer internal navigation that preserves query params:
  const go = useCallback(
    (href) => router.push(withQS(href)),
    [router, withQS]
  );

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

  // Loading + Error states (kept friendly and low-pressure)
  if (loading) {
    return (
      <main style={{ background: "#f9fafb", minHeight: "100vh", paddingBottom: 64 }}>
        {header}
        <section className="max-w-3xl mx-auto p-4">
          <div
            style={{
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <p style={{ color: "#374151", margin: 0 }}>
              Preparing your supportive results… one moment.
            </p>
          </div>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ background: "#f9fafb", minHeight: "100vh", paddingBottom: 64 }}>
        {header}
        <section className="max-w-3xl mx-auto p-4">
          <div
            style={{
              background: "#fff",
              border: "1px solid #fecaca",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <p style={{ color: "#991b1b", marginTop: 0, marginBottom: 8 }}>
              We couldn’t load your results just yet.
            </p>
            <p style={{ color: "#374151", margin: 0 }}>
              Please check the results link or try again. If the issue continues, let us
              know—we’ll sort it quickly.
            </p>
          </div>
        </section>
      </main>
    );
  }

  // If result exists, render the guided journey with REAL values
  const level = result?.level ?? null;
  const score = result?.score ?? null;
  const goalTitle = result?.goalTitle ?? "your main career goal";
  const roleSuggestions = result?.roleSuggestions ?? [];
  const pathway = result?.pathway ?? [];

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
            <SummaryBand level={level} score={score} nextId="actions" />
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
          onPrimary={() => go("/recorder")}
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
          onPrimary={() => go("/recorder")}
          secondaryLabel="I’ve added it"
          onSecondary={next}
          footer={
            <span>
              You can review your clips anytime on{" "}
              <a href={withQS("/evidence")} style={{ textDecoration: "underline" }}>
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
          onPrimary={() => go("/cv")}
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
              score={score}
              goalTitle={goalTitle}
              currentRoles={roleSuggestions}
              pathway={pathway}
            />
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {(roleSuggestions || []).map((r) => (
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
          onPrimary={() => go("/")}
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
            <a href={withQS("/cv")} style={{ textDecoration: "underline" }}>
              Open CV tools
            </a>
          </DetailsDisclosure>

          <DetailsDisclosure title="Availability (working pattern)">
            <p style={{ color: "#374151" }}>
              Set the days and times that suit you best. This helps shape matches.
            </p>
            <a href={withQS("/availability")} style={{ textDecoration: "underline" }}>
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
            <p style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
              🎉 You’ve unlocked your next step
            </p>
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
  return (
    <Suspense fallback={<div />}>
      <ResultsGuidedInner />
    </Suspense>
  );
}

export default ResultPageWithSuspense;
