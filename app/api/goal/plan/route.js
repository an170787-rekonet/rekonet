// app/api/goal/plan/route.js
export const runtime = "nodejs";

import { createServerClient } from "../../_lib/supabase";

// Simple “role profile” map for PR‑4 (we expand later in PR‑5/PR‑6)
const roleProfiles = {
  "customer service advisor": {
    mustHave: ["customer service", "crm", "communication", "complaints"],
    niceToHave: ["ms office", "data entry"]
  },
  "admin assistant": {
    mustHave: ["data entry", "ms office", "records", "filing"],
    niceToHave: ["communication", "scheduling"]
  },
  "warehouse operative": {
    mustHave: ["picking", "packing", "inventory"],
    niceToHave: ["health and safety", "teamwork"]
  }
};

export async function POST(req) {
  try {
    const supabase = createServerClient();

    const body = await req.json();
    const { user_id, goal } = body;

    if (!user_id || !goal) {
      return new Response(
        JSON.stringify({ ok: false, error: "Missing user_id or goal" }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    // 1. Load latest CV signals
    const { data: cv, error: cvError } = await supabase
      .from("cv_documents")
      .select("*")
      .eq("user_id", user_id)
      .order("uploaded_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cvError) {
      return new Response(
        JSON.stringify({ ok: false, error: cvError.message }),
        { status: 500, headers: { "content-type": "application/json" } }
      );
    }

    const parsed = cv?.parsed || {};
    const keywords = parsed.keywords || [];

    // 2. Match to the chosen role profile
    const profile = roleProfiles[goal.toLowerCase()];

    if (!profile) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Unknown goal. Add it to roleProfiles."
        }),
        {
          status: 400,
          headers: { "content-type": "application/json" }
        }
      );
    }

    // 3. Compute AlreadyHave & GentlyMissing
    const alreadyHave = [];
    const gentlyMissing = [];

    for (const req of profile.mustHave) {
      if (keywords.includes(req)) alreadyHave.push(req);
      else gentlyMissing.push(req);
    }

    for (const nice of profile.niceToHave) {
      if (!keywords.includes(nice)) gentlyMissing.push(nice);
    }

    // 4. Recommend next actions (simple version)
    const actions = gentlyMissing.map((item) => ({
      skill: item,
      suggestion: `Practice or add evidence for '${item}'`
    }));

    return new Response(
      JSON.stringify({
        ok: true,
        goal,
        alreadyHave,
        gentlyMissing,
        actions
      }),
      {
        status: 200,
        headers: { "content-type": "application/json" }
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
}
