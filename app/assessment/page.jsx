'use client';
export const dynamic = 'force-dynamic';
import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

// ---- Inner component (can use useSearchParams safely) ----
function ResultInner() {
  const sp = useSearchParams();

  // Read params safely on client
  const assessmentId = useMemo(
    () => sp.get('assessment_id') || sp.get('assessmentId') || 'demo',
    [sp]
  );
  const language = useMemo(
    () => (sp.get('language') || sp.get('lang') || 'en').toLowerCase(),
    [sp]
  );

  // You likely already fetch your API elsewhere in your Result UI.
  // If you render a client Result component here, keep it:
  // <ResultView assessmentId={assessmentId} language={language} />
  // For now, keep a tiny placeholder so the page compiles:
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

// ---- Page export wrapped with Suspense (required) ----
export default function ResultPage() {
  return (
    <Suspense fallback={<main style={{ padding: 24 }}>Loading…</main>}>
      <ResultInner />
    </Suspense>
  );
}
