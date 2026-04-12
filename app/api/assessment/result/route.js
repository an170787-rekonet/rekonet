// app/api/assessment/result/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';
import { emitEvent } from '../../_lib/events/emitEvent';

// ---------------- Helpers ----------------
const clamp01 = (x) => Math.max(0, Math.min(1, x));

function levelFromMeans(overall) {
  if (overall >= 4.0) return { tier: 'Advanced', code: 'L4' };
  if (overall >= 3.0) return { tier: 'Proficient', code: 'L3' };
  if (overall >= 2.0) return { tier: 'Developing', code: 'L2' };
  return { tier: 'Beginner', code: 'L1' };
}

function decidePath({ overall, byCat, proSignals = 0, foundationsSignals = 0 }) {
  const highCats = byCat.filter((c) => c.avg >= 3.6).length;
  const lowCats  = byCat.filter((c) => c.avg <= 2.2).length;
  let pro = proSignals + (overall >= 3.4 ? 1 : 0) + (highCats >= 2 ? 1 : 0);
  let foundations = foundationsSignals + (overall <= 2.4 ? 1 : 0) + (lowCats >= 2 ? 1 : 0);
  if (pro >= 2 && foundations < 2) return 'precision';
  if (foundations >= 2 && pro < 2) return 'foundations';
  return overall >= 3.2 ? 'precision' : 'foundations';
}

function computeProgress({ levelCode, activities = 0, cv = 0, interview = 0 }) {
  const levelScore = { L1: 25, L2: 50, L3: 70, L4: 85 }[levelCode] || 25;
  const p = 0.35 * levelScore + 0.25 * activities + 0.25 * cv + 0.15 * interview;

  const value = Math.round(clamp01(p / 100) * 100);

  const band = value < 25 ? 0 : value < 50 ? 1 : value < 75 ? 2 : value < 100 ? 3 : 4;

  const prompts = [
    "You've started. Small steps count — your next short activity is ready.",
    'Nice momentum — Job‑Ready is within reach. Two steps today will move the needle.',
    "You're past halfway. A focused activity and a quick practice can tip you into Job‑Ready.",
    'Almost there — one short task and an upload will unlock your Job‑Ready badge.',
    'Job‑Ready achieved — great work. Keep your momentum with targeted roles.',
  ];

  return { value, band, withinReach: value >= 75 && value < 100, nextPrompt: prompts[band] };
}

// ---------------- i18n ----------------
const i18n = {
  headline: {
    en: 'Your starting point', fr: 'Votre point de départ', pt: 'O seu ponto de partida', es: 'Tu punto de partida',
    ta: 'உங்கள் தொடக்கப் புள்ளி', uk: 'Ваша стартова точка', ar: 'نقطة البداية لديك',
  },
  message: {
    en: "Based on your answers, here’s a supportive first step to help you move forward.",
    fr: "Selon vos réponses, voici une première étape pour avancer en confiance.",
    pt: "Com base nas suas respostas, aqui está um primeiro passo de apoio para avançar.",
    es: "Según tus respuestas, aquí tienes un primer paso de apoyo para avanzar.",
    ta: "உங்கள் பதில்களின் அடிப்படையில், முன்னேற உதவும் ஆதரவு முதல் படி இதோ.",
    uk: "Виходячи з ваших відповідей, ось перший крок підтримки, щоб рухатися далі.",
    ar: "استنادًا إلى إجاباتك، إليك خطوة أولى داعمة لمواصلة التقدّم.",
  },
  paths: {
    foundations: {
      en: 'Foundations path', fr: 'Parcours Fondations', pt: 'Percurso de Fundamentos', es: 'Ruta de Fundamentos',
      ta: 'அடித்தளம் பாதை', uk: 'Базовий шлях', ar: 'مسار الأساسيات',
    },
    precision: {
      en: 'Precision path', fr: 'Parcours Précision', pt: 'Percurso de Precisão', es: 'Ruta de Precisión',
      ta: 'துல்லிய பாதை', uk: 'Точний шлях', ar: 'مسار الدقّة',
    },
  },
};

