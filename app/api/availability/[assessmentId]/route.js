// app/api/availability/[assessmentId]/route.js
"use server";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs"; // ensure Node runtime (not Edge)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/** GET /api/availability/:assessmentId */
export async function GET(_req, { params }) {
  try {
    const { data, error } = await supabase
      .from("availability")
      .select("*")
      .eq("assessment_id", params.assessmentId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return NextResponse.json({ data: data || null }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: e?.message || "Supabase GET failed." }, { status: 500 });
  }
}

/** PUT /api/availability/:assessmentId
 * Deterministic: try UPDATE; if no row updated, INSERT.
 */
export async function PUT(req, { params }) {
  try {
    const payload = await req.json();
    const assessmentId = params.assessmentId;

    // 1) UPDATE first
    const { data: updData, error: updErr } = await supabase
      .from("availability")
      .update({
        days: Array.isArray(payload?.days) ? payload.days : [],
        times: payload?.times || {},
        contract: payload?.contract || null,
        max_travel_mins: Number(payload?.max_travel_mins) || 0,
        earliest_start: payload?.earliest_start || null,
      })
      .eq("assessment_id", assessmentId)
      .select("*")
      .limit(1);

    if (updErr) throw updErr;
    if (Array.isArray(updData) && updData.length > 0) {
      return NextResponse.json({ data: updData[0] }, { status: 200 });
    }

    // 2) If no row was updated, INSERT
    const insertObj = {
      assessment_id: assessmentId,
      days: Array.isArray(payload?.days) ? payload.days : [],
      times: payload?.times || {},
      contract: payload?.contract || null,
      max_travel_mins: Number(payload?.max_travel_mins) || 0,
      earliest_start: payload?.earliest_start || null,
    };

    const { data: insData, error: insErr } = await supabase
      .from("availability")
      .insert([insertObj])
      .select("*")
      .limit(1);

    if (insErr) throw insErr;

    return NextResponse.json(
      { data: Array.isArray(insData) ? insData[0] : insData },
      { status: 200 }
    );
  } catch (e) {
    // Return the real message so the UI can show it
    return NextResponse.json({ error: e?.message || "Supabase PUT failed." }, { status: 500 });
  }
}
