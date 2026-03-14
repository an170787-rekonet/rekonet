'use client';
import React from 'react';

/**
 * RoleRecommendations
 * - Warm, affirming copy: congratulates progress and frames actions positively.
 * - Shows "roles well‑suited right now" + a supportive "pathway to your main goal".
 *
 * Props:
 *  - score?: number (0–100)    → used ONLY to show positive progress language
 *  - goalTitle?: string        → the learner’s main career goal (e.g., "Recruitment Consultant")
 *  - currentRoles?: Array<{ id, title, link?, note? }>
 *  - pathway?: Array<{ id, label, hint?, href?, actionText? }>
 */
export default function RoleRecommendations({
  score,
  goalTitle = 'your main career goal',
  currentRoles = [],
  pathway = [],
}) {
  const progress =
    typeof score === 'number'
      ? `Well done — you’ve already covered ${Math.round(score)}% of the work. You’ve done so well.`
      : `Well done — you’ve made strong progress already.`;

  return (
    <section style={{ marginTop: 24 }}>
      {/* Supportive headline */}
      <div
        style={{
          background: '#f0fdf4',          // soft green
          border: '1px solid #e5efe8',
          borderRadius: 12,
          padding: 18,
          marginBottom: 16,
        }}
      >
        <h2 style={{ margin: '0 0 6px 0', fontSize: 20 }}>You’re on the right track</h2>
        <p style={{ margin: 0, fontSize: 15, color: '#214' }}>{progress}</p>
        <p style={{ margin: '8px 0 0 0', fontSize: 15, color: '#214' }}>
          All we have to do now to best align your strengths with {goalTitle} is complete
          one or two simple, supportive steps. You’ve already come so far — you’re doing brilliantly.
        </p>
      </div>

      {/* Roles well‑suited right now */}
      <section style={{ marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 8px 0' }}>Roles well‑suited to your CV right now</h3>
        {currentRoles.length === 0 ? (
          <p style={{ margin: 0, color: '#444' }}>
            Based on where your CV is today, you have strengths we can present confidently.
            As you add a couple of quick refinements below, even more role options will open up.
          </p>
        ) : (
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: '0 0 6px 0',
              display: 'grid',
              gap: 12,
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            }}
          >
            {currentRoles.map((role) => (
              <li
                key={role.id}
                style={{
                  border: '1px solid #eee',
                  borderRadius: 12,
                  padding: 14,
                  background: '#fff',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 16 }}>{role.title}</div>
                {role.note && (
                  <div style={{ marginTop: 6, fontSize: 14, color: '#555' }}>{role.note}</div>
                )}
                {role.link && (
                  <div style={{ marginTop: 10 }}>
                    <a
                      href={role.link}
                      style={{
                        background: '#0a0a0a',
                        color: '#fff',
                        padding: '8px 12px',
                        borderRadius: 8,
                        textDecoration: 'none',
                      }}
                    >
                      View role
                    </a>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>
          As you complete a few supportive actions, we’ll surface even more opportunities together.
        </div>
      </section>

      {/* Pathway to goal */}
      <section>
        <h3 style={{ margin: '0 0 8px 0' }}>Pathway to become even more aligned with {goalTitle}</h3>
        {pathway.length === 0 ? (
          <p style={{ margin: 0, color: '#444' }}>
            Here’s a simple, confidence‑building pathway we’ll tailor for you. Each action is small,
            clear, and designed to help your strengths shine.
          </p>
        ) : (
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'grid',
              gap: 12,
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            }}
          >
            {pathway.map((step) => (
              <li
                key={step.id}
                style={{
                  border: '1px solid #eee',
                  borderRadius: 12,
                  padding: 14,
                  background: '#fff',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 16 }}>{step.label}</div>
                {step.hint && (
                  <div style={{ marginTop: 6, fontSize: 14, color: '#555' }}>{step.hint}</div>
                )}
                <div style={{ marginTop: 10 }}>
                  {step.href ? (
                    <a
                      href={step.href}
                      style={{
                        background: '#0a0a0a',
                        color: '#fff',
                        padding: '8px 12px',
                        borderRadius: 8,
                        textDecoration: 'none',
                      }}
                    >
                      {step.actionText || 'Open'}
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
                      {step.actionText || 'Coming soon'}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
``
