'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

function ResultInner() {
  const sp = useSearchParams();

  const assessmentId = useMemo(
    () => sp.get('assessment_id') || sp.get('assessmentId') || 'demo',
    [sp]
  );
  const language = useMemo(
    () => (sp.get('language') || sp.get('lang') || 'en').toLowerCase(),
    [sp]
  );

  // TODO: render your actual Result component here, e.g.
  // return <ResultView assessmentId={assessmentId} language={language} />;

  return (
    <main style={{ maxWidth: 780, margin: '40px auto', padding: 16 }}>
      <h2>Assessment Result</h2>
      <p style={{ color: '#444' }}>
        Loading your result for <strong>{assessmentId}</strong> in{' '}
        <strong>{language.toUpperCase()}</strong>…
      </p>
    </main>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<main style={{ padding: 24 }}>Loading…</main>}>
      <ResultInner />
    </Suspense>
  );
}
