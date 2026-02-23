// app/api/cv/summary/route.js
export const runtime = 'nodejs';

import { createServerClient } from '../../_lib/supabase';

export async function GET(req) {
  try {
    const supabase = createServerClient();

    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return new Response(JSON.stringify({ ok: false, error: "Missing user_id" }), {
        status: 400,
        headers: { 'content-type': 'application/json' }
      });
    }

    // Fetch the latest CV document for this user
    const { data, error } = await supabase
      .from('cv_documents')
      .select('*')
      .eq('user_id', user_id)
      .order('uploaded_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return new Response(JSON.stringify({ ok: false, error: error.message }), {
        status: 500,
        headers: { 'content-type': 'application/json' }
      });
    }

    if (!data) {
      return new Response(JSON.stringify({ ok: true, hasCV: false }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    }

    const parsed = data.parsed || {};
    const topKeywords = parsed.keywords || [];
    const sectorScores = parsed.sectorScores || {};

    // Pick top 1–2 highest scoring sectors
    const sortedSectors = Object.entries(sectorScores)
      .sort((a, b) => b[1] - a[1])
      .map(([key]) => key)
      .slice(0, 2);

    return new Response(JSON.stringify({
      ok: true,
      hasCV: true,
      topKeywords,
      topSectors: sortedSectors,
      uploaded_at: data.uploaded_at
    }), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}
