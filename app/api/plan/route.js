// app/api/plan/route.js
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';

// ✅ Your helpers are under app/api/_lib, so from app/api/plan use ../_lib/…
import { supabaseAdmin } from '../_lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const assessment_id = searchParams.get('id');
    const language = (searchParams.get('language') || 'en').toLowerCase();

    if (!assessment_id) {
      return NextResponse.json({ ok: false, error: 'id missing' }, { status: 400 });
    }

    // 1) Pull the computed result for this assessment
    const { data: resultRow } = await supabaseAdmin
      .from('assessment_results')
      .select('*')
      .eq('assessment_id', assessment_id)
      .maybeSingle();

    // 2) Recent events (last 14 days)
    const since = new Date();
    since.setDate(since.getDate() - 14);
    const { data: recentEvents } = await supabaseAdmin
      .from('events')
      .select('event_type, payload, created_at')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false });

    // 3) Simple scaffold — replace with your real logic later
    const weekly = [
      { text: 'Add 1 evidence note', minutes: 5,  kind: 'evidence' },
      { text: 'Tweak CV summary to match your target role', minutes: 10, kind: 'cv' },
      { text: 'Apply to 2 roles', minutes: 30, kind: 'search' },
      { text: 'Practice 1 STAR story', minutes: 15, kind: 'interview' },
    ];

    const courses = [
      { title: 'Customer Service Basics', minutes: 25, funded: false },
      { title: 'Interview STAR Mini',     minutes: 15, funded: false },
    ];

    const roles = [
      { title: 'Retail Assistant',    url: '#', source: 'Indeed' },
      { title: 'Warehouse Operative', url: '#', source: 'Reed'   },
    ];

    return NextResponse.json({
      ok: true,
      plan: { weekly, courses, roles, level: resultRow?.level ?? 'Emerging' }
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
