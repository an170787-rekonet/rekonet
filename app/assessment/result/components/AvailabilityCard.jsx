// app/assessment/result/components/AvailabilityCard.jsx
"use client";

import { useEffect, useMemo, useState } from "react";

export default function AvailabilityCard({
  language = "en",
  value,           // { days: [], times: {...}, contract, max_travel_mins, earliest_start }
  loading = false,
  saving = false,
  error = "",
  onSave,          // function(payload)
}) {
  const isRTL = language === "ar";

  // ---------- Local state (pre-filled from `value`) ----------
  const [days, setDays] = useState(["mon", "tue", "wed"]);
  const [times, setTimes] = useState({ morning: false, afternoon: false, evening: true });
  const [contract, setContract] = useState("full_time");
  const [maxTravel, setMaxTravel] = useState(30);
  const [earliest, setEarliest] = useState(""); // yyyy-mm-dd

  // Success banner
  const [savedOk, setSavedOk] = useState(false);

  // NEW: Saved ✓ button state
  const [saved, setSaved] = useState(false);

  // Store original values separately for "has form changed?" logic
  const [original, setOriginal] = useState(null);

  // Hydrate when parent provides `value`
  useEffect(() => {
    if (!value) return;

    const normalizedDays = Array.isArray(value.days)
      ? normalizeDays(value.days)
      : ["mon", "tue", "wed"];

    const initialObj = {
      days: normalizedDays,
      times: {
        morning: !!value.times?.morning,
        afternoon: !!value.times?.afternoon,
        evening: !!value.times?.evening,
      },
      contract: value.contract || "full_time",
      maxTravel: Number(value.max_travel_mins) || 0,
      earliest: value.earliest_start ? toInputDate(value.earliest_start) : "",
    };

    // Set local UI state
    setDays(initialObj.days);
    setTimes(initialObj.times);
    setContract(initialObj.contract);
    setMaxTravel(initialObj.maxTravel);
    setEarliest(initialObj.earliest);

    // Store original to compare changes
    setOriginal(initialObj);
  }, [value]);

  // Auto-hide success banner after 3 seconds
  useEffect(() => {
    if (!savedOk) return;
    const t = setTimeout(() => setSavedOk(false), 3000);
    return () => clearTimeout(t);
  }, [savedOk]);

  // ---------- LABELS ----------
  const L = useMemo(
    () => ({
      title: { en: "Availability", ar: "التوفر" },
      daysYouCanWork: { en: "Days you can work", ar: "الأيام المتاحة" },
      timesYouCanWork: { en: "Times you can work", ar: "الأوقات المتاحة" },
      contractPref: { en: "Contract preference", ar: "نوع العقد المفضل" },
      travel: { en: "Max travel time (minutes)", ar: "الحد الأقصى لوقت التنقل (دقائق)" },
      earliest: { en: "Earliest start date", ar: "أقرب تاريخ بدء" },
      save: { en: "Save availability", ar: "حفظ التوفر" },
      saving: { en: "Saving…", ar: "جارٍ الحفظ…" },
      saved: { en: "Saved", ar: "تم الحفظ" },
      mon: { en: "MON", ar: "الإثنين" },
      tue: { en: "TUE", ar: "الثلاثاء" },
      wed: { en: "WED", ar: "الأربعاء" },
      thu: { en: "THU", ar: "الخميس" },
      fri: { en: "FRI", ar: "الجمعة" },
      sat: { en: "SAT", ar: "السبت" },
      sun: { en: "SUN", ar: "الأحد" },
      morning: { en: "morning", ar: "الصباح" },
      afternoon: { en: "afternoon", ar: "بعد الظهر" },
      evening: { en: "evening", ar: "المساء" },
      full_time: { en: "Full-time", ar: "دوام كامل" },
      part_time: { en: "Part-time", ar: "دوام جزئي" },
      weekends: { en: "Weekends", ar: "عطلات نهاية الأسبوع" },
      any: { en: "Any / flexible", ar: "أي / مرن" },
    }),
    [language]
  );

  // ---------- HELPERS ----------
  function normalizeDays(arr) {
    const map = {
      mon: "mon", tue: "tue", wed: "wed", thu: "thu", fri: "fri", sat: "sat", sun: "sun",
      monday: "mon", tuesday: "tue", wednesday: "wed", thursday: "thu", friday: "fri", saturday: "sat", sunday: "sun",
      MON: "mon", TUE: "tue", WED: "wed", THU: "thu", FRI: "fri", SAT: "sat", SUN: "sun",
    };
    const out = [];
    for (const d of arr) {
      const k = String(d || "").trim().toLowerCase();
      if (map[k] && !out.includes(map[k])) out.push(map[k]);
    }
    return out.length ? out : ["mon", "tue", "wed"];
  }

  function toInputDate(v) {
    try {
      if (!v) return "";
      const d = new Date(v);
      if (Number.isNaN(d.getTime())) return "";
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, "0");
      const dd = String(d.getUTCDate()).padStart(2, "0");
      return `${y}-${m}-${dd}`;
    } catch {
      return "";
    }
  }

  const dayKeys = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const dayLabel = (k) => L[k]?.[language] || k.toUpperCase();
  const dir = isRTL ? "rtl" : "ltr";

  // ---------- DETECT IF FORM HAS CHANGED ----------
  const isDirty = original
    ? (
      JSON.stringify({
        days,
        times,
        contract,
        maxTravel: Number(maxTravel),
        earliest
      }) !== JSON.stringify(original)
    )
    : false;

  // ---------- UI HANDLERS ----------
  function toggleDay(k) {
    setDays((prev) => (
      prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]
    ));
  }

  function toggleTime(k) {
    setTimes((prev) => ({ ...prev, [k]: !prev[k] }));
  }

  async function handleSave() {
    if (!onSave) return;
    const payload = {
      days,
      times,
      contract,
      max_travel_mins: Number(maxTravel) || 0,
      earliest_start: earliest || null,
    };
    try {
      await onSave(payload);

      // Banner
      setSavedOk(true);

      // Button state
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);

      // Reset original to new values
      setOriginal({
        days,
        times,
        contract,
        maxTravel: Number(maxTravel),
        earliest,
      });
    } catch {
      /* parent sets error */
    }
  }

  // ---------- RENDER ----------
  return (
    <section
      dir={dir}
      style={{
        marginTop: 12,
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        background: "#fff",
        padding: 12,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 8 }}>
        {L.title[language]}
      </div>

      {loading ? (
        <div style={{ color: "#6b7280" }}>Loading…</div>
      ) : (
        <>
          {/* Days */}
          <div style={{ marginTop: 6 }}>
            <div style={{ fontSize: 12, color: "#374151", marginBottom: 6 }}>
              {L.daysYouCanWork[language]}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {dayKeys.map((k) => {
                const active = days.includes(k);
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => toggleDay(k)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid #E5E7EB",
                      background: active ? "#111827" : "#F3F4F6",
                      color: active ? "#fff" : "#1F2937",
                      fontWeight: 600,
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    {dayLabel(k)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Times */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, color: "#374151", marginBottom: 6 }}>
              {L.timesYouCanWork[language]}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["morning", "afternoon", "evening"].map((t) => {
                const active = !!times[t];
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTime(t)}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      border: "1px solid #E5E7EB",
                      background: active ? "#111827" : "#F3F4F6",
                      color: active ? "#fff" : "#1F2937",
                      fontWeight: 600,
                      fontSize: 12,
                      cursor: "pointer",
                      textTransform: "capitalize",
                    }}
                  >
                    {L[t][language]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contract + Travel + Date */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr 0.8fr",
              alignItems: "center",
              gap: 12,
              marginTop: 12,
            }}
          >
            {/* Contract */}
            <div>
              <div style={{ fontSize: 12, color: "#374151", marginBottom: 6 }}>
                {L.contractPref[language]}
              </div>
              <select
                value={contract}
                onChange={(e) => setContract(e.target.value)}
                style={{
                  width: "100%",
                  height: 38,
                  padding: "8px 10px",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  boxSizing: "border-box",
                }}
              >
                <option value="full_time">{L.full_time[language]}</option>
                <option value="part_time">{L.part_time[language]}</option>
                <option value="weekends">{L.weekends[language]}</option>
                <option value="any">{L.any[language]}</option>
              </select>
            </div>

            {/* Travel */}
            <div>
              <div style={{ fontSize: 12, color: "#374151", marginBottom: 6 }}>
                {L.travel[language]}
              </div>
              <input
                type="number"
                min={0}
                value={maxTravel}
                onChange={(e) => setMaxTravel(e.target.value)}
                style={{
                  width: 140,
                  minWidth: 120,
                  maxWidth: 160,
                  height: 38,
                  padding: "8px 10px",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Earliest Start */}
            <div>
              <div style={{ fontSize: 12, color: "#374151", marginBottom: 6 }}>
                {L.earliest[language]}
              </div>
              <input
                type="date"
                value={earliest || ""}
                onChange={(e) => setEarliest(e.target.value)}
                style={{
                  width: 160,
                  minWidth: 140,
                  maxWidth: 180,
                  height: 38,
                  padding: "8px 10px",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  boxSizing: "border-box",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              />
            </div>
          </div>

          {/* Messages */}
          {error ? (
            <div style={{ color: "#b91c1c", marginTop: 8, fontSize: 12 }}>{error}</div>
          ) : savedOk ? (
            <div
              style={{
                color: "#166534",
                background: "#DCFCE7",
                border: "1px solid #86efac",
                padding: "6px 8px",
                borderRadius: 6,
                marginTop: 8,
                fontSize: 12,
              }}
            >
              {L.saved[language]}
            </div>
          ) : null}

          {/* Save Button */}
          <div style={{ marginTop: 10 }}>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !isDirty}
              style={{
                padding: "8px 12px",
                background: saved ? "#16A34A" : "#2563EB",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontWeight: 700,
                cursor: saving || !isDirty ? "not-allowed" : "pointer",
                opacity: saving || !isDirty ? 0.75 : 1,
              }}
            >
              {saving
                ? L.saving[language]
                : saved
                  ? `${L.saved[language]} ✓`
                  : L.save[language]}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
``
