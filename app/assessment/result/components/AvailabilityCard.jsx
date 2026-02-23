"use client";

import { useState } from "react";

export default function AvailabilityCard({ language = "en", onSave }) {
  const isRTL = language === "ar";

  const [days, setDays] = useState({
    mon: false, tue: false, wed: false,
    thu: false, fri: false, sat: false, sun: false
  });

  const [times, setTimes] = useState({
    morning: false, afternoon: false, evening: false
  });

  const [contract, setContract] = useState("full_time");
  const [travel, setTravel] = useState(30);
  const [startDate, setStartDate] = useState("");

  // NEW: UX feedback
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const L = {
    heading: { en: "Availability", ar: "التوفر" },
    days: { en: "Days you can work", ar: "الأيام المتاحة للعمل" },
    times: { en: "Times you can work", ar: "الأوقات المتاحة للعمل" },
    contract: { en: "Contract preference", ar: "نوع العقد المفضل" },
    travel: { en: "Max travel time (minutes)", ar: "الحد الأقصى لوقت التنقل (بالدقائق)" },
    start: { en: "Earliest start date", ar: "أقرب تاريخ للبدء" },
    save: { en: "Save availability", ar: "حفظ التوفر" },
    saved: { en: "Saved.", ar: "تم الحفظ." },
    error: { en: "Could not save.", ar: "تعذر الحفظ." },
    ft: { en: "Full‑time", ar: "دوام كامل" },
    pt: { en: "Part‑time", ar: "دوام جزئي" },
    wk: { en: "Weekends only", ar: "عطلة نهاية الأسبوع فقط" },
    any: { en: "Flexible / any", ar: "مرن / أي وقت" }
  };

  const toggleDay = (d) => setDays({ ...days, [d]: !days[d] });
  const toggleTime = (t) => setTimes({ ...times, [t]: !times[t] });

  const save = async () => {
    try {
      setBusy(true);
      setMsg("");
      // Build payload
      const payload = {
        days,
        times,
        contract,
        travelMinutes: Number(travel),
        earliestStart: startDate
      };
      // Await parent onSave (this calls your API)
      await onSave?.(payload);
      setMsg(L.saved[language]);
      // Hide the message after a short delay
      setTimeout(() => setMsg(""), 3000);
    } catch (e) {
      console.error(e);
      setMsg(L.error[language]);
    } finally {
      setBusy(false);
    }
  };

  const chip = {
    padding: "6px 10px",
    border: "1px solid #ddd",
    borderRadius: 8,
    cursor: "pointer",
    background: "#f9fafb",
    fontSize: 12,
    margin: 4
  };

  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        border: "1px solid #eee",
        borderRadius: 8,
        padding: 12,
        marginTop: 16,
        background: "#fff"
      }}
    >
      <h3 style={{ marginTop: 0 }}>{L.heading[language]}</h3>

      {/* DAYS */}
      <div style={{ marginTop: 8 }}>
        <strong>{L.days[language]}</strong>
        <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap" }}>
          {Object.keys(days).map((d) => (
            <div
              key={d}
              onClick={() => toggleDay(d)}
              style={{
                ...chip,
                background: days[d] ? "#e0f2fe" : "#f9fafb"
              }}
            >
              {d.toUpperCase()}
            </div>
          ))}
        </div>
      </div>

      {/* TIMES */}
      <div style={{ marginTop: 12 }}>
        <strong>{L.times[language]}</strong>
        <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap" }}>
          {Object.keys(times).map((t) => (
            <div
              key={t}
              onClick={() => toggleTime(t)}
              style={{
                ...chip,
                background: times[t] ? "#fee2e2" : "#f9fafb"
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* CONTRACT */}
      <div style={{ marginTop: 12 }}>
        <strong>{L.contract[language]}</strong>
        <select
          value={contract}
          onChange={(e) => setContract(e.target.value)}
          style={{ display: "block", marginTop: 6, padding: 8 }}
        >
          <option value="full_time">{L.ft[language]}</option>
          <option value="part_time">{L.pt[language]}</option>
          <option value="weekends">{L.wk[language]}</option>
          <option value="any">{L.any[language]}</option>
        </select>
      </div>

      {/* TRAVEL */}
      <div style={{ marginTop: 12 }}>
        <strong>{L.travel[language]}</strong>
        <input
          type="number"
          value={travel}
          onChange={(e) => setTravel(e.target.value)}
          style={{ marginTop: 6, padding: 8, width: 120 }}
        />
      </div>

      {/* START DATE */}
      <div style={{ marginTop: 12 }}>
        <strong>{L.start[language]}</strong>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{ marginTop: 6, padding: 8 }}
        />
      </div>

      <button
        onClick={save}
        disabled={busy}
        style={{
          marginTop: 16,
          padding: "8px 12px",
          background: busy ? "#9CA3AF" : "#2563EB",
          color: "#fff",
          borderRadius: 8,
          border: "none",
          fontWeight: 600,
          cursor: busy ? "not-allowed" : "pointer"
        }}
      >
        {busy ? (language === "ar" ? "جارٍ الحفظ…" : "Saving…") : L.save[language]}
      </button>

      {msg && (
        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            color: msg === L.saved[language] ? "#166534" : "#B91C1C"
          }}
        >
          {msg}
        </div>
      )}
    </section>
  );
}
