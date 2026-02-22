'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { supabase } from '../../../../lib/supabaseClient';

export default function IntStarActivityPage() {
  const sp = useSearchParams();
  const router = useRouter();

  const assessmentId = sp.get('assessment_id') || 'demo';
  const language = (sp.get('language') || 'en').toLowerCase();
  const userIdFromUrl = sp.get('user_id') || '';
  const [userId, setUserId] = useState(userIdFromUrl);
  const [star1, setStar1] = useState('');
  const [star2, setStar2] = useState('');
  const [star3, setStar3] = useState('');
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
    /^[0-9a-f-]{32,}$/i.test(userId) &&
    (star1.trim() || star2.trim() || star3.trim());

  async function handleSave() {
    if (!canSave) {
      setStatus({ kind: 'warn', msg: 'Add your user_id and at least one STAR headline.' });
      return;
    }
    setStatus({ kind: 'busy', msg: 'Saving…' });

    const payload = { star1, star2, star3 };

    let { error } = await supabase
      .from('activity_completions')
      .insert([{ user_id: userId, activity_id: 'int-star-1', details: payload }]);

    if (error && /details/i.test(error.message)) {
      const fallback = await supabase
        .from('activity_completions')
        .insert([{ user_id: userId, activity_id: 'int-star-1' }]);
      if (fallback.error) {
        setStatus({ kind: 'error', msg: fallback.error.message });
        return;
      }
      setStatus({ kind: 'ok', msg: 'Saved (fallback). Redirecting…' });
      router.push(returnUrl);
      return;
    }

    if (error) {
      setStatus({ kind: 'error', msg: error.message });
      return;
    }

    setStatus({ kind: 'ok', msg: 'Saved. Redirecting…' });
    router.push(returnUrl);
  }

  return (
    <main style={{ maxWidth: 720, margin: '40px auto', padding: 16 }}>
      <h2>Create 3 STAR stories</h2>
      <p>Draft short STAR headlines to help with interview answers.</p>

      {!userIdFromUrl && (
        <div style={{ margin: '12px 0', padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
          <label>Your <code>user_id</code> (UUID):</label>
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value.trim())}
            placeholder="paste your user_id"
            style={{ width: '100%', padding: 8, marginTop: 6 }}
          />
        </div>
      )}

      <label>STAR 1</label>
      <input style={{ width: '100%', marginBottom: 8 }} value={star1} onChange={(e) => setStar1(e.target.value)} />

      <label>STAR 2</label>
      <input style={{ width: '100%', marginBottom: 8 }} value={star2} onChange={(e) => setStar2(e.target.value)} />

      <label>STAR 3</label>
      <input style={{ width: '100%', marginBottom: 16 }} value={star3} onChange={(e) => setStar3(e.target.value)} />

      <button
        onClick={handleSave}
        disabled={!canSave || status.kind === 'busy'}
        style={{
          padding: '10px 14px',
          background: canSave ? '#2563EB' : '#9CA3AF',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          cursor: canSave ? 'pointer' : 'not-allowed'
        }}
      >
        {status.kind === 'busy' ? 'Saving…' : 'Save'}
      </button>

      {status.msg && <p style={{ marginTop: 10 }}>{status.msg}</p>}
    </main>
  );
}
