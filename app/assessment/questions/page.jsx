'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Small cookie reader (fallback language)
function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
  return m ? decodeURIComponent(m.pop()) : null;
}

// Demo questions (English)
const QUESTIONS_EN = [
  { id: 1, competency_key: 'cv', prompt: 'My CV is tailored to each target role.' },
  { id: 2, competency_key: 'cv', prompt: 'I quantify achievements with clear metrics.' },
  { id: 3, competency_key: 'interview', prompt: 'I can answer common competency questions confidently.' },
  { id: 4, competency_key: 'skills', prompt: 'I can map my skills to job descriptions effectively.' },
  { id: 5, competency_key: 'jobsearch', prompt: 'I track applications and follow-ups consistently.' },
];

// Minimal translations (you can add more later)
// If a translation is missing, the UI still works (just English shown).
const TRANSLATIONS = {
  fr: {
    1: 'Mon CV est adapté à chaque poste visé.',
    2: 'Je quantifie mes réalisations avec des chiffres clairs.',
    3: 'Je réponds avec confiance aux questions de compétence les plus courantes.',
    4: 'Je fais correspondre mes compétences aux offres de manière efficace.',
    5: 'Je suis mes candidatures et relances de façon régulière.',
  },
  ar: {
    1: 'سيرتي الذاتية مُعدّة لكل وظيفة مستهدفة.',
    2: 'أُقدّم إنجازاتي بأرقام واضحة.',
    3: 'أستطيع الإجابة بثقة عن أسئلة الكفاءات الشائعة.',
    4: 'أطابق مهاراتي مع تفاصيل الوظائف بفعالية.',
    5: 'أُتابع طلباتي ومواعيد المتابعة باستمرار.',
  },
  pt: {
    1: 'O meu CV é adaptado para cada vaga alvo.',
    2: 'Quantifico resultados com métricas claras.',
    3: 'Consigo responder com confiança às perguntas comportamentais comuns.',
    4: 'Consigo mapear as minhas competências para as ofertas.',
    5: 'Acompanho candidaturas e follow‑ups de forma consistente.',
  },
  so: {
    1: 'CV‑gaygu wuxuu u habeeysan yahay shaqo kasta oo aan beegsanayo.',
    2: 'Waxaan muujinayaa guulaha tiro ahaan.',
    3: 'Waxaan si kalsooni leh uga jawaabaa su’aalaha caadiga ah ee kartida.',
    4: 'Waxaan si wax ku ool ah ula jaanqaadaa xirfadahayga sharaxaadaha shaqada.',
    5: 'Waxaan si joogto ah u diiwaangeliyaa codsiyada iyo la‑socodka.',
  },
  ur: {
    1: 'میرا سی وی ہر ہدف شدہ رول کے مطابق ڈھالا ہوا ہے۔',
    2: 'میں اپنی کامیابیاں واضح نمبروں کے ساتھ ظاہر کرتا/کرتی ہوں۔',
    3: 'میں عام اہلیتی سوالات کا پُراعتماد جواب دے سکتا/سکتی ہوں۔',
    4: 'میں اپنی مہارتوں کو ملازمت کی تفصیل سے مؤثر طریقے سے ملاتا/ملاتی ہوں۔',
    5: 'میں درخواستوں اور فالو اپس کا باقاعدہ ریکارڈ رکھتا/رکھتی ہوں۔',
  },
};

export default function QuestionsPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const assessment_id = sp.get('assessment_id') || 'demo';
  const cookieLang = getCookie('rekonet_read_lang') || 'en';
  const language = sp.get('language') || cookieLang;

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // Load from API if available; otherwise use local demo list
  useEffect(() => {
    const load = async () => {
      setLoading(true); setErr('');
      try {
        const res = await fetch(`/api/assessment/questions?language=${language}`);
        if (res.ok) {
          const json = await res.json();
          if (json?.questions?.length) {
            setQuestions(json.questions);
            return;
          }
        }
        // Fallback: local questions with translations
        const t = TRANSLATIONS[language] || {};
        const qs = QUESTIONS_EN.map(q => ({
          id: q.id,
          competency_key: q.competency_key,
          english_prompt: q.prompt,
          local_prompt: t[q.id] || null,
        }));
        setQuestions(qs);
      } catch (e) {
        setErr('Loading questions failed, showing demo set.');
        const t = TRANSLATIONS[language] || {};
        const qs = QUESTIONS_EN.map(q => ({
          id: q.id,
          competency_key: q.competency_key,
          english_prompt: q.prompt,
          local_prompt: t[q.id] || null,
        }));
        setQuestions(qs);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [language]);

  const setValue = (qid, val) => setAnswers(prev => ({ ...prev, [qid]: val }));

  const submit = async () => {
    try {
      // Try to save answers if API exists; otherwise just continue
      const payload = {
        assessment_id,
        answers: Object.entries(answers).map(([qid, value]) => ({
          question_id: Number(qid),
          value: Number(value),
        })),
      };
      if (payload.answers.length) {
        try {
          const res = await fetch('/api/assessment/answers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          await res.json().catch(() => ({}));
        } catch (_) { /* ok to ignore in demo */ }
      }
    } finally {
      router.push(`/assessment/result?assessment_id=${assessment_id}&language=${language}`);
    }
  };

  if (loading) return <main style={{ padding: 24 }}>Loading…</main>;
  if (err) console.warn(err);

  return (
    <main style={{ maxWidth: 780, margin: '40px auto', padding: 16 }}>
      <h2>Questions</h2>
      <ol>
        {questions.map((q) => (
          <li key={q.id} style={{ marginBottom: 16 }}>
            <p><strong>[{q.competency_key}]</strong></p>
            <p style={{ margin: '6px 0' }}>{q.english_prompt}</p>
            {q.local_prompt && (
              <p style={{ margin: 0, color: '#555' }}><em>{q.local_prompt}</em></p>
            )}

            <div role="group" aria-label="How true is this for you today?">
              {[
                { v: 1, t: 'Not yet' },
                { v: 2, t: 'Sometimes' },
                { v: 3, t: 'Often' },
                { v: 4, t: 'Usually' },
                { v: 5, t: 'Always' },
              ].map((o) => (
                <label key={o.v} style={{ marginRight: 10 }}>
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    value={o.v}
                    checked={String(answers[q.id] || '') === String(o.v)}
                    onChange={() => setValue(q.id, o.v)}
                  />{' '}
                  {o.t}
                </label>
              ))}
            </div>
          </li>
        ))}
      </ol>

      <button onClick={submit}>
        See your current level
      </button>
    </main>
  );
}
