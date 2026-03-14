// app/api/upload-audio/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with Service Role (server-only).
// NOTE: Never expose SERVICE_ROLE in client-side code.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Force Node runtime so FormData/File uploads work reliably.
export const runtime = 'nodejs';

export async function POST(req) {
  try {
    // 1) Read multipart/form-data from client
    const form = await req.formData();
    const file = form.get('file'); // Blob/File from <input type="file"> or MediaRecorder
    const userId = form.get('user_id') || 'anon';
    const roleId = form.get('role_id') || 'interview';
    const durationMs = Number(form.get('duration_ms') || 0);

    if (!file || typeof file === 'string') {
      return NextResponse.json({ ok: false, error: 'Missing audio file' }, { status: 400 });
    }

    // 2) Choose extension from MIME
    const mime = (file.type || '').toLowerCase();
    const ext =
      mime.includes('webm') ? 'webm' :
      mime.includes('mp4')  ? 'mp4'  :
      mime.includes('m4a')  ? 'm4a'  :
      mime.includes('mp3')  ? 'mp3'  : 'webm';

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
        contentType: mime || `audio/${ext}`,
      });

    if (uploadError) {
      return NextResponse.json({ ok: false, error: uploadError.message }, { status: 500 });
    }

    // 5) Create a signed URL (works with private buckets)
    const { data: signed, error: signedErr } = await supabase
      .storage
      .from('audio')
      .createSignedUrl(objectPath, 60 * 60); // 1 hour

    if (signedErr) {
      return NextResponse.json({ ok: false, error: signedErr.message }, { status: 500 });
    }

    // 6) Insert a log row into audio_evidence (user_id must be UUID or null)
    const isUuid =
      typeof userId === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId);

    const userIdValue = isUuid ? userId : null;

    const { error: insertErr } = await supabase
      .from('audio_evidence')
      .insert({
        user_id: userIdValue,
        role_id: roleId,
        path: objectPath,
        mime: mime || `audio/${ext}`,
        duration_ms: durationMs
      });

    // If logging fails, still return success for the upload,
    // but include a warning so we can diagnose later without blocking UX.
    if (insertErr) {
      return NextResponse.json({
        ok: true,
        path: objectPath,
        signedUrl: signed.signedUrl,
        mime: mime || `audio/${ext}`,
        durationMs,
        warning: `Upload ok, but audio_evidence insert failed: ${insertErr.message}`
      });
    }

    // 7) Success
    return NextResponse.json({
      ok: true,
      path: objectPath,
      signedUrl: signed.signedUrl,
      mime: mime || `audio/${ext}`,
      durationMs
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err?.message || 'Unknown error' }, { status: 500 });
  }
}
