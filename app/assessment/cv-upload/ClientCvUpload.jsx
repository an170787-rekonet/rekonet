'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ClientCvUpload() {
  const sp = useSearchParams();
  const router = useRouter();

  const assessmentId = sp.get('assessment_id') || 'demo';
  const language = (sp.get('language') || 'en').toLowerCase();
  const user_id = sp.get('user_id') || '';

  const [mode, setMode] = useState('paste'); // 'paste' | 'upload'
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ kind: 'idle', msg: '' });

  const canSubmit = useMemo(() => {
    if (!user_id) return false;
    return mode === 'paste' ? text.trim().length > 0 : !!file;
  }, [mode, text, file, user_id]);

  const returnUrl = useMemo(() => {
    const qs = new URLSearchParams();
    qs.set('assessment_id', assessmentId);
    qs.set('language', language);
    if (user_id) qs.set('user_id', user_id);
    return `/assessment/result?${qs.toString()}`;
  }, [assessmentId, language, user_id]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus({ kind: 'busy', msg: 'Saving…' });

    try {
      let res;
      if (mode === 'paste') {
        res = await fetch('/api/cv/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id,
            language,
            text,
          }),
        });
      } else {
        const fd = new FormData();
        fd.append('user_id', user_id);
        fd.append('language', language);
        fd.append('file', file);
        res = await fetch('/api/cv/parse', {
          method: 'POST',
          body: fd,
        });
      }

      const json = await res.json();

      if (!res.ok) {
        setStatus({ kind: 'error', msg: json?.error || 'Could not parse CV.' });
        return;
      }

      setStatus({ kind: 'ok', msg: 'Saved. Redirecting…' });
      router.push(returnUrl);
    } catch (err) {
      setStatus({ kind: 'error', msg: err?.message || 'Network error' });
    }
  }

  const isRTL = language === 'ar';

  return (
    <main dir={isRTL ? 'rtl' : 'ltr'} style={{ maxWidth: 760, margin: '40px auto', padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Add your CV</h2>
      <p style={{ color: '#444' }}>
        Paste your CV text or upload a file. We’ll extract keywords and sector signals and save them to your profile.
      </p>

      {!user_id && (
        <p style={{ color: 'crimson' }}>
          Missing <code>user_id</code>. Open this page with <code>?user_id=&lt;uuid&gt;</code>.
        </p>
      )}

      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        <button
          onClick={() => setMode('paste')}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #ddd',
            background: mode === 'paste' ? '#E5E7EB' : '#F9FAFB',
            cursor: 'pointer',
          }}
        >
          Paste text
        </button>
        <button
          onClick={() => setMode('upload')}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #ddd',
            background: mode === 'upload' ? '#E5E7EB' : '#F9FAFB',
            cursor: 'pointer',
          }}
        >
          Upload file
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: 8 }}>
        {mode === 'paste' ? (
          <div style={{ display: 'grid', gap: 8 }}>
            <label style={{ fontSize: 13, color: '#555' }}>Paste your CV text here</label>
            <textarea
              rows={10}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste your CV text..."
              style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6 }}
            />
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            <label style={{ fontSize: 13, color: '#555' }}>Upload file (PDF / DOCX / TXT)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt,.rtf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              style={{ padding: 6, border: '1px solid #ddd', borderRadius: 6 }}
            />
            {file && <small style={{ color: '#6B7280' }}>Selected: {file.name}</small>}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit || status.kind === 'busy'}
          style={{
            marginTop: 12,
            padding: '10px 14px',
            background: canSubmit ? '#2563EB' : '#9CA3AF',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
          }}
        >
          {status.kind === 'busy' ? 'Saving…' : 'Save CV'}
        </button>
      </form>

      {status.msg && (
        <p style={{ marginTop: 10, color: status.kind === 'error' ? 'crimson' : '#374151' }}>
          {status.msg}
        </p>
      )}
    </main>
  );
}
