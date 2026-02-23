// app/assessment/result/page.jsx
"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import ResultView from "./ResultView";

// Optional but safe: force dynamic so we don't try to prerender with unknown params
export const dynamic = "force-dynamic";

function ResultInner() {
  const sp = useSearchParams();

  // Read the assessment id from the URL. Your working link uses ?id=...
  const assessmentId = useMemo(() => {
    return (
      sp.get("id") ||            // main key you confirmed works
      sp.get("uuid") ||          // fallback if you ever paste ?uuid=
      sp.get("assessment_id") || // legacy fallback
      sp.get("assessmentId") ||  // legacy fallback
      ""
    );
  }, [sp]);

  const language = useMemo(
    () => (sp.get("language") || sp.get("lang") || "en").toLowerCase(),
    [sp]
  );

  // Pass the id and language down to your existing 600+ line ResultView
  return (
    <ResultView
      assessmentId={assessmentId}
      language={language}
    />
  );
}

export default function Page() {
  // ✅ The Suspense wrapper is REQUIRED when using useSearchParams in a Client Component
  return (
    <Suspense fallback={<div />}>
      <ResultInner />
    </Suspense>
  );
}
