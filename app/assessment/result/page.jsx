'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

/** Fallback helper if API is ever unreachable */
function levelFromAvg(avg) {
  const a = Number(avg || 0);
  if (a >= 4.3) return { n: 4, label: 'Job‑Ready' };
  if (a >= 3.5) return { n: 3, label: 'Ready Soon' };
  if (a >= 2.5) return { n: 2, label: 'Building' };
  return { n: 1, label: 'Exploring' };
}

function ResultPageInner() {
  const sp = useSearchParams();
  const assessment_id = sp.get('assessment_id') || 'demo';
  const language = (sp.get('language') || 'en').toLowerCase();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let on = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/assessment/result?assessment_id=${encodeURIComponent(assessment_id)}&language=${encodeURIComponent(language)}`,
          { cache: 'no-store' }
        );
        if (res.ok) {
          const json = await res.json();
          if (!on) return;
          if (json?.ok) {
            setData(json);
            return;
          }
        }
        // Safe fallback demo data (if API not reachable)
        if (on) {
          setData({
            ok: true,
            message: {
              headline: 'Great job — first check‑in complete!',
              body:
                'There are no right or wrong answers. We’ve used your responses to suggest a starting point and a short flight‑path you can try next.',
            },
            overall: 3.2,
            startingPoint: { n: 2, label: 'Building' },
            byCategory: [
              { competency_key: 'cv',        avg_score: 3.0, answered: 2 },
              { competency_key: 'interview', avg_score: 2.6, answered: 1 },
              { competency_key: 'skills',    avg_score: 3.8, answered: 1 },
              { competency_key: 'jobsearch', avg_score: 3.4, answered: 1 },
            ],
            recommendations: [
              {
                competency_key: 'interview',
                level: 2,
                headline: 'Build your STAR foundations',
                description: 'Practice one STAR story today and record a 60‑second answer.',
                resources: [],
              },
              {
                competency_key: 'cv',
                level: 2,
                headline: 'Start with a quick CV win',
                description: 'Use the ATS template and add two quantified bullet points.',
                resources: [],
              },
            ],
          });
        }
      } finally {
        if (on) setLoading(false);
      }
    })();
    return () => {
      on = false;
    };
  }, [assessment_id, language]);

  if (loading) return <main style={{ padding: 24 }}>Loading…</main>;
  if (!data) return null;

  const overall = Number(data.overall ?? 0);
  // Prefer API’s supportive “startingPoint”; fall back to derived
  const startingPoint = data.startingPoint || levelFromAvg(overall);

  return (
    <main style={{ maxWidth: 780, margin: '40px auto', padding: 16 }}>
      {/* Supportive headline and body from API */}
      {data.message ? (
        <>
          <h2>{data.message.headline}</h2>
          <p>{data.message.body}</p>
        </>
      ) : (
        <>
          <h2>Great job — first check‑in complete!</h2>
          <p>
            There are no right or wrong answers here. We’ve suggested a starting point and a short
            flight‑path to try next.
          </p>
        </>
      )}

      {/* Show starting point instead of “skill level” */}
      <p style={{ marginTop: 8 }}>
        <strong>Starting point: {startingPoint.label}</strong> ({overall.toFixed(2)} / 5)
      </p>

      {/* By area */}
      <h3 style={{ marginTop: 20 }}>By area</h3>
      <ul>
        {(data.byCategory || []).map((r) => {
          const l = levelFromAvg(r.avg_score);
          return (
            <li key={r.competency_key}>
              <strong>{r.competency_key}</strong>: {l.label} ({Number(r.avg_score).toFixed(2)})
            </li>
          );
        })}
      </ul>

      {/* First flight‑path */}
      <h3 style={{ marginTop: 20 }}>First flight‑path</h3>
      {(data.recommendations || []).length === 0 ? (
        <p>We’ll add tailored steps here shortly.</p>
      ) : (
        (data.recommendations || []).map((rec) => (
          <section key={rec.competency_key} style={{ marginBottom: 16 }}>
            <h4>
              {rec.competency_key} — {['', 'Exploring', 'Building', 'Ready Soon', 'Job‑Ready'][rec.level]}
            </h4>
            <p>
              <strong>{rec.headline}</strong>: {rec.description}
            </p>
            {rec.resources?.length ? (
              <ul>
                {rec.resources.map((r) => (
                  <li key={r.id}>
                    <a href={r.url} target="_blank" rel="noreferrer">
                      {r.title}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))
      )}

      {/* Footer links fixed */}
      <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
        <Link href="/assessment">Take again</Link>
        <span>·</span>
        <Link href="/assessment/language">Change language</Link>
      </div>
    </main>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<main style={{ padding: 24 }}>Loading…</main>}>
      <ResultPageInner />
    </Suspense>
  );
}
