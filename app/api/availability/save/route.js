// app/api/availability/save/route.js
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseClient";

export async function POST(req) {
  try {
    const supabase = createClient();
    const body = await req.json();

    const { data, error } = await supabase
      .from("availability")
      .upsert(body)
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
