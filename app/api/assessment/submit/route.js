export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseClient";

/**
 * Expected incoming JSON:
 * {
 *   "assessment_id": "...",
 *   "answers": [
 *      { "question_id": "...", "category": "...", "score": 1 }
 *   ]
 * }
 */

export async function POST(request) {
  try {
    const body = await request.json();
    const { assessment_id, answers } = body;

    // ✅ Validate presence of assessment_id
    if (!assessment_id) {
      return NextResponse.json(
        { ok: false, error: "Missing assessment_id" },
        { status: 400 }
      );
    }

    // ✅ Validate answers shape
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No answers provided" },
        { status: 400 }
      );
    }

    // ✅ Insert answers one‑by‑one (safe against DB constraint failures)
    const formatted = answers.map((a) => ({
      assessment_id,
      question_id: a.question_id,
      category: a.category,  // ✅ must be: general / literacy / digital / behaviour
      score: a.score,
    }));

    const { error: insertError } = await supabase
      .from("answers")
      .insert(formatted);

    if (insertError) {
      return NextResponse.json(
        { ok: false, error: insertError.message },
        { status: 500 }
      );
    }

    // ✅ Mark assessment as completed
    await supabase
      .from("assessments")
      .update({ completed_at: new Date().toISOString() })
      .eq("id", assessment_id);

    return NextResponse.json({ ok: true, inserted: formatted.length });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e.message },
      { status: 500 }
    );
  }
}
