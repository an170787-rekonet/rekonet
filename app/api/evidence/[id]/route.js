// app/api/evidence/[id]/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function DELETE(_req, { params }) {
  try {
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 });
    }

    // 1) Look up the row to get the storage path
    const { data: row, error: selErr } = await supabase
      .from('audio_evidence')
      .select('id, path')
      .eq('id', id)
      .single();

    if (selErr || !row) {
      return NextResponse.json({ ok: false, error: selErr?.message || 'Not found' }, { status: 404 });
    }

    // 2) Delete the file from the 'audio' bucket
    const { error: delFileErr } = await supabase
      .storage
      .from('audio')
      .remove([row.path]);

    if (delFileErr) {
      return NextResponse.json({ ok: false, error: `Storage delete failed: ${delFileErr.message}` }, { status: 500 });
    }

    // 3) Delete the DB row
    const { error: delRowErr } = await supabase
      .from('audio_evidence')
      .delete()
      .eq('id', id);

    if (delRowErr) {
      return NextResponse.json({ ok: false, error: `Row delete failed: ${delRowErr.message}` }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err?.message || 'Unknown error' }, { status: 500 });
  }
}
