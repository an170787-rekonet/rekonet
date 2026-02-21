'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Read a cookie by name
function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]+)'));
  return m ? decodeURIComponent(m[1]) : null;
}

export default function AssessmentStart() {
  const router = useRouter();
  const sp = useSearchParams();

  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  // ✅ Language source of truth: URL → cookie('language') → cookie(legacy) → 'en'
  useEffect(() => {
    const fromUrl = sp.get('language');
    const fromCookieNew = getCookie('language');            // set by /api/assessment/language
    const fromCookieLegacy = getCookie('rekonet_read_lang'); // your older cookie name
    const chosen = (fromUrl || fromCookieNew || fromCookieLegacy || 'en').toLowerCase();
    setLanguage(chosen);
  }, [sp]);

  const start = async () => {
    setLoading(true);
    setErr('');
    try {
      let id = 'demo';

      // Try to create an assessment (works with both old/new response shapes)
      try {
        const res = await fetch('/api/assessment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language }),
        });
        const json = await res.json().catch(() => ({}));

        // New shape we used: { assessmentId, language }
        // Old shape you had: { assessment: { id } }
        if (res.ok && (json?.assessmentId || json?.assessment?.id)) {
          id = json.assessmentId || json.assessment.id;
        }
      } catch {
        // swallow; fall back to 'demo'
      }

      // ✅ IMPORTANT: real '&language=' (not &amp;)
      router.push(
        `/assessment/questions?assessment_id=${encodeURIComponent(id)}&language=${encodeURIComponent(language)}`
      );
    } catch (e) {
      setErr(String(e?.message || e));
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
        Not your language?{' '}
        <Link href="/assessment/language">Change it here</Link>.
      </p>
    </main>
  );
}
