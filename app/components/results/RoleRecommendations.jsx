'use client';
import React from 'react';

/**
 * RoleRecommendations (Option 1 version – no progress message here)
 * This version removes the duplicate “Well done — you’ve covered X%” line.
 * SummaryBand handles all progress affirmations.
 *
 * Props:
 *  - goalTitle: string
 *  - currentRoles: [{ id, title, link?, note? }]
 *  - pathway: [{ id, label, hint?, href?, actionText? }]
 */
export default function RoleRecommendations({
  goalTitle = 'your main career goal',
  currentRoles = [],
  pathway = [],
}) {
  return (
    <section style={{ marginTop: 30 }}>
      {/* SUPPORTIVE HEADER — but WITHOUT progress or “well done” */}
      <div
        style={{
          background: '#f0fdf4', // soft green
          border: '1px solid #e5efe8',
          borderRadius: 12,
          padding: 18,
          marginBottom: 20,
        }}
      >
        <h2 style={{ margin: '0 0 8px 0', fontSize: 20 }}>
          You’re on the right track
        </h2>

        <p style={{ margin: 0, fontSize: 15, color: '#214' }}>
          To help you align your strengths even more closely with {goalTitle},
          here are roles that fit your CV today — along with a simple pathway
          to move you even closer to your goal.
        </p>
      </div>

      {/* ROLES WELL-SUITED RIGHT NOW */}
      <section style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 10 }}>Roles well‑suited to your CV right now</h3>

        {currentRoles.length === 0 ? (
          <p style={{ margin: 0, color: '#444' }}>
            Based on your progress so far, good matches will appear here as
            we continue shaping your CV and strengths.
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
            {currentRoles.map((role) => (
              <li
                key={role.id}
                style={{
                  border: '1px solid #eee',
                  borderRadius: 12,
                  padding: 16,
                  background: '#fff',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 16 }}>{role.title}</div>

                {role.note && (
                  <div style={{ marginTop: 6, fontSize: 14, color: '#555' }}>
                    {role.note}
                  </div>
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
      </section>

      {/* PATHWAY SECTION */}
      <section>
        <h3 style={{ marginBottom: 10 }}>
          Pathway to become even more aligned with {goalTitle}
        </h3>

        {pathway.length === 0 ? (
          <p style={{ margin: 0, color: '#444' }}>
            As you continue building your strengths, new steps will appear here.
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
                  padding: 16,
                  background: '#fff',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 16 }}>{step.label}</div>

                {step.hint && (
                  <div style={{ marginTop: 6, fontSize: 14, color: '#555' }}>
                    {step.hint}
                  </div>
                )}

                <div style={{ marginTop: 12 }}>
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
