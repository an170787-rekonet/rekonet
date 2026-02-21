// app/api/assessment/questions/route.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    // Accept both snake_case and camelCase just in case
    const assessmentId =
      searchParams.get('assessment_id') ||
      searchParams.get('assessmentId') ||
      'demo';
    const lang = (searchParams.get('language') || searchParams.get('lang') || 'en').toLowerCase();

    // 🔸 EMERGENCY FALLBACK QUESTIONS
    // This guarantees your Questions page has something to show while we fix the DB route.
    // Shape matches your UI: flat list with { id, category, text_en, text_local }
    const demoCategories = [
      {
        id: 'cv-1',
        category: 'cv',
        text_en: 'How comfortable do you feel writing a short CV summary (2–3 lines)?',
        text_local: 'How comfortable do you feel writing a short CV summary (2–3 lines)?'
      },
      {
        id: 'int-1',
        category: 'interview',
        text_en: 'In a short interview, how confident are you explaining your last job?',
        text_local: 'In a short interview, how confident are you explaining your last job?'
      },
      {
        id: 'js-1',
        category: 'jobsearch',
        text_en: 'When you see a job online, how ready do you feel to apply today?',
        text_local: 'When you see a job online, how ready do you feel to apply today?'
      },
      {
        id: 'dig-1',
        category: 'digital',
        text_en: 'How confident are you joining an online meeting and checking audio?',
        text_local: 'How confident are you joining an online meeting and checking audio?'
      }
    ];

    // Supportive scale (ethos: no right/wrong)
    const scale = ['Not yet', 'Rarely', 'Sometimes', 'Often', 'Always'];

    // Supportive intro (ethos)
    const intro =
      "This isn’t a test — there are no right or wrong answers. We’re just finding your best starting point.";

    // ✅ Always return success for now so your page renders questions
    return NextResponse.json({
      ok: true,
      assessmentId,
      language: lang,
      categories: demoCategories, // ⬅️ flat list (as your client expects)
      scale,
      intro
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}
