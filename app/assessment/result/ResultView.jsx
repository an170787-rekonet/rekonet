'use client';

import { useEffect, useMemo, useState } from 'react';

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
  };

  // ===== Styles (inline, no external CSS) =====
  const styles = {
    container: {
      maxWidth: 820, margin: '40px auto', padding: 16,
    },
    progressBarOuter: {
      height: 12, background: '#eee', borderRadius: 6, overflow: 'hidden',
    },
    progressBarInner: (p) => ({
      width: `${p}%`, height: '100%',
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
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
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
    return () => { on = false; };
  }, [qs]);

  if (loading) return <main style={{ padding: 24 }}>Loading…</main>;
  if (err) return <main style={{ padding: 24, color: 'crimson' }}>{err}</main>;
  if (!data) return <main style={{ padding: 24 }}>No data.</main>;

  const { summary, reflection, flightPath = [], progress, roleSuggestions } = data || {};
  const p = progress?.value ?? 0;
  const ready = roleSuggestions?.readyNow || [];
  const bridges = roleSuggestions?.bridgeRoles || [];

  // Small helper to render gaps with localized captions
  const renderGap = (g) => {
    if (!g) return null;
    const L = ui.gapLabels;
    if (g.type === 'interview') {
      return (
        <li>
          {(L.interviewMin[language] || L.interviewMin.en)}: {g.key}
        </li>
      );
    }
    if (g.type === 'level') {
      return (
        <li>
          {(L.levelReq[language] || L.levelReq.en)}: {g.key}
        </li>
      );
    }
    if (g.type === 'keywords') {
      return (
        <li>
          {(L.keywords[language] || L.keywords.en)}:{' '}
          {Array.isArray(g.key) ? g.key.join(', ') : String(g.key)}
        </li>
      );
    }
    if (g.type === 'certificate') {
      return (
        <li>
          {(L.certificates[language] || L.certificates.en)}:{' '}
          {Array.isArray(g.key) ? g.key.join(', ') : String(g.key)}
        </li>
      );
    }
    return null;
  };

  const RoleCard = ({ item, variant }) => (
    <article style={styles.card}>
      <header style={styles.cardHeader}>
        <h4 style={styles.title}>{item.title}</h4>
        <span style={styles.badge(variant)}>
          {variant === 'ready'
            ? (ui.badge.ready[language] || ui.badge.ready.en)
            : (ui.badge.bridge[language] || ui.badge.bridge.en)}
        </span>
      </header>
      {item.why && <p style={styles.why}>{item.why}</p>}
      {Array.isArray(item.gaps) && item.gaps.length > 0 && (
        <ul style={styles.gapList}>
          {item.gaps.map((g, i) => <span key={i}>{renderGap(g)}</span>)}
        </ul>
      )}
    </article>
  );

  return (
    <main
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      style={styles.container}
    >
      {/* Headline & message (already localized by API) */}
      <h2 style={{ marginTop: 0 }}>{summary?.headline || 'Your result'}</h2>
      <p style={{ color: '#444', marginTop: 4 }}>{summary?.message}</p>

      {/* Progress bar */}
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
              <div><strong>{s.title}</strong></div>
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
