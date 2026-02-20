// app/api/assessment/questions/route.js
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  try {
    const { data: questions, error: qerr } = await supabase
      .from("assessment_questions")
      .select("*")
      .order("created_at", { ascending: true });
    if (qerr) throw qerr;

    const ids = (questions || []).map(q => q.id);
    let optionsByQ = {};
    if (ids.length) {
      const { data: options, error: oerr } = await supabase
        .from("assessment_options")
        .select("*")
        .in("question_id", ids)
        .order("created_at", { ascending: true });
      if (oerr) throw oerr;

      optionsByQ = (options || []).reduce((acc, o) => {
        (acc[o.question_id] ||= []).push(o);
        return acc;
      }, {});
    }

    return new Response(JSON.stringify({ questions, optionsByQ }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
