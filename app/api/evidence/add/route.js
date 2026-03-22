// app/api/evidence/add/route.js
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';

// Adjust these paths if your project keeps clients elsewhere
import { supabaseAdmin } from '../../_lib/supabase';
import { emitEvent } from '../../_lib/events/emitEvent';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const assessment_id = body?.assessment_id;
    const url = (body?.url || '').trim();
    const note = (body?.note || '').trim();

    if (!assessment_id || !url) {
      return NextResponse.json(
        { ok: false, error: 'assessment_id and url are required' },
        { status: 400 }
      );
    }

    // Insert row
    const { data, error } = await supabaseAdmin
      .from('evidence')
      .insert({ assessment_id, url, note })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // Log event
    try {
      await emitEvent({
        actor_role: 'participant',
        event_type: 'evidence_uploaded',
        payload: { assessment_id, kind: 'link', url }
      });
    } catch (e) {
      console.error('emitEvent failed:', e);
    }

    return NextResponse.json({ ok: true, evidence: data });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
