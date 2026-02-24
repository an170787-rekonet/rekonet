// app/api/interview/attempt/route.js
import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseClient";

// GET recent attempts
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const assessmentId = searchParams.get("assessment_id");
    const limit = Number(searchParams.get("limit") || 3);

    if (!assessmentId) {
      return NextResponse.json(
        { ok: false, data: null, error: "assessment_id is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("interview_attempts")
      .select("id, question_id, score, created_at")
      .eq("assessment_id", assessmentId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ ok: false, data: null, error: error.message });
    }

    return NextResponse.json({ ok: true, data, error: null });
  } catch {
    return NextResponse.json({
      ok: false,
      data: null,
      error: "Unexpected server error"
    });
  }
}

// POST new attempt
export async function POST(req) {
  try {
    const body = await req.json();

    const { data, error } = await supabase
      .from("interview_attempts")
      .insert(body)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ ok: false, data: null, error: error.message });
    }

    return NextResponse.json({ ok: true, data, error: null });
  } catch {
    return NextResponse.json({
      ok: false,
      data: null,
      error: "Unexpected server error"
    });
  }
}
