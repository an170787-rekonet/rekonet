export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../_lib/supabase';

export async function POST(request) {
  try {
    const body = await request.json();
    const { assessment_id, question_id, category, score } = body || {};

    if (!assessment_id || !question_id || !category || score == null) {
      return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
    }

    if (assessment_id !== 'demo') {
      // ensure assessment exists
      const { data: a, error: e1 } = await supabaseAdmin
        .from('assessments')
        .select('id')
        .eq('id', assessment_id)
        .single();
      if (e1 || !a) return NextResponse.json({ ok: false, error: 'Unknown assessment_id' }, { status: 404 });
    }

    if (assessment_id === 'demo') {
      // For demo IDs, emulate success without DB write
      return NextResponse.json({
        ok: true,
        saved: { question_id, category, score: Number(score), created_at: new Date().toISOString() },
      });
    }

    const { data, error } = await supabaseAdmin
      .from('answers')
      .insert({ assessment_id, question_id, category, score: Number(score) })
      .select('id, assessment_id, question_id, category, score, created_at')
      .single();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, saved: data });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
