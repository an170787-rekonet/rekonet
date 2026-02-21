export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../_lib/supabase';

const ALL_CATS = ['cv', 'interview', 'skills', 'jobsearch'];

function levelFromAvg(avg) {
  const a = Number(avg || 0);
  if (a >= 4.3) return { n: 4, label: 'Job‑Ready' };
  if (a >= 3.5) return { n: 3, label: 'Ready Soon' };
  if (a >= 2.5) return { n: 2, label: 'Building' };
  return { n: 1, label: 'Exploring' };
}

function completionMessage(language = 'en') {
  const M = {
    en: {
      headline: 'Great job — first check‑in complete!',
      body: 'There are no right or wrong answers here. We’ve used your responses to suggest a starting point and a short flight‑path you can try next.',
    },
    fr: {
      headline: 'Bravo — premier point d’étape terminé !',
      body: 'Ici, il n’y a pas de bonnes ou de mauvaises réponses. Vos réponses nous aident à proposer un point de départ et une courte trajectoire à essayer.',
    },
    ar: {
      headline: 'أحسنت — لقد أكملت أول فحص سريع!',
      body: 'لا توجد إجابات صحيحة أو خاطئة. استخدمنا إجاباتك لاقتراح نقطة بداية ومسار دعم قصير للخطوات التالية.',
    },
  };
  return M[language] || M.en;
}

function flightPathFor(category, L) {
  const base = {
    cv: {
      1: { headline: 'Start with one quick CV win', description: 'Use a clean template and add two quantified bullet points in your latest role.' },
      2: { headline: 'Tailor your CV in 15 minutes', description: 'Pick one role and align your top 3 bullets to its keywords.' },
      3: { headline: 'Proof and polish', description: 'Run a grammar check and ask a friend for one improvement suggestion.' },
      4: { headline: 'Show impact upfront', description: 'Move your strongest results to the top third of the first page.' },
    },
    interview: {
      1: { headline: 'Build your first STAR story', description: 'Draft one 60‑second answer about when you solved a problem.' },
      2: { headline: 'Practice one core question', description: 'Record “Tell me about yourself” and replay it once.' },
      3: { headline: 'Add a results line', description: 'Tighten your ending with a clear result and what you learned.' },
      4: { headline: 'Refine and rotate', description: 'Rotate through three STAR stories and vary the emphasis.' },
    },
    skills: {
      1: { headline: 'Name your top 3 strengths', description: 'Write three strengths and one example for each.' },
      2: { headline: 'Collect quick examples', description: 'Add one sentence for each example that shows your part.' },
      3: { headline: 'Match to job keywords', description: 'Align your strengths to a role description you like.' },
      4: { headline: 'Show breadth and depth', description: 'Prepare a short “how I apply this” for each strength.' },
    },
    jobsearch: {
      1: { headline: 'Pick two places to look', description: 'Choose two job boards or communities and bookmark them.' },
      2: { headline: 'Set a weekly 15‑min routine', description: 'Check and save roles once a week, same time.' },
      3: { headline: 'Add light tracking', description: 'Note role title, link, and one-line reason it fits.' },
      4: { headline: 'Personalize outreach', description: 'Send one short message per week to someone in the team.' },
    },
  };
  const steps = base[category] || {};
  const pick = steps[L] || steps[2] || { headline: 'Next small step', description: 'Choose one simple action you can take this week.' };
  return { level: L, ...pick };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const assessment_id = searchParams.get('assessment_id') || 'demo';
    const language = (searchParams.get('language') || 'en').toLowerCase();

    if (assessment_id === 'demo') {
      const byCategory = ALL_CATS.map((key) => ({ competency_key: key, avg_score: 0, answered: 0 }));
      const overall = 0;
      const recommendations = byCategory.map((c) => {
        const L = levelFromAvg(c.avg_score).n;
        const fp = flightPathFor(c.competency_key, L);
        return { competency_key: c.competency_key, level: fp.level, headline: fp.headline, description: fp.description, resources: [] };
      });
      return NextResponse.json({
        ok: true,
        assessment_id,
        language,
        message: completionMessage(language),
        startingPoint: levelFromAvg(overall),
        overall,
        byCategory,
        recommendations,
      });
    }

    // Get assessment + language
    const { data: a, error: eA } = await supabaseAdmin
      .from('assessments')
      .select('id, language')
      .eq('id', assessment_id)
      .single();
    if (eA || !a) return NextResponse.json({ ok: false, error: 'Unknown assessment_id' }, { status: 404 });
    const lang = (a.language || language || 'en').toLowerCase();

    // Fetch answers
    const { data: rows, error } = await supabaseAdmin
      .from('answers')
      .select('category, score')
      .eq('assessment_id', assessment_id);

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    // Aggregate
    const map = new Map();
    for (const r of rows || []) {
      const e = map.get(r.category) || { sum: 0, count: 0 };
      e.sum += Number(r.score || 0);
      e.count += 1;
      map.set(r.category, e);
    }

    const byCategory = ALL_CATS.map((key) => {
      const e = map.get(key) || { sum: 0, count: 0 };
      const avg = e.count ? e.sum / e.count : 0;
      return { competency_key: key, avg_score: avg, answered: e.count };
    });

    const overall =
      byCategory.reduce((acc, c) => acc + (Number(c.avg_score) || 0), 0) / (byCategory.length || 1);

    const recommendations = byCategory.map((c) => {
      const L = levelFromAvg(c.avg_score).n;
      const fp = flightPathFor(c.competency_key, L);
      return { competency_key: c.competency_key, level: fp.level, headline: fp.headline, description: fp.description, resources: [] };
    });

    return NextResponse.json({
      ok: true,
      assessment_id,
      language: lang,
      message: completionMessage(lang),
      startingPoint: levelFromAvg(overall),
      overall,
      byCategory,
      recommendations,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
