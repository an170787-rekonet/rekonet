export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseClient";  // ✅ your real file

export async function GET() {
  try {
    // ✅ Load real questions from your DB
    const { data, error } = await supabase
      .from("assessment_questions")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      questions: data || [],
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e.message },
      { status: 500 }
    );
  }
}
