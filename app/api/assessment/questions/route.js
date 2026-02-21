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

    // 🔸 FALLBACK QUESTIONS (copy-polished, ethos-aligned)
    // Shape matches your UI: flat list with { id, category, text_en, text_local }
    const demoCategories = [
      {
        id: 'cv-1',
        category: 'cv',
        text_en: 'How comfortable do you feel writing a short, simple CV summary about yourself?',
        text_local: 'How comfortable do you feel writing a short, simple CV summary about yourself?'
      },
      {
        id: 'int-1',
        category: 'interview',
        text_en: 'In a short conversation or interview, how confident do you feel talking about your last role or experience?',
        text_local: 'In a short conversation or interview, how confident do you feel talking about your last role or experience?'
      },
      {
        id: 'js-1',
        category: 'jobsearch',
        text_en: 'When you see a job online, how ready do you feel to apply?',
        text_local: 'When you see a job online, how ready do you feel to apply?'
      },
      {
        id: 'dig-1',
        category: 'digital',
        text_en: 'How comfortable do you feel joining an online meeting and making sure your sound works?',
        text_local: 'How comfortable do you feel joining an online meeting and making sure your sound works?'
      }
    ];

    // Supportive scale (ethos: no right/wrong). Gentler than "Rarely".
    const scale = ['Not yet', 'A little', 'Sometimes', 'Often', 'Always'];

    // Supportive intro (ethos)
    const intro =
      "This isn’t a test — there are no right or wrong answers. We’re simply finding your best starting point so we can support your job‑ready journey.";

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
