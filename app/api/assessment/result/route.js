// app/api/assessment/result/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

/**
 * Supabase client import (ROOT /lib)
 * Your repo tree shows: lib/supabaseClient.js
 * We import the module namespace and normalize to `supabase`
 * so it works for either named or default export.
 */
import * as supa from '../../../../lib/supabaseClient';
const supabase = supa.supabase || supa.default;

// ---------------- Helpers ----------------
const clamp01 = (x) => Math.max(0, Math.min(1, x));

function levelFromMeans(overall) {
  if (overall >= 4.0) return { tier: 'Advanced', code: 'L4' };
  if (overall >= 3.0) return { tier: 'Proficient', code: 'L3' };
  if (overall >= 2.0) return { tier: 'Developing', code: 'L2' };
  return { tier: 'Beginner', code: 'L1' };
}

function decidePath({ overall, byCat, proSignals = 0, foundationsSignals = 0 }) {
  const highCats = byCat.filter((c) => c.avg >= 3.6).length;
  const lowCats  = byCat.filter((c) => c.avg <= 2.2).length;
  let pro = proSignals + (overall >= 3.4 ? 1 : 0) + (highCats >= 2 ? 1 : 0);
  let foundations = foundationsSignals + (overall <= 2.4 ? 1 : 0) + (lowCats >= 2 ? 1 : 0);
  if (pro >= 2 && foundations < 2) return 'precision';
  if (foundations >= 2 && pro < 2) return 'foundations';
  return overall >= 3.2 ? 'precision' : 'foundations';
}

// Weighted progress (defaults)
function computeProgress({ levelCode, activities = 0, cv = 0, interview = 0 }) {
  const levelScore = { L1: 25, L2: 50, L3: 70, L4: 85 }[levelCode] || 25;
  const p = 0.35 * levelScore + 0.25 * activities + 0.25 * cv + 0.15 * interview;
  const value = Math.round(clamp01(p / 100) * 100);
  const band = value < 25 ? 0 : value < 50 ? 1 : value < 75 ? 2 : value < 100 ? 3 : 4;
  const prompts = [
    "You've started. Small steps count — your next short activity is ready.",
    'Nice momentum — Job‑Ready is within reach. Two steps today will move the needle.',
    "You're past halfway. A focused activity and a quick practice can tip you into Job‑Ready.",
    'Almost there — one short task and an upload will unlock your Job‑Ready badge.',
    'Job‑Ready achieved — great work. Keep your momentum with targeted roles.',
  ];
  return { value, band, withinReach: value >= 75 && value < 100, nextPrompt: prompts[band] };
}

