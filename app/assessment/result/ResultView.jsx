// app/assessment/result/ResultView.jsx
'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';

// Panels/components already in your project
import CvInsights from './components/CvInsights';
import MyGoalForm from './components/MyGoalForm';
import LiveJobsLinks from './components/LiveJobsLinks';
import AvailabilityCard from './components/AvailabilityCard';

/* ---------------------------------------------------------
   Support band (Path + Experience + Readiness)
   – Bilingual + RTL
---------------------------------------------------------- */
function SupportBand({ lang = 'en', path, readiness, experienceStage }) {
  const isRTL = lang === 'ar';
  const r = Number(readiness ?? 0);

  const L = {
    path: { en: 'Path', ar: 'المسار' },
    ready: { en: 'Readiness', ar: 'الجاهزية' },
    exp: { en: 'Experience', ar: 'الخبرة' },
    expNew: { en: 'New', ar: 'جديد' },
    expGrowing: { en: 'Growing', ar: 'في تطوّر' },
    expSolid: { en: 'Solid', ar: 'راسخ' },
    expSeasoned: { en: 'Seasoned', ar: 'متمرّس' },
    exploring: { en: 'Exploring', ar: 'استكشاف' },
    soonReady: { en: 'Soon ready', ar: 'قريبًا جاهز' },
    jobReady: { en: 'Job ready', ar: 'جاهز للعمل' },
  };

  // Friendly stage (keep gentle)
  const stageKey = r >= 100 ? 'jobReady' : r >= 50 ? 'soonReady' : 'exploring';

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
        borderRadius: 10,
        background: '#EEF2FF',
        border: '1px solid #A5B4FC',
        margin: '12px 0',
        alignItems: 'center',
      }}
      aria-label="Support overview"
    >
      <div style={{ fontSize: 14, color: '#374151' }}>
        <strong>{L.path[lang]}: </strong>{L[stageKey][lang]}
      </div>
      <div style={{ fontSize: 14, color: '#374151' }}>
        <strong>{L.exp[lang]}: </strong>{expLabel}
      </div>
      <div style={{ fontSize: 14, color: '#374151' }}>
        <strong>{L.ready[lang]}: </strong>{Number.isFinite(r) ? `${r}%` : '—'}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------
   Experience mini‑form (inline): domain + months
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
        <select value={domain} onChange={(e) => setDomain(e.target.value)} style={{ padding: 8, border: '1px solid #ddd', borderRadius: 6 }}>
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
            color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600,
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
   Small chip UI
---------------------------------------------------------- */
function Chip({ href, children, lang = 'en' }) {
  const isRTL = lang === 'ar';
  return (
    <Link
      href={href}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '6px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
        color: '#1F2937', background: '#F3F4F6', border: '1px solid #E5E7EB',
        textDecoration: 'none',
      }}
      dir={isRTL ? 'rtl' : 'ltr'}
      aria-label={typeof children === 'string' ? children : 'Action'}
    >
      <span aria-hidden style={{ width: 6, height: 6, borderRadius: 999, background: '#111827', display: 'inline-block' }} />
      {children}
    </Link>
  );
}

/* ---------------------------------------------------------
   Helpers for experience level
---------------------------------------------------------- */
function monthsToStage(totalMonths) {
  if (!Number.isFinite(totalMonths) || totalMonths <= 0) return 'New';
  if (totalMonths < 12) return 'New';
  if (totalMonths < 36) return 'Growing';
  if (totalMonths < 60) return 'Solid';
  return 'Seasoned';
}

/* ---------------------------------------------------------
   PR‑6: Availability & travel‑aware scoring helpers
---------------------------------------------------------- */
const UK_POSTCODE_REGEX = /\b([A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}|GIR ?0AA)\b/i;
const IN_PERSON_WORDS = [
  'assistant','advisor','associate','reception','front of house','warehouse','retail','store',
  'customer service','call centre','contact centre','team member','host','server','barista','care assistant'
];
const REMOTE_WORDS = ['remote','work from home','hybrid'];

const PT_WORDS = ['part-time','part time','pt'];
const WEEKEND_WORDS = ['weekend','saturday','sunday','weekends'];
const EVENING_WORDS = ['evening','late','night','twilight','pm shift','night shift'];
const MORNING_WORDS = ['morning','am shift','early'];
const AFTERNOON_WORDS = ['afternoon','pm','day shift'];

