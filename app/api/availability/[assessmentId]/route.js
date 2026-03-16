// app/api/availability/[assessmentId]/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY; // server only
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key);
}

export async function GET(_req, { params }) {
  try {
    const supabase = getServerSupabase();
    const assessmentId = params.assessmentId;

    // TODO: adjust to your schema/table name
    const { data, error } = await supabase
      .from("availability")
      .select("*")
      .eq("assessment_id", assessmentId)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({ ok: true, availability: data || null }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
