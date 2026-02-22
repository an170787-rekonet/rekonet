// app/api/assessment/result/route.js
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

/**
 * Supabase client import (ROOT /lib)
 * Your repo tree shows: lib/supabaseClient.js
 * Import the module namespace and normalize to `supabase`
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