function stringHitsAny(s = '', words = []) {
  const t = String(s).toLowerCase();
  return words.some(w => t.includes(w));
}

function availabilityBoostForTitle(roleTitle = '', availability) {
  if (!availability) return 0;
  const t = (roleTitle || '').toLowerCase();
  let score = 0;

  // Contract
  const c = (availability.contract || '').toLowerCase();
  if (c === 'part_time' && stringHitsAny(t, PT_WORDS)) score += 1.0;
  if (c === 'weekends' && stringHitsAny(t, WEEKEND_WORDS)) score += 0.75;
  // 'any' and 'full_time' → neutral

  // Times
  const times = availability.times || {};
  if (times.evening && stringHitsAny(t, EVENING_WORDS)) score += 0.6;
  if (times.morning && stringHitsAny(t, MORNING_WORDS)) score += 0.45;
  if (times.afternoon && stringHitsAny(t, AFTERNOON_WORDS)) score += 0.45;

  return score; // additive, small
}

function proximityBoostForTitle(roleTitle = '', place = '', availability) {
  // Gentle boost for likely in‑person titles when user entered a UK postcode and keeps travel small (≤30 mins)
  if (!place || !UK_POSTCODE_REGEX.test(place)) return 0;
  const max = Number(availability?.max_travel_mins ?? 0);
  if (!Number.isFinite(max) || max <= 0 || max > 30) return 0;

  const t = (roleTitle || '').toLowerCase();
  let s = 0;
  if (stringHitsAny(t, IN_PERSON_WORDS)) s += 0.35;  // slight lift for in‑person roles
  if (stringHitsAny(t, REMOTE_WORDS))     s -= 0.15; // if explicitly remote, reduce a touch
  return s;
}

function availabilityWhy(availability, language = 'en') {
  if (!availability) return '';
  const parts = [];

  const c = (availability.contract || '').toLowerCase();
  if (c === 'part_time') parts.push(language === 'ar' ? 'دوام جزئي' : 'part‑time');
  else if (c === 'weekends') parts.push(language === 'ar' ? 'عطلات نهاية الأسبوع' : 'weekends');
  else if (c === 'full_time') parts.push(language === 'ar' ? 'دوام كامل' : 'full‑time');
  else if (c === 'any') parts.push(language === 'ar' ? 'مرن' : 'flexible');

  const t = availability.times || {};
  const tLabels = [];
  if (t.morning)   tLabels.push(language === 'ar' ? 'الصباح'     : 'morning');
  if (t.afternoon) tLabels.push(language === 'ar' ? 'بعد الظهر'  : 'afternoon');
  if (t.evening)   tLabels.push(language === 'ar' ? 'المساء'     : 'evening');

  if (tLabels.length) parts.push(tLabels.join(language === 'ar' ? ' و' : ' & '));

  if (parts.length === 0) return '';
  return language === 'ar'
    ? `متوافق مع توافرك (${parts.join('، ')}).`
    : `Matches your availability (${parts.join(', ')}).`;
}

