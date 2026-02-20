'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'French' },
  { code: 'ar', label: 'Arabic' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'so', label: 'Somali' },
  { code: 'ur', label: 'Urdu' },
];

// Simple cookie setter (front-end only; no backend needed yet)
function setCookie(name, value, days = 365) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${d.toUTCString()}; path=/; samesite=Lax`;
}

export default function LanguageSelection() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const choose = async (code) => {
    try {
      setSaving(true);
      setError('');
      // Remember language + show bilingual by default
      setCookie('rekonet_read_lang', code);
      setCookie('rekonet_translation_mode', 'bilingual');

      // Go to assessment start
      router.push('/assessment');
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <main style={{ padding: '40px', maxWidth: '500px', margin: '0 auto' }}>
      <h1>Select Your Preferred Language</h1>
      <p>This helps us show supportive text under English instructions.</p>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {LANGUAGES.map((lang) => (
          <li key={lang.code} style={{ margin: '12px 0' }}>
            <button
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                cursor: 'pointer',
                opacity: saving ? 0.6 : 1,
              }}
              disabled={saving}
              onClick={() => choose(lang.code)}
            >
              {lang.label}
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
