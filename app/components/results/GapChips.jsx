'use client';
import React from 'react';

export default function GapChips({ id = 'actions', title = 'Next steps', items = [] }) {
  return (
    <section id={id} style={{ marginTop: 8 }}>
      <h3 style={{ marginBottom: 8 }}>{title}</h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        {items.map((it) => (
          <li key={it.id} style={{ border: '1px solid #eee', borderRadius: 12, padding: 12, background: '#fff' }}>
            <div style={{ fontWeight: 600 }}>{it.label}</div>
            {it.hint && <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>{it.hint}</div>}
            <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {it.href ? (
                <a href={it.href} style={{ background: '#111', color: '#fff', padding: '8px 12px', borderRadius: 8, textDecoration: 'none' }}>
                  {it.actionText || 'Open'}
                </a>
              ) : (
                <button disabled title="Coming soon" style={{ background: '#999', color: '#fff', padding: '8px 12px', borderRadius: 8, border: 0, opacity: 0.8 }}>
                  {it.actionText || 'Coming soon'}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
