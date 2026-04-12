export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabaseClient";

export async function GET(request) {
  try {
    // ✅ read ?language=en
    const { searchParams } = new URL(request.url);
    const language = searchParams.get("language") || "en";

    // ✅ map language → correct column
    const column = `text_${language}`;

    // ✅ select exactly what the frontend needs
    const { data, error } = await supabase
      .from("assessment_questions")
      .select(`
        id,
        category,
        ${column},
        order_index
      `)
      .order("order_index", { ascending: true });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // ✅ rename the language column to "text" for the frontend
    const questions = (data || []).map(q => ({
      id: q.id,
      category: q.category,
      text: q[column],        // ✅ front-end needs "text"
      order_index: q.order_index
    }));

    return NextResponse.json({ ok: true, questions });
    
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
