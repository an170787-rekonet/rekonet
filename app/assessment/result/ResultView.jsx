'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';

/* ---------------------------------------------------------
   Support band: Path stage + Experience + Readiness %
   - No “Level” language shown.
   - RTL-safe for Arabic.
---------------------------------------------------------- */
function SupportBand({ lang = 'en', path, readiness, experienceStage }) {
  const isRTL = lang === 'ar';
  const r = Number(readiness ?? 0);

  const L = {
    // band labels
    path: { en: 'Path', es: 'Ruta', fr: 'Parcours', pt: 'Percurso', ta: 'பாதை', uk: 'Шлях', ar: 'المسار' },
    ready: { en: 'Readiness', es: 'Preparación', fr: 'Préparation', pt: 'Prontidão', ta: 'தயார்நிலை', uk: 'Готовність', ar: 'الجاهزية' },
    // user-facing path stages
    exploring: { en: 'Exploring', es: 'Explorando', fr: 'Exploration', pt: 'Explorando', ta: 'ஆராய்ச்சி', uk: 'Досліджуємо', ar: 'استكشاف' },
    soonReady: { en: 'Soon ready', es: 'Casi listo', fr: 'Bientôt prêt', pt: 'Quase pronto', ta: 'விரைவில் தயாராக', uk: 'Скоро готово', ar: 'قريبًا جاهز' },
    jobReady:  { en: 'Job ready',  es: 'Listo para el trabajo', fr: 'Prêt pour l’emploi', pt: 'Pronto para o trabalho', ta: 'வேலையிற்குத் தயாராக', uk: 'Готово до роботи', ar: 'جاهز للعمل' },
    // tooltips for underlying path (optional)
    foundations: { en: 'Foundations' },
    precision:   { en: 'Precision' },

    // experience tag
    exp: { en: 'Experience', es: 'Experiencia', fr: 'Expérience', pt: 'Experiência', ta: 'அனுபவம்', uk: 'Досвід', ar: 'الخبرة' },
    expNew: { en: 'New', es: 'Inicial', fr: 'Nouveau', pt: 'Inicial', ta: 'புதிய', uk: 'Новачок', ar: 'جديد' },
    expGrowing: { en: 'Growing', es: 'En progreso', fr: 'En progrès', pt: 'Em crescimento', ta: 'வளர்ந்து வருகிறது', uk: 'Зростає', ar: 'في تطوّر' },
    expSolid: { en: 'Solid', es: 'Sólido', fr: 'Solide', pt: 'Sólido', ta: 'நிலையான', uk: 'Солідний', ar: 'راسخ' },
    expSeasoned: { en: 'Seasoned', es: 'Consolidadx', fr: 'Expérimenté', pt: 'Experiente', ta: 'பழக்கம் வாய்ந்த', uk: 'Досвідчений', ar: 'متمرّس' },
  };

  const pathKey = (path || '').toLowerCase() === 'precision' ? 'precision' : 'foundations';
  let stageKey = pathKey === 'precision' ? 'soonReady' : 'exploring';
  if (r >= 100) stageKey = 'jobReady';

  const bandColors =
    r < 25 ? { bg: '#FFF7ED', text: '#9A3412', ring: '#FDBA74' }
  : r < 50 ? { bg: '#FEF9C3', text: '#92400E', ring: '#FDE68A' }
  : r < 75 ? { bg: '#ECFDF5', text: '#065F46', ring: '#6EE7B7' }
  : r < 100 ? { bg: '#EEF2FF', text: '#3730A3', ring: '#A5B4FC' }
  : { bg: '#F0FDF4', text: '#166534', ring: '#4ADE80' };

  const expLabel = {
    New: L.expNew[lang] || L.expNew.en,
    Growing: L.expGrowing[lang] || L.expGrowing.en,
    Solid: L.expSolid[lang] || L.expSolid.en,
    Seasoned: L.expSeasoned[lang] || L.expSeasoned.en,
  }[experienceStage || 'New'];

  return (
    <section
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto auto',
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
      {/* Path stage */}
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
            {(L[stageKey] && (L[stageKey][lang] || L[stageKey].en)) || 'Exploring'}
          </span>
        </div>
      </div>

      {/* Experience tag */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 14, color: '#6B7280' }}>
          {L.exp[lang] || L.exp.en}
        </span>
        <span
          style={{
            fontWeight: 600,
            fontSize: 14,
            padding: '6px 10px',
            borderRadius: 999,
            background: '#F9FAFB',
            color: '#111827',
            border: '1px solid #E5E7EB',
          }}
        >
          {expLabel}
        </span>
      </div>

      {/* Readiness % */}
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

/* ---------------------------------------------------------
   Experience mini-form (inline): domain + months
---------------------------------------------------------- */
function ExperienceForm({ userId, language = 'en', onSaved }) {
  const [domain, setDomain] = useState('customer_service');
  const [months, setMonths] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const isRTL = language === 'ar';

  const canSave = !!userId && String(months).trim() !== '' && Number(months) >= 0;

  async function save() {
    if (!canSave) return;
    setBusy(true);
    setMsg('');
    try {
      // Upsert per (user_id, domain) if a unique index exists
      const { error } = await supabase
        .from('experience_evidence')
        .upsert(
          [{ user_id: userId, domain, months: Number(months) }],
          { onConflict: 'user_id,domain' }
        );
      if (error) throw error;
      setMsg('Saved.');
      onSaved?.();
    } catch (e) {
      setMsg(e?.message || 'Could not save.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ marginTop: 8, padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <label style={{ fontSize: 13, color: '#555' }}>Domain</label>
        <select
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
        >
          <option value="customer_service">Customer service</option>
          <option value="admin">Admin</option>
          <option value="warehouse">Warehouse</option>
        </select>

        <label style={{ fontSize: 13, color: '#555', marginInlineStart: 8 }}>Months</label>
        <input
          type="number"
          min={0}
          value={months}
          onChange={(e) => setMonths(e.target.value)}
          placeholder="0"
          style={{ width: 90, padding: 8, border: '1px solid #ddd', borderRadius: 6 }}
        />

        <button
          onClick={save}
          disabled={!canSave || busy}
          style={{
            padding: '8px 12px',
            background: canSave ? '#2563EB' : '#9CA3AF',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontWeight: 600,
            cursor: canSave ? 'pointer' : 'not-allowed',
          }}
        >
          {busy ? 'Saving…' : 'Save'}
        </button>
      </div>
      {msg && <div style={{ marginTop: 6, fontSize: 12, color: '#374151' }}>{msg}</div>}
    </div>
  );
}

/* ---------------------------------------------------------
   Small Chip for gap actions
---------------------------------------------------------- */
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
          width: 6,
          height: 6,
          borderRadius: 999,
          background: '#111827',
          display: 'inline-block',
        }}
      />
      {children}
    </Link>
  );
}

