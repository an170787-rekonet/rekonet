// app/api/availability/save/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY; // server only
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key);
}

export async function POST(req) {
  try {
    const supabase = getServerSupabase();
    const body = await req.json(); // { assessmentId, ...fields }
    const { assessmentId, ...fields } = body;

    // TODO: adjust to your schema/table name & conflict target
    const { data, error } = await supabase
      .from("availability")
      .upsert(
        { assessment_id: assessmentId, ...fields },
        { onConflict: "assessment_id" }
      )
      .select()
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({ ok: true, availability: data }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
``
