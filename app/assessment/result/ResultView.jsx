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

  return (
    <main
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      style={{ maxWidth: 820, margin: '40px auto', padding: 16 }}
    >
      {/* Headline & message (already localized by API) */}
      <h2 style={{ marginTop: 0 }}>{summary?.headline || 'Your result'}</h2>
      <p style={{ color: '#444', marginTop: 4 }}>{summary?.message}</p>

      {/* Progress bar */}
      <section style={{ margin: '20px 0' }}>
        <label style={{ display: 'block', marginBottom: 8 }}>
          <strong>{ui.progress[language] || ui.progress.en}</strong>
        </label>
        <div style={{ height: 12, background: '#eee', borderRadius: 6, overflow: 'hidden' }}>
          <div
            style={{
              width: `${p}%`,
              height: '100%',
              background: p >= 75 ? '#16a34a' : '#3b82f6',
              transition: 'width 400ms ease',
            }}
          />
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

      {/* Role suggestions */}
      <section style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 8 }}>{ui.suggestedRoles[language] || ui.suggestedRoles.en}</h3>

        {ready.length > 0 && (
          <>
            <h4 style={{ color: '#16a34a', marginBottom: 4 }}>
              {ui.readyHeading[language] || ui.readyHeading.en}
            </h4>
            <ul>
              {ready.map((r) => (
                <li key={r.title} style={{ marginBottom: 6 }}>
                  <strong>{r.title}</strong> — {r.why} {typeof r.match === 'number' ? `(${r.match}%)` : ''}
                </li>
              ))}
            </ul>
          </>
        )}

        {bridges.length > 0 && (
          <>
            <h4 style={{ color: '#a16207', margin: '12px 0 4px' }}>
              {ui.bridgeHeading[language] || ui.bridgeHeading.en}
            </h4>
            <ul>
              {bridges.map((r) => (
                <li key={r.title} style={{ marginBottom: 10 }}>
                  <strong>{r.title}</strong> — {r.why}
                  {Array.isArray(r.gaps) && r.gaps.length > 0 && (
                    <ul style={{ marginTop: 6 }}>
                      {r.gaps.map((g, i) => (
                        <li key={i} style={{ color: '#555' }}>
                          {g.type === 'interview' && (
                            <>
                              {ui.gapLabels.interviewMin[language] || ui.gapLabels.interviewMin.en}: {g.key}
                            </>
                          )}
                          {g.type === 'level' && (
                            <>
                              {ui.gapLabels.levelReq[language] || ui.gapLabels.levelReq.en}: {g.key}
                            </>
                          )}
                          {g.type === 'keywords' && (
                            <>
                              {ui.gapLabels.keywords[language] || ui.gapLabels.keywords.en}:{' '}
                              {Array.isArray(g.key) ? g.key.join(', ') : String(g.key)}
                            </>
                          )}
                          {g.type === 'certificate' && (
                            <>
                              {ui.gapLabels.certificates[language] || ui.gapLabels.certificates.en}:{' '}
                              {Array.isArray(g.key) ? g.key.join(', ') : String(g.key)}
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
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
