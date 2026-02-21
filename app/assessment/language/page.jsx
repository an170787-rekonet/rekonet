'use client';

import { useRouter } from 'next/navigation';

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'pt', label: 'Português' },
  { code: 'es', label: 'Español' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'uk', label: 'Українська' },
  { code: 'ar', label: 'العربية' },
];

export default function LanguagePage() {
  const router = useRouter();

  async function select(code) {
    try {
      await fetch('/api/assessment/language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: code }),
      });
    } catch {}
    router.push(`/assessment?language=${encodeURIComponent(code)}`);
  }

  return (
    <main style={{ maxWidth: 640, margin: '40px auto', padding: 16 }}>
      <h1 style={{ marginBottom: 8 }}>Select Your Preferred Language</h1>
      <p style={{ color: '#475569', marginBottom: 16 }}>
        This helps us show supportive text under English instructions.
      </p>

      <div style={{ display: 'grid', gap: 10 }}>
        {LANGS.map((l) => (
          <button
            key={l.code}
            onClick={() => select(l.code)}
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              background: '#f8fafc',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: 16,
            }}
          >
            {l.label}
          </button>
        ))}
      </div>
    </main>
  );
}
