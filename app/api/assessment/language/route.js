// app/api/assessment/language/route.js
import { NextResponse } from 'next/server';
// Adjust import based on your setup (named vs default)
import { supabase } from '../../../../lib/supabaseClient';

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));

    // Accept either { language } OR { user_id, preferred_language }
    const language =
      (body.language || body.preferred_language || 'en').toLowerCase();
    const user_id = body.user_id || null;

    // Always set cookie so UI works immediately
    const res = NextResponse.json({ ok: true, language });
    res.headers.set(
      'Set-Cookie',
      `language=${encodeURIComponent(language)}; Path=/; Max-Age=${14 * 24 * 60 * 60}; SameSite=Lax`
    );

    // Optionally persist to Supabase if user_id provided
    if (user_id) {
      const { error } = await supabase
        .from('assessment_profiles')
        .upsert({ user_id, preferred_language: language });

      if (error) {
        return NextResponse.json(
          { ok: false, language, error: error.message },
          { status: 500 }
        );
      }
    }

    return res;
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err?.message || err) },
      { status: 500 }
    );
  }
}
