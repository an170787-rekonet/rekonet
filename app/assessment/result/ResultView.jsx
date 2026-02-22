'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

/* Support band: Path stage + Readiness %, no Level */
function SupportBand({ lang = 'en', path, readiness }) {
  const isRTL = lang === 'ar';
  const r = Number(readiness ?? 0);

  const L = {
    path: { en: 'Path', es: 'Ruta', fr: 'Parcours', pt: 'Percurso', ta: 'பாதை', uk: 'Шлях', ar: 'المسار' },
    ready: { en: 'Readiness', es: 'Preparación', fr: 'Préparation', pt: 'Prontidão', ta: 'தயார்நிலை', uk: 'Готовність', ar: 'الجاهزية' },
    exploring: { en: 'Exploring', es: 'Explorando', fr: 'Exploration', pt: 'Explorando', ta: 'ஆராய்ச்சி', uk: 'Досліджуємо', ar: 'استكشاف' },
    soonReady: { en: 'Soon ready', es: 'Casi listo', fr: 'Bientôt prêt', pt: 'Quase pronto', ta: 'விரைவில் தயாராக', uk: 'Скоро готово', ar: 'قريبًا جاهز' },
    jobReady: { en: 'Job ready', es: 'Listo para el trabajo', fr: 'Prêt pour l’emploi', pt: 'Pronto para o trabalho', ta: 'வேலையிற்குத் தயாராக', uk: 'Готово до роботи', ar: 'جاهز للعمل' },
    foundations: { en: 'Foundations' },
    precision: { en: 'Precision' },
  };

  const pathKey = (path || '').toLowerCase() === 'precision' ? 'precision' : 'foundations';
  let stageKey = pathKey === 'precision' ? 'soonReady' : 'exploring';
  if (r >= 100) stageKey = 'jobReady';

  const bandColors =
    r < 25
      ? { bg: '#FFF7ED', text: '#9A3412', ring: '#FDBA74' }
      : r < 50
      ? { bg: '#FEF9C3', text: '#92400E', ring: '#FDE68A' }
      : r < 75
      ? { bg: '#ECFDF5', text: '#065F46', ring: '#6EE7B7' }
      : r < 100
      ? { bg: '#EEF2FF', text: '#3730A3', ring: '#A5B4FC' }
      : { bg: '#F0FDF4', text: '#166534', ring: '#4ADE80' };

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
      {/* Path stage (friendly wording) */}
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

      {/* Readiness % (gentle style) */}
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

/* Small “Chip” button for gap actions */
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

/* Map each gap to deep-link actions */
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
  // certificate and others: placeholder for future route
  return [];
}

