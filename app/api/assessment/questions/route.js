// /api/assessment/questions
import { NextResponse } from 'next/server';
import { getQuestions } from '@/app/_lib/questions'; // adjust path if different

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const lang = (searchParams.get('lang') || 'en').toLowerCase();
  const assessmentId = searchParams.get('assessmentId') || null;

  const data = getQuestions(lang); // { language, categories: [...] }

  return NextResponse.json({
    assessmentId,
    language: data.language,
    categories: data.categories,
    scale: ["Not yet", "Rarely", "Sometimes", "Often", "Always"]
  });
}
