// app/assessment/result/page.jsx
'use client';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import ResultView from './ResultView';

// Keep dynamic so we don't prerender with unknown params
export const dynamic = 'force-dynamic';

function ResultInner() {
  const sp = useSearchParams();

  // Read assessment id from the URL (support multiple keys)
  const assessmentId = useMemo(() => {
    return (
      sp.get('id') ||            // primary key
      sp.get('uuid') ||          // fallback
      sp.get('assessment_id') || // legacy fallback
      sp.get('assessmentId') ||  // legacy fallback
      ''
    );
  }, [sp]);

  // Read language (default to en)
  const language = useMemo(
    () => (sp.get('language') || sp.get('lang') || 'en').toLowerCase(),
    [sp]
  );

  // Render the real results view; we'll enhance ResultView.jsx next
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
