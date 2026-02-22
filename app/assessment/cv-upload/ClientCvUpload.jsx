'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ClientCvUpload() {
  const sp = useSearchParams();
  const router = useRouter();

  const assessmentId = sp.get('assessment_id') || 'demo';
  const language = (sp.get('language') || 'en').toLowerCase();
  const user_id = sp.get('user_id') || '';

  const [mode, setMode] = useState('paste');
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
      setStatus({ kind: 'error', msg: err?.message || 'Network error.' });
    }
  }

  const isRTL = language === 'ar';

  return (
    <main dir={isRTL ? 'rtl' : 'ltr'} style={{ maxWidth: 760, margin: '40px auto', padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Add your CV</h2>
      <p style={{ color: '#444' }}>Paste your CV text or upload a file.</p>

      {!user_id && (
        <p style={{ color: 'crimson' }}>This page requires a user_id.</p>
      )}

      <div style={{ display: 'flex', gap: 8, margin: '12px 0' }}>
        <button
          onClick={() => setMode('paste')}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #ddd',
            background: mode === 'paste' ? '#E5E7EB' : '#F9FAFB',
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
          }}
        >
          Upload file
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: 8 }}>
        {mode === 'paste' ? (
          <div style={{ display: 'grid', gap: 8 }}>
            <label>Paste your CV text below:</label>
            <textarea
              rows={10}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste text here…"
              style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6 }}
            />
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            <label>Upload a file:</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt,.rtf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
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
          }}
        >
          {status.kind === 'busy' ? 'Saving…' : 'Save CV'}
        </button>
      </form>

      {status.msg && (
        <p style={{ marginTop: 10 }}>{status.msg}</p>
      )}
    </main>
  );
}
