// app/api/assessment/route.js
import { emitEvent } from '../_lib/events/emitEvent';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../_lib/supabase';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const language = (body?.language || 'en').toLowerCase();

    // 1) Create assessment (service role client)
    const { data, error } = await supabaseAdmin
      .from('assessments')
      .insert({ language })
      .select('id, language, created_at')
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // 2) NEW: emit 'assessment_started' (ASM foundation)
    // Replace participant_id with a real user id once auth is wired.
    await emitEvent({
      participant_id: null,
      actor_role: 'participant',
      event_type: 'assessment_started',
      payload: { assessment_id: data.id, language: data.language },
    });

    // 3) Response (unchanged shape; Language page expects assessment_id)
    return NextResponse.json({
      ok: true,
      assessment_id: data.id,
      language: data.language,
      assessment: data,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
