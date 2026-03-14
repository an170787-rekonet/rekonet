// app/api/evidence/recent/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-only Supabase client (uses service role)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Force Node runtime
export const runtime = 'nodejs';

export async function GET() {
  try {
    // 1) Get the latest 25 audio evidence rows
    const { data: rows, error } = await supabase
      .from('audio_evidence')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(25);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // 2) For each row, create a 1-hour signed URL to the 'audio' bucket
    const items = [];
    for (const row of rows || []) {
      const path = row.path;
      const { data: signed, error: sErr } = await supabase
        .storage
        .from('audio')
        .createSignedUrl(path, 60 * 60); // 1 hour
      if (sErr) {
        // If a URL fails, skip it but include the row so you can see the issue
        items.push({ ...row, signedUrl: null, signError: sErr.message });
      } else {
        items.push({ ...row, signedUrl: signed.signedUrl });
      }
    }

    return NextResponse.json({ ok: true, items });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err?.message || 'Unknown error' }, { status: 500 });
  }
}