/* ---------------------------------------------------------
   PR‑6: Enhanced role ranking (availability + proximity)
   – with CV keyword cap to avoid over‑boosting
---------------------------------------------------------- */
function enhanceRoles({
  readyNow = [],
  bridgeRoles = [],
  cvTopKeywords = [],
  experienceStage = 'New',
  goalTitle = '',
  availability = null,
  place = '',
}) {
  const kwSet = new Set((cvTopKeywords || []).map((k) => String(k).toLowerCase()));
  const levelBoost =
    experienceStage === 'Seasoned' ? 2 :
    experienceStage === 'Solid'    ? 1.5 :
    experienceStage === 'Growing'  ? 1.25 : 1;

  function keywordScore(title, why, gaps) {
    // Rebalanced weights + cap to avoid over‑boosting
    // title: 1.2, why: 0.8, gaps: 0.4  → cap total KW to 2.5
    const t = String(title || '').toLowerCase();
    const w = String(why || '').toLowerCase();
    const g = JSON.stringify(gaps || []).toLowerCase();

    let sum = 0;
    for (const kw of kwSet) {
      if (!kw) continue;
      if (t.includes(kw)) sum += 1.2;
      if (w.includes(kw)) sum += 0.8;
      if (g.includes(kw)) sum += 0.4;
      if (sum >= 2.5) break; // cap early
    }
    return Math.min(sum, 2.5);
  }

  function scoreRole(role) {
    const title = (role?.title || '').toLowerCase();

    // Base: goal alignment
    let score = 0;
    if (goalTitle && title.includes(String(goalTitle).toLowerCase())) score += 2;

    // CV keyword overlaps (capped)
    const kw = keywordScore(role?.title, role?.why, role?.gaps);
    score += kw;

    // PR‑6 additions
    const availB = availabilityBoostForTitle(role?.title, availability);     // availability
    const proxB  = proximityBoostForTitle(role?.title, place, availability); // travel proximity
    score += availB + proxB;

    // level as the final multiplier
    score *= levelBoost;

    return { score, availB, proxB, kw };
  }

  const ready = [...readyNow]
    .map((r) => {
      const s = scoreRole(r);
      return { ...r, _enhScore: s.score, _availabilityBoost: s.availB, _proximityBoost: s.proxB, _kwScore: s.kw, _variant: 'ready' };
    })
    .sort((a, b) => b._enhScore - a._enhScore);

  const bridges = [...bridgeRoles]
    .map((r) => {
      const s = scoreRole(r);
      return { ...r, _enhScore: s.score, _availabilityBoost: s.availB, _proximityBoost: s.proxB, _kwScore: s.kw, _variant: 'bridge' };
    })
    .sort((a, b) => b._enhScore - a._enhScore);

  return { ready, bridges };
}