// ---------------- ✅ FIXED fetchCategoryMeans ----------------
async function fetchCategoryMeans(assessmentId) {
  try {
    const { data, error } = await supabase
      .from('answers')
      .select('category, score')
      .eq('assessment_id', assessmentId);

    if (error || !Array.isArray(data) || data.length === 0) {
      return [
        { key: 'general', avg: 2.8 },
        { key: 'literacy', avg: 2.8 },
        { key: 'digital', avg: 2.8 },
        { key: 'behaviour', avg: 2.8 },
      ];
    }

    const buckets = new Map();
    for (const row of data) {
      const k = (row.category || 'general').toLowerCase();
      if (!buckets.has(k)) buckets.set(k, { sum: 0, count: 0 });
      const b = buckets.get(k);
      b.sum += Number(row.score || 0);
      b.count += 1;
    }

    const keys = ['general', 'literacy', 'digital', 'behaviour'];
    return keys.map((k) => {
      const b = buckets.get(k);
      const avg = b && b.count ? b.sum / b.count : 0;
      return { key: k, avg: Number(avg.toFixed(2)) };
    });

  } catch {
    return [
      { key: 'general', avg: 2.8 },
      { key: 'literacy', avg: 2.8 },
      { key: 'digital', avg: 2.8 },
      { key: 'behaviour', avg: 2.8 },
    ];
  }
}

// ---------------- The rest of your file (UNCHANGED) ----------------

