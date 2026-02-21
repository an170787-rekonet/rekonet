function completionMessage(language = 'en') {
  const M = {
    en: {
      headline: 'Well done — you’ve completed your first check‑in!',
      body: 'You’ve taken a positive first step today. These questions don’t have right or wrong answers — they simply help us understand where you are right now. Your responses give a clear starting point and a short flight‑path to help you move forward with confidence.',
    },
    fr: {
      headline: 'Bravo — vous avez terminé votre premier point d’étape !',
      body: 'Vous avez fait un premier pas positif aujourd’hui. Il n’y a pas de bonnes ou mauvaises réponses — ces questions nous aident simplement à comprendre où vous en êtes. Vos réponses nous donnent un point de départ clair et une courte trajectoire pour avancer en confiance.',
    },
    ar: {
      headline: 'أحسنت — لقد أكملت أول فحص لك!',
      body: 'لقد خطوت خطوة إيجابية اليوم. لا توجد إجابات صحيحة أو خاطئة — فهذه الأسئلة تساعدنا فقط على فهم مكانك الآن. إجاباتك تعطينا نقطة بداية واضحة ومسار دعم قصير لمساعدتك على التقدّم بثقة.',
    },
  };
  return M[language] || M.en;
}
