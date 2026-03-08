// app/assessment/result/page.jsx
"use client";

import { Suspense, useMemo } from "react";
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
   * Label overrides
   * We send these down so the UI can use friendlier phrasing.
   * If ResultView already accepts a different prop name (e.g., `labels`, `strings`, `copy`),
   * rename `uiLabels` below to match.
   *
   * You can extend this map for other languages later.
   */
  const uiLabels = useMemo(() => {
    const byLang = {
      en: {
        showGapsButton: "Show next steps",   // <-- replaces "Show my gaps"
        // You can add more overrides here if needed, e.g.:
        // gapsTabTitle: "Next steps",
        // gapsSectionHeading: "Your next steps",
      },
      // Example future translations:
      // es: { showGapsButton: "Ver siguientes pasos" },
      // fr: { showGapsButton: "Voir les prochaines étapes" },
      // pt: { showGapsButton: "Ver próximos passos" },
      // ta: { showGapsButton: "அடுத்த படிகளை காட்டு" },
      // uk: { showGapsButton: "Показати наступні кроки" },
      // ar: { showGapsButton: "اعرض الخطوات التالية" },
    };

    return byLang[language] || byLang.en;
  }, [language]);

  return (
    <ResultView
      assessmentId={assessmentId}
      language={language}
      uiLabels={uiLabels}   // <-- NEW: pass friendly label(s) down
    />
  );
}

export default function Page() {
  // Suspense wrapper is required for useSearchParams in a Client Component
  return (
    <Suspense fallback={<div />}>
      <ResultInner />
    </Suspense>
  );
}
