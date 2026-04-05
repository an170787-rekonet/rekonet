export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../_lib/supabase';

export async function POST(request) {
  try {
    const body = await request.json();
    const { assessment_id, question_id, value } = body || {};

    // Validate required fields
    if (!assessment_id || !question_id || value == null) {
      return NextResponse.json(
        { ok: false, error: 'Missing fields' },
        { status: 400 }
      );
    }

    // Ensure assessment exists
    const { data: assessment, error: assessErr } = await supabaseAdmin
      .from('assessments')
      .select('id')
      .eq('id', assessment_id)
      .single();

    if (assessErr || !assessment) {
      return NextResponse.json(
        { ok: false, error: 'Unknown assessment_id' },
        { status: 404 }
      );
    }

    // Insert answer using correct schema: value, not score/category
    const { data, error } = await supabaseAdmin
      .from('answers')
      .insert({
        assessment_id,
        question_id,
        value: Number(value),
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, saved: data });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}
