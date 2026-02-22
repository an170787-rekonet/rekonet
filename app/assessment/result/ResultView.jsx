'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

/* ——— Support band (no Level; Path + Readiness %) ———
   - Path is rendered as stages: Exploring / Soon ready / Job ready
   - Readiness % stays, but presented gently
   - RTL-safe for Arabic
*/
function SupportBand({ lang = 'en', path, readiness }) {
  const isRTL = lang === 'ar';
  const r = Number(readiness ?? 0);

  // Soft client labels (server i18n remains source of truth for main copy)
  const L = {
    path: { en: 'Path', es: 'Ruta', fr: 'Parcours', pt: 'Percurso', ta: 'பாதை', uk: 'Шлях', ar: 'المسار' },
    stage: { en: 'Stage', es: 'Etapa', fr: 'Étape', pt: 'Etapa', ta: 'நிலை', uk: 'Етап', ar: 'المرحلة' },
    ready: { en: 'Readiness', es: 'Preparación', fr: 'Préparation', pt: 'Prontidão', ta: 'தயார்நிலை', uk: 'Готовність', ar: 'الجاهزية' },
    // user-facing stage names
    exploring:   { en: 'Exploring',   es: 'Explorando', fr: 'Exploration', pt: 'Explorando', ta: 'ஆராய்ச்சி', uk: 'Досліджуємо', ar: 'استكشاف' },
    soonReady:   { en: 'Soon ready',  es: 'Casi listo', fr: 'Bientôt prêt', pt: 'Quase pronto', ta: 'விரைவில் தயாராக', uk: 'Скоро готово', ar: 'قريبًا جاهز' },
    jobReady:    { en: 'Job ready',   es: 'Listo para el trabajo', fr: 'Prêt pour l’emploi', pt: 'Pronto para o trabalho', ta: 'வேலையிற்குத் தயாராக', uk: 'Готово до роботи', ar: 'جاهز للعمل' },
    // original path keys if you still want to show the underlying label subtly
    foundations: { en: 'Foundations', es: 'Fundamentos', fr: 'Fondations', pt: 'Fundamentos', ta: 'அடித்தளம்', uk: 'База', ar: 'الأساسيات' },
    precision:   { en: 'Precision',   es: 'Precisión',  fr: 'Précision',   pt: 'Precisão',    ta: 'துல்லியம்', uk: 'Точність', ar: 'الدقّة' },
  };

  // Map to a friendly stage:
  // - prefer your server "path": foundations → Exploring, precision → Soon ready
  // - if readiness is 100, call it "Job ready"
  const pathKey = (path || '').toLowerCase() === 'precision' ? 'precision' : 'foundations';
  let stageKey = pathKey === 'precision' ? 'soonReady' : 'exploring';
  if (r >= 100) stageKey = 'jobReady';

  // Gentle colors based on readiness
  const bandColors = r < 25
    ? { bg: '#FFF7ED', text: '#9A3412', ring: '#FDBA74' }    // very early
    : r < 50
    ? { bg: '#FEF9C3', text: '#92400E', ring: '#FDE68A' }
    : r < 75
    ? { bg: '#ECFDF5', text: '#065F46', ring: '#6EE7B7' }
    : r < 100
    ? { bg: '#EEF2FF', text: '#3730A3', ring: '#A5B4FC' }
    : { bg: '#F0FDF4', text: '#166534', ring: '#4ADE80' };    // job ready

  return (
    <section
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 12,
        alignItems: 'center',
        padding: '12px 14px',
        borderRadius: 10,
        background: bandColors.bg,
        border: `1px solid ${bandColors.ring}`,
        margin: '12px 0',
      }}
      aria-label="Support overview"
    >
      {/* Path + Stage (friendly) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, color: '#6B7280' }}>
            {L.path[lang] || L.path.en}
          </span>
          <span
            title={(L[pathKey] && (L[pathKey][lang] || L[pathKey].en)) || undefined}
            style={{
              fontWeight: 600,
              fontSize: 14,
              padding: '6px 10px',
              borderRadius: 8,
              background: '#F9FAFB',
              color: '#111827',
              border: '1px solid #E5E7EB',
            }}
          >
            {L[stageKey][lang] || L[stageKey].en}
          </span>
        </div>
      </div>

      {/* Readiness % (gentle) */}
      <div style={{ justifySelf: isRTL ? 'start' : 'end' }}>
        <div style={{ fontSize: 14, color: '#6B7280' }}>
          {L.ready[lang] || L.ready.en}
        </div>
        <div
          style={{
            minWidth: 64,
            display: 'inline-block',
            textAlign: 'center',
            fontWeight: 700,
            fontSize: 16,
            padding: '6px 10px',
            borderRadius: 8,
            color: bandColors.text,
            background: '#FFFFFF',
            border: `2px solid ${bandColors.ring}`,
          }}
          aria-label="Readiness percent"
        >
          {Number.isFinite(r) ? `${r}%` : '—'}
        </div>
      </div>
    </section>
  );
}

