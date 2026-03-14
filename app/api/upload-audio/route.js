// app/api/upload-audio/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with Service Role (server-only)
// NOTE: Never expose SERVICE_ROLE in client-side code.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Force Node runtime so FormData/File uploads work reliably
export const runtime = 'nodejs';

export async function POST(req) {
  try {
    // 1) Read multipart/form-data coming from the client
    const form = await req.formData();
    const file = form.get('file'); // Blob/File from <input type="file"> or MediaRecorder
    const userId = form.get('user_id') || 'anon';
    const roleId = form.get('role_id') || null;
    const durationMs = Number(form.get('duration_ms') || 0);

    if (!file || typeof file === 'string') {
      return NextResponse.json({ ok: false, error: 'Missing audio file' }, { status: 400 });
    }

    // 2) Choose extension from MIME
    const ext =
      (file.type && file.type.includes('webm')) ? 'webm' :
      (file.type && file.type.includes('mp4'))  ? 'mp4'  : 'webm';

    // 3) Unique object path inside the bucket
    const now = new Date().toISOString().replace(/[:.]/g, '-');
    const objectPath = `${userId}/${now}.${ext}`;

    // 4) Upload into your PRIVATE bucket: 'audio'
    const { error: uploadError } = await supabase
      .storage
      .from('audio')
      .upload(objectPath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || `audio/${ext}`,
      });

    if (uploadError) {
      return NextResponse.json({ ok: false, error: uploadError.message }, { status: 500 });
    }

    // 5) Get a signed URL (works with private buckets)
    const { data: signed, error: signedErr } = await supabase
      .storage
      .from('audio')
      .createSignedUrl(objectPath, 60 * 60); // 1 hour

    if (signedErr) {
      return NextResponse.json({ ok: false, error: signedErr.message }, { status: 500 });
    }

    // 6) OPTIONAL: Persist metadata once the table exists (uncomment when ready)
    await supabase.from('audio_evidence').insert({
  user_id: userId,
  role_id: roleId,
  path: objectPath,
  mime: file.type || `audio/${ext}`,
  duration_ms: durationMs
});
    return NextResponse.json({
      ok: true,
      path: objectPath,
      signedUrl: signed.signedUrl,
      mime: file.type || `audio/${ext}`,
      durationMs
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err?.message || 'Unknown error' }, { status: 500 });
  }
}
