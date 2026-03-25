// app/api/plan/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { supabaseAdmin } from "../_lib/supabase";

/**
 * /api/plan
 * Returns:
 * {
 *   ok: true,
 *   plan: { weekly, courses, roles }
 * }
 *
 * Heuristics:
 * - If no evidence in last 7 days → Add "Add 1 evidence note"
 * - If no availability row → Add "Set your availability"
 * - If CV stage (level <= 2) → Add CV tune-up action
 * - Always return 3–5 SMART actions
 */

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id"); // assessment_id
    if (!id) {
      return NextResponse.json(
        { ok: false, error: "Missing assessment id" },
        { status: 400 }
      );
    }

    // ============================================================
    // 1) Load latest assessment result
    // ============================================================
    const { data: assess, error: assessErr } = await supabaseAdmin
      .from("assessment_results")
      .select("*")
      .eq("assessment_id", id)
      .maybeSingle();

    if (assessErr) {
      return NextResponse.json(
        { ok: false, error: assessErr.message },
        { status: 500 }
      );
    }

    const level = assess?.level ?? 1;

    // ============================================================
    // 2) Load latest availability (if any)
    // ============================================================
    const { data: availRow } = await supabaseAdmin
      .from("availability")
      .select("*")
      .eq("assessment_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const hasAvailability = !!availRow;

    // ============================================================
    // 3) Load recent events (last 14 days)
    // evidence_uploaded, availability_saved
    // ============================================================
    const sinceIso = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

    const { data: events, error: evErr } = await supabaseAdmin
      .from("events")
      .select("*")
      .eq("payload->>assessment_id", id)
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false });

    if (evErr) {
      return NextResponse.json(
        { ok: false, error: evErr.message },
        { status: 500 }
      );
    }

    const hasRecentEvidence = events?.some((ev) => ev.event_type === "evidence_uploaded");

    // ============================================================
    // 4) Build SMART weekly plan using heuristics
    // ============================================================
    const actions = [];

    // Evidence cadence
    if (!hasRecentEvidence) {
      actions.push({
        text: "Add one evidence note to show recent progress",
        minutes: 5,
        kind: "evidence",
      });
    }

    // Availability reminder
    if (!hasAvailability) {
      actions.push({
        text: "Set your availability so we can suggest good times for activities",
        minutes: 5,
        kind: "availability",
      });
    }

    // CV stage (simple heuristic)
    if (level <= 2) {
      actions.push({
        text: "Tweak your CV summary to match your target role",
        minutes: 10,
        kind: "cv",
      });
    }

    // Generic action to hit 3–5 total
    actions.push({
      text: "Apply to two roles that match your interests",
      minutes: 20,
      kind: "apply",
    });

    if (actions.length < 3) {
      actions.push({
        text: "Read a short article about improving interview answers",
        minutes: 10,
        kind: "learn",
      });
    }

    const weekly = [
      {
        label: "This week",
        items: actions.slice(0, 5),
      },
    ];

    // ============================================================
    // 5) Micro-courses (simple static list for now)
    // ============================================================
    const courses = [
      {
        title: "Customer Service Basics",
        minutes: 25,
        funded: false,
      },
      {
        title: "Interview STAR Mini",
        minutes: 15,
        funded: false,
      },
    ];

    // ============================================================
    // 6) Roles feed (placeholder for your real job search module)
    // Will read skills + location later
    // ============================================================
    const roles = [
      { title: "Retail Assistant", url: "#", source: "Indeed" },
      { title: "Warehouse Operative", url: "#", source: "Reed" },
    ];

    // ============================================================
    // 7) Final response
    // ============================================================
    return NextResponse.json({
      ok: true,
      plan: {
        weekly,
        courses,
        roles,
        level,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}
``
