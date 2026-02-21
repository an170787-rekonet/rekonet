// app/api/_lib/store.js
import { randomUUID } from 'crypto';

const assessments = new Map(); // id -> { id, language, createdAt }
const answers = new Map();     // id -> [{ question_id, category, score, at }]

export function createAssessment(language = 'en') {
  const id = randomUUID();
  const rec = { id, language, createdAt: Date.now() };
  assessments.set(id, rec);
  if (!answers.has(id)) answers.set(id, []);
  return rec;
}

export function getAssessment(id) {
  return assessments.get(id) || null;
}

export function setAssessmentLanguage(id, language) {
  const rec = assessments.get(id);
  if (rec) {
    rec.language = language;
    assessments.set(id, rec);
    return rec;
  }
  return null;
}

export function saveAnswer(id, payload) {
  if (!answers.has(id)) answers.set(id, []);
  const row = {
    question_id: payload.question_id,
    category: payload.category,
    score: Number(payload.score || 0),
    at: Date.now(),
  };
  answers.get(id).push(row);
  return row;
}

export function getAnswers(id) {
  return answers.get(id) || [];
}

export function listAssessments() {
  return Array.from(assessments.values());
}
