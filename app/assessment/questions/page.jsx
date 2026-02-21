'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function QuestionsPageInner() {
  const sp = useSearchParams();
  const assessment_id = sp.get('assessment_id') || 'demo';
  const language = sp.get('language') || 'en';

  // TODO: your existing Questions page logic here
  // e.g., fetch questions client-side, render bilingual prompts and the “Not yet → Always” scale, etc.

  return (
    <main style={{ maxWidth: 780, margin: '40px auto', padding: 16 }}>
      <h2>Assessment Questions</h2>
      <p><em>Assessment ID:</em> {assessment_id}</p>
      <p><em>Language:</em> {language}</p>

      {/* Render your question list + scale controls here */}
      {/* ... */}
    </main>
  );
}

export default function QuestionsPage() {
  return (
    <Suspense fallback={<main style={{ padding: 24 }}>Loading…</main>}>
      <QuestionsPageInner />
    </Suspense>
  );
}
