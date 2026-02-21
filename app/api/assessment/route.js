export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../_lib/supabase';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const language = (body?.language || 'en').toLowerCase();

    const { data, error } = await supabaseAdmin
      .from('assessments')
      .insert({ language })
      .select('id, language, created_at')
      .single();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, assessment: data });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
