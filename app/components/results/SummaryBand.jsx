'use client';
import React from 'react';

const levelCopy = {
  1: { title: 'Getting started', body: 'You’re building foundations. No rush — small steps count. We’ll show you one easy next step to move forward today.', color: '#fde68a', badge: 'Level 1' },
  2: { title: 'Growing', body: 'Good progress. You’ve got early wins — keep momentum with one short action we recommend below.', color: '#c7f9cc', badge: 'Level 2' },
  3: { title: 'Ready for lift‑off', body: 'Solid foundations. A couple of focused actions will lift you to the next level quickly.', color: '#bae6fd', badge: 'Level 3' },
  4: { title: 'Confident', body: 'You’re nearly job‑ready. Polish one or two areas and add a strong evidence example.', color: '#ddd6fe', badge: 'Level 4' },
  5: { title: 'Showcase', body: 'Excellent. You can showcase your strengths now — keep your evidence current and relevant.', color: '#fecaca', badge: 'Level 5' },
};

export default function SummaryBand({ level = 3, score, nextId = 'actions' }) {
  const copy = levelCopy[level] || levelCopy[3];
  return (
    <section style={{ background: copy.color, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ background: '#111', color: '#fff', padding: '6px 10px', borderRadius: 999, fontSize: 12 }}>{copy.badge}</span>
        {typeof score === 'number' && <span style={{ fontSize: 12, color: '#444' }}>score: {Math.round(score)}%</span>}
      </div>
      <h2 style={{ margin: '8px 0 4px 0' }}>{copy.title}</h2>
      <p style={{ margin: 0, color: '#333' }}>{copy.body}</p>
      <div style={{ marginTop: 12 }}>
        <a href={`#${nextId}`} style={{ display: 'inline-block', background: '#111', color: '#fff', padding: '8px 12px', borderRadius: 8, textDecoration: 'none' }}>
          View your next step
        </a>
      </div>
    </section>
  );
}