export default function ResultView({ assessmentId, language, userId = null }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  // ===== UI labels per language =====
  const ui = {
    progress: {
      en: 'Progress',
      es: 'Progreso',
      fr: 'Progrès',
      pt: 'Progresso',
      ta: 'முன்னேற்றம்',
      uk: 'Прогрес',
      ar: 'التقدّم',
    },
    nextSteps: {
      en: 'Your next steps',
      es: 'Tus próximos pasos',
      fr: 'Vos prochaines étapes',
      pt: 'Seus próximos passos',
      ta: 'உங்கள் அடுத்த படிகள்',
      uk: 'Ваші наступні кроки',
      ar: 'خطواتك التالية',
    },
    suggestedRoles: {
      en: 'Suggested roles',
      es: 'Roles sugeridos',
      fr: 'Rôles suggérés',
      pt: 'Funções sugeridas',
      ta: 'பரிந்துரைக்கப்பட்ட வேடங்கள்',
      uk: 'Рекомендовані ролі',
      ar: 'الأدوار المقترحة',
    },
    readyHeading: {
      en: 'Ready now',
      es: 'Listo ahora',
      fr: 'Prêt maintenant',
      pt: 'Pronto agora',
      ta: 'தயார்',
      uk: 'Готові вже',
      ar: 'جاهز الآن',
    },
    bridgeHeading: {
      en: 'Bridge roles (1–2 gaps)',
      es: 'Roles puente (1–2 brechas)',
      fr: 'Rôles passerelle (1–2 écarts)',
      pt: 'Funções ponte (1–2 lacunas)',
      ta: 'பாலம் வேடங்கள் (1–2 இடைவெளிகள்)',
      uk: 'Ролі‑містки (1–2 прогалини)',
      ar: 'أدوار الجسر (فجوة أو فجوتان)',
    },
    badge: {
      ready: {
        en: 'Ready',
        es: 'Listo',
        fr: 'Prêt',
        pt: 'Pronto',
        ta: 'தயார்',
        uk: 'Готово',
        ar: 'جاهز',
      },
      bridge: {
        en: 'Bridge',
        es: 'Puente',
        fr: 'Passerelle',
        pt: 'Ponte',
        ta: 'பாலம்',
        uk: 'Місток',
        ar: 'جسر',
      },
    },
    gapLabels: {
      interviewMin: {
        en: 'Interview minimum',
        es: 'Entrevista mínima',
        fr: 'Seuil d’entretien',
        pt: 'Mínimo de entrevista',
        ta: 'நேர்காணல் குறைந்தபட்சம்',
        uk: 'Мінімум співбесіди',
        ar: 'الحد الأدنى للمقابلة',
      },
      levelReq: {
        en: 'Overall level',
        es: 'Nivel global',
        fr: 'Niveau global',
        pt: 'Nível geral',
        ta: 'மொத்த நிலை',
        uk: 'Загальний рівень',
        ar: 'المستوى العام',
      },
      keywords: {
        en: 'Keywords',
        es: 'Palabras clave',
        fr: 'Mots‑clés',
        pt: 'Palavras‑chave',
        ta: 'முக்கிய சொற்கள்',
        uk: 'Ключові слова',
        ar: 'الكلمات المفتاحية',
      },
      certificates: {
        en: 'Certificates',
        es: 'Certificados',
        fr: 'Certificats',
        pt: 'Certificados',
        ta: 'சான்றிதழ்கள்',
        uk: 'Сертифікати',
        ar: 'الشهادات',
      },
    },
    // Action chip labels
    actionLabels: {
      atsTune: {
        en: 'ATS CV tune (10 min)',
        es: 'Ajuste ATS del CV (10 min)',
        fr: 'Ajuster le CV pour ATS (10 min)',
        pt: 'Ajuste ATS do CV (10 min)',
        ta: 'ATS CV திருத்தம் (10 நிமி)',
        uk: 'Налаштування резюме під ATS (10 хв)',
        ar: 'ملاءمة السيرة الذاتية لنظام ATS (10 دقائق)',
      },
      star3: {
        en: 'Create 3 STAR stories',
        es: 'Crea 3 historias STAR',
        fr: 'Rédiger 3 histoires STAR',
        pt: 'Criar 3 histórias STAR',
        ta: '3 STAR கதைகள் உருவாக்கு',
        uk: 'Створіть 3 історії STAR',
        ar: 'أنشئ 3 قصص STAR',
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
        : { background: '#FEF3C7', color: '#92400E', border: '1px solid #fcd34d' }),
      whiteSpace: 'nowrap',
    }),
    why: { color: '#444', margin: '8px 0 4px' },
    gapList: { color: '#555', margin: '6px 0 0 0' },
    chipsRow: { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 },
  };

  // ===== Build query string from props =====
  const qs = useMemo(() => {
    const params = new URLSearchParams();
    params.set('assessment_id', assessmentId || 'demo');
    params.set('language', (language || 'en').toLowerCase());
    if (userId) params.set('user_id', userId);
    return params.toString();
  }, [assessmentId, language, userId]);

  // ===== Fetch the Result API =====
  useEffect(() => {
    let on = true;
    setLoading(true);
    setErr('');
    (async () => {
      try {
        const res = await fetch(`/api/assessment/result?${qs}`, { cache: 'no-store' });
        const json = await res.json();
        if (!on) return;
        if (res.ok) setData(json);
        else setErr(json?.error || 'Could not load result.');
      } catch (e) {
        if (on) setErr(String(e?.message || e));
      } finally {
        if (on) setLoading(false);
      }
    })();
    return () => {
      on = false;
    };
  }, [qs]);

  if (loading) return <main style={{ padding: 24 }}>Loading…</main>;
  if (err) return <main style={{ padding: 24, color: 'crimson' }}>{err}</main>;
  if (!data) return <main style={{ padding: 24 }}>No data.</main>;

  const { summary, reflection, flightPath = [], progress, roleSuggestions, path } = data || {};
  const p = progress?.value ?? 0;
  const ready = roleSuggestions?.readyNow || [];
  const bridges = roleSuggestions?.bridgeRoles || [];

  // Render gaps with localized captions + action chips
  const renderGap = (g) => {
    if (!g) return null;
    const L = ui.gapLabels;
    let label = '';
    if (g.type === 'interview') {
      label = `${L.interviewMin[language] || L.interviewMin.en}: ${g.key}`;
    } else if (g.type === 'level') {
      label = `${L.levelReq[language] || L.levelReq.en}: ${g.key}`;
    } else if (g.type === 'keywords') {
      const keys = Array.isArray(g.key) ? g.key.join(', ') : String(g.key);
      label = `${L.keywords[language] || L.keywords.en}: ${keys}`;
    } else if (g.type === 'certificate') {
      const keys = Array.isArray(g.key) ? g.key.join(', ') : String(g.key);
      label = `${L.certificates[language] || L.certificates.en}: ${keys}`;
    }
    const actions = actionsForGap(g, ui, language);
    return (
      <li>
        {label}
        {actions.length > 0 && (
          <div style={styles.chipsRow} dir={language === 'ar' ? 'rtl' : 'ltr'}>
            {actions.map((a, idx) => (
              <Chip key={`${g.type}-${idx}`} href={a.href} lang={language}>
                {a.label}
              </Chip>
            ))}
          </div>
        )}
      </li>
    );
  };

  const RoleCard = ({ item, variant }) => (
    <article style={styles.card}>
      <header style={styles.cardHeader}>
        <h4 style={styles.title}>{item.title}</h4>
        <span style={styles.badge(variant)}>
          {variant === 'ready'
            ? ui.badge.ready[language] || ui.badge.ready.en
            : ui.badge.bridge[language] || ui.badge.bridge.en}
        </span>
      </header>
      {item.why && <p style={styles.why}>{item.why}</p>}
      {Array.isArray(item.gaps) && item.gaps.length > 0 && (
        <ul style={styles.gapList}>
          {item.gaps.map((g, i) => (
            <span key={i}>{renderGap(g)}</span>
          ))}
        </ul>
      )}
    </article>
  );

  return (
    <main dir={language === 'ar' ? 'rtl' : 'ltr'} style={styles.container}>
      {/* Headline & message (already localized by API) */}
      <h2 style={{ marginTop: 0 }}>{summary?.headline || 'Your starting point'}</h2>
      <p style={{ color: '#444', marginTop: 4 }}>{summary?.message}</p>

      {/* Support band (Path stage + Readiness %) */}
      <SupportBand lang={language} path={path} readiness={progress?.value} />

      {/* Progress bar (you can remove the line with {p}% if you want no numbers here) */}
      <section style={{ margin: '20px 0' }}>
        <label style={{ display: 'block', marginBottom: 8 }}>
          <strong>{ui.progress[language] || ui.progress.en}</strong>
        </label>
        <div style={styles.progressBarOuter}>
          <div style={styles.progressBarInner(p)} />
        </div>
        <div style={{ fontSize: 12, color: '#444', marginTop: 6 }}>{p}%</div>
        {progress?.nextPrompt && (
          <div style={{ fontSize: 13, color: '#333', marginTop: 6 }}>{progress.nextPrompt}</div>
        )}
      </section>

      {/* Next steps / flight path */}
      <section style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 8 }}>{ui.nextSteps[language] || ui.nextSteps.en}</h3>
        <ol style={{ paddingInlineStart: language === 'ar' ? 24 : 32 }}>
          {flightPath.map((s, idx) => (
            <li key={idx} style={{ marginBottom: 12 }}>
              <div>
                <strong>{s.title}</strong>
              </div>
              <div style={{ color: '#555' }}>{s.why}</div>
              <div style={{ color: '#333' }}>{s.next}</div>
            </li>
          ))}
        </ol>
      </section>

      {/* Role suggestions (cards) */}
      <section style={styles.roleGroup}>
        <h3 style={{ marginBottom: 8 }}>{ui.suggestedRoles[language] || ui.suggestedRoles.en}</h3>

        {/* Ready now cards */}
        {ready.length > 0 && (
          <>
            <h4 style={{ color: '#16a34a', margin: '8px 0' }}>
              {ui.readyHeading[language] || ui.readyHeading.en}
            </h4>
            {ready.map((r) => (
              <RoleCard key={`ready-${r.title}`} item={r} variant="ready" />
            ))}
          </>
        )}

        {/* Bridge role cards */}
        {bridges.length > 0 && (
          <>
            <h4 style={{ color: '#a16207', margin: '14px 0 8px' }}>
              {ui.bridgeHeading[language] || ui.bridgeHeading.en}
            </h4>
            {bridges.map((r) => (
              <RoleCard key={`bridge-${r.title}`} item={r} variant="bridge" />
            ))}
          </>
        )}

        {ready.length === 0 && bridges.length === 0 && <p>No suggestions yet.</p>}
      </section>

      {/* Reflection / nudge (already localized by API) */}
      {reflection && (
        <section style={{ marginTop: 24, paddingTop: 8, borderTop: '1px solid #eee' }}>
          <p style={{ color: '#444' }}>{reflection}</p>
        </section>
      )}
    </main>
  );
}
