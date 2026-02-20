import { supabase } from "@/lib/supabaseClient";

export async function POST(req) {
  try {
    const { user_id, preferred_language } = await req.json();

    if (!user_id || !preferred_language) {
      return new Response(
        JSON.stringify({ error: "Missing user_id or preferred_language" }),
        { status: 400 }
      );
    }

    // Save language to database
    const { error } = await supabase
      .from("assessment_profiles")
      .upsert({
        user_id,
        preferred_language
      });

    if (error) {
      console.error("Supabase error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500
      });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (err) {
    console.error("API error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500
    });
  }
}
