// app/assessment/result/page.jsx
"use client";

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

// Adjust paths if needed to match your repo structure
import SummaryBand from "../../components/results/SummaryBand";
import GapChips from "../../components/results/GapChips";
import RoleRecommendations from "../../components/results/RoleRecommendations";

/**
 * Keep a Suspense boundary around the subtree that calls useSearchParams().
 * This avoids Next.js prerender errors in production builds.
 */
export default function AssessmentResultPage() {
  return (
    <Suspense
      fallback={
        <main className="container">
          <div className="my-8">Loading your result…</div>
        </main>
      }
    >
      <ResultContent />
    </Suspense>
  );
}

function ResultContent() {
  const sp = useSearchParams();
  const router = useRouter();

  // --- Read query params (Update v16 contract) ---
  const qs = useMemo(() => new URLSearchParams(sp?.toString() ?? ""), [sp]);
  const assessmentId = qs.get("id"); // /api/assessment/result?id=... returns { ok:true, result:{...} }
  const language = (qs.get("language") || "en").toLowerCase();
  const openTarget = qs.get("open"); // used to auto-focus sections on return

  // --- Local state ---
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Step 1 scroll feedback
  const [justScrolled, setJustScrolled] = useState(false);
  const [jumpMsg, setJumpMsg] = useState("");

  // Step 2.3 evidence add
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [evMsg, setEvMsg] = useState("");
  const [evBusy, setEvBusy] = useState(false);

  // Step 4: finish for now
  const [finishBusy, setFinishBusy] = useState(false);

  // --- Pathway anchor ref + highlight ---
  const pathwayRef = useRef(null);

  const flashHighlight = useCallback(() => {
    setJustScrolled(true);
    setJumpMsg("Jumped to your pathway");
    setTimeout(() => {
      setJustScrolled(false);
      setJumpMsg("");
    }, 900);
  }, []);

  /**
   * Robust manual scroll that always causes a visible movement:
   *  - compute a target so the heading lands clearly below any sticky UI
   *  - if already near, enforce a small delta so the eye sees motion
   *  - focus the heading and flash an outline briefly (a11y + feedback)
   */
  const scrollToPathway = useCallback(() => {
    const el = pathwayRef.current || document.getElementById("pathway");
    if (!el || typeof window === "undefined") return;

    const OFFSET = 120; // adjust if you have a taller sticky header
    const rect = el.getBoundingClientRect();
    const currentY =
      window.pageYOffset || document.documentElement.scrollTop || 0;
    let targetTop = currentY + rect.top - OFFSET;

    // Ensure visible movement even if already in view
    const MIN_DELTA = 80;
    if (Math.abs(targetTop - currentY) < MIN_DELTA) {
      targetTop = currentY + (rect.top >= 0 ? MIN_DELTA : -MIN_DELTA);
    }

    window.scrollTo({ top: targetTop, behavior: "smooth" });

    // a11y: announce heading, plus visual confirmation
    setTimeout(() => el?.focus?.(), 350);
    flashHighlight();
  }, [flashHighlight]);

  const handleGoToPathway = useCallback(
    (e) => {
      e.preventDefault();
      scrollToPathway();
    },
    [scrollToPathway]
  );

  // --- Step 2.3: add evidence via API ---
  const handleAddEvidence = useCallback(async () => {
    setEvMsg("");
    const url = evidenceUrl.trim();

    if (!url) {
      setEvMsg("Please paste a link to add as evidence.");
      return;
    }
    if (!assessmentId) {
      setEvMsg("Missing assessment id.");
      return;
    }

    try {
      setEvBusy(true);
      const res = await fetch("/api/evidence/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessment_id: assessmentId, url }),
      });
      const json = await res.json();

      if (res.ok && json?.ok) {
        setEvMsg("Added to your evidence — well done!");
        setEvidenceUrl("");
      } else {
        setEvMsg(json?.error || "Sorry — could not add evidence.");
      }
    } catch (e) {
      setEvMsg(String(e?.message || e));
    } finally {
      setEvBusy(false);
    }
  }, [assessmentId, evidenceUrl]);

  // --- Step 4: finish for now → save checkpoint + redirect to /dashboard ---
  const finishForNow = useCallback(async () => {
    if (!assessmentId) return;
    try {
      setFinishBusy(true);
      await fetch("/api/journey/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessment_id: assessmentId,
          step_key: "dashboard",
          payload: { from: "result" },
        }),
      });
      // Redirect regardless to keep UX flowing
      router.push("/dashboard");
    } finally {
      setFinishBusy(false);
    }
  }, [assessmentId, router]);

  // --- Fetch compute-on-read result (kept aligned with your API contract) ---
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        if (!assessmentId) {
          setError("Missing assessment id");
          setLoading(false);
          return;
        }
        setLoading(true);
        const res = await fetch(
          `/api/assessment/result?id=${encodeURIComponent(
            assessmentId
          )}&language=${encodeURIComponent(language)}`
        );
        const json = await res.json();
        if (cancelled) return;

        if (res.ok && json?.ok) {
          setResult(json.result ?? null);
          setError("");
        } else {
          setError(json?.error || "Unable to load result");
        }
      } catch (e) {
        if (!cancelled) setError(String(e?.message || e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [assessmentId, language]);

  // OPTIONAL: when we come back from Availability with ?open=availability,
  // reuse the pathway section as the “hub” anchor for now.
  useEffect(() => {
    if (openTarget === "availability") {
      scrollToPathway();
    }
  }, [openTarget, scrollToPathway]);

  if (loading) {
    return (
      <main className="container">
        <div className="my-8">Loading your result…</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container">
        <div role="alert" className="my-8 text-red-600">
          {error}
        </div>
      </main>
    );
  }

  const pathway = result?.pathway ?? [];

  return (
    <main className="container" style={{ scrollBehavior: "smooth" }}>
      {/* ===== Top summary area ===== */}
      <header className="mb-6">
        <SummaryBand
          level={result?.level}
          score={result?.score}
          goalTitle={result?.goal_title}
          language={language}
        />

        {/* Top actions */}
        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleGoToPathway}
            className="btn btn-primary"
            aria-describedby="pathway"
          >
            View your suggested pathway
          </button>

          {/* tiny live message so you know the handler ran */}
          {jumpMsg ? (
            <span
              className="text-sm"
              style={{ color: "#2563eb", marginLeft: "6px" }}
              aria-live="polite"
            >
              {jumpMsg}
            </span>
          ) : null}

          {/* Step 4: Finish for now */}
          <button
            type="button"
            onClick={finishForNow}
            className="btn btn-outline"
            disabled={finishBusy}
          >
            {finishBusy ? "Saving…" : "Finish for now"}
          </button>
        </div>
      </header>

      {/* ===== “Gaps” / Next-step chips ===== */}
      <section className="mb-8" aria-label="Suggested next steps overview">
        <GapChips result={result} />
      </section>

      {/* ===== Role recommendations ===== */}
      <section className="mb-10" aria-label="Role recommendations">
        <RoleRecommendations items={result?.role_suggestions ?? []} />
      </section>

      {/* ===== Quick evidence add (micro‑win) — Step 2.3 ===== */}
      <section className="mb-6" aria-label="Quick evidence add">
        <h4 className="text-lg font-medium mb-2">Add a quick piece of evidence</h4>
        <p className="text-sm text-gray-600 mb-2">
          Paste a link that shows your progress (a document, portfolio item, or anything you’re proud of).
        </p>
        <div className="flex items-center gap-2">
          <input
            type="url"
            value={evidenceUrl}
            onChange={(e) => setEvidenceUrl(e.target.value)}
            placeholder="https://example.com/my-proof"
            className="border rounded px-3 py-2 w-full max-w-xl"
            aria-label="Evidence link"
          />
          <button
            type="button"
            onClick={handleAddEvidence}
            className="btn btn-secondary"
            disabled={evBusy}
          >
            {evBusy ? "Adding…" : "Add to my evidence"}
          </button>
        </div>
        {evMsg ? <div className="mt-2 text-sm">{evMsg}</div> : null}
      </section>

      {/* ===== Link to Availability (Step 3 entry point) ===== */}
      <div className="mb-10">
        <Link
          href={`/availability?id=${encodeURIComponent(
            assessmentId || ""
          )}&language=${encodeURIComponent(language)}`}
          className="btn btn-outline"
        >
          Set my availability
        </Link>
      </div>

      {/* ===== Pathway section with anchor ===== */}
      <section aria-label="Suggested pathway" className="mb-14">
        <h3
          id="pathway"
          ref={pathwayRef}
          tabIndex={-1}
          className="text-xl font-semibold mb-4"
          style={{
            // brief highlight so movement is clearly noticeable
            outline: justScrolled ? "3px solid #3b82f6" : "none",
            outlineOffset: justScrolled ? "4px" : "0",
            // ensures heading is not hidden behind sticky UI
            scrollMarginTop: "120px",
          }}
        >
          Your suggested pathway
        </h3>

        {Array.isArray(pathway) && pathway.length > 0 ? (
          <div className="space-y-6">
            {pathway.map((band, idx) => (
              <div key={band?.label ?? idx} className="rounded-lg border p-4">
                <h4 className="text-lg font-medium">{band?.label}</h4>
                <ul className="list-disc ml-6 mt-2">
                  {(band?.steps ?? []).map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            We’ll suggest a simple set of actions to help you keep momentum. (No
            wrong answers — just next steps.)
          </p>
        )}
      </section>
    </main>
  );
}
