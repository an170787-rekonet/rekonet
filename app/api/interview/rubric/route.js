// app/api/interview/rubric/route.js
import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseClient";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("competency_rubric")
      .select("*");

    if (error) {
      return NextResponse.json({
        ok: false,
        data: null,
        error: error.message
      });
    }

    return NextResponse.json({ ok: true, data, error: null });
  } catch (err) {
    return NextResponse.json({
      ok: false,
      data: null,
      error: "Unexpected server error"
    });
  }
}
