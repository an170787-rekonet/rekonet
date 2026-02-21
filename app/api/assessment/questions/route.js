// app/api/assessment/questions/route.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getAssessment } from '../../_lib/store';
import { supabaseAdmin } from '../../_lib/supabase';
import { getQuestions, getCategories, getScale, getIntro } from '../../_lib/questions';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Accept both snake_case and camelCase for resilience
    const assessmentId =
      searchParams.get('assessment_id') ||
      searchParams.get('assessmentId') ||
      'demo';

    // Start with URL language (accept language or lang)
    let lang =
      (searchParams.get('language') ||
        searchParams.get('lang') ||
        'en').toLowerCase();

    // Prefer the language saved on the in-memory assessment (if present)
    const local = typeof getAssessment === 'function' ? getAssessment(assessmentId) : null;
    if (local?.language) {
      lang = String(local.language).toLowerCase();
    }

    // If not demo, check Supabase for the assessment language (takes priority if present)
    if (assessmentId !== 'demo' && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('assessments')
        .select('language')
        .eq('id', assessmentId)
        .single();

      if (!error && data?.language) {
        lang = String(data.language).toLowerCase();
      }
    }

    // Pull question content
    // If your _lib/questions exports categories/scale/intro, we’ll use them;
    // otherwise we’ll fall back to safe defaults.
    const categories = typeof getCategories === 'function' ? getCategories(lang) : null;
    const itemsOrCategories = getQuestions(lang);
    const scale =
      (typeof getScale === 'function' && getScale(lang)) ||
      ['Not yet', 'Rarely', 'Sometimes', 'Often', 'Always'];
    const intro = typeof getIntro === 'function' ? getIntro(lang) : null;

    // Normalise: ensure we return { categories: [...] } shape
    const categoriesNormalized = Array.isArray(itemsOrCategories)
      ? itemsOrCategories // already an array of categories
      : categories || [
          {
            key: 'default',
            label: 'Assessment',
            items: (itemsOrCategories && itemsOrCategories.items) || [],
          },
        ];

    return NextResponse.json({
      ok: true,
      assessmentId,
      language: lang,
      categories: categoriesNormalized,
      scale,
      intro,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}
