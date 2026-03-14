// app/api/evidence/recent/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
// 👇 Force this route to run dynamically on every request (no ISR/static caching)
export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  try {
    // 1) Get the latest 25 audio evidence rows (newest first)
    const { data: rows, error } = await supabase
      .from('audio_evidence')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(25);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // 2) For each row, create a 1-hour signed URL
    const items = [];
    for (const row of rows || []) {
      const { data: signed, error: sErr } = await supabase
        .storage
        .from('audio')
        .createSignedUrl(row.path, 60 * 60);
      items.push({
        ...row,
        signedUrl: sErr ? null : signed?.signedUrl || null,
        signError: sErr?.message || null,
      });
    }

    // Return with explicit no-store headers (belt‑and‑braces)
    return new NextResponse(JSON.stringify({ ok: true, items }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err?.message || 'Unknown error' }, { status: 500 });
  }
}
