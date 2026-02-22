// app/api/assessment/result/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';

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

// ---------------- i18n (Option‑3 tone) ----------------
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

// ---------------- Keyword & Title translation (API-side, Option A) ----------------
const KEYWORD_I18N = {
  es: {
    'keywords': 'Palabras clave',
    'customer service': 'Atención al cliente',
    'complaints': 'Quejas',
    'crm': 'CRM',
    'excel': 'Excel',
    'filing': 'Archivo',
    'data entry': 'Entrada de datos',
    'picking & packing': 'Preparación de pedidos',
    'picking': 'Preparación de pedidos',
    'packing': 'Empaquetado',
    'h&s': 'Salud y Seguridad',
    'health & safety': 'Salud y Seguridad',
    'food hygiene': 'Higiene alimentaria',
    'rms': 'sistema de gestión de inventario',
    'picking list': 'lista de preparación',
    'packing list': 'lista de empaquetado',
    'warehouse operations': 'operaciones de almacén',
  },
  ar: {
    'keywords': 'الكلمات المفتاحية',
    'customer service': 'خدمة العملاء',
    'complaints': 'الشكاوى',
    'crm': 'نظام إدارة علاقات العملاء (CRM)',
    'excel': 'إكسل',
    'filing': 'الأرشفة',
    'data entry': 'إدخال البيانات',
    'picking & packing': 'الفرز والتعبئة',
    'picking': 'الفرز',
    'packing': 'التعبئة',
    'h&s': 'الصحة والسلامة',
    'health & safety': 'الصحة والسلامة',
    'food hygiene': 'النظافة الغذائية',
'rms': 'نظام إدارة المخزون',
'picking list': 'قائمة الالتقاط',
'packing list': 'قائمة التعبئة',
'warehouse operations': 'عمليات المستودع',    
  },
  fr: { 'keywords': 'Mots‑clés' },
  pt: { 'keywords': 'Palavras‑chave' },
  ta: { 'keywords': 'முக்கிய சொற்கள்' },
  uk: { 'keywords': 'Ключові слова' },
  en: {},
};

const TITLE_I18N = {
  es: {
    'Customer Service Advisor': 'Asesor de Atención al Cliente',
    'Admin Assistant': 'Asistente administrativo',
    'Warehouse Operative': 'Operario de almacén',
  },
  ar: {
    'Customer Service Advisor': 'ممثل خدمة العملاء',
    'Admin Assistant': 'مساعد إداري',
    'Warehouse Operative': 'عامل مستودع',
  },
};

function translateTerm(term = '', lang = 'en') {
  const map = KEYWORD_I18N[lang] || {};
  const t = String(term || '').trim();
  const key = t.toLowerCase();
  return map[key] || t; // fallback to original term
}
function translateTitle(title = '', lang = 'en') {
  const map = TITLE_I18N[lang] || {};
  return map[title] || title;
}

function localizeRoleSuggestions(rs, lang) {
  if (!rs) return rs;
  const out = { ...rs };
  const translateList = (arr) => (Array.isArray(arr) ? arr.map((x) => translateTerm(x, lang)) : arr);

  ['readyNow', 'bridgeRoles'].forEach((bucket) => {
    if (!Array.isArray(out[bucket])) return;
    out[bucket] = out[bucket].map((item) => {
      const copy = { ...item, title: translateTitle(item.title, lang) };
      if (Array.isArray(copy.gaps)) {
        copy.gaps = copy.gaps.map((g) => {
          if (g?.type === 'keywords') return { ...g, key: translateList(g.key) };
          if (g?.type === 'certificate') return { ...g, key: translateList(g.key) };
          return g;
        });
      }
      return copy;
    });
  });
  return out;
}

// ---------------- Supabase lookups with graceful fallbacks ----------------
async function fetchCategoryMeans(assessmentId) {
  try {
    const { data, error } = await supabase
      .from('assessment_answers')
      .select('category, value')
      .eq('assessment_id', assessmentId);

    if (error || !Array.isArray(data) || data.length === 0) {
      return [
        { key: 'cv',        avg: 2.8 },
        { key: 'interview', avg: 3.1 },
        { key: 'jobsearch', avg: 2.9 },
        { key: 'digital',   avg: 3.2 },
      ];
    }

    const buckets = new Map(); // key -> {sum,count}
    for (const row of data) {
      const k = (row.category || 'general').toLowerCase();
      if (!buckets.has(k)) buckets.set(k, { sum: 0, count: 0 });
      const b = buckets.get(k);
      b.sum += Number(row.value || 0);
      b.count += 1;
    }
    const keys = ['cv', 'interview', 'jobsearch', 'digital'];
    return keys.map((k) => {
      const b = buckets.get(k);
      const avg = b && b.count ? b.sum / b.count : 0;
      return { key: k, avg: Number(avg.toFixed(2)) };
    });
  } catch {
    return [
      { key: 'cv',        avg: 2.8 },
      { key: 'interview', avg: 3.1 },
      { key: 'jobsearch', avg: 2.9 },
      { key: 'digital',   avg: 3.2 },
    ];
  }
}

