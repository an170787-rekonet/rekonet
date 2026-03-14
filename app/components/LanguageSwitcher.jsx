'use client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useMemo, useCallback } from 'react';

// Languages to show in the switcher. Add/remove as you wish.
const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية', rtl: true },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'pt', label: 'Português' },
  { code: 'it', label: 'Italiano' },
  { code: 'pl', label: 'Polski' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'ru', label: 'Русский' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'ur', label: 'اُردُو' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
];

export default function LanguageSwitcher({ language = 'en' }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const currentCode = (language || 'en').toLowerCase();
  const items = useMemo(() => LANGS, []);

  const onChange = useCallback((e) => {
    const next = e?.target?.value || 'en';
    const q = new URLSearchParams(sp?.toString() || '');
    q.set('language', next);
    router.push(`${pathname}?${q.toString()}`);
  }, [router, pathname, sp]);

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <label htmlFor="lang" style={{ fontSize: 12, color: '#374151' }}>
        Language
      </label>
      <select
        id="lang"
        value={currentCode}
        onChange={onChange}
        style={{
          fontSize: 12,
          padding: '6px 8px',
          borderRadius: 8,
          border: '1px solid #E5E7EB',
          background: '#fff',
          color: '#111827',
        }}
      >
        {items.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}
