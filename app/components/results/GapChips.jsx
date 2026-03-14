'use client';
import React from 'react';

/**
 * GapChips — supportive next steps with multilingual copy.
 * Languages: en, ar (RTL), es, fr, de, pt, it, pl, ru, hi, bn, ur (RTL), zh, ja, ko.
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
  hi: {
    title: 'अगले सुझाए गए कदम',
    intro:
      'ये सरल और आत्म‑विश्वास बढ़ाने वाले कदम आपको अपने मुख्य करियर लक्ष्यों के और पास ले जाएँगे। आपके पास पहले से मजबूत आधार है — ये कदम उसे और बेहतर दिखाएँगे।',
    open: 'खोलें',
    coming: 'जल्द',
  },
  bn: {
    title: 'পরবর্তী প্রস্তাবিত ধাপ',
    intro:
      'এই সহজ, আত্মবিশ্বাস‑বর্ধক ধাপগুলো আপনাকে আপনার প্রধান ক্যারিয়ার লক্ষ্যের আরও কাছাকাছি নিয়ে যাবে। আপনার দৃঢ় ভিত্তি ইতিমধ্যেই রয়েছে — এই ধাপগুলো সেটিকে আরও ভালোভাবে তুলে ধরবে।',
    open: 'ওপেন',
    coming: 'শীঘ্রই',
  },
  ur: {
    title: 'اگلے تجویز کردہ اقدامات',
    intro:
      'یہ سادہ، حوصلہ افزا اقدامات آپ کو اپنے مرکزی کیریئر ہدف کے اور قریب لے آئیں گے۔ آپ کے پاس پہلے ہی مضبوط بنیاد ہے — یہ اقدامات اسے مزید نمایاں کریں گے۔',
    open: 'کھولیں',
    coming: 'جلد',
  },
  zh: {
    title: '建议的下一步',
    intro:
      '这些温和、能增强信心的步骤将帮助你更贴近核心职业目标。你已经有很好的基础——这些步骤会把它展示得更充分。',
    open: '打开',
    coming: '即将推出',
  },
  ja: {
    title: '次におすすめのステップ',
    intro:
      'シンプルで自信を高めるこれらのステップは、主要なキャリア目標にさらに近づくのに役立ちます。すでに強い土台があります — これらのステップでさらに輝きます。',
    open: '開く',
    coming: '近日公開',
  },
  ko: {
    title: '다음 추천 단계',
    intro:
      '이 간단하고 자신감을 높여주는 단계들은 주요 커리어 목표에 더 가까워지도록 도와줍니다. 이미 탄탄한 기반이 있어요 — 이 단계들이 이를 더 잘 보여줍니다.',
    open: '열기',
    coming: '곧 제공',
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

            {it.hint && (
              <div style={{ fontSize: 13, color: '#555', marginTop: 6 }}>{it.hint}</div>
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
