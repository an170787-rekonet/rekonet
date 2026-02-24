// app/api/interview/attempt/route.js
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseClient";

/**
 * GET /api/interview/attempt?assessment_id=...&limit=3
 * Returns recent attempts (id, question_id, score, created_at)
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const assessmentId = searchParams.get("assessment_id");
    const limit = Math.max(1, Math.min(10, Number(searchParams.get("limit") || 3)));

    if (!assessmentId) {
      return NextResponse.json(
        { ok: false, data: null, error: "assessment_id is required" },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from("interview_attempts")
      .select("id, question_id, score, created_at")
      .eq("assessment_id", assessmentId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json(
        { ok: false, data: null, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, data, error: null }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { ok: false, data: null, error: "Unexpected server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/interview/attempt
 * Body: { assessment_id, question_id, answer, score }
 */
export async function POST(req) {
  try {
    const supabase = createClient();
    const body = await req.json();

    const { data, error } = await supabase
      .from("interview_attempts")
      .insert(body)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, data: null, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, data, error: null }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { ok: false, data: null, error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
