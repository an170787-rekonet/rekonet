// app/api/availability/[assessmentId]/route.js

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Next.js route handlers are server by default. Do NOT add "use server" here.
export const runtime = "nodejs"; // ensure Node runtime (not Edge)

/**
 * Prefer server-only env vars on the server.
 * Fall back to NEXT_PUBLIC_* if needed (not recommended for writes).
 */
const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn(
    "[availability route] Missing Supabase env vars. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE / ANON KEY."
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * GET /api/availability/:assessmentId
 * Returns { data } where data is the JSON payload you store.
 */
export async function GET(_req, { params }) {
  try {
    const assessmentId = params?.assessmentId;
    if (!assessmentId) {
      return NextResponse.json(
        { error: "Missing assessmentId" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("availability")
      .select("data")
      .eq("assessment_id", assessmentId)
      .maybeSingle();

    if (error) {
      console.error("[availability GET] Supabase error:", error);
      return NextResponse.json(
        { error: "Database error while loading availability." },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data?.data ?? null }, { status: 200 });
  } catch (e) {
    console.error("[availability GET] Unexpected error:", e);
    return NextResponse.json(
      { error: "Unexpected error." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/availability/:assessmentId
 * Body: JSON object you want to store under 'data'.
 * Returns { data } echoing what is stored.
 */
export async function PUT(req, { params }) {
  try {
    const assessmentId = params?.assessmentId;
    if (!assessmentId) {
      return NextResponse.json(
        { error: "Missing assessmentId" },
        { status: 400 }
      );
    }

    let payload;
    try {
      payload = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    // Upsert by assessment_id
    const { data, error } = await supabase
      .from("availability")
      .upsert(
        [{ assessment_id: assessmentId, data: payload }],
        { onConflict: "assessment_id" } // requires a unique index on assessment_id
      )
      .select("data")
      .maybeSingle();

    if (error) {
      console.error("[availability PUT] Supabase error:", error);
      return NextResponse.json(
        { error: "Database error while saving availability." },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data?.data ?? payload }, { status: 200 });
  } catch (e) {
    console.error("[availability PUT] Unexpected error:", e);
    return NextResponse.json(
      { error: "Unexpected error." },
      { status: 500 }
    );
  }
}
