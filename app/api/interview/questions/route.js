// app/api/interview/questions/route.js
import { NextResponse } from "next/server";
// If your project has the alias "@/lib/...", use the line below:
import { supabase } from "@/lib/supabaseClient";
// If the alias is not set, comment the line above and uncomment the next line:
// import { supabase } from "../../../../lib/supabaseClient";

export async function GET() {
  try {
    // Interview questions remain in English by design for PR‑7
    const { data, error } = await supabase
      .from("interview_questions")
      .select("*")
      .eq("language", "en")
      .order("order_no", { ascending: true });

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
