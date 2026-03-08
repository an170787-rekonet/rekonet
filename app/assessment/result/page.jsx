// app/assessment/result/page.jsx
"use client";

import { Suspense, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ResultView from "./ResultView";

// Keep dynamic so we don't prerender with unknown params
export const dynamic = "force-dynamic";

function ResultInner() {
  const sp = useSearchParams();

  // Read assessment id from the URL (support multiple keys)
  const assessmentId = useMemo(() => {
    return (
      sp.get("id") ||            // primary key
      sp.get("uuid") ||          // fallback
      sp.get("assessment_id") || // legacy fallback
      sp.get("assessmentId") ||  // legacy fallback
      ""
    );
  }, [sp]);

  // Read language (default to en)
  const language = useMemo(
    () => (sp.get("language") || sp.get("lang") || "en").toLowerCase(),
    [sp]
  );

  /**
   * TEMPORARY OVERRIDE:
   * Swap any visible "Show my gaps" button text to "Show next steps".
   * This runs after render and retries a few times as the content loads.
   * We can remove this once we change the source label in the component/strings file.
   */
  useEffect(() => {
    const TARGET_OLD = "Show my gaps";
    const TARGET_NEW = "Show next steps";

    const tryReplace = () => {
      let changed = false;
      const candidates = document.querySelectorAll(
        "button, a, [role='button'], .btn, .tab, .chip"
      );
      candidates.forEach((el) => {
        const txt = (el.textContent || "").trim();
        if (txt === TARGET_OLD) {
          el.textContent = TARGET_NEW;
          changed = true;
        }
      });
      return changed;
    };

    // Run immediately, then retry a few times in case content renders later
    if (!tryReplace()) {
      const delays = [100, 300, 700, 1200, 2000];
      const timers = delays.map((ms) => setTimeout(tryReplace, ms));
      return () => timers.forEach(clearTimeout);
    }
  }, [language, assessmentId]);

  return (
    <ResultView
      assessmentId={assessmentId}
      language={language}
    />
  );
}

export default function Page() {
  // Suspense wrapper is required when using useSearchParams in a Client Component
  return (
    <Suspense fallback={<div />}>
      <ResultInner />
    </Suspense>
  );
}
