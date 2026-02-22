'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { supabase } from '../../../../lib/supabaseClient';

export default function CvAtsActivityPage() {
  const sp = useSearchParams();
  const router = useRouter();

  const assessmentId = sp.get('assessment_id') || 'demo';
  const language = (sp.get('language') || 'en').toLowerCase();
  const userIdFromUrl = sp.get('user_id') || '';
  const [userId, setUserId] = useState(userIdFromUrl);
  const [status, setStatus] = useState({ kind: 'idle', msg: '' });

  const returnUrl = useMemo(() => {
    const qs = new URLSearchParams();
    qs.set('assessment_id', assessmentId);
    qs.set('language', language);
    if (userId) qs.set('user_id', userId);
    return `/assessment/result?${qs.toString()}`;
  }, [assessmentId, language, userId]);

  const canSave =
    userId &&
    /^[0-9a-f-]{32,}$/i.test(userId); // simple UUID check

  async function handleMarkDone() {
    if (!canSave) {
      setStatus({ kind: 'warn', msg: 'Add your user_id first.' });
      return;
    }
    setStatus({ kind: 'busy', msg: 'Saving…' });

    const { error } = await supabase
      .from('activity_completions')
      .insert([{ user_id: userId, activity_id: 'cv-ats-1' }]);

    if (error) {
      setStatus({ kind: 'error', msg: error.message });
      return;
    }

    setStatus({ kind: 'ok', msg: 'Saved. Redirecting…' });
    router.push(returnUrl);
  }

  return (
    <main style={{ maxWidth: 640, margin: '40px auto', padding: 16 }}>
      <h2>ATS CV tune (10 min)</h2>
      <p>Align your top 5 bullets to a target role. When done, mark this activity complete.</p>

      {!userIdFromUrl && (
        <div style={{ margin: '12px 0', padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
          <label>Your <code>user_id</code> (UUID):</label>
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value.trim())}
            placeholder="paste your user_id"
            style={{ width: '100%', padding: 8, marginTop: 6 }}
          />
          <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>
            Tip: copy it from your Results URL (?user_id=…).
          </div>
        </div>
      )}

      <button
        onClick={handleMarkDone}
        disabled={status.kind === 'busy' || !canSave}
        style={{
          marginTop: 12,
          padding: '10px 14px',
          background: canSave ? '#16a34a' : '#9CA3AF',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          cursor: canSave ? 'pointer' : 'not-allowed'
        }}
      >
        {status.kind === 'busy' ? 'Saving…' : 'Mark as done'}
      </button>

      {status.msg && <p style={{ marginTop: 10 }}>{status.msg}</p>}

      <div style={{ marginTop: 16 }}>
        <a href={returnUrl} style={{ color: '#2563EB', textDecoration: 'none' }}>
          ← Back to your results
        </a>
      </div>
    </main>
  );
}
