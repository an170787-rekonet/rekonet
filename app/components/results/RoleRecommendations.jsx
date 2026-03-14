'use client';
import React from 'react';

const COPY = {
  en: {
    headerTitle: 'You’re on the right track',
    headerBody:
      (goal) => `To help you align your strengths even more closely with ${goal}, here are roles that fit your CV today — along with a simple pathway to move you even closer to your goal.`,
    rolesTitle: 'Roles well‑suited to your CV right now',
    rolesEmpty:
      'Based on your progress so far, good matches will appear here as we continue shaping your CV and strengths.',
    pathTitle: (goal) => `Pathway to become even more aligned with ${goal}`,
    open: 'Open',
    coming: 'Coming soon',
    viewRole: 'View role',
  },
  ar: {
    headerTitle: 'أنت على الطريق الصحيح',
    headerBody:
      (goal) => `لمواءمة نقاط قوتك بشكل أوضح مع ${goal}، إليك أدوار مناسبة لسيرتك الذاتية الآن — ومعها مسار بسيط يقرّبك أكثر من هدفك.`,
    rolesTitle: 'أدوار مناسبة لسيرتك الذاتية الآن',
    rolesEmpty:
      'بحسب تقدمك حتى الآن، ستظهر التوافقات الجيدة هنا بينما نواصل تطوير سيرتك ونقاط قوتك.',
    pathTitle: (goal) => `مسار لتصبح أكثر مواءمة مع ${goal}`,
    open: 'فتح',
    coming: 'قريبًا',
    viewRole: 'عرض الدور',
  },
  es: {
    headerTitle: 'Vas por buen camino',
    headerBody:
      (goal) => `Para alinear aún más tus fortalezas con ${goal}, aquí tienes roles que encajan con tu CV hoy — junto con un camino sencillo para acercarte más a tu objetivo.`,
    rolesTitle: 'Roles bien alineados con tu CV actualmente',
    rolesEmpty:
      'Según tu progreso, aquí aparecerán buenas coincidencias mientras seguimos mejorando tu CV y fortalezas.',
    pathTitle: (goal) => `Ruta para alinearte aún más con ${goal}`,
    open: 'Abrir',
    coming: 'Próximamente',
    viewRole: 'Ver rol',
  },
  fr: {
    headerTitle: 'Tu es sur la bonne voie',
    headerBody:
      (goal) => `Pour mieux aligner tes atouts avec ${goal}, voici des postes adaptés à ton CV aujourd’hui — avec un parcours simple pour te rapprocher encore de ton objectif.`,
    rolesTitle: 'Postes adaptés à ton CV dès maintenant',
    rolesEmpty:
      'Selon ta progression, des correspondances apparaîtront ici au fur et à mesure que nous valorisons ton CV et tes atouts.',
    pathTitle: (goal) => `Parcours pour mieux t’aligner avec ${goal}`,
    open: 'Ouvrir',
    coming: 'Bientôt',
    viewRole: 'Voir le poste',
  },
};

export default function RoleRecommendations({
  goalTitle = 'your main career goal',
  currentRoles = [],
  pathway = [],
  language = 'en',
}) {
  const L = COPY[language] || COPY.en;

  return (
    <section style={{ marginTop: 30 }}>
      {/* Supportive header (no duplicate progress text) */}
      <div
        style={{
          background: '#f0fdf4',
          border: '1px solid #e5efe8',
          borderRadius: 12,
          padding: 18,
          marginBottom: 20,
        }}
      >
        <h2 style={{ margin: '0 0 8px 0', fontSize: 20 }}>{L.headerTitle}</h2>
        <p style={{ margin: 0, fontSize: 15, color: '#214' }}>{L.headerBody(goalTitle)}</p>
      </div>

      {/* Roles well‑suited now */}
      <section style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 10 }}>{L.rolesTitle}</h3>

        {currentRoles.length === 0 ? (
          <p style={{ margin: 0, color: '#444' }}>{L.rolesEmpty}</p>
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
                      {L.viewRole}
                    </a>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Pathway */}
      <section>
        <h3 style={{ marginBottom: 10 }}>{L.pathTitle(goalTitle)}</h3>

        {pathway.length === 0 ? (
          <p style={{ margin: 0, color: '#444' }}>
            {L.rolesEmpty}
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
                      {step.actionText || L.open}
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
                      {step.actionText || L.coming}
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
