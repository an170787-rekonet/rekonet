'use client';
import React from 'react';

export default function SummaryBand({ level = 3, score, nextId = 'actions' }) {
  const progress =
    typeof score === 'number'
      ? `Well done — you’ve already covered ${Math.round(score)}% of the work. You’ve done so well.`
      : null;

  return (
    <section
      style={{
        background: '#e0f2fe', // soft supportive tone
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        border: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <h2 style={{ margin: 0, fontSize: 22 }}>You’re doing brilliantly</h2>

      {progress && (
        <p style={{ margin: '8px 0', fontSize: 15, color: '#333' }}>{progress}</p>
      )}

      <p style={{ margin: '8px 0', fontSize: 15, color: '#333' }}>
        All we have to do now to best align your strengths with the role requirements
        is complete one or two simple steps below. You’ve already come so far — you’re
        on exactly the right track.
      </p>

      <div style={{ marginTop: 14 }}>
        <a
          href={`#${nextId}`}
          style={{
            padding: '8px 14px',
            background: '#0a0a0a',
            color: '#fff',
            borderRadius: 8,
            textDecoration: 'none',
          }}
        >
          View your suggested pathway
        </a>
      </div>
    </section>
  );
}
