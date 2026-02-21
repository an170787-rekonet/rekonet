// app/api/assessment/language/route.js
import { NextResponse } from 'next/server';
// If your project exports as default, adjust this import accordingly:
import { supabase } from '../../../../lib/supabaseClient';

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));

    // Accept both shapes
    // A) { language: 'fr' }  (anonymous, cookie only)
    // B) { user_id: '...', preferred_language: 'fr' } (persisted + cookie)
    const language =
      (body.language || body.preferred_language || 'en').toLowerCase();
    const user_id = body.user_id || null;

    // 1) Always set the cookie so the UI updates immediately
    const res = NextResponse.json({ ok: true, language });

    // 14 days, SameSite=Lax, Path=/ (adjust if you need)
    res.headers.set(
      'Set-Cookie',
      `language=${encodeURIComponent(language)}; Path=/; Max-Age=${14 * 24 * 60 * 60}; SameSite=Lax`
    );

    // 2) Optionally persist to Supabase if user_id is provided
    if (user_id) {
      // Ensure the table name/columns match your schema:
      // table: assessment_profiles (user_id text/uuid, preferred_language text)
      const { error } = await supabase
        .from('assessment_profiles')
        .upsert({
          user_id,
          preferred_language: language,
        });

      if (error) {
        // Return cookie success but surface DB error so you can debug
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
