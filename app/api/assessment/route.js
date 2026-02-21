export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createAssessment } from '../_lib/store';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const language = body?.language || 'en';
    const assessment = createAssessment(language);
    return NextResponse.json({ ok: true, assessment });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}