/* ——— Small “Chip” button for gap actions ——— */
function Chip({ href, children, lang = 'en' }) {
  const isRTL = lang === 'ar';
  return (
    <Link
      href={href}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        color: '#1F2937',
        background: '#F3F4F6',
        border: '1px solid #E5E7EB',
        textDecoration: 'none',
        outline: 'none',
      }}
      dir={isRTL ? 'rtl' : 'ltr'}
      aria-label={typeof children === 'string' ? children : 'Action'}
    >
      <span
        aria-hidden
        style={{
          width: 6, height: 6, borderRadius: 999, background: '#111827',
          display: 'inline-block',
        }}
      />
      {children}
    </Link>
  );
}

/* ——— Map each gap to suggested actions (deep-links) ——— */
function actionsForGap(g, ui, language) {
  if (!g?.type) return [];
  const L = ui.actionLabels;

  if (g.type === 'keywords') {
    return [{ label: L.atsTune[language] || L.atsTune.en, href: '/activities/cv-ats-1' }];
  }
  if (g.type === 'interview') {
    return [{ label: L.star3[language] || L.star3.en, href: '/activities/int-star-1' }];
  }
  if (g.type === 'level') {
    return [
      { label: L.atsTune[language] || L.atsTune.en, href: '/activities/cv-ats-1' },
      { label: L.star3[language] || L.star3.en, href: '/activities/int-star-1' },
    ];
  }
  return [];
}

export default function ResultView({ assessmentId, language, userId = null }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  // ===== UI labels per language =====
  const ui = {
    progress: {
      en: 'Progress', es: 'Progreso', fr: 'Progrès', pt: 'Progresso',
      ta: 'முன்னேற்றம்', uk: 'Прогрес', ar: 'التقدّم',
    },
    nextSteps: {
      en: 'Your next steps', es: 'Tus próximos pasos', fr: 'Vos prochaines étapes', pt: 'Seus próximos passos',
      ta: 'உங்கள் அடுத்த படிகள்', uk: 'Ваші наступні кроки', ar: 'خطواتك التالية',
    },
    suggestedRoles: {
      en: 'Suggested roles', es: 'Roles sugeridos', fr: 'Rôles suggérés', pt: 'Funções sugeridas',
      ta: 'பரிந்துரைக்கப்பட்ட வேடங்கள்', uk: 'Рекомендовані ролі', ar: 'الأدوار المقترحة',
    },
    readyHeading: {
      en: 'Ready now', es: 'Listo ahora', fr: 'Prêt maintenant', pt: 'Pronto agora',
      ta: 'தயார்', uk: 'Готові вже', ar: 'جاهز الآن',
    },
    bridgeHeading: {
      en: 'Bridge roles (1–2 gaps)', es: 'Roles puente (1–2 brechas)', fr: 'Rôles passerelle (1–2 écarts)', pt: 'Funções ponte (1–2 lacunas)',
      ta: 'பாலம் வேடங்கள் (1–2 இடைவெளிகள்)', uk: 'Ролі‑містки (1–2 прогалини)', ar: 'أدوار الجسر (فجوة أو فجوتان)',
    },
    // Badge labels
    badge: {
      ready: {
        en: 'Ready', es: 'Listo', fr: 'Prêt', pt: 'Pronto',
        ta: 'தயார்', uk: 'Готово', ar: 'جاهز',
      },
      bridge: {
        en: 'Bridge', es: 'Puente', fr: 'Passerelle', pt: 'Ponte',
        ta: 'பாலம்', uk: 'Місток', ar: 'جسر',
      },
    },
    // Gap captions
    gapLabels: {
      interviewMin: {
        en: 'Interview minimum', es: 'Entrevista mínima', fr: 'Seuil d’entretien', pt: 'Mínimo de entrevista',
        ta: 'நேர்காணல் குறைந்தபட்சம்', uk: 'Мінімум співбесіди', ar: 'الحد الأدنى للمقابلة',
      },
      levelReq: {
        en: 'Overall level', es: 'Nivel global', fr: 'Niveau global', pt: 'Nível geral',
        ta: 'மொத்த நிலை', uk: 'Загальний рівень', ar: 'المستوى العام',
      },
      keywords: {
        en: 'Keywords', es: 'Palabras clave', fr: 'Mots‑clés', pt: 'Palavras‑chave',
        ta: 'முக்கிய சொற்கள்', uk: 'Ключові слова', ar: 'الكلمات المفتاحية',
      },
      certificates: {
        en: 'Certificates', es: 'Certificados', fr: 'Certificats', pt: 'Certificados',
        ta: 'சான்றிதழ்கள்', uk: 'Сертифікати', ar: 'الشهادات',
      },
    },
    // Action chip labels
    actionLabels: {
      atsTune: {
        en: 'ATS CV tune (10 min)', es: 'Ajuste ATS del CV (10 min)', fr: 'Ajuster le CV pour ATS (10 min)',
        pt: 'Ajuste ATS do CV (10 min)', ta: 'ATS CV திருத்தம் (10 நிமி)', uk: 'Налаштування резюме під ATS (10 хв)', ar: 'ملاءمة السيرة الذاتية لنظام ATS (10 دقائق)',
      },
      star3: {
