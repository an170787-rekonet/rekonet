export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getAssessment, saveAnswer } from '../../_lib/store';

export async function POST(request) {
  try {
    const body = await request.json();
    const { assessment_id, question_id, category, score } = body || {};

    if (!assessment_id || !question_id || !category || score == null) {
      return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
    }

    // Allow demo; otherwise require an existing assessment
    const exists = assessment_id === 'demo' ? true : !!getAssessment(assessment_id);
    if (!exists) {
      return NextResponse.json({ ok: false, error: 'Unknown assessment_id' }, { status: 404 });
    }

    const row = saveAnswer(assessment_id, { question_id, category, score });
    return NextResponse.json({ ok: true, saved: row });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
