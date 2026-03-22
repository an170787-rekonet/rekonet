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
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Adjust paths if needed to match your repo
import SummaryBand from "../../components/results/SummaryBand";
import GapChips from "../../components/results/GapChips";
import RoleRecommendations from "../../components/results/RoleRecommendations";

/**
 * Suspense boundary is required because the child uses useSearchParams().
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
  const pathname = usePathname();

  // Read query params (kept consistent with Update v16 contract)
  const qs = useMemo(() => new URLSearchParams(sp?.toString() ?? ""), [sp]);
  const assessmentId = qs.get("id"); // /api/assessment/result?id=... returns { ok:true, result:{...} }
  const language = (qs.get("language") || "en").toLowerCase();

  // Local state
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [justScrolled, setJustScrolled] = useState(false);
  const [jumpMsg, setJumpMsg] = useState("");

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
   * Robust scroll that always causes a visible movement:
   * - compute absolute top for the heading
   * - apply a negative offset (header clearance)
   * - if already in view, force a small delta so the eye sees motion
   */
  const scrollToPathway = useCallback(() => {
    const el = pathwayRef.current || document.getElementById("pathway");
    if (!el || typeof window === "undefined") return;

    const OFFSET = 120; // px; adjust if you have a taller sticky header
    const rect = el.getBoundingClientRect();
    const currentY =
      window.pageYOffset || document.documentElement.scrollTop || 0;
    let targetTop = currentY + rect.top - OFFSET;

    // If already roughly in place, force a little motion so it’s visible
    const MIN_DELTA = 80; // px
    if (Math.abs(targetTop - currentY) < MIN_DELTA) {
      targetTop = currentY + (rect.top >= 0 ? MIN_DELTA : -MIN_DELTA);
    }

    window.scrollTo({ top: targetTop, behavior: "smooth" });

    // a11y focus + visual confirmation
    setTimeout(() => el?.focus?.(), 350);
    flashHighlight();
  }, [flashHighlight]);

  // Button handler
  const handleGoToPathway = useCallback(
    (e) => {
      e.preventDefault();
      // Keep URL clean (no hash); rely on manual scroll for consistent UX
      scrollToPathway();
    },
    [scrollToPathway]
  );

  // Fetch compute-on-read result (kept aligned with Update v16)
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

        {/* ✅ Single “View your suggested pathway” button (no duplicates here) */}
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={handleGoToPathway}
            className="btn btn-primary"
            aria-describedby="pathway"
          >
            View your suggested pathway
          </button>

          {/* Tiny live message so you know the handler ran */}
          {jumpMsg ? (
            <span
              className="text-sm"
              style={{ color: "#2563eb", marginLeft: "6px" }}
              aria-live="polite"
            >
              {jumpMsg}
            </span>
          ) : null}
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
