'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';
import CvInsights from "./components/CvInsights";
import MyGoalForm from "./components/MyGoalForm";

/* ---------------------------------------------------------
   Support band component
---------------------------------------------------------- */
function SupportBand({ lang = 'en', path, readiness, experienceStage }) {
  const isRTL = lang === 'ar';
  const r = Number(readiness ?? 0);

  const L = {
    path: { en: 'Path', ar: 'المسار' },
    ready: { en: 'Readiness', ar: 'الجاهزية' },
    exploring: { en: 'Exploring', ar: 'استكشاف' },
    soonReady: { en: 'Soon ready', ar: 'قريبًا جاهز' },
    jobReady: { en: 'Job ready', ar: 'جاهز للعمل' },
    exp: { en: 'Experience', ar: 'الخبرة' },
    expNew: { en: 'New', ar: 'جديد' },
    expGrowing: { en: 'Growing', ar: 'في تطوّر' },
    expSolid: { en: 'Solid', ar: 'راسخ' },
    expSeasoned: { en: 'Seasoned', ar: 'متمرّس' },
  };

  const stageKey =
    r >= 100 ? 'jobReady' :
    r >= 50 ? 'soonReady' :
    'exploring';

  const expLabel = {
    New: L.expNew[lang],
    Growing: L.expGrowing[lang],
    Solid: L.expSolid[lang],
    Seasoned: L.expSeasoned[lang],
  }[experienceStage || 'New'];

  return (
    <section
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto auto',
        gap: 12,
        padding: '12px 14px',
        margin: '12px 0',
        borderRadius: 10,
        background: '#EEF2FF',
        border: '1px solid #A5B4FC'
      }}
    >
      <div>
        <strong>{L.path[lang]}:</strong> {L[stageKey][lang]}
      </div>

      <div>
        <strong>{L.exp[lang]}:</strong> {expLabel}
      </div>

      <div>
        <strong>{L.ready[lang]}:</strong> {r}%
      </div>
    </section>
  );
}

/* ---------------------------------------------------------
   Experience form
---------------------------------------------------------- */
function ExperienceForm({ userId, language = 'en', onSaved }) {
  const [domain, setDomain] = useState('customer_service');
  const [months, setMonths] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const isRTL = language === 'ar';

  async function save() {
    if (!userId || !months.trim()) return;
    setBusy(true); setMsg('');
    try {
      await supabase
        .from('experience_evidence')
        .upsert([{ user_id: userId, domain, months: Number(months) }], {
          onConflict: 'user_id,domain'
        });
      setMsg('Saved.');
      onSaved && onSaved();
    } catch (e) {
      setMsg(e.message);
    }
    setBusy(false);
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ marginTop: 8, padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
      <label>Domain:</label>
      <select value={domain} onChange={(e) => setDomain(e.target.value)}>
        <option value="customer_service">Customer service</option>
        <option value="admin">Admin</option>
        <option value="warehouse">Warehouse</option>
      </select>

      <label style={{ marginLeft: 10 }}>Months:</label>
      <input type="number" min={0} value={months} onChange={(e) => setMonths(e.target.value)} />

      <button onClick={save} disabled={busy}>
        {busy ? 'Saving…' : 'Save'}
      </button>

      {msg && <div>{msg}</div>}
    </div>
  );
}

/* ---------------------------------------------------------
   Chip for actions
---------------------------------------------------------- */
function Chip({ href, children, lang }) {
  return (
    <Link
      href={href}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 10px',
        borderRadius: 999,
        background: '#F3F4F6',
        border: '1px solid #E5E7EB',
        textDecoration: 'none',
        fontSize: 12
      }}
    >
      <span style={{ width: 6, height: 6, background: '#111', borderRadius: 999 }} />
      {children}
    </Link>
  );
}

