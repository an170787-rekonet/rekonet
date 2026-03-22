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

// Reuse your results components (adjust import paths to match your repo structure)
import SummaryBand from "../../components/results/SummaryBand";
import GapChips from "../../components/results/GapChips";
import RoleRecommendations from "../../components/results/RoleRecommendations";
// If you also have a consolidated ResultView component, you can import and render it later.
// import ResultView from "./components/ResultView";

/**
 * BUILD FIX:
 * Next.js requires a Suspense boundary around any subtree that calls useSearchParams().
 * We render <ResultContent/> (which uses useSearchParams) inside <Suspense> here,
 * per the official guidance, to avoid the prerendering error.  [1](https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout)
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
  const assessmentId = qs.get("id"); // results route accepts id=…  [4](https://maximusunitedkingdom-my.sharepoint.com/personal/ashley_neerohoo_maximusuk_co_uk/_layouts/15/Doc.aspx?sourcedoc=%7B5FEB9156-253A-4354-B13E-1F1130085B29%7D&file=Rekonet_Recovery_Update_v16_2026-03-21.docx&action=default&mobileredirect=true)
  const language = (qs.get("language") || "en").toLowerCase();
  const openTarget = qs.get("open"); // used later (Step 3) to open availability  [3](https://maximusunitedkingdom-my.sharepoint.com/personal/ashley_neerohoo_maximusuk_co_uk/_layouts/15/Doc.aspx?sourcedoc=%7B1E900587-7789-4AA7-B9EE-F5179EE4F487%7D&file=Rekonet_Recovery_Pause_v19_2026-03-21.docx&action=default&mobileredirect=true)

  // Local result state
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // --- Step 1: Pathway anchor ref for smooth scroll ---
  const pathwayRef = useRef(null);

  const handleScrollToPathway = useCallback(() => {
    pathwayRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    // a11y: focus after scroll so screen readers announce the section
    setTimeout(() => pathwayRef.current?.focus?.(), 350);
  }, []);

  // Fetch compute-on-read result (kept aligned with Update v16 shape)
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
          setResult(json.result ?? null); // { level, score, goal_title, role_suggestions, pathway, ... }
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

  // Optional: if later you navigate back with &open=pathway, auto-scroll to the anchor
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
    <main className="container">
      {/* ===== Top summary area ===== */}
      <header className="mb-6">
        <SummaryBand
          level={result?.level}
          score={result?.score}
          goalTitle={result?.goal_title}
          language={language}
        />

        {/* --- NEW (Step 1): Button that scrolls to the pathway anchor --- */}
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

      {/* If you use a consolidated ResultView component, you can render it here */}
      {/* <ResultView result={result} /> */}
    </main>
  );
}
