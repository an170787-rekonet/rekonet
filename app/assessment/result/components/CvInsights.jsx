// app/assessment/result/components/CvInsights.jsx
"use client";

import { useEffect, useState } from "react";

// -------------------------------
// Bilingual Labels (EN + AR)
// -------------------------------
const labels = {
  en: {
    insights: "CV Insights",
    topKeywords: "Top Keywords",
    topSectors: "Top Sectors",
    updated: "Updated",
    noCV: "No CV uploaded yet.",
    addCV: "Add your CV to see personalised insights.",
    loading: "Loading CV insights..."
  },
  ar: {
    insights: "رؤى السيرة الذاتية",
    topKeywords: "أهم الكلمات المفتاحية",
    topSectors: "أفضل القطاعات",
    updated: "آخر تحديث",
    noCV: "لم يتم رفع سيرة ذاتية بعد.",
    addCV: "أضف سيرتك الذاتية لعرض الرؤى المخصصة.",
    loading: "جارٍ تحميل رؤى السيرة الذاتية..."
  }
};

export default function CvInsights({ userId, language }) {
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `/api/cv/summary?user_id=${userId}&language=${language}`
        );
        const data = await res.json();
        setInfo(data);
      } catch (err) {
        console.error("Insights error:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [userId, language]);

  // -------------------------------
  // Loading state
  // -------------------------------
  if (loading) {
    return (
      <div>
        {labels[language]?.loading}
      </div>
    );
  }

  // -------------------------------
  // No CV uploaded yet
  // -------------------------------
  if (!info?.hasCV) {
    return (
      <div
        style={{
          marginTop: "1.5rem",
          marginBottom: "1.5rem",
          padding: "1rem",
          border: "1px solid #ddd",
          borderRadius: "8px"
        }}
      >
        <strong>{labels[language]?.noCV}</strong>
        <p>{labels[language]?.addCV}</p>
      </div>
    );
  }

  // -------------------------------
  // Main Insights Panel
  // -------------------------------
  return (
    <div
      style={{
        marginTop: "1.5rem",
        marginBottom: "1.5rem",
        padding: "1rem",
        border: "1px solid #eee",
        borderRadius: "8px"
      }}
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <h3 style={{ marginBottom: "0.5rem" }}>
        {labels[language]?.insights}
      </h3>

      {/* Top Keywords */}
      <div>
        <strong>{labels[language]?.topKeywords}:</strong>
        <div
          style={{
            marginTop: "0.5rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "6px"
          }}
        >
          {info.topKeywords.map((kw) => (
            <span
              key={kw}
              style={{
                background: "#f1f1f1",
                padding: "4px 8px",
                borderRadius: "5px"
              }}
            >
              {kw}
            </span>
          ))}
        </div>
      </div>

      {/* Top Sectors */}
      <div style={{ marginTop: "1rem" }}>
        <strong>{labels[language]?.topSectors}:</strong>
        <div
          style={{
            marginTop: "0.5rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "6px"
          }}
        >
          {info.topSectors.map((s) => (
            <span
              key={s}
              style={{
                background: "#e5f2ff",
                padding: "4px 8px",
                borderRadius: "5px"
              }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Updated timestamp */}
      <div
        style={{
          marginTop: "1rem",
          fontSize: "0.85rem",
          opacity: 0.7
        }}
      >
        {labels[language]?.updated}:{" "}
        {new Date(info.uploaded_at).toLocaleString()}
      </div>
    </div>
  );
}
