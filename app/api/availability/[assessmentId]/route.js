// app/api/availability/[assessmentId]/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs"; // ensure Node runtime (not Edge)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET /api/availability/:assessmentId
export async function GET(_req, { params }) {
  const { assessmentId } = params;

  const { data, error } = await supabase
    .from("availability")
    .select("*")
    .eq("assessment_id", assessmentId)
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}

// PUT /api/availability/:assessmentId
export async function PUT(req, { params }) {
  const { assessmentId } = params;
  const payload = await req.json();

  const { data, error } = await supabase
    .from("availability")
    .upsert(
      {
        assessment_id: assessmentId,
        days: payload?.days ?? [],
        times: payload?.times ?? {},
        contract: payload?.contract ?? null,
        max_travel_mins: payload?.max_travel_mins ?? null,
        earliest_start: payload?.earliest_start ?? null,
      },
      // onConflict works if you add a unique index later
      { onConflict: "assessment_id" }
    )
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data });
}
