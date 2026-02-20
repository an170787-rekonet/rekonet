// app/api/assessment/profile/route.js
import { supabase } from '../../../lib/supabaseClient';

export async function GET() {
  try {
    // TODO: replace with real auth user id later
    const user_id = "demo-user-id";

    const { data, error } = await supabase
      .from("assessment_profiles")
      .select("preferred_language")
      .eq("user_id", user_id)
      .maybeSingle();
    if (error) throw error;

    return new Response(JSON.stringify(data || { preferred_language: "en" }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