async function fetchActivitiesPercent(userId) {
  if (!userId) return 0;
  try {
    const { data, error } = await supabase
      .from('activity_completions')
      .select('activity_id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) return 0;
    const completed = data === null ? 0 : (data.length || 0); // head:true → length is 0
    const target = 5;
    return Math.max(0, Math.min(100, Math.round((completed / target) * 100)));
  } catch {
    return 0;
  }
}

async function fetchCvPercent(userId) {
  if (!userId) return 0;
  try {
    const { data, error } = await supabase
      .from('cv_versions')
      .select('score_ai, delta_from_prev')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (error || !data || !data[0]) return 0;
    const { score_ai = 0, delta_from_prev = 0 } = data[0];
    if (delta_from_prev >= 20 || score_ai >= 75) return 100;
    return Math.max(0, Math.min(100, Math.round(Math.max(delta_from_prev * 5, score_ai))));
  } catch {
    return 0;
  }
}

async function fetchInterviewPercent(userId) {
  if (!userId) return 0;
  try {
    const { data, error } = await supabase
      .from('interview_sessions')
      .select('score_24')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(1);

    if (error || !data || !data[0]) return 0;
    const score = Number(data[0].score_24 || 0);
    return Math.max(0, Math.min(100, Math.round((score / 18) * 100)));
  } catch {
    return 0;
  }
}

async function fetchRoleProfiles() {
  try {
    const { data, error } = await supabase.from('role_profiles').select('*');
    if (error || !Array.isArray(data)) return [];
    return data;
  } catch {
    return [];
  }
}

function meetLevel(levelCode, minOverallLevel) {
  const rank = { L1: 1, L2: 2, L3: 3, L4: 4 };
  const need = rank[minOverallLevel || 'L1'] || 1;
  const got  = rank[levelCode || 'L1'] || 1;
  return got >= need;
}

function buildRoleSuggestions({ profiles, levelCode, interviewPct, certificates = [] }) {
  if (!profiles?.length) return { readyNow: [], bridgeRoles: [], gaps: [], actions: [] };

  const readyNow = [];
  const bridgeRoles = [];

  const certProviders = new Set(
    (certificates || [])
      .filter((c) => c.verified)
      .map((c) => (c.provider || '').toLowerCase())
  );

  for (const p of profiles) {
    const needsLevel = p.min_overall_level || 'L1';
    const meetsLevel = meetLevel(levelCode, needsLevel);

    const meetsInterview = p.min_interview_score
      ? interviewPct >= Math.min(100, Math.round((p.min_interview_score / 18) * 100))
      : true;

    const requiresCert = !!p.requires_certificate;
    const hasPreferredCert = p.preferred_cert_providers?.some((prov) =>
      certProviders.has((prov || '').toLowerCase())
    );

    const gaps = [];

    if (!meetsLevel) gaps.push({ type: 'level', key: needsLevel, why: 'Increase overall level' });
    if (!meetsInterview) gaps.push({ type: 'interview', key: p.min_interview_score || 0, why: 'Build interview score' });

    if (Array.isArray(p.must_have_keywords) && p.must_have_keywords.length) {
      gaps.push({ type: 'keywords', key: p.must_have_keywords, why: 'Add role keywords to CV bullets' });
    }

    if (requiresCert && !hasPreferredCert) {
      gaps.push({ type: 'certificate', key: p.preferred_cert_providers || [], why: 'Upload/earn certificate' });
    }

    if (gaps.length === 0) {
      readyNow.push({ title: p.title, match: 86, why: 'Meets current baselines' });
    } else if (gaps.length <= 2) {
      bridgeRoles.push({ title: p.title, why: 'One or two fast gaps to close', gaps });
    }
  }

  const actions = [
    { title: 'ATS CV tune (10 min)', activityId: 'cv-ats-1' },
    { title: 'Create 3 STAR stories', activityId: 'int-star-1' },
  ];

  return { readyNow, bridgeRoles, gaps: [], actions };
}

// ---------------- Route ----------------
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get('assessment_id') || searchParams.get('assessmentId') || 'demo';
    const lang = (searchParams.get('language') || searchParams.get('lang') || 'en').toLowerCase();
    const userId = searchParams.get('user_id') || null;

    // 1) Category means
    const byCategory = await fetchCategoryMeans(assessmentId);
    const overall = byCategory.reduce((a, c) => a + c.avg, 0) / (byCategory.length || 1);

    // 2) Level & Path
    const lvl = levelFromMeans(overall);
    const path = decidePath({ overall, byCat: byCategory });

    // 3) Progress components
    const [activitiesPct, cvPct, interviewPct] = await Promise.all([
      fetchActivitiesPercent(userId),
      fetchCvPercent(userId),
      fetchInterviewPercent(userId),
    ]);
    const progress = computeProgress({
      levelCode: lvl.code,
      activities: activitiesPct,
      cv: cvPct,
      interview: interviewPct,
    });

    // 4) Flight‑path steps (localized) — CORRECT CALL
    const steps = i18n.steps[path]({ lang }).map((s) => ({
      title: s.title,
      why: s.why,
      next: s.next,
    }));

    // 5) Summary & reflection
    const summary = {
      headline: i18n.headline[lang] || i18n.headline.en,
      message: i18n.message[lang] || i18n.message.en,
    };
    const reflection = reflectionI18n[lang] || reflectionI18n.en;

    // 6) Role suggestions (then localize keywords/titles)
    const profiles = await fetchRoleProfiles();

    let certificates = [];
    if (userId) {
      try {
        const { data } = await supabase
          .from('portfolio_items')
          .select('provider, verified')
          .eq('user_id', userId);
        certificates = Array.isArray(data) ? data : [];
      } catch {}
    }

    const roleSuggestionsRaw = buildRoleSuggestions({
      profiles,
      levelCode: lvl.code,
      interviewPct,
      certificates,
    });
    const roleSuggestions = localizeRoleSuggestions(roleSuggestionsRaw, lang);

    // 7) Respond
    return NextResponse.json({
      assessmentId,
      language: lang,
      levels: { overall: lvl, byCategory },
      path,
      summary,
      reflection,
      flightPath: steps,
      progress,
      roleSuggestions,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
