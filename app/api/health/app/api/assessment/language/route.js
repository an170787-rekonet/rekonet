import { supabase } from "@/lib/supabaseClient";

export async function POST(req) {
  try {
    const { user_id, preferred_language } = await req.json();

    // Save the user's selected language
    const { error } = await supabase
      .from("assessment_profiles")
      .upsert({
        user_id,
        preferred_language
      });

    if (error) {
      console.error("Supabase error:", error);
      return new Response(JSON.stringify({ error }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
