export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../_lib/supabase';

// --- Helper: fetch participant level ------------------------------
async function fetchAssessmentLevel(assessmentId) {
  const { data, error } = await supabaseAdmin
    .from('assessment_results')
    .select('level, pathway')
    .eq('assessment_id', assessmentId)
    .maybeSingle();

  if (error) return { level: null, pathway: null };
  return { level: data?.level || null, pathway: data?.pathway || null };
}

// --- Helper: fetch recent events ----------------------------------
async function fetchRecentEvents(assessmentId) {
  const { data, error } = await supabaseAdmin
    .from('events')
    .select('event_type, payload, created_at')
    .eq('payload->>assessment_id', assessmentId)
    .gte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()) // last 14 days
    .order('created_at', { ascending: false });

  if (error) return [];
  return data || [];
}

// --- Helper: fetch latest availability -----------------------------
async function fetchLatestAvailability(assessmentId) {
  const { data, error } = await supabaseAdmin
    .from('availability')
    .select('*')
    .eq('assessment_id', assessmentId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return null;
  return data;
}

// --- SMART Plan Builder --------------------------------------------
function buildSmartPlan({ level, events, availability }) {
  const plan = [];

  // --- Check evidence cadence (last 7 days) ------------------------
  const hadRecentEvidence = events.some(
    (e) =>
      e.event_type === 'evidence_uploaded' &&
      new Date(e.created_at) > Date.now() - 7 * 24 * 60 * 60 * 1000
  );

  if (!hadRecentEvidence) {
    plan.push({
      text: 'Add one new piece of evidence (5 minutes)',
      minutes: 5,
      kind: 'evidence',
    });
  }

  // --- Check availability saved -----------------------------------
  if (!availability) {
    plan.push({
      text: 'Set your weekly availability',
      minutes: 5,
      kind: 'availability',
    });
  }

  // --- Level-based hinting ----------------------------------------
  if (level === 'cv' || level === 'entry_cv') {
    plan.push({
      text: 'Tweak your CV summary to match the roles you want',
      minutes: 10,
      kind: 'cv',
    });
  }

  if (level === 'interview' || level === 'readiness') {
    plan.push({
      text: 'Practice one STAR interview answer',
      minutes: 10,
      kind: 'interview',
    });
  }

  // --- If not enough tasks, fill with universal recommended actions
  while (plan.length < 3) {
    plan.push({
      text: 'Explore two new local job roles',
      minutes: 10,
      kind: 'exploration',
    });
  }

  // Cap plan to 5 items
  return plan.slice(0, 5);
}

// --- Main GET handler ----------------------------------------------
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get('id');

    if (!assessmentId) {
      return NextResponse.json({ ok: false, error: 'Missing assessment id' }, { status: 400 });
    }

    // Fetch all needed sources
    const [levelInfo, recentEvents, availability] = await Promise.all([
      fetchAssessmentLevel(assessmentId),
      fetchRecentEvents(assessmentId),
      fetchLatestAvailability(assessmentId),
    ]);

    // Build plan
    const weekly = buildSmartPlan({
      level: levelInfo.level,
      events: recentEvents,
      availability,
    });

    // Micro-courses (static for now)
    const courses = [
      { title: 'Customer Service Basics', minutes: 25, funded: false },
      { title: 'Interview STAR Mini', minutes: 15, funded: false },
    ];

    // Roles (placeholder; integrate roles feed next)
    const roles = [
      { title: 'Retail Assistant', url: '#', source: 'Indeed' },
      { title: 'Warehouse Operative', url: '#', source: 'Reed' },
    ];

    return NextResponse.json({
      ok: true,
      plan: {
        weekly,
        courses,
        roles,
        level: levelInfo.level,
      },
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