/* ---------------------------------------------------------
   Map each gap to deep-link actions
---------------------------------------------------------- */
function actionsForGap(g, ui, language) {
  if (!g?.type) return [];
  const L = ui.actionLabels;

  if (g.type === 'keywords') return [{ label: L.atsTune[language] || L.atsTune.en, href: '/activities/cv-ats-1' }];
  if (g.type === 'interview') return [{ label: L.star3[language] || L.star3.en, href: '/activities/int-star-1' }];
  if (g.type === 'level') {
    return [
      { label: L.atsTune[language] || L.atsTune.en, href: '/activities/cv-ats-1' },
      { label: L.star3[language] || L.star3.en, href: '/activities/int-star-1' },
    ];
  }
  return [];
}

/* ---------------------------------------------------------
   Helper: months → stage
---------------------------------------------------------- */
function monthsToStage(totalMonths) {
  if (!Number.isFinite(totalMonths) || totalMonths <= 0) return 'New';
  if (totalMonths < 12) return 'New';
  if (totalMonths < 36) return 'Growing';
  if (totalMonths < 60) return 'Solid';
  return 'Seasoned';
}

/* =========================================================
   MAIN COMPONENT
========================================================= */
export default function ResultView({ assessmentId, language, userId = null }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  // Experience state
  const [expRows, setExpRows] = useState([]);
  const [expLoading, setExpLoading] = useState(false);
  const [showExpForm, setShowExpForm] = useState(false);

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
        en: 'Create 3 STAR stories', es: 'Crea 3 historias STAR', fr: 'Rédiger 3 histoires STAR',
        pt: 'Criar 3 histórias STAR', ta: '3 STAR கதைகள் உருவாக்கு', uk: 'Створіть 3 історії STAR', ar: 'أنشئ 3 قصص STAR',
      },
    },
  };

  // ===== Styles (inline) =====
  const styles = {
    container: { maxWidth: 820, margin: '40px auto', padding: 16 },
    progressBarOuter: { height: 12, background: '#eee', borderRadius: 6, overflow: 'hidden' },
    progressBarInner: (p) => ({
      width: `${p}%`,
      height: '100%',
      background: p >= 75 ? '#16a34a' : '#3b82f6',
      transition: 'width 400ms ease',
    }),
    roleGroup: { marginTop: 24 },
    card: {
      border: '1px solid #e5e7eb',
      borderRadius: 8,
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      padding: 14,
      marginBottom: 12,
      background: '#fff',
    },
    cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    title: { margin: 0, fontWeight: 600 },
    badge: (variant) => ({
      fontSize: 12,
      padding: '2px 8px',
      borderRadius: 999,
      ...(variant === 'ready'
        ? { background: '#DCFCE7', color: '#166534', border: '1px solid #86efac' }
