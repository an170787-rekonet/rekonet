// app/api/_lib/supabase.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// These guard checks make sure your env vars are loaded
if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
}
if (!serviceKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
}

// Create an admin client (server-side only)
export const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});
