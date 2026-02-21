'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function QuestionsInner() {
  const sp = useSearchParams();
  const router = useRouter();

  const assessment_id = sp.get('assessment_id') || 'demo';
  const language = (sp.get('language') || 'en').toLowerCase();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [intro, setIntro] = useState('');
  const [scale, setScale] = useState(['Not yet','Rarely','Sometimes','Often','Always']);
  const [items, setItems] = useState([]); // [{id, category, text_en, text_local}]
  const [i, setI] = useState(0);          // current index
  const [saving, setSaving] = useState(false);

  // Load questions
  useEffect(() => {
    let on = true;
    (async () => {
      setLoading(true); setErr('');
      try {
        // Accept old param names; server is resilient (supports both)
        const url = `/api/assessment/questions?assessment_id=${encodeURIComponent(assessment_id)}&language=${encodeURIComponent(language)}`;
        const res = await fetch(url, { cache: 'no-store' });
        const json = await res.json();
        if (!on) return;

        if (json?.ok) {
          // Server now returns categories; flatten to your existing items shape
          const cats = Array.isArray(json.categories) ? json.categories : [];
          const flattened = cats.flatMap(cat =>
            (cat.items || []).map(q => ({
              id: q.id || q.question_id || `${cat.key}-${Math.random().toString(36).slice(2)}`,
              category: cat.key || q.category || 'general',
              text_en: q.prompt || q.text_en || '',
              // If you already store localised text per item, map it here.
              // Otherwise, just mirror English until FR/AR are added.
              text_local: q.text_local || q.prompt || q.text_en || ''
            }))
          );

          setIntro(json.intro || '');
          setScale(Array.isArray(json.scale) ? json.scale : scale);
          setItems(flattened);
          setI(0);
        } else {
          setErr(json?.error || 'Could not load questions.');
        }
      } catch (e) {
        setErr(String(e?.message || e));
      } finally {
        if (on) setLoading(false);
      }
    })();
    return () => { on = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessment_id, language]);

  const current = useMemo(() => items[i] || null, [items, i]);
  const done = i >= items.length;

  // Handle answer selection (1..5)
  const answer = async (score) => {
    if (!current) return;
    setSaving(true);
    try {
      await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessment_id,
          question_id: current.id,
          category: current.category,
          score, // 1..5
          language
        }),
      }).catch(() => null);
    } finally {
      setSaving(false);
      // Next question or go to results
      if (i + 1 < items.length) {
        setI(i + 1);
      } else {
        router.push(`/assessment/result?assessment_id=${encodeURIComponent(assessment_id)}&language=${encodeURIComponent(language)}`);
      }
    }
  };

  if (loading) return <main style={{ padding: 24 }}>Loading…</main>;
  if (err) return <main style={{ padding: 24, color: 'crimson' }}>{err}</main>;
  if (!items.length) return <main style={{ padding: 24 }}>No questions yet.</main>;

  if (done) {
    // In case we render once more while redirecting
    return (
      <main style={{ padding: 24 }}>
        <p>Thanks — finishing up…</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 780, margin: '40px auto', padding: 16 }}>
      <h2>Assessment Questions</h2>
      <p style={{ color: '#444', marginBottom: 16 }}>{intro}</p>

      <p style={{ fontStyle: 'italic' }}>
        <strong>Question {i + 1} of {items.length}</strong>
      </p>

      <section style={{ marginTop: 20, marginBottom: 20 }}>
        <p style={{ fontSize: 18, marginBottom: 8 }}>{current.text_en}</p>
        {language !== 'en' && (
          <p style={{ fontSize: 16, color: '#444', marginTop: 0 }}>{current.text_local}</p>
        )}
      </section>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {scale.map((label, idx) => {
          const score = idx + 1; // 1..5
          return (
            <button
              key={label}
              onClick={() => answer(score)}
              disabled={saving}
              style={{
                padding: '8px 12px',
                border: '1px solid #999',
                background: '#fff',
                cursor: 'pointer'
              }}
              aria-label={`${label} (${score})`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </main>
  );
}

export default function QuestionsPage() {
  return (
    <Suspense fallback={<main style={{ padding: 24 }}>Loading…</main>}>
      <QuestionsInner />
    </Suspense>
  );
}
