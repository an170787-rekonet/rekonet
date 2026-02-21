// app/api/_lib/questions.js

const CATEGORIES = [
  { key: 'cv',        name_en: 'CV',         name_fr: 'CV',                 name_ar: 'السيرة الذاتية' },
  { key: 'interview', name_en: 'Interview',  name_fr: 'Entretien',          name_ar: 'المقابلة' },
  { key: 'skills',    name_en: 'Skills',     name_fr: 'Compétences',        name_ar: 'المهارات' },
  { key: 'jobsearch', name_en: 'Job Search', name_fr: 'Recherche d’emploi', name_ar: 'البحث عن عمل' },
];

const T = {
  en: {
    scale: ['Not yet', 'Rarely', 'Sometimes', 'Often', 'Always'],
    intro: 'We’ll use your responses to suggest a starting point and a first flight‑path. There are no right or wrong answers.',
  },
  fr: {
    scale: ['Pas encore', 'Rarement', 'Parfois', 'Souvent', 'Toujours'],
    intro: 'Nous utiliserons vos réponses pour proposer un point de départ et une première trajectoire. Il n’y a pas de bonnes ou de mauvaises réponses.',
  },
  ar: {
    scale: ['ليس بعد', 'نادرًا', 'أحيانًا', 'غالبًا', 'دائمًا'],
    intro: 'سنستعين بإجاباتك لاقتراح نقطة بداية ومسار دعم أول. لا توجد إجابات صحيحة أو خاطئة.',
  },
};

const QUESTIONS = [
  // CV
  { id: 'cv-1',  category: 'cv',        en: 'My CV highlights the roles and achievements I’m most proud of.', fr: 'Mon CV met en valeur les rôles et les réalisations dont je suis le plus fier/fière.', ar: 'سيرتي الذاتية تُبرز الأدوار والإنجازات التي أفتخر بها.' },
  { id: 'cv-2',  category: 'cv',        en: 'I can tailor my CV to a specific job in under 15 minutes.',     fr: 'Je peux adapter mon CV à une offre précise en moins de 15 minutes.',           ar: 'أستطيع تكييف سيرتي الذاتية لوظيفة محددة خلال 15 دقيقة.' },

  // Interview
  { id: 'int-1', category: 'interview', en: 'I can answer “Tell me about yourself” in about 60 seconds.',    fr: 'Je peux répondre à « Parlez-moi de vous » en environ 60 secondes.',            ar: 'أستطيع الإجابة عن “حدّثني عن نفسك” خلال 60 ثانية تقريبًا.' },
  { id: 'int-2', category: 'interview', en: 'I have one STAR story ready for a time I solved a problem.',    fr: 'J’ai une histoire STAR prête sur un problème que j’ai résolu.',                ar: 'لدي قصة بطريقة STAR جاهزة عن موقف حللت فيه مشكلة.' },

  // Skills
  { id: 'sk-1',  category: 'skills',    en: 'I can name three strengths that match roles I’m interested in.',fr: 'Je peux citer trois atouts en lien avec les postes qui m’intéressent.',        ar: 'أستطيع تسمية ثلاث نقاط قوة تتوافق مع الوظائف التي أبحث عنها.' },
  { id: 'sk-2',  category: 'skills',    en: 'I keep a simple list of examples that show those strengths.',   fr: 'Je garde une liste simple d’exemples qui démontrent ces atouts.',              ar: 'أحتفظ بقائمة بسيطة من الأمثلة التي تُبرز هذه النقاط.' },

  // Job Search
  { id: 'js-1',  category: 'jobsearch', en: 'I know where to find roles I’m interested in.',                 fr: 'Je sais où trouver des offres qui m’intéressent.',                             ar: 'أعرف أين أجد وظائف تناسب اهتمامي.' },
  { id: 'js-2',  category: 'jobsearch', en: 'I have a routine for checking new roles each week.',            fr: 'J’ai une routine pour vérifier les nouvelles offres chaque semaine.',           ar: 'لدي روتين أسبوعي للبحث عن الفرص الجديدة.' },
];

export function getCategories(language = 'en') {
  return CATEGORIES.map(c => {
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
  return QUESTIONS.map(q => ({
    id: q.id,
    category: q.category,
    text_en: q.en,
    text_local:
      language === 'fr' ? q.fr :
      language === 'ar' ? q.ar :
      q.en,
  }));
}
