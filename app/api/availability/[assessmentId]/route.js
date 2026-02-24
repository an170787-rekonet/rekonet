// app/api/availability/[assessmentId]/route.js
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseClient";

export async function PUT(req, { params }) {
  const assessmentId = params.assessmentId;

  try {
    const supabase = createClient();
    const body = await req.json();

    const { data, error } = await supabase
      .from("availability")
      .upsert({
        assessment_id: assessmentId,
        days: body.days,
        times: body.times,
        contract: body.contract,
        max_travel_mins: body.max_travel_mins,
        earliest_start: body.earliest_start
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, data: null, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { ok: true, data, error: null },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { ok: false, data: null, error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
