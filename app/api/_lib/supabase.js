// app/api/_lib/supabase.js

import { createClient } from '@supabase/supabase-js';

/**
 * ENV VARS
 * ----------
 * NEXT_PUBLIC_SUPABASE_URL            -> Supabase project URL (safe to expose)
 * SUPABASE_SERVICE_ROLE_KEY           -> Service role (SERVER ONLY! never ship to client)
 *
 * On Vercel: add both in Project Settings > Environment Variables.
 * Locally:   put them in .env.local (do NOT commit the service key).
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Guard checks so failures are obvious in logs
if (!supabaseUrl) {
  throw new Error('Missing env: NEXT_PUBLIC_SUPABASE_URL');
}
if (!serviceRoleKey) {
  throw new Error('Missing env: SUPABASE_SERVICE_ROLE_KEY');
}

/**
 * Server-side admin client
 * Use ONLY in API routes / server code.
 * Provides full DB access governed by RLS policies (or bypass if disabled).
 * We disable session persistence because this is not a browser.
 */
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/**
 * Convenience wrapper for API routes.
 * Keeps your route code neat and gives us a single place to evolve config later.
 */
export function createServerClient() {
  return supabaseAdmin;
}
