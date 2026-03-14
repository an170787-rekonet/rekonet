'use client';
import React from 'react';

/**
 * GapChips — supportive “next steps” chips with multilingual copy.
 * Included languages: en, ar (RTL), es, fr, de, pt, it, pl, ru.
 * To add more languages later, extend the COPY object below.
 */
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

  // ---------- NEW LANGUAGES ----------

  de: {
    title: 'Empfohlene nächste Schritte',
    intro:
      'Diese einfachen, stärkenden Schritte helfen dir, dich noch enger an deine Karriereziele anzunähern. Du hast bereits ein starkes Fundament — diese Schritte zeigen es noch klarer.',
    open: 'Öffnen',
    coming: 'Bald verfügbar',
  },

  pt: {
    title: 'Próximos passos sugeridos',
    intro:
      'Estas ações simples e encorajadoras o(a) ajudarão a alinhar‑se ainda mais aos seus objetivos de carreira. Você já tem uma base sólida — estes passos irão destacá‑la ainda mais.',
    open: 'Abrir',
    coming: 'Em breve',
  },

  it: {
    title: 'Prossimi passi suggeriti',
    intro:
      'Queste azioni semplici e incoraggianti ti aiuteranno ad allinearti ancora meglio ai tuoi obiettivi professionali. Hai già una base solida — questi passi la metteranno ancora più in evidenza.',
    open: 'Apri',
    coming: 'In arrivo',
  },

  pl: {
    title: 'Sugerowane kolejne kroki',
    intro:
      'Te proste, wzmacniające kroki pomogą ci jeszcze lepiej zbliżyć się do głównych celów zawodowych. Masz już solidne podstawy — te kroki to jeszcze wyraźniej pokażą.',
    open: 'Otwórz',
    coming: 'Wkrótce',
  },

  ru: {
    title: 'Рекомендуемые следующие шаги',
    intro:
      'Эти простые, поддерживающие действия помогут ещё ближе подойти к вашим карьерным целям. У вас уже прочная база — эти шаги лишь лучше её покажут.',
    open: 'Открыть',
    coming: 'Скоро',
  },
};

export default function GapChips({
  id = 'actions',
  title,
  items = [],
  language = 'en',
}) {
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

            {it.hint && (
              <div style={{ fontSize: 13, color: '#555', marginTop: 6 }}>
                {it.hint}
              </div>
            )}

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
                  title="Coming soon"
                  style={{
                    background: '#9ca3af',
                    color: '#fff',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: 0,
                    opacity: 0.95,
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
``
