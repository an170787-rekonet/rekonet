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

// Adjust these import paths to match your repo structure
import SummaryBand from "../../components/results/SummaryBand";
import GapChips from "../../components/results/GapChips";
import RoleRecommendations from "../../components/results/RoleRecommendations";

/**
 * Suspense boundary is required because ResultContent uses useSearchParams().
 * This avoids Next.js prerender build errors. [1](https://oneuptime.com/blog/post/2026-01-24-nextjs-usesearchparams-ssr-issues/view)
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

  // Read query params (kept consistent with Update v16’s contract)
  const qs = useMemo(() => new URLSearchParams(sp?.toString() ?? ""), [sp]);
  const assessmentId = qs.get("id");       // /api/assessment/result?id=… returns { ok:true, result:{…} } [2](https://github.com/vercel/next.js/discussions/61654)
  const language = (qs.get("language") || "en").toLowerCase();

  // Local state
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [justScrolled, setJustScrolled] = useState(false);

  // --- Pathway anchor ref + highlight ---
  const pathwayRef = useRef(null);

  const flashHighlight = useCallback(() => {
    setJustScrolled(true);
    setTimeout(() => setJustScrolled(false), 900);
  }, []);

  const scrollToPathway = useCallback(() => {
    const el = pathwayRef.current || document.getElementById("pathway");
    if (!el) return;
    // JS fallback to ensure a visible movement and focus for a11y
    el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    setTimeout(() => el?.focus?.(), 350);
    flashHighlight();
  }, [flashHighlight]);

  // Button handler — prefer a native hash jump, then JS fallback to ensure visibility
  const handleGoToPathway = useCallback(
    (e) => {
      e.preventDefault();
      // 1) Native anchor navigation (most reliable across containers)
      if (typeof window !== "undefined") {
        // preserve existing querystring; just add #pathway
        const url = new URL(window.location.href);
        url.hash = "pathway";
        window.history.replaceState({}, "", url.toString());
      }
      // 2) Fallback animation & focus (visible confirmation)
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

  // If user loaded with #pathway in the URL, ensure the anchor is focused and highlighted
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#pathway") {
      // Delay slightly to ensure the node is in DOM after render
      setTimeout(() => {
        const el = pathwayRef.current || document.getElementById("pathway");
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus?.();
        flashHighlight();
      }, 150);
    }
  }, [flashHighlight]);

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

        {/* Single “View your suggested pathway” button */}
        <div className="mt-4 flex items-center gap-3">
          <a
            href="#pathway"
            onClick={handleGoToPathway}
            className="btn btn-primary"
            aria-describedby="pathway"
          >
            View your suggested pathway
          </a>
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
            outline: justScrolled ? "3px solid #3b82f6" : "none",
            outlineOffset: justScrolled ? "4px" : "0",
            scrollMarginTop: "80px", // adjust if you have a sticky header
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
