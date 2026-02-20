'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Read cookie helper
function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
  return m ? decodeURIComponent(m.pop()) : null;
}

export default function AssessmentStart() {
  const router = useRouter();
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    const saved = getCookie('rekonet_read_lang');
    if (saved) setLanguage(saved);
  }, []);

  const start = async () => {
    setLoading(true); setErr('');
    try {
      // Try to create an assessment (if API exists). If not, fall back to demo id.
      let id = 'demo';
      try {
        const res = await fetch('/api/assessment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language })
        });
        const json = await res.json();
        if (res.ok && json?.assessment?.id) id = json.assessment.id;
      } catch (_) { /* silent fallback */ }

      router.push(`/assessment/questions?assessment_id=${id}&language=${language}`);
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 680, margin: '40px auto', padding: 16 }}>
      <h1>Employability Assessment</h1>
      <p>We’ll show English first and your selected language underneath each question.</p>

      <div style={{ marginTop: 16 }}>
        <button onClick={start} disabled={loading}>
          {loading ? 'Starting…' : 'Start'}
        </button>
      </div>

      {err && <p style={{ color: 'crimson' }}>{err}</p>}

      <p style={{ marginTop: 12 }}>
        Not your language? Go to <a href="/assessment/language">Language</a>.
      </p>
    </main>
  );
}
