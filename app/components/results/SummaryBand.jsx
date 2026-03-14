'use client';
import React from 'react';

/**
 * SummaryBand — affirming progress banner with multilingual copy.
 * Languages: en, ar (RTL), es, fr, de, pt, it, pl, ru, hi, bn, ur (RTL), zh, ja, ko.
 * Add more by extending COPY below.
 */
const COPY = {
  en: {
    badge: (level) => `Level ${level}`,
    title: "You’re doing brilliantly",
    progress: (n) => `Well done — you’ve already covered ${n}% of the work. You’ve done so well.`,
    body:
      "All we have to do now to best align your strengths with the role requirements is complete one or two simple steps below. You’ve already come so far — you’re on exactly the right track.",
    cta: "View your suggested pathway",
  },

  ar: {
    badge: (level) => `المستوى ${level}`,
    title: "أحسنت! أنت تتقدم بشكل رائع",
    progress: (n) => `أحسنت — لقد أنجزت ${n}% من العمل. أداء ممتاز.`,
    body:
      "كل ما نحتاجه الآن لمواءمة نقاط قوتك مع متطلبات الدور هو إكمال خطوة أو خطوتين بسيطتين أدناه. لقد قطعت شوطًا كبيرًا — أنت على الطريق الصحيح.",
    cta: "شاهد مسارك المقترح",
  },

  es: {
    badge: (level) => `Nivel ${level}`,
    title: "¡Vas muy bien!",
    progress: (n) => `Muy bien — ya has cubierto el ${n}% del camino. Excelente.`,
    body:
      "Ahora solo necesitamos completar uno o dos pasos sencillos para alinear tus fortalezas con los requisitos del puesto. Ya has avanzado mucho — vas por el camino correcto.",
    cta: "Ver tu ruta sugerida",
  },

  fr: {
    badge: (level) => `Niveau ${level}`,
    title: "Tu avances très bien",
    progress: (n) => `Bravo — tu as déjà réalisé ${n}% du parcours. Excellent.`,
    body:
      "Il ne reste plus qu’une ou deux petites étapes pour aligner tes atouts sur les exigences du poste. Tu as déjà beaucoup progressé — tu es sur la bonne voie.",
    cta: "Voir ton parcours suggéré",
  },

  de: {
    badge: (level) => `Niveau ${level}`,
    title: "Du machst das großartig",
    progress: (n) => `Sehr gut — du hast bereits ${n}% der Arbeit geschafft. Tolle Leistung.`,
    body:
      "Jetzt brauchst du nur noch ein bis zwei einfache Schritte unten, damit deine Stärken noch besser zu den Anforderungen der Rolle passen. Du bist schon weit gekommen — du bist auf dem richtigen Weg.",
    cta: "Zeige deinen empfohlenen Weg",
  },

  pt: {
    badge: (level) => `Nível ${level}`,
    title: "Você está indo muito bem",
    progress: (n) => `Muito bem — você já concluiu ${n}% do caminho. Excelente trabalho.`,
    body:
      "Agora basta concluir um ou dois passos simples abaixo para alinhar ainda mais seus pontos fortes aos requisitos da vaga. Você já avançou bastante — está no caminho certo.",
    cta: "Ver caminho sugerido",
  },

  it: {
    badge: (level) => `Livello ${level}`,
    title: "Stai andando benissimo",
    progress: (n) => `Ottimo — hai già coperto il ${n}% del percorso. Bel lavoro.`,
    body:
      "Ora bastano uno o due semplici passaggi qui sotto per allineare ancora meglio i tuoi punti di forza ai requisiti del ruolo. Hai già fatto molta strada — sei sulla strada giusta.",
    cta: "Vedi percorso suggerito",
  },

  pl: {
    badge: (level) => `Poziom ${level}`,
    title: "Świetnie sobie radzisz",
    progress: (n) => `Brawo — masz już ${n}% pracy za sobą. Doskonała robota.`,
    body:
      "Teraz wystarczy jeden lub dwa proste kroki poniżej, by jeszcze lepiej dopasować twoje mocne strony do wymagań stanowiska. Zaszłaś/Zaszłeś już daleko — jesteś na dobrej drodze.",
    cta: "Zobacz sugerowaną ścieżkę",
  },

  ru: {
    badge: (level) => `Уровень ${level}`,
    title: "Отличный прогресс",
    progress: (n) => `Отлично — вы уже прошли ${n}% пути. Прекрасная работа.`,
    body:
      "Теперь осталось выполнить один‑два простых шага ниже, чтобы ещё лучше согласовать ваши сильные стороны с требованиями роли. Вы уже проделали большой путь — вы на верном направлении.",
    cta: "Посмотреть рекомендуемый маршрут",
  },

  // ---------- NEW ASIAN/RTL SET ----------

  hi: {
    badge: (level) => `स्तर ${level}`,
    title: "आप बहुत अच्छा कर रहे हैं",
    progress: (n) => `शानदार — आपने काम का ${n}% हिस्सा पहले ही पूरा कर लिया है। बहुत बढ़िया।`,
    body:
      "अब हमें बस नीचे दिए गए एक‑दो छोटे कदम पूरे करने हैं ताकि आपकी क्षमताएँ भूमिका की आवश्यकताओं से और अच्छी तरह मेल खाएँ। आप काफी आगे आ चुके हैं — आप सही रास्ते पर हैं।",
    cta: "अपना सुझाया हुआ मार्ग देखें",
  },

  bn: {
    badge: (level) => `স্তর ${level}`,
    title: "আপনি চমৎকার করছেন",
    progress: (n) => `দারুণ — আপনি কাজের ${n}% ইতিমধ্যেই সম্পন্ন করেছেন। খুব ভালো।`,
    body:
      "এখন আমাদের কেবল নিচের এক‑দুইটি সহজ ধাপ সম্পন্ন করতে হবে যাতে আপনার শক্তিগুলো ভূমিকার চাহিদার সঙ্গে আরও ভালোভাবে মিলে যায়। আপনি অনেকটা এগিয়ে গেছেন — আপনি ঠিক পথে আছেন।",
    cta: "আপনার প্রস্তাবিত পথ দেখুন",
  },

  ur: {
    badge: (level) => `سطح ${level}`,
    title: "آپ بہت اچھا کر رہے ہیں",
    progress: (n) => `خوب — آپ پہلے ہی کام کا ${n}% مکمل کر چکے ہیں۔ بہت عمدہ۔`,
    body:
      "اب ہمیں صرف نیچے دیے گئے ایک یا دو آسان مراحل مکمل کرنے ہیں تاکہ آپ کی طاقتیں کردار کی ضروریات کے ساتھ مزید بہتر طور پر ہم آہنگ ہو جائیں۔ آپ بہت آگے آ چکے ہیں — آپ درست راستے پر ہیں۔",
    cta: "اپنا تجویز کردہ راستہ دیکھیں",
  },

  zh: {
    badge: (level) => `等级 ${level}`,
    title: "你做得很棒",
    progress: (n) => `很好——你已经完成了 ${n}% 的进度。非常出色。`,
    body:
      "现在只需完成下面的一到两个简单步骤，就能让你的优势与岗位要求更加匹配。你已经走了很远——方向完全正确。",
    cta: "查看建议路径",
  },

  ja: {
    badge: (level) => `レベル ${level}`,
    title: "とても順調です",
    progress: (n) => `素晴らしいです — すでに ${n}% を進めました。よくできました。`,
    body:
      "この下の簡単なステップを1〜2件進めれば、あなたの強みが職務要件とさらにうまく合致します。すでに大きく前進しています — この調子です。",
    cta: "提案された道筋を見る",
  },

  ko: {
    badge: (level) => `레벨 ${level}`,
    title: "매우 잘하고 있어요",
    progress: (n) => `아주 좋아요 — 이미 작업의 ${n}%를 완료했어요. 훌륭합니다.`,
    body:
      "이제 아래의 간단한 단계 1~2가지만 더 완료하면, 당신의 강점이 역할 요구사항과 더 잘 맞춰집니다. 이미 많이 앞서가고 있어요 — 올바른 방향입니다.",
    cta: "추천 경로 보기",
  },
};

export default function SummaryBand({ level = 3, score, nextId = "actions", language = "en" }) {
  const L = COPY[language] || COPY.en;
  const progressMessage = typeof score === "number" ? L.progress(Math.round(score)) : null;

  return (
    <section
      style={{
        background: "#e0f2fe",
        border: "1px solid rgba(0,0,0,0.06)",
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <span
          style={{
            background: "#111",
            color: "#fff",
            padding: "6px 10px",
            borderRadius: 999,
            fontSize: 12,
          }}
        >
          {L.badge(level)}
        </span>

        {progressMessage && (
          <span style={{ fontSize: 13, color: "#333" }}>{progressMessage}</span>
        )}
      </div>

      <h2 style={{ margin: "10px 0 4px 0" }}>{L.title}</h2>
      <p style={{ margin: 0, color: "#333" }}>{L.body}</p>

      <div style={{ marginTop: 14 }}>
        <a
          href={`#${nextId}`}
          style={{
            padding: "8px 14px",
            background: "#0a0a0a",
            color: "#fff",
            borderRadius: 8,
            textDecoration: "none",
          }}
        >
          {L.cta}
        </a>
      </div>
    </section>
  );
}
