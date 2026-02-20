'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function levelFromAvg(avg) {
  const a = Number(avg || 0);
  if (a >= 4.3) return { n: 4, label: 'Job‑Ready' };
  if (a >= 3.5) return { n: 3, label: 'Ready Soon' };
  if (a >= 2.5) return { n: 2, label: 'Building' };
  return { n: 1, label: 'Exploring' };
}

export default function ResultPage() {
  const sp = useSearchParams();
  const assessment_id = sp.get('assessment_id') || 'demo';
  const language = sp.get('language') || 'en';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/assessment/result?assessment_id=${assessment_id}&language=${language}`);
        if (res.ok) {
          const json = await res.json();
          if (json?.ok) {
            setData(json);
            return;
          }
        }
        // Fallback demo result
        setData({
          overall: 3.2,
          overallLevel: 2,
          byCategory: [
            { competency_key: 'cv', avg_score: 3.0, answered: 2 },
            { competency_key: 'interview', avg_score: 2.6, answered: 1 },
            { competency_key: 'skills', avg_score: 3.8, answered: 1 },
            { competency_key: 'jobsearch', avg_score: 3.4, answered: 1 },
          ],
          recommendations: [
            { competency_key: 'interview', level: 2, headline: 'Build your STAR foundations', description: 'Practice one STAR story today and record a 60‑second answer.', resources: [] },
            { competency_key: 'cv', level: 2, headline: 'Start with a quick CV win', description: 'Use the ATS template and add two quantified bullet points.', resources: [] },
          ],
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [assessment_id, language]);

  if (loading) return <main style={{ padding: 24 }}>Loading…</main>;
  if (!data) return null;

  const overall = data.overall ?? 0;
  const L = levelFromAvg(overall);

  return (
    <main style={{ maxWidth: 780, margin: '40px auto', padding: 16 }}>
      <h2>Your current level</h2>
      <p>
        <strong>{L.label}</strong> ({overall.toFixed ? overall.toFixed(2) : overall} / 5)
      </p>

      <h3>By area</h3>
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

      <h3>First flight‑path</h3>
      {(data.recommendations || []).length === 0 ? (
        <p>We’ll add tailored steps here shortly.</p>
      ) : (
        (data.recommendations || []).map((rec) => (
          <section key={rec.competency_key} style={{ marginBottom: 16 }}>
            <h4>{rec.competency_key} — {['','Exploring','Building','Ready Soon','Job‑Ready'][rec.level]}</h4>
            <p><strong>{rec.headline}</strong>: {rec.description}</p>
            {rec.resources?.length ? (
              <ul>
                {rec.resources.map((r) => (
                  <li key={r.id}><a href={r.url} target="_blank" rel="noreferrer">{r.title}</a></li>
                ))}
              </ul>
            ) : null}
          </section>
        ))
      )}

      <div style={{ marginTop: 16 }}>
        <a href="/assessment">Take again</a> · <a href="/assessment/language">Change language</a>
      </div>
    </main>
  );
}
