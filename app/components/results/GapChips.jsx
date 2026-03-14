'use client';
import React from 'react';

export default function GapChips({ id = 'actions', title = 'Your supportive next steps', items = [] }) {
  return (
    <section id={id} style={{ marginTop: 20 }}>
      <h3 style={{ marginBottom: 12 }}>{title}</h3>

      <p style={{ fontSize: 15, marginBottom: 18, maxWidth: 580 }}>
        These gentle, confidence‑building actions will help you align even more closely
        with your main career goals. You already have a strong foundation — these steps
        simply help showcase it even more.
      </p>

      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'grid',
          gap: 16,
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        }}
      >
        {items.map((it) => (
          <li
            key={it.id}
            style={{
              border: '1px solid #ededed',
              borderRadius: 12,
              padding: 16,
              background: '#ffffff',
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 16 }}>{it.label}</div>

            {it.hint && (
              <div style={{ fontSize: 14, color: '#555', marginTop: 6 }}>{it.hint}</div>
            )}

            <div style={{ marginTop: 14 }}>
              {it.href ? (
                <a
                  href={it.href}
                  style={{
                    background: '#0a0a0a',
                    color: '#fff',
                    padding: '8px 12px',
                    borderRadius: 8,
                    textDecoration: 'none',
                  }}
                >
                  {it.actionText}
                </a>
              ) : (
                <button
                  disabled
                  style={{
                    background: '#9ca3af',
                    color: '#fff',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: 0,
                  }}
                >
                  {it.actionText}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
