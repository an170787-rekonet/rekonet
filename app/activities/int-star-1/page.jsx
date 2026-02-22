'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { supabase } from '../../../lib/supabaseClient';

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
    (star1.trim().length > 0 || star2.trim().length > 0 || star3.trim().length > 0);

  async function handleSave() {
    if (!canSave) {
      setStatus({ kind: 'warn', msg: 'Add your user_id and at least one STAR headline.' });
      return;
    }
    setStatus({ kind: 'busy', msg: 'Saving…' });

    const payload = {
      star1: star1.trim(),
      star2: star2.trim(),
      star3: star3.trim(),
    };

    let { error } = await supabase
      .from('activity_completions')
      .insert([{ user_id: userId, activity_id: 'int-star-1', details: payload }]);

    if (error && /details/i.test(error.message || '')) {
      // Fallback if details column doesn't exist yet
      const fallback = await supabase
        .from('activity_completions')
        .insert([{ user_id: userId, activity_id: 'int-star-1' }]);
      if (fallback.error) {
        setStatus({ kind: 'error', msg: fallback.error.message || 'Could not save.' });
        return;
      }
      setStatus({ kind: 'ok', msg: 'Saved (fallback). Redirecting…' });
      router.push(returnUrl);
      return;
    }

    if (error) {
      setStatus({ kind: 'error', msg: error.message || 'Could not save.' });
      return;
    }

    setStatus({ kind: 'ok', msg: 'Saved. Redirecting…' });
    router.push(returnUrl);
  }

  const isRTL = language === 'ar';

  return (
    <main dir={isRTL ? 'rtl' : 'ltr'} style={{ maxWidth: 720, margin: '40px auto', padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Create 3 STAR stories</h2>
      <p style={{ color: '#444' }}>
        Draft short STAR headlines to practice “Situation, Task, Action, Result”.
      </p>

      {!userIdFromUrl && (
        <div style={{ margin: '12px 0', padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
          <label style={{ display: 'block', fontSize: 13, color: '#555', marginBottom: 6 }}>
            Your <code>user_id</code> (UUID):
          </label>
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value.trim())}
            placeholder="paste your user_id"
            style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
          />
          <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>
            Tip: open your Results page URL and copy the <code>user_id</code> from there.
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: 12 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, color: '#555', marginBottom: 6 }}>
            STAR 1
          </label>
          <input
            value={star1}
            onChange={(e) => setStar1(e.target.value)}
            placeholder="E.g., calmed an upset customer and resolved the issue same-day"
            style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6 }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, color: '#555', marginBottom: 6 }}>
            STAR 2
          </label>
          <input
            value={star2}
            onChange={(e) => setStar2(e.target.value)}
            placeholder="E.g., reorganized files to cut retrieval time by 30%"
            style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6 }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, color: '#555', marginBottom: 6 }}>
            STAR 3
          </label>
          <input
            value={star3}
            onChange={(e) => setStar3(e.target.value)}
            placeholder="E.g., picked & packed 120 orders/day with 99% accuracy"
            style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6 }}
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={status.kind === 'busy' || !canSave}
        style={{
          marginTop: 16,
          padding: '10px 14px',
          background: canSave ? '#2563EB' : '#9CA3AF',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          fontWeight: 600,
          cursor: canSave ? 'pointer' : 'not-allowed',
        }}
      >
        {status.kind === 'busy' ? 'Saving…' : 'Save'}
      </button>

      {status.msg && (
        <p style={{ marginTop: 10, color: status.kind === 'error' ? 'crimson' : '#374151' }}>
          {status.msg}
        </p>
      )}

      <div style={{ marginTop: 16 }}>
        <a href={returnUrl} style={{ textDecoration: 'none', color: '#2563EB' }}>
          ← Back to your results
        </a>
      </div>
    </main>
  );
}
