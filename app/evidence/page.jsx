'use client';
import { useEffect, useState } from 'react';

export default function EvidencePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  async function load() {
    try {
      setLoading(true);
      setErr('');
      // 👇 No-store to avoid client-side caching
      const res = await fetch('/api/evidence/recent', { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'Failed to load evidence');
      setItems(data.items || []);
    } catch (e) {
      setErr(e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 16px', fontFamily: 'system-ui, Arial' }}>
      <h1>Audio Evidence</h1>
      <p>Latest uploads (most recent first). Each item includes a 1-hour signed link for playback.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button onClick={load} style={{ padding: '8px 12px', background: '#111', color: '#fff', borderRadius: 6, border: 0 }}>
          ↻ Refresh
        </button>
      </div>

      {loading && <div>Loading…</div>}
      {err && (
        <div style={{ padding: 12, background: '#f8d7da', border: '1px solid #f5c2c7', borderRadius: 6, marginBottom: 12 }}>
          <strong>Error:</strong> {err}
        </div>
      )}

      {!loading && !err && items.length === 0 && <div>No evidence yet. Record something on /recorder and refresh.</div>}

      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {items.map((it) => (
          <li key={it.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: '#666' }}>{new Date(it.created_at).toLocaleString()}</div>
            <div style={{ fontSize: 14, margin: '6px 0' }}>
              <strong>role:</strong> {it.role_id || '—'} &nbsp; | &nbsp;
              <strong>path:</strong> <code style={{ fontSize: 12 }}>{it.path}</code> &nbsp; | &nbsp;
              <strong>duration:</strong> {typeof it.duration_ms === 'number' ? `${Math.round(it.duration_ms/1000)}s` : '—'} &nbsp; | &nbsp;
              <strong>mime:</strong> {it.mime || '—'}
            </div>
            <div>
              {it.signedUrl ? (
                <audio controls src={it.signedUrl} style={{ width: '100%' }} />
              ) : (
                <div style={{ color: '#b91c1c' }}>Signed URL error: {it.signError || 'unknown'}</div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
