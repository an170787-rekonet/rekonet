// app/api/assessment/questions/route.js
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    // Accept both snake_case and camelCase just in case
    const assessmentId =
      searchParams.get('assessment_id') ||
      searchParams.get('assessmentId') ||
      'demo';
    const lang = (searchParams.get('language') || searchParams.get('lang') || 'en').toLowerCase();

    // ---------- BEGIN: Localized copy (Option 3 tone) ----------

    // Localized scale — balanced tone
    const scaleMap = {
      en: ['Not yet', 'A little', 'Sometimes', 'Often', 'Always'],
      fr: ['Pas encore', 'Un peu', 'Parfois', 'Souvent', 'Toujours'],
      pt: ['Ainda não', 'Um pouco', 'Às vezes', 'Muitas vezes', 'Sempre'],
      es: ['Aún no', 'Un poco', 'A veces', 'A menudo', 'Siempre'],
      ta: ['இன்னும் இல்லை', 'கொஞ்சம்', 'சில நேரங்களில்', 'அடிக்கடி', 'எப்போதும்'],
      uk: ['Ще ні', 'Трохи', 'Іноді', 'Часто', 'Завжди'],
      ar: ['ليس بعد', 'قليلًا', 'أحيانًا', 'غالبًا', 'دائمًا']
    };
    const scale = scaleMap[lang] || scaleMap.en;

    // Localized introduction — balanced, supportive, job‑ready
    const introMap = {
      en: "This isn’t a test — there are no right or wrong answers. We’re simply finding your best starting point so we can support your job‑ready journey.",
      fr: "Ce n’est pas un test — il n’y a pas de bonnes ou de mauvaises réponses. Nous cherchons simplement votre meilleur point de départ pour mieux vous accompagner vers l’emploi.",
      pt: "Isto não é um teste — não há respostas certas ou erradas. Vamos apenas identificar o seu melhor ponto de partida para apoiar a sua trajetória rumo ao emprego.",
      es: "Esto no es un examen — no hay respuestas correctas o incorrectas. Solo queremos encontrar tu mejor punto de partida para acompañarte en tu camino hacia el empleo.",
      ta: "இது ஒரு தேர்வு அல்ல — சரி/தவறு என்ற பதில்கள் இல்லை. உங்களுக்கு ஏற்ற சிறந்த தொடக்கப் புள்ளியை கண்டுபிடித்து, வேலைக்கான பயணத்தில் ஆதரிக்கவே நாங்கள் இருக்கிறோம்.",
      uk: "Це не тест — немає правильних чи неправильних відповідей. Ми лише визначаємо найкращу стартову точку, щоб підтримати ваш шлях до працевлаштування.",
      ar: "هذه ليست اختبارًا — لا توجد إجابات صحيحة أو خاطئة. نهدف فقط إلى تحديد أفضل نقطة بداية لك لدعم رحلتك نحو الجاهزية للعمل."
    };
    const intro = introMap[lang] || introMap.en;

    // Helper: return localized text for the current lang (fallback to English)
    function L(en, fr, pt, es, ta, uk, ar) {
      if (lang === 'fr') return fr;
      if (lang === 'pt') return pt;
      if (lang === 'es') return es;
      if (lang === 'ta') return ta;
      if (lang === 'uk') return uk;
      if (lang === 'ar') return ar;
      return en; // default: English
    }

    // ---------------- 8 QUESTIONS: 2 PER AREA (flat list; IDs stable) ----------------
    // Categories: cv, interview, jobsearch, digital
    // Tone: balanced (friendly + professional), supportive, no exam vibe
    const demoCategories = [
      // CV (2)
      {
        id: 'cv-1',
        category: 'cv',
        text_en: 'How comfortable do you feel writing a short, simple CV summary about yourself?',
        text_local: L(
          'How comfortable do you feel writing a short, simple CV summary about yourself?',
          'À quel point vous sentez‑vous à l’aise pour rédiger un court résumé de CV simple à votre sujet ?',
          'Quão confortável você se sente ao escrever um resumo curto e simples do seu CV sobre você?',
          '¿Qué tan cómodo/a te sientes al escribir un resumen breve y sencillo de tu CV sobre ti?',
          'உங்களைப் பற்றி குறுகிய, எளிய CV சுருக்கத்தை எழுதுவதில் நீங்கள் எவ்வளவு வசதியாக உணர்கிறீர்கள்?',
          'Наскільки вам комфортно написати коротке, просте резюме для свого резюме про себе?',
          'ما مدى شعورك بالراحة عند كتابة ملخص سيرة ذاتية بسيط وقصير عن نفسك؟'
        )
      },
      {
        id: 'cv-2',
        category: 'cv',
        text_en: 'How confident do you feel listing 3–5 strengths or achievements clearly on your CV?',
        text_local: L(
          'How confident do you feel listing 3–5 strengths or achievements clearly on your CV?',
          'À quel point vous vous sentez confiant(e) для présenter clairement 3 à 5 points forts ou réalisations sur votre CV ?',
          'Quão confiante você se sente em listar claramente de 3 a 5 pontos fortes ou conquistas no seu CV?',
          '¿Qué tan seguro/a te sientes al enumerar claramente 3–5 fortalezas o logros en tu CV?',
          'உங்கள் CV‑யில் 3–5 பலங்களையோ அல்லது சாதனைகளையோ தெளிவாக எழுதுவதில் நீங்கள் எவ்வளவு நம்பிக்கையுடன் உள்ளீர்கள்?',
          'Наскільки ви впевнені, що зможете чітко вказати 3–5 сильних сторін або досягнень у своєму резюме?',
          'ما مدى ثقتك في إدراج 3–5 نقاط قوة أو إنجازات بشكل واضح في سيرتك الذاتية؟'
        )
      },

      // Interview (2)
      {
        id: 'int-1',
        category: 'interview',
        text_en: 'In a short conversation or interview, how confident do you feel talking about your last role or experience?',
        text_local: L(
          'In a short conversation or interview, how confident do you feel talking about your last role or experience?',
          'Lors d’une courte conversation ou d’un entretien, à quel point vous sentez‑vous confiant(e) pour parler de votre dernier poste ou de votre expérience ?',
          'Em uma conversa curta ou entrevista, quão confiante você se sente ao falar sobre seu último cargo ou experiência?',
          'En una conversación breve o entrevista, ¿qué tan seguro/a te sientes al hablar de tu último puesto o experiencia?',
          'சுருக்கமான உரையாடல் அல்லது நேர்காணலில், உங்கள் கடைசி பணியிட/அனுபவத்தைப் பற்றி பேசுவதில் நீங்கள் எவ்வளவு நம்பிக்கையுடன் உள்ளீர்கள்?',
          'У короткій розмові чи на співбесіді наскільки впевнено ви розповідаєте про свою останню посаду або досвід?',
          'في محادثة قصيرة أو مقابلة، ما مدى ثقتك في التحدّث عن آخر وظيفة أو خبرة لديك؟'
        )
      },
      {
        id: 'int-2',
        category: 'interview',
        text_en: 'How comfortable do you feel answering “Tell me about yourself” with a short, clear story?',
        text_local: L(
          'How comfortable do you feel answering “Tell me about yourself” with a short, clear story?',
          'À quel point vous vous sentez à l’aise pour répondre « Parlez‑moi de vous » avec une réponse courte et claire ?',
          'Quão confortável você se sente em responder “Fale sobre você” com uma resposta curta e clara?',
          '¿Qué tan cómodo/a te sientes al responder “Háblame de ti” con una historia breve y clara?',
          '“உங்களைப் பற்றி சொல்லுங்கள்” என்ற கேள்விக்கு, குறுகிய மற்றும் தெளிவான பதிலை வழங்குவதில் நீங்கள் எவ்வளவு வசதியாக உள்ளீர்கள்?',
          'Наскільки вам комфортно відповідати на «Розкажіть про себе» короткою та чіткою історією?',
          'ما مدى شعورك بالراحة عند الإجابة عن «حدّثني عن نفسك» بقصة قصيرة وواضحة؟'
        )
      },

      // Job search (2)
      {
        id: 'js-1',
        category: 'jobsearch',
        text_en: 'When you see a job online, how ready do you feel to apply?',
        text_local: L(
          'When you see a job online, how ready do you feel to apply?',
          'Quand vous voyez une offre en ligne, à quel point vous vous sentez prêt(e) à postuler ?',
          'Quando você vê uma vaga online, quão pronto(a) você se sente para se candidatar?',
          'Cuando ves una oferta en línea, ¿qué tan preparado/a te sientes para postular?',
          'ஆன்லைனில் வேலை அறிவிப்பு பார்க்கும் போது, விண்ணப்பிக்க நீங்கள் எவ்வளவு தயாராக உள்ளீர்கள்?',
          'Коли ви бачите вакансію онлайн, наскільки ви готові подати заявку?',
          'عندما ترى وظيفة عبر الإنترنت، إلى أي مدى تشعر بأنك مستعد للتقديم؟'
        )
      },
      {
        id: 'js-2',
        category: 'jobsearch',
        text_en: 'How confident are you tailoring your CV to match a specific job post?',
        text_local: L(
          'How confident are you tailoring your CV to match a specific job post?',
          'À quel point vous êtes confiant(e) pour adapter votre CV à une annonce précise ?',
          'Quão confiante você está em adaptar seu CV para corresponder a uma vaga específica?',
          '¿Qué tan seguro/a estás de adaptar tu CV para que encaje con una oferta específica?',
          'குறிப்பிட்ட வேலை அறிவிப்புக்கு ஏற்றவாறு உங்கள் CV‑யை மாற்றுவதில் நீங்கள் எவ்வளவு நம்பிக்கையுடன் உள்ளீர்கள்?',
          'Наскільки ви впевнені, що можете адаптувати своє резюме під конкретну вакансію?',
          'ما مدى ثقتك في تعديل سيرتك الذاتية لتناسب إعلان وظيفة محدّد؟'
        )
      },

      // Digital (2)
      {
        id: 'dig-1',
        category: 'digital',
        text_en: 'How comfortable do you feel joining an online meeting and making sure your sound works?',
        text_local: L(
          'How comfortable do you feel joining an online meeting and making sure your sound works?',
          'À quel point vous vous sentez à l’aise для rejoindre une réunion en ligne et vérifier que le son fonctionne ?',
          'Quão confortável você se sente ao entrar em uma reunião online e garantir que o áudio funcione?',
          '¿Qué tan cómodo/a te sientes al unirte a una reunión en línea y comprobar que el sonido funcione?',
          'ஆன்லைன் கூட்டத்தில் சேர்ந்து, ஒலி சரியாக வேலை செய்கிறது என்பதைச் சரிபார்ப்பதில் நீங்கள் எவ்வளவு வசதியாக உள்ளீர்கள்?',
          'Наскільки вам комфортно приєднатися до онлайн‑зустрічі та перевірити, що звук працює?',
          'ما مدى شعورك بالراحة عند الانضمام إلى اجتماع عبر الإنترنت والتأكد من أن الصوت يعمل؟'
        )
      },
      {
        id: 'dig-2',
        category: 'digital',
        text_en: 'How confident are you sending a short, clear email to a colleague or manager?',
        text_local: L(
          'How confident are you sending a short, clear email to a colleague or manager?',
          'À quel point vous êtes confiant(e) pour envoyer un e‑mail court et clair à un collègue ou à un responsable ?',
          'Quão confiante você está para enviar um e‑mail curto e claro a um colega ou gestor?',
          '¿Qué tan seguro/a estás de enviar un correo breve y claro a un colega o responsable?',
          'ஒரு சக பணியாளர் அல்லது மேலாளருக்கு குறுகிய, தெளிவான மின்னஞ்சல் அனுப்புவதில் நீங்கள் எவ்வளவு நம்பிக்கையுடன் உள்ளீர்கள்?',
          'Наскільки ви впевнені, що можете надіслати короткого й чіткого листа колезі чи керівнику?',
          'ما مدى ثقتك في إرسال بريد إلكتروني قصير وواضح إلى زميل أو مدير؟'
        )
      }
    ];
    // ---------- END: Localized copy ----------

    // ✅ Always return success for now so your page renders questions
    return NextResponse.json({
      ok: true,
      assessmentId,
      language: lang,
      categories: demoCategories,
      scale,
      intro
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}
