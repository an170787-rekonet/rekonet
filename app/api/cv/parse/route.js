// app/api/cv/parse/route.js

// Force Node runtime for this API (not Edge)
export const runtime = 'nodejs';

// IMPORTANT: from app/api/cv/parse/route.js → ../../_lib/supabase  (two levels up)
import { createServerClient } from '../../_lib/supabase';

// ---------- helpers ----------
function topN(map, n = 7) {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k]) => k);
}

function extractSignals(rawText = '') {
  const text = (rawText || '').toLowerCase();

  const keywordBank = [
    'customer service','complaints','crm','call centre','contact centre',
    'ms office','excel','filing','data entry','scheduling','records',
    'picking','packing','picking list','packing list','inventory'
  ];

  const freq = {};
  for (const kw of keywordBank) {
    const pattern = new RegExp(`\\b${kw.replace(/\s+/g, '\\s+')}\\b`, 'gi');
    const count = (text.match(pattern) || []).length;
    if (count > 0) freq[kw] = count;
  }

  const sectors = {
    customer_service: ['customer service','complaints','crm','call centre','contact centre'],
    admin: ['filing','data entry','ms office','excel','scheduling','records'],
    warehouse: ['picking','packing','picking list','packing list','inventory']
  };

  const sectorScores = {};
  for (const [sector, kws] of Object.entries(sectors)) {
    sectorScores[sector] = kws.reduce((sum, kw) => sum + (freq[kw] || 0), 0);
  }

  return {
    keywords: topN(freq, 7),
    sectorScores
  };
}

// ---------- handlers ----------
export async function POST(req) {
  const startedAt = Date.now();

  try {
    const supabase = createServerClient();

    const contentType = req.headers.get('content-type') || '';
    let text = '';
    let user_id = '';
    let language = '';
    let assessment_id = '';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      text = (body?.text || '').toString();
      user_id = (body?.user_id || '').toString();
      language = (body?.language || '').toString();
      assessment_id = (body?.assessment_id || '').toString();
    } else if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      text = String(form.get('text') || '');
      user_id = String(form.get('user_id') || '');
      language = String(form.get('language') || '');
      assessment_id = String(form.get('assessment_id') || '');
      // Optional: handle uploaded file later
      // const file = form.get('file'); // Blob
    } else {
      return new Response(JSON.stringify({ ok: false, error: 'Unsupported content-type' }), {
        status: 415,
        headers: { 'content-type': 'application/json' }
      });
    }

    if (!user_id) {
      return new Response(JSON.stringify({ ok: false, error: 'Missing user_id' }), {
        status: 400,
        headers: { 'content-type': 'application/json' }
      });
    }

    const parsed = extractSignals(text);

    const { error } = await supabase.from('cv_documents').insert({
      user_id,
      file_name: null,
      mime_type: 'text/plain',
      text_extracted: text,
      parsed
    });

    if (error) {
      return new Response(JSON.stringify({ ok: false, error: error.message }), {
        status: 500,
        headers: { 'content-type': 'application/json' }
      });
    }

    const ms = Date.now() - startedAt;
    return new Response(JSON.stringify({
      ok: true,
      saved: true,
      took_ms: ms,
      summary: parsed
    }), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });

  } catch (err) {
    // Always return JSON so the client’s res.json() never fails
    return new Response(JSON.stringify({ ok: false, error: String(err?.message || err) }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}

// GET handler so you can test the route in a browser
export async function GET() {
  return new Response(JSON.stringify({ ok: true, alive: true }), {
    status: 200,
    headers: { 'content-type': 'application/json' }
  });
}
