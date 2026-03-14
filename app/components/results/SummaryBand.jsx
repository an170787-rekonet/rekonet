'use client';
import React from 'react';

// Minimal i18n copy dictionaries. Add more languages as needed.
const COPY = {
  en: {
    badge: (level) => `Level ${level}`,
    title: 'You’re doing brilliantly',
    progress: (n) => `Well done — you’ve already covered ${n}% of the work. You’ve done so well.`,
    body:
      'All we have to do now to best align your strengths with the role requirements is complete one or two simple steps below. You’ve already come so far — you’re on exactly the right track.',
    cta: 'View your suggested pathway',
  },
  ar: {
    badge: (level) => `المستوى ${level}`,
    title: 'أحسنت! أنت تتقدم بشكل رائع',
    progress: (n) => `أحسنت — لقد أنجزت ${n}% من العمل. أداء ممتاز.`,
    body:
      'كل ما نحتاجه الآن لمواءمة نقاط قوتك مع متطلبات الدور هو إكمال خطوة أو خطوتين بسيطتين أدناه. لقد قطعت شوطًا كبيرًا — أنت على الطريق الصحيح.',
    cta: 'شاهد مسارك المقترح',
  },
  es: {
    badge: (level) => `Nivel ${level}`,
    title: '¡Vas muy bien!',
    progress: (n) => `Muy bien — ya has cubierto el ${n}% del camino. Excelente.`,
    body:
      'Ahora solo necesitamos completar uno o dos pasos sencillos para alinear tus fortalezas con los requisitos del puesto. Ya has avanzado mucho — vas por el camino correcto.',
    cta: 'Ver tu ruta sugerida',
  },
  fr: {
    badge: (level) => `Niveau ${level}`,
    title: 'Tu avances très bien',
    progress: (n) => `Bravo — tu as déjà réalisé ${n}% du parcours. Excellent.`,
    body:
      'Il ne reste plus qu’une ou deux petites étapes pour aligner tes atouts sur les exigences du poste. Tu as déjà beaucoup progressé — tu es sur la bonne voie.',
    cta: 'Voir ton parcours suggéré',
  },
  // Fallback: English for any language not listed
};

export default function SummaryBand({ level = 3, score, nextId = 'actions', language = 'en' }) {
  const L = COPY[language] || COPY.en;

  const progressMessage =
    typeof score === 'number'
      ? L.progress(Math.round(score))
      : null;

  return (
    <section
      style={{
        background: '#e0f2fe',
        border: '1px solid rgba(0,0,0,0.06)',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
      }}
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <span
          style={{
            background: '#111',
            color: '#fff',
            padding: '6px 10px',
            borderRadius: 999,
            fontSize: 12,
          }}
        >
          {L.badge(level)}
        </span>
        {progressMessage && (
          <span style={{ fontSize: 13, color: '#333' }}>{progressMessage}</span>
        )}
      </div>

      <h2 style={{ margin: '10px 0 4px 0' }}>{L.title}</h2>
      <p style={{ margin: 0, color: '#333' }}>{L.body}</p>

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
          {L.cta}
        </a>
      </div>
    </section>
  );
}
