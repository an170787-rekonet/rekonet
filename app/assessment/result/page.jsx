'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import ResultView from './ResultView';

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
  const userId = useMemo(() => sp.get('user_id') || null, [sp]);

  return <ResultView assessmentId={assessmentId} language={language} userId={userId} />;
}

export default function ResultPage() {
  return (
    <Suspense fallback={<main style={{ padding: 24 }}>Loading…</main>}>
      <ResultInner />
    </Suspense>
  );
}