async function fetchActivitiesPercent(userId) {
  if (!userId) return 0;
  try {
    const { data, error } = await supabase
      .from('activity_completions')
      .select('activity_id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) return 0;
    const completed = data === null ? 0 : (data.length || 0);
    const target = 5;
    return Math.max(0, Math.min(100, Math.round((completed / target) * 100)));
  } catch {
    return 0;
  }
}

async function fetchCvPercent(userId) {
  if (!userId) return 0;
  try {
    const { data, error } = await supabase
      .from('cv_versions')
      .select('score_ai, delta_from_prev')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (error || !data || !data[0]) return 0;
    const { score_ai = 0, delta_from_prev = 0 } = data[0];
    if (delta_from_prev >= 20 || score_ai >= 75) return 100;
    return Math.max(0, Math.min(100, Math.round(Math.max(delta_from_prev * 5, score_ai))));
  } catch {
    return 0;
  }
}

async function fetchInterviewPercent(userId) {
  if (!userId) return 0;
  try {
    const { data, error } = await supabase
      .from('interview_sessions')
      .select('score_24')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(1);

    if (error || !data || !data[0]) return 0;
    const score = Number(data[0].score_24 || 0);
    return Math.max(0, Math.min(100, Math.round((score / 18) * 100)));
  } catch {
    return 0;
  }
}

async function fetchRoleProfiles() {
  try {
    const { data, error } = await supabase.from('role_profiles').select('*');
    if (error || !Array.isArray(data)) return [];
    return data;
  } catch {
    return [];
  }
}

function meetLevel(levelCode, minOverallLevel) {
  const rank = { L1: 1, L2: 2, L3: 3, L4: 4 };
  const need = rank[minOverallLevel || 'L1'] || 1;
  const got  = rank[levelCode || 'L1'] || 1;
  return got >= need;
}

function buildRoleSuggestions({ profiles, levelCode, interviewPct, certificates = [] }) {
  if (!profiles?.length) return { readyNow: [], bridgeRoles: [], gaps: [], actions: [] };

  const readyNow = [];
  const bridgeRoles = [];

  const certProviders = new Set(
    (certificates || [])
      .filter((c) => c.verified)
      .map((c) => (c.provider || '').toLowerCase())
  );

  for (const p of profiles) {
    const needsLevel = p.min_overall_level || 'L1';
    const meetsOverall = meetLevel(levelCode, needsLevel);

    const meetsInterview = p.min_interview_score
      ? interviewPct >= Math.min(100, Math.round((p.min_interview_score / 18) * 100))
      : true;

    const requiresCert = !!p.requires_certificate;
    const hasPreferredCert = p.preferred_cert_providers?.some((prov) =>
      certProviders.has((prov || '').toLowerCase())
    );

    const gaps = [];
    if (!meetsOverall) gaps.push({ type: 'level', key: needsLevel });
    if (!meetsInterview) gaps.push({ type: 'interview', key: p.min_interview_score });

    if (Array.isArray(p.must_have_keywords) && p.must_have_keywords.length) {
      gaps.push({ type: 'keywords', key: p.must_have_keywords });
    }

    if (requiresCert && !hasPreferredCert) {
      gaps.push({ type: 'certificate', key: p.preferred_cert_providers || [] });
    }

    if (gaps.length === 0) {
      readyNow.push({ title: p.title, match: 86 });
    } else if (gaps.length <= 2) {
      bridgeRoles.push({ title: p.title, gaps });
    }
  }

  return { readyNow, bridgeRoles, gaps: [], actions: [] };
}

// ---------------- Route ----------------
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const assessmentId =
      searchParams.get('id') ||
      searchParams.get('assessment_id') ||
      searchParams.get('assessmentId');

    const lang = (searchParams.get('language') || searchParams.get('lang') || 'en').toLowerCase();
    const userId = searchParams.get('user_id') || null;

    if (!assessmentId) {
      return NextResponse.json({ ok: false, error: 'id missing' }, { status: 400 });
    }

    const byCategory = await fetchCategoryMeans(assessmentId);
    const overall = byCategory.reduce((a, c) => a + c.avg, 0) / (byCategory.length || 1);

    const lvl = levelFromMeans(overall);
    const path = decidePath({ overall, byCat: byCategory });

    const [activitiesPct, cvPct, interviewPct] = await Promise.all([
      fetchActivitiesPercent(userId),
      fetchCvPercent(userId),
      fetchInterviewPercent(userId),
    ]);

    const progress = computeProgress({
      levelCode: lvl.code,
      activities: activitiesPct,
      cv: cvPct,
      interview: interviewPct,
    });

    const steps = i18n.steps[path]({ lang }).map((s) => ({
      title: s.title,
      why: s.why,
      next: s.next,
    }));

    const summary = {
      headline: i18n.headline[lang] || i18n.headline.en,
      message: i18n.message[lang] || i18n.message.en,
    };

    const profiles = await fetchRoleProfiles();
    const roleSuggestions = buildRoleSuggestions({
      profiles,
      levelCode: lvl.code,
      interviewPct,
    });

    const score = Math.max(0, Math.min(100, Math.round((overall / 4) * 100)));
    const level =
      lvl?.tier === 'Advanced'   ? 'Strengthening' :
      lvl?.tier === 'Proficient' ? 'Developing'    :
      lvl?.tier === 'Developing' ? 'Developing'    :
                                   'Emerging';

    const resultPayload = {
      assessment_id: assessmentId,
      level,
      score,
      goal_title: summary?.headline || 'Your starting point',
      role_suggestions: roleSuggestions,
      pathway: steps,
    };

    try {
      await supabase
        .from('assessment_results')
        .upsert(resultPayload, { onConflict: 'assessment_id' });
    } catch (e) {}

    await emitEvent({
      participant_id: null,
      actor_role: 'system',
      event_type: 'result_computed',
      payload: { assessment_id: assessmentId, level, score },
    });

    return NextResponse.json({
      ok: true,
      computed: true,
      result: resultPayload,
      assessmentId,
      language: lang,
      levels: { overall: lvl, byCategory },
      path,
      summary,
      flightPath: steps,
      progress,
      roleSuggestions,
    });

  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
