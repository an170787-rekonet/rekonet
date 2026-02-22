'use client';

import { useEffect, useMemo, useState } from 'react';

export default function ResultView({ assessmentId, language, userId = null }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  // Build query string from props
  const qs = useMemo(() => {
    const params = new URLSearchParams();
    params.set('assessment_id', assessmentId || 'demo');
    params.set('language', (language || 'en').toLowerCase());
    if (userId) params.set('user_id', userId);
    return params.toString();
  }, [assessmentId, language, userId]);

  // Fetch the Result API
  useEffect(() => {
    let on = true;
    setLoading(true);
    setErr('');
    (async () => {
      try {
        const res = await fetch(`/api/assessment/result?${qs}`, { cache: 'no-store' });
        const json = await res.json();
        if (!on) return;
        if (res.ok) setData(json);
        else setErr(json?.error || 'Could not load result.');
      } catch (e) {
        if (on) setErr(String(e?.message || e));
      } finally {
        if (on) setLoading(false);
      }
    })();
    return () => { on = false; };
  }, [qs]);

  if (loading) return <main style={{ padding: 24 }}>Loading…</main>;
  if (err) return <main style={{ padding: 24, color: 'crimson' }}>{err}</main>;
  if (!data) return <main style={{ padding: 24 }}>No data.</main>;

  const { summary, reflection, flightPath = [], progress, roleSuggestions } = data || {};
  const p = progress?.value ?? 0;
  const ready = roleSuggestions?.readyNow || [];
  const bridges = roleSuggestions?.bridgeRoles || [];

  return (
    <main style={{ maxWidth: 820, margin: '40px auto', padding: 16 }}>
      {/* Headline & message */}
      <h2 style={{ marginTop: 0 }}>{summary?.headline || 'Your result'}</h2>
      <p style={{ color: '#444', marginTop: 4 }}>{summary?.message}</p>

      {/* Progress bar */}
      <section style={{ margin: '20px 0' }}>
        <label style={{ display: 'block', marginBottom: 8 }}>
          <strong>Progress</strong>
        </label>
        <div style={{ height: 12, background: '#eee', borderRadius: 6, overflow: 'hidden' }}>
          <div
            style={{
              width: `${p}%`,
              height: '100%',
              background: p >= 75 ? '#16a34a' : '#3b82f6',
              transition: 'width 400ms ease'
            }}
          />
        </div>
        <div style={{ fontSize: 12, color: '#444', marginTop: 6 }}>{p}%</div>
        {progress?.nextPrompt && (
          <div style={{ fontSize: 13, color: '#333', marginTop: 6 }}>{progress.nextPrompt}</div>
        )}
      </section>

      {/* Next steps / flight path */}
      <section style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 8 }}>Your next steps</h3>
        <ol>
          {flightPath.map((s, idx) => (
            <li key={idx} style={{ marginBottom: 12 }}>
              <div><strong>{s.title}</strong></div>
              <div style={{ color: '#555' }}>{s.why}</div>
              <div style={{ color: '#333' }}>{s.next}</div>
            </li>
          ))}
        </ol>
      </section>

      {/* Role suggestions */}
      <section style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 8 }}>Suggested roles</h3>

        {ready.length > 0 && (
          <>
            <h4 style={{ color: '#16a34a', marginBottom: 4 }}>Ready now</h4>
            <ul>
              {ready.map((r) => (
                <li key={r.title}>
                  <strong>{r.title}</strong> — {r.why} {typeof r.match === 'number' ? `(${r.match}%)` : ''}
                </li>
              ))}
            </ul>
          </>
        )}

        {bridges.length > 0 && (
          <>
            <h4 style={{ color: '#a16207', margin: '12px 0 4px' }}>Bridge roles (1–2 gaps)</h4>
            <ul>
              {bridges.map((r) => (
                <li key={r.title} style={{ marginBottom: 6 }}>
                  <strong>{r.title}</strong> — {r.why}
                  {Array.isArray(r.gaps) && r.gaps.length > 0 && (
                    <ul style={{ marginTop: 6 }}>
                      {r.gaps.map((g, i) => (
                        <li key={i} style={{ color: '#555' }}>
                          {g.type === 'interview' && <>Interview minimum: {g.key}</>}
                          {g.type === 'level' && <>Overall level: {g.key}</>}
                          {g.type === 'keywords' && <>Keywords: {Array.isArray(g.key) ? g.key.join(', ') : String(g.key)}</>}
                          {g.type === 'certificate' && <>Certificates: {Array.isArray(g.key) ? g.key.join(', ') : String(g.key)}</>}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}

        {ready.length === 0 && bridges.length === 0 && <p>No suggestions yet.</p>}
      </section>

      {/* Reflection / nudge */}
      {reflection && (
        <section style={{ marginTop: 24, paddingTop: 8, borderTop: '1px solid #eee' }}>
          <p style={{ color: '#444' }}>{reflection}</p>
        </section>
      )}
    </main>
  );
}
