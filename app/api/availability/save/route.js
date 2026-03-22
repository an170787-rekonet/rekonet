// app/api/availability/save/route.js
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';

// ⬇️ Adjust these two lines if your helpers live elsewhere
import { supabaseAdmin } from '../../_lib/supabase';
import { emitEvent } from '../../_lib/events/emitEvent';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const assessment_id = body?.assessment_id;
    const availability = body?.availability; // any JSON object

    if (!assessment_id || !availability) {
      return NextResponse.json(
        { ok: false, error: 'assessment_id and availability are required' },
        { status: 400 }
      );
    }

    // Upsert so each assessment keeps one current availability entry
    const { data, error } = await supabaseAdmin
      .from('availability')
      .upsert({ assessment_id, availability }, { onConflict: 'assessment_id' })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // Non‑fatal if event emit fails
    try {
      await emitEvent({
        actor_role: 'participant',
        event_type: 'availability_saved',
        payload: { assessment_id }
      });
    } catch (e) {
      console.error('emitEvent(availability_saved) failed:', e);
    }

    return NextResponse.json({ ok: true, availability: data });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
