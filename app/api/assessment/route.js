// app/api/assessment/route.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import * as dbClients from '../_lib/supabase';          // 👈 safe import (no breaking if a named export is missing)
import { emitEvent } from '../_lib/events/emitEvent';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const language = (body?.language || 'en').toLowerCase();

    // Pick a working client (service-role preferred; fallback to anon)
    const db = dbClients?.supabaseAdmin ?? dbClients?.supabase;
    if (!db || !db.from) {
      // Give a friendly error the Language page can show
      throw new Error('Database client was not initialised on the server (supabase/supabaseAdmin missing).');
    }

    // 1) Create assessment
    const { data, error } = await db
      .from('assessments')
      .insert({ language })
      .select('id, language, created_at')
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // 2) Emit ASM event (non-blocking)
    try {
      await emitEvent({
        participant_id: null, // replace with real user id when auth is wired
        actor_role: 'participant',
        event_type: 'assessment_started',
        payload: { assessment_id: data.id, language: data.language },
      });
    } catch (e) {
      console.error('emitEvent(assessment_started) failed (continuing):', e?.message || e);
    }

    // 3) Respond with the shape the Language page needs
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
