// app/assessment/result/page.jsx
"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import ResultView from "./ResultView";

export default function ResultPage() {
  const sp = useSearchParams();

  // ✅ Read the id exactly as your URL uses it (?id=...)
  const assessmentId = useMemo(() => {
    return (
      sp.get("id") ||             // main key you use in the URL
      sp.get("uuid") ||           // allow fallback if you ever use ?uuid=
      sp.get("assessment_id") ||  // legacy fallback
      sp.get("assessmentId") ||   // legacy fallback
      ""
    );
  }, [sp]);

  const language = useMemo(
    () => (sp.get("language") || sp.get("lang") || "en").toLowerCase(),
    [sp]
  );

  return (
    <Suspense fallback={<div />}>
      <ResultView
        assessmentId={assessmentId}
        language={language}
        // pass other props you already use if needed:
        // goal={...} level={...} city={...} keywords={...}
      />
    </Suspense>
  );
}
