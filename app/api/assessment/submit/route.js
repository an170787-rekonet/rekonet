// app/api/assessment/submit/route.js
import { supabase } from '../../../../lib/supabaseClient';

export async function POST(req) {
  try {
    const { user_id, answers } = await req.json();
    if (!user_id || !Array.isArray(answers)) {
      return new Response(JSON.stringify({ error: "Missing user_id or answers" }), { status: 400 });
    }

    let literacy = 0, digital = 0, behaviour = 0;

    for (const a of answers) {
      const { question_id, selected_option_id, free_text_response } = a;

      // Get question category
      const { data: q, error: qerr } = await supabase
        .from("assessment_questions")
        .select("id, category")
        .eq("id", question_id)
        .single();
      if (qerr) throw qerr;

      // Determine score
      let score_value = 0;
      if (selected_option_id) {
        const { data: opt, error: oerr } = await supabase
          .from("assessment_options")
          .select("score_value")
          .eq("id", selected_option_id)
          .single();
        if (oerr) throw oerr;
        score_value = opt?.score_value ?? 0;
      } else if (free_text_response) {
        // MVP: neutral for free text (we can enhance later)
        score_value = 0;
      }

      // Store raw result
      const { error: rerr } = await supabase.from("assessment_results").insert({
        user_id,
        question_id,
        selected_option_id: selected_option_id || null,
        free_text_response: free_text_response || null,
        score_value
      });
      if (rerr) throw rerr;

      // Accumulate per category
      if (q.category === "literacy") literacy += score_value;
      if (q.category === "digital")  digital  += score_value;
      if (q.category === "behaviour") behaviour += score_value;
    }

    // Simple rules for the current sample set
    let recommended_path = "standard";
    if (literacy < 2 || digital < 2 || behaviour < 2) recommended_path = "foundations";
    else if (literacy >= 4 && digital >= 4 && behaviour >= 4) recommended_path = "fast-track";

    // Save scores + recommendation
    const { error: perr } = await supabase.from("assessment_profiles").upsert({
      user_id,
      literacy_score: literacy,
      digital_score: digital,
      behaviour_score: behaviour,
      recommended_path
    });
    if (perr) throw perr;

    return new Response(JSON.stringify({ recommended_path }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
