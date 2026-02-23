// app/assessment/result/components/CvInsights.jsx
"use client";

import { useEffect, useState } from "react";

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

  if (loading) return <div>Loading CV insights...</div>;

  if (!info?.hasCV) {
    return (
      <div style={{ marginTop: "1rem", padding: "1rem", border: "1px solid #ddd", borderRadius: "8px" }}>
        <strong>No CV uploaded yet.</strong>
        <p>Add your CV to see personalised insights.</p>
      </div>
    );
  }

  return (
    <div 
      style={{ 
        marginTop: "1.5rem", 
        marginBottom: "1.5rem",
        padding: "1rem", 
        border: "1px solid #eee", 
        borderRadius: "8px" 
      }}>
      <h3 style={{ marginBottom: "0.5rem" }}>CV Insights</h3>

      <div>
        <strong>Top Keywords:</strong>
        <div style={{ marginTop: "0.5rem", display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {info.topKeywords.map((kw) => (
            <span key={kw} style={{ background: "#f1f1f1", padding: "4px 8px", borderRadius: "5px" }}>
              {kw}
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <strong>Top Sectors:</strong>
        <div style={{ marginTop: "0.5rem", display: "flex", gap: "6px" }}>
          {info.topSectors.map((s) => (
            <span key={s} style={{ background: "#e5f2ff", padding: "4px 8px", borderRadius: "5px" }}>
              {s}
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "1rem", fontSize: "0.85rem", opacity: 0.7 }}>
        Updated: {new Date(info.uploaded_at).toLocaleString()}
      </div>
    </div>
  );
}
