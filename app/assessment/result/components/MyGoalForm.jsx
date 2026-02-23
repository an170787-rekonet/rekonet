// app/assessment/result/components/MyGoalForm.jsx
"use client";

import { useState } from "react";

export default function MyGoalForm({ userId, language = "en", onResult }) {
  const [goal, setGoal] = useState("");
  const [city, setCity] = useState(""); // NEW: location field

  const L = {
    en: {
      goalLabel: "My goal",
      placeholder: "Choose a job role...",
      locationLabel: "City or postcode",
      locationPh: "e.g., Birmingham, B1 1AA",
      button: "Show my gaps"
    },
    ar: {
      goalLabel: "هدفي",
      placeholder: "اختر الوظيفة...",
      locationLabel: "المدينة أو الرمز البريدي",
      locationPh: "مثال: لندن، B1 1AA",
      button: "اعرض الفجوات"
    }
  }[language] || {
    goalLabel: "My goal",
    placeholder: "Choose a job role...",
    locationLabel: "City or postcode",
    locationPh: "e.g., Birmingham, B1 1AA",
    button: "Show my gaps"
  };

  async function handleSubmit(e) {
    e.preventDefault();

    // Call your existing goal plan API
    const res = await fetch("/api/goal/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        goal
      })
    });

    const data = await res.json();

    // Return the API data PLUS the city value so ResultView can use it
    onResult?.({
      ...data,
      _city: city?.trim() || ""
    });
  }

  const dir = language === "ar" ? "rtl" : "ltr";

  return (
    <form
      onSubmit={handleSubmit}
      dir={dir}
      style={{
        marginTop: "1.5rem",
        padding: "1rem",
        border: "1px solid #ddd",
        borderRadius: 8,
        background: "#fff"
      }}
    >
      {/* Goal selector */}
      <label style={{ display: "block", fontWeight: 700 }}>
        {L.goalLabel}
      </label>

      <select
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        required
        style={{
          marginTop: "0.5rem",
          padding: "0.5rem",
          width: "100%",
          border: "1px solid #ddd",
          borderRadius: 6
        }}
      >
        <option value="">{L.placeholder}</option>
        <option value="Customer Service Advisor">Customer Service Advisor</option>
        <option value="Admin Assistant">Admin Assistant</option>
        <option value="Warehouse Operative">Warehouse Operative</option>
      </select>

      {/* NEW: City / Postcode field */}
      <div style={{ marginTop: "0.75rem" }}>
        <label style={{ display: "block", fontWeight: 700 }}>
          {L.locationLabel}
        </label>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder={L.locationPh}
          style={{
            marginTop: "0.5rem",
            padding: "0.5rem",
            width: "100%",
            border: "1px solid #ddd",
            borderRadius: 6
          }}
        />
      </div>

      <button
        type="submit"
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          borderRadius: 6,
          cursor: "pointer",
          background: "#2563EB",
          color: "#fff",
          border: "none",
          fontWeight: 600
        }}
      >
        {L.button}
      </button>
    </form>
  );
}
