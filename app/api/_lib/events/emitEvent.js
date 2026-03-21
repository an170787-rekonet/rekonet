// app/api/_lib/events/emitEvent.js
import { supabase } from '../supabase';

/**
 * Write a single event row into public.events (ASM foundation).
 * @param {Object} p
 * @param {string|null} [p.participant_id]
 * @param {'participant'|'advisor'|'manager'|'employer'|'system'} p.actor_role
 * @param {string} p.event_type  e.g. 'assessment_started' | 'answer_submitted' | 'result_computed'
 * @param {any} [p.payload]      small JSON: { assessment_id, language, question_id, value, level, score, ... }
 */
export async function emitEvent({ participant_id = null, actor_role, event_type, payload = {} }) {
  const { error } = await supabase
    .from('events')
    .insert({ participant_id, actor_role, event_type, payload });

  if (error) {
    console.error('emitEvent error:', error.message || error);
  }
}
``
