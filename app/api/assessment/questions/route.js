export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../_lib/supabase';
import { getCategories, getScale, getIntro, getQuestions } from '../../_lib/questions';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const assessment_id = searchParams.get('assessment_id') || 'demo';
    const languageParam = (searchParams.get('language') || 'en').toLowerCase();

    let lang = languageParam;

    if (assessment_id !== 'demo') {
      const { data, error } = await supabaseAdmin
        .from('assessments')
        .select('language')
        .eq('id', assessment_id)
        .single();
      if (!error && data?.language) lang = data.language;
    }

    return NextResponse.json({
      ok: true,
      assessment_id,
      language: lang,
      intro: getIntro(lang),
      scale: getScale(lang),
      categories: getCategories(lang),
      items: getQuestions(lang),
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