/* ---------------------------------------------------------
   Main component
---------------------------------------------------------- */
export default function ResultView({ assessmentId, language, userId = null }) {

  /* STATE */
  const [data, setData] = useState(null);
  const [goalPlan, setGoalPlan] = useState(null);
  const [expRows, setExpRows] = useState([]);
  const [showExpForm, setShowExpForm] = useState(false);

  const qs = useMemo(() => {
    const params = new URLSearchParams();
    params.set('assessment_id', assessmentId || 'demo');
    params.set('language', language || 'en');
    if (userId) params.set('user_id', userId);
    return params.toString();
  }, [assessmentId, language, userId]);

  /* LOAD RESULTS */
  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/assessment/result?${qs}`);
      setData(await res.json());
    })();
  }, [qs]);

  /* LOAD EXPERIENCE */
  async function loadExperience() {
    if (!userId) return;
    const { data } = await supabase
      .from('experience_evidence')
      .select('months');
    setExpRows(data || []);
  }
  useEffect(() => { loadExperience(); }, [userId]);

  const totalMonths = expRows.reduce((a, b) => a + (b.months || 0), 0);
  const experienceStage =
    totalMonths >= 60 ? 'Seasoned' :
    totalMonths >= 36 ? 'Solid' :
    totalMonths >= 12 ? 'Growing' :
    'New';

  if (!data) return <main>Loading…</main>;

  const { summary, reflection, flightPath = [], progress, roleSuggestions, path } = data;

  /* Param helper */
  const withParams = (base) => {
    const p = new URLSearchParams();
    p.set('assessment_id', assessmentId || 'demo');
    p.set('language', language);
    if (userId) p.set('user_id', userId);
    return `${base}?${p.toString()}`;
  };

  /* GOAL LABELS */
  const goalL = {
    panelTitle: { en: 'My goal — guidance', ar: 'هدفي — إرشادات' },
    alreadyHave: { en: 'Already have', ar: 'متوفر لديك' },
    gentlyMissing: { en: 'Gently missing', ar: 'قيد الإضافة' },
    suggestions: { en: 'Suggested next actions', ar: 'الإجراءات المقترحة' },
    chooseHint: { en: 'Choose a goal above to see guidance.', ar: 'اختر هدفًا بالأعلى لعرض الإرشادات.' }
  };

  return (
    <main dir={language === 'ar' ? 'rtl' : 'ltr'} style={{ maxWidth: 820, margin: '40px auto', padding: 16 }}>

      <h2>{summary?.headline || 'Your starting point'}</h2>
      <p>{summary?.message}</p>

      <SupportBand
        lang={language}
        path={path}
        readiness={progress?.value}
        experienceStage={experienceStage}
      />

      <CvInsights userId={userId} language={language} />

      <MyGoalForm userId={userId} language={language} onResult={setGoalPlan} />

      {/* -----------------------------------------
          GOAL RESULTS PANEL (fixed version)
      ------------------------------------------ */}
      {goalPlan && goalPlan.ok ? (
        <section
          dir={language === 'ar' ? 'rtl' : 'ltr'}
          style={{
            marginTop: 12,
            marginBottom: 20,
            padding: 12,
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            background: '#fff'
          }}
        >
          <h3>
            {(goalL.panelTitle[language] || goalL.panelTitle.en)} — {goalPlan.goal}
          </h3>

          {/* Already have */}
          <div style={{ marginTop: 8 }}>
            <strong>{goalL.alreadyHave[language] || goalL.alreadyHave.en}:</strong>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
              {(goalPlan.alreadyHave || []).map((k) => (
                <span key={k} style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: 6 }}>
                  {k}
                </span>
              ))}
            </div>
          </div>

          {/* Gently missing */}
          <div style={{ marginTop: 12 }}>
            <strong>{goalL.gentlyMissing[language] || goalL.gentlyMissing.en}:</strong>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
              {(goalPlan.gentlyMissing || []).map((k) => (
                <span key={k} style={{ background: '#fff7ed', padding: '4px 8px', borderRadius: 6 }}>
                  {k}
                </span>
              ))}
            </div>

            {/* Suggested actions */}
            {goalPlan.gentlyMissing?.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <strong>{goalL.suggestions[language] || goalL.suggestions.en}:</strong>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
                  <Chip href={withParams('/activities/cv-ats-1')} lang={language}>
                    ATS CV tune (10 min)
                  </Chip>
                  <Chip href={withParams('/activities/int-star-1')} lang={language}>
                    Create 3 STAR stories
                  </Chip>
                </div>
              </div>
            )}
          </div>
        </section>
      ) : (
        <>
          {/* JSX-safe fallback */}
          <div style={{ marginTop: 8, color: '#6b7280' }}>
            {goalL.chooseHint[language] || goalL.chooseHint.en}
          </div>
        </>
      )}

      {/* Experience */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 20 }}>
        <small>Total experience: <strong>{totalMonths}</strong> months</small>

        {userId && (
          <button
            onClick={() => setShowExpForm((v) => !v)}
            style={{
              padding: '6px 10px',
              background: '#F3F4F6',
              border: '1px solid #E5E7EB',
              borderRadius: 8
            }}
          >
            {showExpForm ? 'Hide' : 'Add or edit experience'}
          </button>
        )}
      </div>

      {showExpForm && (
        <ExperienceForm userId={userId} language={language} onSaved={loadExperience} />
      )}

    </main>
  );
}