/* =========================================================
   MAIN
========================================================= */
export default function ResultView({ assessmentId, language, userId = null }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  // Goal & city
  const [goalPlan, setGoalPlan] = useState(null);
  const [city, setCity] = useState('');

  // Availability (PR‑5A + used by PR‑5B/PR‑6)
  const [availability, setAvailability] = useState(null);
  const [loadingAvail, setLoadingAvail] = useState(true);
  const [savingAvail, setSavingAvail] = useState(false);
  const [errorAvail, setErrorAvail] = useState('');

  // CV summary (top keywords/sectors for links & heuristics)
  const [cvSummary, setCvSummary] = useState(null);

  // Experience
  const [expRows, setExpRows] = useState([]);
  const [expLoading, setExpLoading] = useState(false);
  const [showExpForm, setShowExpForm] = useState(false);

  /* ---------- query string helper (existing API) ---------- */
  const qs = useMemo(() => {
    const params = new URLSearchParams();
    params.set('assessment_id', assessmentId || 'demo');
    params.set('language', (language || 'en').toLowerCase());
    if (userId) params.set('user_id', userId);
    return params.toString();
  }, [assessmentId, language, userId]);

  const withParams = (base) => {
    const q = new URLSearchParams();
    q.set('assessment_id', assessmentId || 'demo');
    q.set('language', (language || 'en').toLowerCase());
    if (userId) q.set('user_id', userId);
    return `${base}?${q.toString()}`;
  };

  /* ---------- load result data ---------- */
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

  /* ---------- load CV summary for topKeywords ---------- */
  useEffect(() => {
    let on = true;
    if (!userId) { setCvSummary(null); return; }
    (async () => {
      try {
        const r = await fetch(
          `/api/cv/summary?user_id=${encodeURIComponent(userId)}&language=${encodeURIComponent((language || 'en').toLowerCase())}`,
          { cache: 'no-store' }
        );
        const j = await r.json();
        if (on) setCvSummary(j?.ok ? j : null);
      } catch {
        // ignore
      }
    })();
    return () => { on = false; };
  }, [userId, language]);

  /* ---------- load experience ---------- */
  async function loadExperience() {
    if (!userId) { setExpRows([]); return; }
    setExpLoading(true);
    try {
      const { data, error } = await supabase
        .from('experience_evidence')
        .select('domain, months')
        .eq('user_id', userId);
      if (error) throw error;
      setExpRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('experience load', e);
    } finally {
      setExpLoading(false);
    }
  }
  useEffect(() => { loadExperience(); }, [userId]);

  /* ---------- derive experience stage ---------- */
  const totalMonths = expRows.reduce((acc, r) => acc + (Number(r?.months) || 0), 0);
  const experienceStage = monthsToStage(totalMonths);

  /* ---------- PR‑5A: load & save Availability via API ---------- */
  useEffect(() => {
    let ignore = false;
    async function loadAvailability() {
      try {
        if (!assessmentId) return;
        setLoadingAvail(true);
        setErrorAvail('');
        const res = await fetch(`/api/availability/${assessmentId}`, { cache: 'no-store' });
        const json = await res.json();
        if (!ignore) setAvailability(json?.data || null);
      } catch (e) {
        if (!ignore) setErrorAvail('Failed to load availability.');
      } finally {
        if (!ignore) setLoadingAvail(false);
      }
    }
    loadAvailability();
    return () => { ignore = true; };
  }, [assessmentId]);

  const handleSaveAvailability = useCallback(async (value) => {
  if (savingAvail) return false;

  setSavingAvail(true);
  setErrorAvail("");

  try {
    const res = await fetch(`/api/availability/${assessmentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value),
    });

    const json = await res.json().catch(() => null);

    if (!json?.ok) {
      const msg = json?.error || "Failed to save availability.";
      throw new Error(msg);
    }

    setAvailability(json.data);

    return true;
  } catch (e) {
    console.error(e);
    setErrorAvail(e?.message || "Failed to save availability.");
    return false;
  } finally {
    setSavingAvail(false);
  }
}, [assessmentId, savingAvail]);
  /* ---------- loading guards ---------- */
  if (loading) return <main style={{ padding: 24 }}>Loading…</main>;
  if (err) return <main style={{ padding: 24, color: 'crimson' }}>{err}</main>;
  if (!data) return <main style={{ padding: 24 }}>No data.</main>;

  const { summary, reflection, flightPath = [], progress, roleSuggestions = {}, path } = data || {};
  const p = progress?.value ?? 0;

  // PR‑6: availability + proximity‑aware enhanced roles
  const { ready: rolesReady, bridges: rolesBridge } = enhanceRoles({
    readyNow: roleSuggestions.readyNow,
    bridgeRoles: roleSuggestions.bridgeRoles,
    cvTopKeywords: cvSummary?.topKeywords || [],
    experienceStage,
    goalTitle: goalPlan?.goal || '',
    availability,
    place: city || '',
  });

  const styles = {
    container: { maxWidth: 820, margin: '40px auto', padding: 16 },
    progressOuter: { height: 12, background: '#eee', borderRadius: 6, overflow: 'hidden' },
    progressInner: { width: `${p}%`, height: '100%', background: p >= 75 ? '#16a34a' : '#3b82f6', transition: 'width 400ms ease' },
    card: { border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.04)', padding: 14, marginBottom: 12, background: '#fff' },
    chipsRow: { display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8, marginBottom: 12 },
    expRow: { display: 'flex', gap: 8, alignItems: 'center', marginTop: 20, marginBottom: 12 },
  };

  const ui = {
    nextSteps: { en: 'Your next steps', ar: 'خطواتك التالية' },
    suggestedRoles: { en: 'Suggested roles', ar: 'الأدوار المقترحة' },
    readyHeading: { en: 'Ready now', ar: 'جاهز الآن' },
    bridgeHeading: { en: 'Bridge roles (1–2 gaps)', ar: 'أدوار الجسر (فجوة أو فجوتان)' },
    progress: { en: 'Progress', ar: 'التقدّم' },
    alreadyHave: { en: 'Already have', ar: 'متوفر لديك' },
    gentlyMissing: { en: 'Gently missing', ar: 'قيد الإضافة' },
    suggestions: { en: 'Suggested next actions', ar: 'الإجراءات المقترحة' },
  };

  /* ---------- Role card ---------- */
  function RoleCard({ item, variant }) {
    const availLine = availabilityWhy(availability, language);
    const boosted = ((item._availabilityBoost || 0) + (item._proximityBoost || 0)) > 0.2;

    const clarifier = boosted && variant === 'bridge'
      ? (language === 'ar'
          ? 'دور الجسر يناسب توافرك ومسافة تنقلك.'
          : 'Bridge role that fits your availability and travel.')
      : '';

    return (
      <article style={styles.card}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <h4 style={{ margin: 0, fontWeight: 600 }}>{item.title}</h4>
          <span
            style={{
              fontSize: 12,
              padding: '2px 8px',
              borderRadius: 999,
              ...(variant === 'ready'
                ? { background: '#DCFCE7', color: '#166534', border: '1px solid #86efac' }
                : { background: '#FEF3C7', color: '#92400E', border: '1px solid #fcd34d' }),
            }}
          >
            {variant === 'ready'
              ? (ui.readyHeading[language] || ui.readyHeading.en)
              : (ui.bridgeHeading[language] || ui.bridgeHeading.en)}
          </span>
        </header>

        {item.why && <p style={{ color: '#444', margin: '8px 0 4px' }}>{item.why}</p>}

        {/* PR‑6: Availability & proximity hints */}
        {(availLine || clarifier) && (
          <p style={{ color: '#475569', margin: '4px 0 8px', fontSize: 13 }}>
            {clarifier ? (clarifier + ' ') : ''}{availLine}
          </p>
        )}

        {/* Live Job Links for this role (already availability-aware; chips live in the component) */}
        <LiveJobsLinks
          goal={item.title}
          level={experienceStage}
          city={city}
          keywords={cvSummary?.topKeywords || []}
          language={language}
          availability={availability}
        />

        {/* Optional gaps */}
        {Array.isArray(item.gaps) && item.gaps.length > 0 && (
          <ul style={{ color: '#555', margin: '6px 0 0 16px' }}>
            {item.gaps.map((g, i) => {
              const t = String(g?.type || '').toLowerCase();
              const k = Array.isArray(g?.key) ? g.key.join(', ') : String(g?.key || '');
              const line = t ? `${t}: ${k}` : k;
              return <li key={i}>{line}</li>;
            })}
          </ul>
        )}
      </article>
    );
  }

  /* ---------- RENDER ---------- */
  return (
    <main dir={language === 'ar' ? 'rtl' : 'ltr'} style={styles.container}>
      {/* Headline & message (already localized by API) */}
      <h2 style={{ marginTop: 0 }}>{summary?.headline || 'Your starting point'}</h2>
      <p style={{ color: '#444', marginTop: 4 }}>{summary?.message}</p>

      {/* Support band */}
      <SupportBand
        lang={language}
        path={path}
        readiness={progress?.value}
        experienceStage={experienceStage}
      />

      {/* CV Insights */}
      <CvInsights userId={userId} language={language} />

      {/* Availability Card */}
      <AvailabilityCard
        language={language}
        value={availability}
        loading={loadingAvail}
        saving={savingAvail}
        error={errorAvail}
        onSave={handleSaveAvailability}
      />

      {/* Goal selector */}
      <MyGoalForm
        userId={userId}
        language={language}
        onResult={(res) => {
          setGoalPlan(res);
          if (res?._city) setCity(res._city);
        }}
      />

      {/* Goal results panel */}
      {goalPlan && goalPlan.ok ? (
        <section
          dir={language === 'ar' ? 'rtl' : 'ltr'}
          style={{
            marginTop: 12,
            marginBottom: 20, // spacing before experience row
            padding: 12,
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            background: '#fff',
          }}
        >
          <h3 style={{ marginTop: 0 }}>
            {(language === 'ar' ? 'هدفي — إرشادات' : 'My goal — guidance')} — {goalPlan.goal}
          </h3>

          {/* Already have */}
          <div style={{ marginTop: 8 }}>
            <strong>{ui.alreadyHave[language] || ui.alreadyHave.en}:</strong>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
              {(goalPlan.alreadyHave || []).length > 0
                ? goalPlan.alreadyHave.map((k) => (
                    <span key={`have-${k}`} style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: 6 }}>
                      {k}
                    </span>
                  ))
                : <span style={{ color: '#6b7280' }}>—</span>}
            </div>
          </div>

          {/* Gently missing */}
          <div style={{ marginTop: 12 }}>
            <strong>{ui.gentlyMissing[language] || ui.gentlyMissing.en}:</strong>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
              {(goalPlan.gentlyMissing || []).length > 0
                ? goalPlan.gentlyMissing.map((k) => (
                    <span key={`miss-${k}`} style={{ background: '#fff7ed', padding: '4px 8px', borderRadius: 6 }}>
                      {k}
                    </span>
                  ))
                : <span style={{ color: '#6b7280' }}>—</span>}
            </div>

            {/* Suggested actions */}
            {goalPlan.gentlyMissing?.length > 0 && (
              <div style={{ marginTop: 10 }}>
                <div style={{ marginBottom: 6 }}>
                  <strong>{ui.suggestions[language] || ui.suggestions.en}:</strong>
                </div>
                <div style={styles.chipsRow}>
                  <Chip href={withParams('/activities/cv-ats-1')} lang={language}>ATS CV tune (10 min)</Chip>
                  <Chip href={withParams('/activities/int-star-1')} lang={language}>Create 3 STAR stories</Chip>
                </div>
              </div>
            )}
          </div>

          {/* Live jobs for goal */}
          <LiveJobsLinks
            goal={goalPlan.goal}
            level={experienceStage}
            city={city}
            keywords={cvSummary?.topKeywords || []}
            language={language}
            availability={availability}
          />
        </section>
      ) : (
        <>
          {/* If no goal chosen yet, show a gentle hint */}
          <div style={{ marginTop: 8, color: '#6b7280' }}>
            {language === 'ar' ? 'اختر هدفًا بالأعلى لعرض الإرشادات.' : 'Choose a goal above to see guidance.'}
          </div>
        </>
      )}

      {/* Experience quick edit link */}
      <div style={styles.expRow}>
        <small style={{ color: '#6B7280' }}>
          Total experience recorded: <strong>{totalMonths}</strong> month(s)
          {expLoading ? ' …loading' : ''}
        </small>
        {userId && (
          <button
            onClick={() => setShowExpForm((v) => !v)}
            style={{
              padding: '6px 10px',
              background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 8,
              fontSize: 12, cursor: 'pointer',
            }}
          >
            {showExpForm ? 'Hide' : 'Add or edit experience'}
          </button>
        )}
      </div>
      {showExpForm && userId && (
        <ExperienceForm userId={userId} language={language} onSaved={loadExperience} />
      )}

      {/* Progress */}
      <section style={{ margin: '20px 0' }}>
        <label style={{ display: 'block', marginBottom: 8 }}>
          <strong>{ui.progress[language] || ui.progress.en}</strong>
        </label>
        <div style={styles.progressOuter}>
          <div style={styles.progressInner} />
        </div>
        <div style={{ fontSize: 12, color: '#444', marginTop: 6 }}>{p}%</div>
        {progress?.nextPrompt && (
          <div style={{ fontSize: 13, color: '#333', marginTop: 6 }}>{progress.nextPrompt}</div>
        )}
      </section>

      {/* Flight path */}
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

      {/* Enhanced Suggested Roles (availability + proximity aware) */}
      <section style={{ marginTop: 24 }}>
        <h3 style={{ marginBottom: 8 }}>{ui.suggestedRoles[language] || ui.suggestedRoles.en}</h3>

        {rolesReady.length > 0 && (
          <>
            <h4 style={{ color: '#16a34a', margin: '8px 0' }}>
              {ui.readyHeading[language] || ui.readyHeading.en}
            </h4>
            {rolesReady.map((r) => (
              <RoleCard key={`ready-${r.title}`} item={r} variant="ready" />
            ))}
          </>
        )}

        {rolesBridge.length > 0 && (
          <>
            <h4 style={{ color: '#a16207', margin: '14px 0 8px' }}>
              {ui.bridgeHeading[language] || ui.bridgeHeading.en}
            </h4>
            {rolesBridge.map((r) => (
              <RoleCard key={`bridge-${r.title}`} item={r} variant="bridge" />
            ))}
          </>
        )}

        {rolesReady.length === 0 && rolesBridge.length === 0 && (
          <p style={{ color: '#6b7280' }}>No suggestions yet.</p>
        )}
      </section>

      {/* Reflection */}
      {reflection && (
        <section style={{ marginTop: 24, paddingTop: 8, borderTop: '1px solid #eee' }}>
          <p style={{ color: '#444' }}>{reflection}</p>
        </section>
      )}
    </main>
  );
}