// Localized strings (Option‑3 tone)
const i18n = {
  headline: {
    en: 'Your starting point', fr: 'Votre point de départ', pt: 'O seu ponto de partida', es: 'Tu punto de partida',
    ta: 'உங்கள் தொடக்கப் புள்ளி', uk: 'Ваша стартова точка', ar: 'نقطة البداية لديك',
  },
  message: {
    en: "Based on your answers, here’s a supportive first step to help you move forward.",
    fr: "Selon vos réponses, voici une première étape pour avancer en confiance.",
    pt: "Com base nas suas respostas, aqui está um primeiro passo de apoio para avançar.",
    es: "Según tus respuestas, aquí tienes un primer paso de apoyo para avanzar.",
    ta: "உங்கள் பதில்களின் அடிப்படையில், முன்னேற உதவும் ஆதரவு முதல் படி இதோ.",
    uk: "Виходячи з ваших відповідей, ось перший крок підтримки, щоб рухатися далі.",
    ar: "استنادًا إلى إجاباتك، إليك خطوة أولى داعمة لمواصلة التقدّم.",
  },
  paths: {
    foundations: {
      en: 'Foundations path', fr: 'Parcours Fondations', pt: 'Percurso de Fundamentos', es: 'Ruta de Fundamentos',
      ta: 'அடித்தளம் பாதை', uk: 'Базовий шлях', ar: 'مسار الأساسيات',
    },
    precision: {
      en: 'Precision path', fr: 'Parcours Précision', pt: 'Percurso de Precisão', es: 'Ruta de Precisión',
      ta: 'துல்லிய பாதை', uk: 'Точний шлях', ar: 'مسار الدقّة',
    },
  },
  steps: {
    foundations: ({ lang }) => [
      {
        title: { en: 'CV basics (10 min)', fr: 'Notions de CV (10 min)', pt: 'Fundamentos do CV (10 min)', es: 'CV básico (10 min)', ta: 'CV அடிப்படை (10 நிமி)', uk: 'Основи резюме (10 хв)', ar: 'أساسيات السيرة الذاتية (10 دقائق)' }[lang],
        why:   { en: 'A clear summary unlocks applications.', fr: 'Un résumé clair débloque vos candidatures.', pt: 'Um resumo claro abre portas.', es: 'Un resumen claro abre candidaturas.', ta: 'தெளிவான சுருக்கம் விண்ணப்பங்களுக்கு உதவும்.', uk: 'Чітке резюме відкриває можливості.', ar: 'الملخص الواضح يفتح باب التقديم.' }[lang],
        next:  { en: 'Write 2–3 lines with our guide.', fr: 'Rédigez 2–3 lignes avec notre guide.', pt: 'Escreva 2–3 linhas com o nosso guia.', es: 'Escribe 2–3 líneas con nuestra guía.', ta: 'எங்கள் வழிகாட்டியுடன் 2–3 வரிகள் எழுதவும்.', uk: 'Напишіть 2–3 рядки за нашим гайдом.', ar: 'اكتب 2–3 أسطر باستخدام دليلنا.' }[lang],
      },
      {
        title: { en: '“Tell me about yourself” (5 min)', fr: '“Parlez‑moi de vous” (5 min)', pt: '“Fale sobre você” (5 min)', es: '“Háblame de ti” (5 min)', ta: '"உங்களைப் பற்றி சொல்லுங்கள்" (5 நிமி)', uk: '«Розкажіть про себе» (5 хв)', ar: '"حدّثني عن نفسك" (5 دقائق)' }[lang],
        why:   { en: 'Build interview confidence fast.', fr: 'Renforcez vite votre confiance en entretien.', pt: 'Ganha confiança rápida para entrevista.', es: 'Gana confianza rápida para la entrevista.', ta: 'நேர்காணல் நம்பிக்கை வளரும்.', uk: 'Швидко підвищує впевненість на співбесіді.', ar: 'يرفع ثقتك سريعًا في المقابلة.' }[lang],
        next:  { en: 'Use the 3‑step template and record once.', fr: 'Modèle en 3 étapes, faites un essai.', pt: 'Use o modelo em 3 passos e grave 1 vez.', es: 'Usa el modelo de 3 pasos y graba una vez.', ta: '3 படி வார்ப்புருவைப் பயன்படுத்தி ஒரு முறை பதிவு செய்க.', uk: 'Скористайтесь 3‑кроковим шаблоном і зробіть запис.', ar: 'استخدم نموذج 3 خطوات وسجّل مرة واحدة.' }[lang],
      },
      {
        title: { en: 'Join an online meeting (5 min)', fr: 'Rejoindre une réunion en ligne (5 min)', pt: 'Entrar numa reunião online (5 min)', es: 'Unirte a una reunión online (5 min)', ta: 'ஆன்லைன் கூட்டத்தில் சேர (5 நிமி)', uk: 'Долучіться до онлайн‑зустрічі (5 хв)', ar: 'الانضمام لاجتماع عبر الإنترنت (5 دقائق)' }[lang],
        why:   { en: 'Real‑world practice builds momentum.', fr: 'La pratique concrète crée l’élan.', pt: 'Prática real cria impulso.', es: 'La práctica real crea impulso.', ta: 'நடைமுறை முயற்சி முன்னேற்றம் தரும்.', uk: 'Практика дає імпульс.', ar: 'الممارسة الواقعية تصنع زخمًا.' }[lang],
        next:  { en: 'Do a sound check practice.', fr: 'Faites un test audio.', pt: 'Faça um teste de áudio.', es: 'Haz una prueba de audio.', ta: 'ஒலி சோதனையை முயற்சிக்கவும்.', uk: 'Зробіть перевірку звуку.', ar: 'أجرِ فحصًا للصوت.' }[lang],
      },
    ],
    precision: ({ lang }) => [
      {
        title: { en: 'ATS CV tune (10 min)', fr: 'Ajuster le CV pour ATS (10 min)', pt: 'Ajuste ATS do CV (10 min)', es: 'Ajuste ATS del CV (10 min)', ta: 'ATS CV திருத்தம் (10 நிமி)', uk: 'Налаштування резюме під ATS (10 хв)', ar: 'ملاءمة السيرة الذاتية لنظام ATS (10 دقائق)' }[lang],
        why:   { en: 'Align bullets to target role.', fr: 'Alignez vos points au rôle visé.', pt: 'Alinhe bullets ao cargo‑alvo.', es: 'Alinea bullets al rol objetivo.', ta: 'இலக்கு பணிக்கு புள்ளிகளை ஒத்திசைக்கவும்.', uk: 'Вирівняйте bullets під роль.', ar: 'وافق النقاط مع الدور المستهدف.' }[lang],
        next:  { en: 'Update top 5 bullets.', fr: 'Mettez à jour 5 points clés.', pt: 'Atualize os 5 bullets principais.', es: 'Actualiza los 5 bullets principales.', ta: 'முன்னணி 5 புள்ளிகளைப் புதுப்பிக்கவும்.', uk: 'Оновіть 5 основних пунктів.', ar: 'حدّث أفضل 5 نقاط.' }[lang],
      },
      {
        title: { en: 'Targeted job search (15 min)', fr: 'Recherche ciblée (15 min)', pt: 'Busca direcionada (15 min)', es: 'Búsqueda dirigida (15 min)', ta: 'இலக்கு வேலை தேடல் (15 நிமி)', uk: 'Таргетований пошук роботи (15 хв)', ar: 'بحث وظيفي موجّه (15 دقيقة)' }[lang],
        why:   { en: 'Focus boosts response rates.', fr: 'Le ciblage augmente les réponses.', pt: 'Foco aumenta respostas.', es: 'El enfoque aumenta respuestas.', ta: 'கவனம் பதில் விகிதத்தை உயர்த்தும்.', uk: 'Фокус підвищує відгуки.', ar: 'التركيز يرفع معدلات الاستجابة.' }[lang],
        next:  { en: 'Pick 3 titles × 5 companies; save tracker.', fr: '3 intitulés × 5 entreprises; enregistrez.', pt: '3 cargos × 5 empresas; salve o tracker.', es: '3 puestos × 5 empresas; guarda en el tracker.', ta: '3 பதவிகள் × 5 நிறுவனங்கள்; பதிவேடு சேமிக்கவும்.', uk: '3 назви × 5 компаній; збережіть у трекері.', ar: '3 مسميات × 5 شركات؛ احفظ في المتعقّب.' }[lang],
      },
      {
        title: { en: 'Interview story bank (10 min)', fr: 'Banque d’histoires d’entretien (10 min)', pt: 'Banco de histórias (10 min)', es: 'Banco de historias (10 min)', ta: 'நேர்காணல் கதைகள் (10 நிமி)', uk: 'Банк історій (10 хв)', ar: 'بنك القصص للمقابلة (10 دقائق)' }[lang],
        why:   { en: 'STAR examples convert interviews.', fr: 'Les exemples STAR font la différence.', pt: 'Exemplos STAR convertem entrevistas.', es: 'Ejemplos STAR convierten entrevistas.', ta: 'STAR உதாரணங்கள் மாற்றத்தை தரும்.', uk: 'Приклади STAR працюють.', ar: 'أمثلة STAR تحوّل المقابلات.' }[lang],
        next:  { en: 'Write 3 concise STARs with outcomes.', fr: 'Rédigez 3 STAR concis avec résultats.', pt: 'Escreva 3 STAR concisos com resultados.', es: 'Escribe 3 STAR concisos con resultados.', ta: 'விளைவுகளுடன் 3 சுருக்கமான STAR எழுதவும்.', uk: 'Напишіть 3 стислих STAR з результатами.', ar: 'اكتب 3 أمثلة STAR موجزة بالنتائج.' }[lang],
      },
    ],
  },
};

const reflectionI18n = {
  en: 'Small steps build momentum — your next short activity is ready.',
  fr: 'Les petits pas créent l’élan — votre prochaine activité courte est prête.',
  pt: 'Pequenos passos criam impulso — sua próxima atividade curta está pronta.',
  es: 'Los pequeños pasos crean impulso — tu próxima actividad corta está lista.',
  ta: 'சிறு படிகள் முன்னேற்றம் தரும் — உங்கள் அடுத்த குறும் செயல்பாடு தயார்.',
  uk: 'Малі кроки створюють імпульс — ваша наступна коротка активність готова.',
  ar: 'الخطوات الصغيرة تصنع زخمًا — نشاطك القصير التالي جاهز.',
};

// ---------------- Supabase lookups with graceful fallbacks ----------------
async function fetchCategoryMeans(assessmentId) {
  try {
