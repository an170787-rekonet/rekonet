// app/assessment/result/components/MyGoalForm.jsx
"use client";

import { useState } from "react";

export default function MyGoalForm({ userId, language, onResult }) {
  const [goal, setGoal] = useState("");

  const labels = {
    en: {
      goalLabel: "My goal",
      placeholder: "Choose a job role...",
      button: "Show my gaps"
    },
    ar: {
      goalLabel: "هدفي",
      placeholder: "اختر الوظيفة...",
      button: "اعرض الفجوات"
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/goal/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        goal
      })
    });

    const data = await res.json();
    onResult(data);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ 
        marginTop: "1.5rem",
        padding: "1rem",
        border: "1px solid #ddd",
        borderRadius: "8px",
      }}
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <label>
        <strong>{labels[language]?.goalLabel}:</strong>
      </label>

      <select
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        required
        style={{
          marginTop: "0.5rem",
          padding: "0.5rem",
          width: "100%",
          borderRadius: "6px"
        }}
      >
        <option value="">
          {labels[language]?.placeholder}
        </option>
        <option value="Customer Service Advisor">Customer Service Advisor</option>
        <option value="Admin Assistant">Admin Assistant</option>
        <option value="Warehouse Operative">Warehouse Operative</option>
      </select>

      <button
        type="submit"
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        {labels[language]?.button}
      </button>
    </form>
  );
}
