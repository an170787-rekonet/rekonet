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

// Adjust paths as needed to match your repo
import SummaryBand from "../../components/results/SummaryBand";
import GapChips from "../../components/results/GapChips";
import RoleRecommendations from "../../components/results/RoleRecommendations";

/**
 * Keep a Suspense boundary around any subtree that calls useSearchParams().
 * (Required by Next.js prerendering rules.)
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

  // Read query params
  const qs = useMemo(() => new URLSearchParams(sp?.toString() ?? ""), [sp]);
  const assessmentId = qs.get("id");
  const language = (qs.get("language") || "en").toLowerCase();
  const openTarget = qs.get("open"); // used later by Step 3

  // Local state
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [justScrolled, setJustScrolled] = useState(false);

  // --- Pathway anchor ref ---
  const pathwayRef = useRef(null);

  // Helper to visibly highlight the section momentarily
  const flashHighlight = useCallback(() => {
    setJustScrolled(true);
    // remove highlight after 1s
    setTimeout(() => setJustScrolled(false), 1000);
  }, []);

  // Smooth scroll to pathway; center it for a visible movement
  const handleScrollToPathway = useCallback(() => {
    const el = pathwayRef.current || document.getElementById("pathway");
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    // a11y: move focus to the heading so screen readers announce it
    setTimeout(() => el?.focus?.(), 350);
    flashHighlight();
  }, [flashHighlight]);

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

  // Support deep-linking if later we use &open=pathway
  useEffect(() => {
    if (openTarget === "pathway") {
      handleScrollToPathway();
    }
  }, [openTarget, handleScrollToPathway]);

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

        {/* Single “View your suggested pathway” button (remove duplicates) */}
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={handleScrollToPathway}
            className="btn btn-primary"
            aria-describedby="pathway"
          >
            View your suggested pathway
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

      {/* ===== Pathway section with anchor ===== */}
      <section aria-label="Suggested pathway" className="mb-14">
        <h3
          id="pathway"
          ref={pathwayRef}
          tabIndex={-1}
          className="text-xl font-semibold mb-4"
          style={{
            // visible highlight after scroll to confirm movement
            outline: justScrolled ? "3px solid #3b82f6" : "none",
            outlineOffset: justScrolled ? "4px" : "0",
            // if you have a sticky header, this avoids hiding the heading under it
            scrollMarginTop: "80px",
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
