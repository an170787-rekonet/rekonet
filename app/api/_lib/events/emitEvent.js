// app/api/_lib/events/emitEvent.js
import * as dbClients from '../supabase';  // supports either export

/**
 * Write a single event row into public.events (ASM foundation).
 * Fails safely if the client isn't ready (no user impact).
 */
export async function emitEvent({
  participant_id = null,
  actor_role,
  event_type,
  payload = {},
}) {
  try {
    const db = dbClients?.supabase ?? dbClients?.supabaseAdmin;
    if (!db || !db.from) {
      console.error('emitEvent: supabase client missing — skipping insert');
      return;
    }
    const { error } = await db
      .from('events')
      .insert({ participant_id, actor_role, event_type, payload });
    if (error) console.error('emitEvent error:', error.message || error);
  } catch (e) {
    console.error('emitEvent exception:', e?.message || e);
  }
}
