'use client';
import React from 'react';

const COPY = {
  en: {
    title: 'Suggested next steps',
    intro:
      'These gentle, confidence‑building actions will help you align even more closely with your main career goals. You already have a strong foundation — these steps simply help showcase it even more.',
    open: 'Open',
    coming: 'Coming soon',
  },
  ar: {
    title: 'الخطوات المقترحة',
    intro:
      'هذه الخطوات البسيطة المعززة للثقة تساعدك على مزيد من المواءمة مع أهدافك المهنية. لديك أساس قوي — وهذه الخطوات تُبرز ذلك أكثر.',
    open: 'فتح',
    coming: 'قريبًا',
  },
  es: {
    title: 'Siguientes pasos sugeridos',
    intro:
      'Estas acciones sencillas y motivadoras te ayudarán a acercarte más a tus objetivos profesionales. Ya tienes una base sólida — estos pasos la destacarán aún más.',
    open: 'Abrir',
    coming: 'Próximamente',
  },
  fr: {
    title: 'Prochaines étapes suggérées',
    intro:
      'Ces actions simples et valorisantes t’aideront à te rapprocher de tes objectifs. Tu as déjà une base solide — ces étapes la mettront encore plus en valeur.',
    open: 'Ouvrir',
    coming: 'Bientôt',
  },
};

export default function GapChips({ id = 'actions', title, items = [], language = 'en' }) {
  const L = COPY[language] || COPY.en;
  return (
    <section id={id} style={{ marginTop: 12 }}>
      <h3 style={{ marginBottom: 8 }}>{title || L.title}</h3>
      <p style={{ fontSize: 15, marginBottom: 16, maxWidth: 620 }}>{L.intro}</p>

      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'grid',
          gap: 14,
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        }}
      >
        {items.map((it) => (
          <li
            key={it.id}
            style={{
              border: '1px solid #eee',
              borderRadius: 12,
              padding: 14,
              background: '#fff',
            }}
          >
            <div style={{ fontWeight: 600 }}>{it.label}</div>
            {it.hint && <div style={{ fontSize: 13, color: '#555', marginTop: 6 }}>{it.hint}</div>}

            <div style={{ marginTop: 12 }}>
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
                  {it.actionText || L.open}
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
                  {it.actionText || L.coming}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
