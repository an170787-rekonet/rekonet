export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getAssessment } from '../../_lib/store';
import { getCategories, getScale, getIntro, getQuestions } from '../../_lib/questions';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const assessment_id = searchParams.get('assessment_id') || 'demo';
    const language = (searchParams.get('language') || 'en').toLowerCase();

    // Prefer the language stored on the assessment if present
    const a = getAssessment(assessment_id);
    const lang = a?.language || language || 'en';

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
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}
