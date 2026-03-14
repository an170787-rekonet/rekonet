'use client';
import React from 'react';

/**
 * RoleRecommendations — roles well‑suited now + supportive pathway (multilingual).
 * Included languages: en, ar (RTL), es, fr, de, pt, it, pl, ru.
 * Add more by extending the COPY object below.
 */
const COPY = {
  en: {
    headerTitle: 'You’re on the right track',
    headerBody: (goal) =>
      `To help you align your strengths even more closely with ${goal}, here are roles that fit your CV today — along with a simple pathway to move you even closer to your goal.`,
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
    headerBody: (goal) =>
      `لمواءمة نقاط قوتك بشكل أوضح مع ${goal}، إليك أدوار مناسبة لسيرتك الذاتية الآن — ومعها مسار بسيط يقرّبك أكثر من هدفك.`,
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
    headerBody: (goal) =>
      `Para alinear aún más tus fortalezas con ${goal}, aquí tienes roles que encajan con tu CV hoy — junto con un camino sencillo para acercarte más a tu objetivo.`,
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
    headerBody: (goal) =>
      `Pour mieux aligner tes atouts avec ${goal}, voici des postes adaptés à ton CV aujourd’hui — avec un parcours simple pour te rapprocher encore de ton objectif.`,
    rolesTitle: 'Postes adaptés à ton CV dès maintenant',
    rolesEmpty:
      'Selon ta progression, des correspondances apparaîtront ici au fur et à mesure que nous valorisons ton CV et tes atouts.',
    pathTitle: (goal) => `Parcours pour mieux t’aligner avec ${goal}`,
    open: 'Ouvrir',
    coming: 'Bientôt',
    viewRole: 'Voir le poste',
  },

  // ---------- NEW LANGUAGES ----------

  de: {
    headerTitle: 'Du bist auf dem richtigen Weg',
    headerBody: (goal) =>
      `Damit deine Stärken noch besser zu ${goal} passen, findest du hier Rollen, die bereits heute zu deinem Lebenslauf passen — sowie einen einfachen Weg, der dich deinem Ziel weiter annähert.`,
    rolesTitle: 'Rollen, die derzeit gut zu deinem Lebenslauf passen',
    rolesEmpty:
      'Je nach Fortschritt erscheinen hier passende Treffer, während wir deinen Lebenslauf und Stärken weiter schärfen.',
    pathTitle: (goal) => `Weg, um noch besser zu ${goal} zu passen`,
    open: 'Öffnen',
    coming: 'Bald verfügbar',
    viewRole: 'Rolle ansehen',
  },

  pt: {
    headerTitle: 'Você está no caminho certo',
    headerBody: (goal) =>
      `Para alinhar ainda mais seus pontos fortes a ${goal}, aqui estão funções que combinam com seu CV hoje — e um caminho simples para aproximá‑lo(a) do objetivo.`,
    rolesTitle: 'Funções bem alinhadas ao seu CV neste momento',
    rolesEmpty:
      'Conforme o progresso, aparecerão aqui boas correspondências enquanto aprimoramos seu CV e pontos fortes.',
    pathTitle: (goal) => `Caminho para alinhar‑se ainda mais com ${goal}`,
    open: 'Abrir',
    coming: 'Em breve',
    viewRole: 'Ver função',
  },

  it: {
    headerTitle: 'Sei sulla strada giusta',
    headerBody: (goal) =>
      `Per allineare ancora meglio i tuoi punti di forza a ${goal}, ecco ruoli che già oggi si adattano al tuo CV — con un percorso semplice per avvicinarti all’obiettivo.`,
    rolesTitle: 'Ruoli adatti al tuo CV in questo momento',
    rolesEmpty:
      'In base ai tuoi progressi, qui compariranno corrispondenze via via migliori mentre valorizziamo il CV e i tuoi punti di forza.',
    pathTitle: (goal) => `Percorso per allinearti ancora meglio a ${goal}`,
    open: 'Apri',
    coming: 'In arrivo',
    viewRole: 'Vedi ruolo',
  },

  pl: {
    headerTitle: 'Jesteś na dobrej drodze',
    headerBody: (goal) =>
      `Aby jeszcze lepiej dopasować twoje mocne strony do ${goal}, poniżej znajdziesz role pasujące do twojego CV już dziś — oraz prostą ścieżkę, która przybliży cię do celu.`,
    rolesTitle: 'Role dobrze dopasowane do twojego CV na teraz',
    rolesEmpty:
      'Wraz z postępami pojawią się tu coraz trafniejsze propozycje — równolegle wzmacniamy CV i mocne strony.',
    pathTitle: (goal) => `Ścieżka, by lepiej dopasować się do ${goal}`,
    open: 'Otwórz',
    coming: 'Wkrótce',
    viewRole: 'Zobacz rolę',
  },

  ru: {
    headerTitle: 'Вы на верном пути',
    headerBody: (goal) =>
      `Чтобы ещё точнее согласовать ваши сильные стороны с «${goal}», здесь роли, которые уже сейчас подходят вашему резюме — и простой маршрут, чтобы приблизиться к цели.`,
    rolesTitle: 'Роли, подходящие вашему резюме сейчас',
    rolesEmpty:
      'По мере вашего прогресса здесь будут появляться подходящие варианты — мы продолжаем усиливать резюме и сильные стороны.',
    pathTitle: (goal) => `Маршрут, чтобы лучше соответствовать «${goal}»`,
    open: 'Открыть',
    coming: 'Скоро',
    viewRole: 'Посмотреть роль',
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
      {/* Supportive header (no duplicate “well done” message here) */}
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
        <p style={{ margin: 0, fontSize: 15, color: '#214' }}>
          {L.headerBody(goalTitle)}
        </p>
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
                      {L.open}
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
                      {L.coming}
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
