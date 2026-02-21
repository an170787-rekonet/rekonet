// app/api/_lib/questions.js

// Category names (localized)
const CATEGORIES = [
  { key: 'cv',        name_en: 'CV',         name_fr: 'CV',                 name_ar: 'السيرة الذاتية' },
  { key: 'interview', name_en: 'Interview',  name_fr: 'Entretien',          name_ar: 'المقابلة' },
  { key: 'skills',    name_en: 'Skills',     name_fr: 'Compétences',        name_ar: 'المهارات' },
  { key: 'jobsearch', name_en: 'Job Search', name_fr: 'Recherche d’emploi', name_ar: 'البحث عن عمل' },
];

// Intro + scale (localized)
const T = {
  en: {
    scale: ['Not yet', 'Rarely', 'Sometimes', 'Often', 'Always'],
    intro: 'There are no right or wrong answers here. Your responses help us suggest a starting point and a short flight‑path you can try next.',
  },
  fr: {
    scale: ['Pas encore', 'Rarement', 'Parfois', 'Souvent', 'Toujours'],
    intro: 'Il n’y a pas de bonnes ou mauvaises réponses. Vos réponses nous aident à proposer un point de départ et une courte trajectoire à essayer.',
  },
  ar: {
    scale: ['ليس بعد', 'نادرًا', 'أحيانًا', 'غالبًا', 'دائمًا'],
    intro: 'لا توجد إجابات صحيحة أو خاطئة. تساعدنا إجاباتك في اقتراح نقطة بداية ومسار دعم قصير يمكنك تجربته.',
  },
};

// Questions (EN + localized). Keep ASCII quotes for JS safety.
const QUESTIONS = [
  // CV
  {
    id: 'cv-1',
    category: 'cv',
    en: 'My CV highlights the roles and achievements I’m most proud of.',
    fr: 'Mon CV met en valeur les rôles et les réalisations dont je suis le plus fier/fière.',
    ar: 'سيرتي الذاتية تُبرز الأدوار والإنجازات التي أفتخر بها.',
  },
  {
    id: 'cv-2',
    category: 'cv',
    en: 'I can tailor my CV to a specific job in under 15 minutes.',
    fr: 'Je peux adapter mon CV à une offre précise en moins de 15 minutes.',
    ar: 'أستطيع تكييف سيرتي الذاتية لوظيفة محددة خلال 15 دقيقة.',
  },

  // Interview
  {
    id: 'int-1',
    category: 'interview',
    en: 'I can answer "Tell me about yourself" in about 60 seconds.',
    fr: 'Je peux répondre à « Parlez-moi de vous » en environ 60 secondes.',
    ar: 'أستطيع الإجابة عن "حدّثني عن نفسك" خلال 60 ثانية تقريبًا.',
  },
  {
    id: 'int-2',
    category: 'interview',
    en: 'I have one short example ready about a time I solved a problem.',
    fr: 'J’ai un court exemple prêt sur un moment où j’ai résolu un problème.',
    ar: 'لدي مثال قصير جاهز عن موقف حللت فيه مشكلة.',
  },

  // Skills
  {
    id: 'sk-1',
    category: 'skills',
    en: 'I know a few strengths I can talk about for roles I like.',
    fr: 'Je connais quelques atouts dont je peux parler pour les postes qui me plaisent.',
    ar: 'أعرف بعض نقاط القوة التي يمكنني الحديث عنها للوظائف التي تعجبني.',
  },
  {
    id: 'sk-2',
    category: 'skills',
    en: 'I have a few examples that show my strengths.',
    fr: 'J’ai quelques exemples qui montrent mes atouts.',
    ar: 'لدي بعض الأمثلة التي تُظهر نقاط قوتي.',
  },

  // Job Search
  {
    id: 'js-1',
    category: 'jobsearch',
    en: 'I know where to find roles I’m interested in.',
    fr: 'Je sais où trouver des offres qui m’intéressent.',
    ar: 'أعرف أين أجد وظائف تناسب اهتمامي.',
  },
  {
    id: 'js-2',
    category: 'jobsearch',
    en: 'I check for new roles when I can, even if it’s not every week.',
    fr: 'Je regarde les nouvelles offres quand je peux, même si ce n’est pas chaque semaine.',
    ar: 'أبحث عن فرص عمل جديدة عندما أستطيع، حتى لو لم يكن ذلك كل أسبوع.',
  },
];

// Public helpers
export function getCategories(language = 'en') {
  return CATEGORIES.map((c) => {
    const name =
      language === 'fr' ? c.name_fr :
      language === 'ar' ? c.name_ar :
      c.name_en;
    return { key: c.key, name };
  });
}

export function getScale(language = 'en') {
  return T[language]?.scale || T.en.scale;
}

export function getIntro(language = 'en') {
  return T[language]?.intro || T.en.intro;
}

export function getQuestions(language = 'en') {
  return QUESTIONS.map((q) => ({
    id: q.id,
    category: q.category,
    text_en: q.en,
    text_local:
      language === 'fr' ? q.fr :
      language === 'ar' ? q.ar :
      q.en,
  }));
}
