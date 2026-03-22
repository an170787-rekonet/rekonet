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

// ⬇️ Adjust these import paths if your folder structure differs
import SummaryBand from "../../components/results/SummaryBand";
import GapChips from "../../components/results/GapChips";
import RoleRecommendations from "../../components/results/RoleRecommendations";

/**
 * We keep a Suspense boundary around the subtree that uses useSearchParams().
 * This is required by Next.js so production builds don’t fail.
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

  // --- Read query params (stable contract from Update v16) ---
  const qs = useMemo(() => new URLSearchParams(sp?.toString() ?? ""), [sp]);
  const assessmentId = qs.get("id");
  const language = (qs.get("language") || "en").toLowerCase();

  // --- Local state for result payload and UX ---
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [justScrolled, setJustScrolled] = useState(false);

  // --- Step 1: Pathway anchor + visual confirmation ---
  const pathwayRef = useRef(null);

  const flashHighlight = useCallback(() => {
    setJustScrolled(true);
    setTimeout(() => setJustScrolled(false), 900);
  }, []);

  /**
   * Robust manual scroll that always causes a visible movement:
   *  - compute a top target so the heading lands below any sticky UI
   *  - if already near the target, enforce a small delta (so the eye sees motion)
   *  - focus the heading and flash an outline briefly (a11y + feedback)
   */
  const scrollToPathway = useCallback(() => {
    if (typeof window === "undefined") return;
    const el = pathwayRef.current || document.getElementById("pathway");
    if (!el) return;

    const OFFSET = 120; // adjust if your header is taller/shorter
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

    setTimeout(() => el?.focus?.(), 350); // a11y: announce heading
    flashHighlight();
  }, [flashHighlight]);

  const handleGoToPathway = useCallback(
    (e) => {
      e.preventDefault();
      scrollToPathway();
    },
    [scrollToPathway]
  );

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
      {/* ===== Summary ===== */}
      <header className="mb-6">
        <SummaryBand
          level={result?.level}
          score={result?.score}
          goalTitle={result?.goal_title}
          language={language}
        />

        {/* ✅ Single “View your suggested pathway” button (no duplicates) */}
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={handleGoToPathway}
            className="btn btn-primary"
            aria-describedby="pathway"
          >
            View your suggested pathway
          </button>
        </div>
      </header>

      {/* ===== Gaps / Next-step chips ===== */}
      <section className="mb-8" aria-label="Suggested next steps overview">
        <GapChips result={result} />
      </section>

      {/* ===== Role recommendations ===== */}
      <section className="mb-10" aria-label="Role recommendations">
        <RoleRecommendations items={result?.role_suggestions ?? []} />
      </section>

      {/* ===== Pathway (the anchor lives here) ===== */}
      <section aria-label="Suggested pathway" className="mb-14">
        <h3
          id="pathway"
          ref={pathwayRef}
          tabIndex={-1}
          className="text-xl font-semibold mb-4"
          style={{
            outline: justScrolled ? "3px solid #3b82f6" : "none",
            outlineOffset: justScrolled ? "4px" : "0",
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
