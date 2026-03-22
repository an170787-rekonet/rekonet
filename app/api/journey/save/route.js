// app/api/journey/save/route.js
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';

// ⬇️ Adjust these two imports only if your helpers live elsewhere
import { supabaseAdmin } from '../../_lib/supabase';
import { emitEvent } from '../../_lib/events/emitEvent';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const assessment_id = body?.assessment_id;
    const step_key = (body?.step_key || '').trim();   // e.g., 'dashboard'
    const payload = body?.payload || {};

    if (!assessment_id || !step_key) {
      return NextResponse.json(
        { ok: false, error: 'assessment_id and step_key are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('journey_checkpoints')
      .insert({ assessment_id, step_key, payload })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // Non‑fatal if event fails
    try {
      await emitEvent({
        actor_role: 'participant',
        event_type: 'journey_checkpoint_saved',
        payload: { assessment_id, step_key }
      });
    } catch (e) {}

    return NextResponse.json({ ok: true, checkpoint: data });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
