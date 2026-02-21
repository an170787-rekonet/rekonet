'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Read a cookie by name (fallback if URL param missing)
function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]+)'));
  return m ? decodeURIComponent(m[1]) : null;
}

export default function ResultPage() {
  const sp = useSearchParams();
  const router = useRouter();

  const assessment_id = sp.get('assessment_id') || 'demo';

  // First guess: URL -> cookie -> 'en'
  const cookieLang = typeof document !== 'undefined' ? getCookie('language') : null;
  const clientLang = (sp.get('language') || cookieLang || 'en').toLowerCase();

  // After we fetch, we trust the server's language
  const [serverLang, setServerLang] = useState(clientLang);
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let on = true;
    (async () => {
      setLoading(true);
      setErr('');
      try {
        // IMPORTANT: use a real '&' (not &amp;)
        const url = `/api/assessment/result?assessment_id=${encodeURIComponent(assessment_id)}&language=${encodeURIComponent(clientLang)}`;
        const res = await fetch(url, { cache: 'no-store' });
        const json = await res.json();
        if (!on) return;

        if (res.ok && json) {
          setData(json);
          const lang = (json.language || clientLang || 'en').toLowerCase();
          setServerLang(lang);
        } else {
          setErr(json?.error || 'Could not load results.');
        }
      } catch (e) {
        setErr(String(e?.message || e));
      } finally {
        if (on) setLoading(false);
      }
    })();
    return () => { on = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessment_id, clientLang]);

  function restart() {
    // 🔁 Always forward the language when restarting
    router.push(`/assessment?language=${encodeURIComponent(serverLang)}`);
  }

  if (loading) return <main style={{ padding: 24 }}>Loading…</main>;
  if (err) return <main style={{ padding: 24, color: 'crimson' }}>{err}</main>;
  if (!data) return <main style={{ padding: 24 }}>No results yet.</main>;

  const headline = data?.summary?.headline || 'Your starting point';
  const message  = data?.summary?.message  || 'Based on your answers, here’s a supportive first step to help you move forward.';
  const overall  = data?.levels?.overall;
  const steps    = Array.isArray(data?.flightPath) ? data.flightPath : [];

  return (
    // RTL for Arabic result screen as well
    <main dir={serverLang === 'ar' ? 'rtl' : 'ltr'} style={{ maxWidth: 780, margin: '40px auto', padding: 16 }}>
      <h2>{headline}</h2>
      <p style={{ color: '#475569' }}>{message}</p>

      {overall && (
        <div style={{ marginTop: 16, padding: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <strong>Level:</strong> {overall.tier} ({overall.code})
        </div>
      )}

      {steps.length > 0 && (
        <>
          <h3 style={{ marginTop: 16 }}>Your next steps</h3>
          <ul>
            {steps.map((f, idx) => (
              <li key={idx} style={{ margin: '8px 0' }}>
                <strong>{f.title}</strong><br />
                {f.why && <span style={{ color: '#64748b' }}>{f.why}</span>}<br />
                {f.next && <em>{f.next}</em>}
              </li>
            ))}
          </ul>
        </>
      )}

      <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {/* Continue link if API provided */}
        {Array.isArray(data?.links) && data.links.map((l) => (
          <a key={l.href} href={l.href} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8 }}>
            {l.label}
          </a>
        ))}

        {/* 🔁 Start again: forward language so the next run stays localized */}
        <button
          onClick={restart}
          style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer' }}
        >
          Start again
        </button>

        {/* Optional: direct language change */}
        <a
          href="/assessment/language"
          style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8 }}
        >
          Change language
        </a>
      </div>
    </main>
  );
}
