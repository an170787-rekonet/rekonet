// app/assessment/result/components/AvailabilityCard.jsx
"use client";

import { useEffect, useMemo, useState } from "react";

export default function AvailabilityCard({
  language = "en",
  value,
  loading = false,
  saving = false,
  error = "",
  onSave,
}) {
  const isRTL = language === "ar";

  // ---------- Local state ----------
  const [days, setDays] = useState(["mon", "tue", "wed"]);
  const [times, setTimes] = useState({ morning: false, afternoon: false, evening: true });
  const [contract, setContract] = useState("full_time");
  const [maxTravel, setMaxTravel] = useState(30);
  const [earliest, setEarliest] = useState("");

  // UI
  const [savedOk, setSavedOk] = useState(false);
  const [saved, setSaved] = useState(false);
  const [localError, setLocalError] = useState("");

  // Snapshot of original values
  const [original, setOriginal] = useState(null);

  // Hydrate from `value`
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

    setDays(initialObj.days);
    setTimes(initialObj.times);
    setContract(initialObj.contract);
    setMaxTravel(initialObj.maxTravel);
    setEarliest(initialObj.earliest);

    setOriginal(initialObj);
  }, [value]);

  // Auto-hide success banner
  useEffect(() => {
    if (!savedOk) return;
    const t = setTimeout(() => setSavedOk(false), 3000);
    return () => clearTimeout(t);
  }, [savedOk]);

  // ---------- UK & Arabic Labels ----------
  const L = useMemo(
    () => ({
      title: {
        en: "Availability (Working Pattern)",
        ar: "التوفر",
      },
      daysYouCanWork: {
        en: "Days you are available",
        ar: "الأيام المتاحة",
      },
      timesYouCanWork: {
        en: "Times you are available",
        ar: "الأوقات المتاحة",
      },
      contractPref: {
        en: "Working pattern preference",
        ar: "نوع العقد المفضل",
      },
      travel: {
        en: "Maximum commute time (minutes)",
        ar: "الحد الأقصى لوقت التنقل (دقائق)",
      },
      earliest: {
        en: "Earliest possible start date",
        ar: "أقرب تاريخ بدء",
      },
      save: {
        en: "Save availability details",
        ar: "حفظ التوفر",
      },
      saving: {
        en: "Saving…",
        ar: "جارٍ الحفظ…",
      },
      saved: {
        en: "Saved",
        ar: "تم الحفظ",
      },
      validation_days: {
        en: "Please select at least one working day.",
        ar: "الرجاء اختيار يوم واحد على الأقل.",
      },

      // Day labels unchanged
      mon: { en: "MON", ar: "الإثنين" },
      tue: { en: "TUE", ar: "الثلاثاء" },
      wed: { en: "WED", ar: "الأربعاء" },
      thu: { en: "THU", ar: "الخميس" },
      fri: { en: "FRI", ar: "الجمعة" },
      sat: { en: "SAT", ar: "السبت" },
      sun: { en: "SUN", ar: "الأحد" },

      // Times
      morning: { en: "morning", ar: "الصباح" },
      afternoon: { en: "afternoon", ar: "بعد الظهر" },
      evening: { en: "evening", ar: "المساء" },

      // Contracts
      full_time: { en: "Full-time", ar: "دوام كامل" },
      part_time: { en: "Part-time", ar: "دوام جزئي" },
      weekends: { en: "Weekends", ar: "عطلات نهاية الأسبوع" },
      any: { en: "Any / flexible", ar: "أي / مرن" },
    }),
    [language]
  );

  // ---------- Helpers ----------
  function normalizeDays(arr) {
    const map = {
      mon: "mon",
      tue: "tue",
      wed: "wed",
      thu: "thu",
      fri: "fri",
      sat: "sat",
      sun: "sun",
      monday: "mon",
      tuesday: "tue",
      wednesday: "wed",
      thursday: "thu",
      friday: "fri",
      saturday: "sat",
      sunday: "sun",
      MON: "mon",
      TUE: "tue",
      WED: "wed",
      THU: "thu",
      FRI: "fri",
      SAT: "sat",
      SUN: "sun",
    };

    const out = [];
    for (const d of arr) {
      const k = String(d).trim().toLowerCase();
      if (map[k] && !out.includes(map[k])) out.push(map[k]);
    }
    return out.length ? out : ["mon", "tue", "wed"];
  }

  function toInputDate(v) {
    try {
      if (!v) return "";
      const d = new Date(v);
      if (isNaN(d.getTime())) return "";
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getUTCDate()).padStart(2, "0")}`;
    } catch {
      return "";
    }
  }

  const dayKeys = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const dir = isRTL ? "rtl" : "ltr";

  // ---------- Dirty check ----------
  const currentSnapshot = {
    days,
    times,
    contract,
    maxTravel: Number(maxTravel),
    earliest,
  };

  const isDirty =
    original && JSON.stringify(currentSnapshot) !== JSON.stringify(original);

  // ---------- Validation ----------
  const isValid = days.length > 0;
  const disableSave = saving || !isDirty || !isValid;

  // ---------- UI Handlers ----------
  function toggleDay(k) {
    setLocalError("");
    setDays((prev) =>
      prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]
    );
  }

  function toggleTime(k) {
    setTimes((prev) => ({ ...prev, [k]: !prev[k] }));
  }

  async function handleSave() {
    if (days.length === 0) {
      setLocalError(L.validation_days[language]);
      return;
    }

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

      setLocalError("");
      setSavedOk(true);

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);

      setOriginal({
        days,
        times,
        contract,
        maxTravel: Number(maxTravel),
        earliest,
      });
    } catch {}
  }

  // ---------- Render ----------
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
                    onClick={() => toggleDay(k)}
                    type="button"
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
                    {L[k][language]}
                  </button>
                );
              })}
            </div>

            {/* Inline Validation */}
            {localError && (
              <div style={{ color: "#b91c1c", fontSize: 12, marginTop: 4 }}>
                {localError}
              </div>
            )}
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
                    onClick={() => toggleTime(t)}
                    type="button"
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

          {/* Contract + travel + date */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr 0.8fr",
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
                  height: 38,
                  padding: "8px 10px",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                }}
              />
            </div>

            {/* Earliest start */}
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
                  height: 38,
                  padding: "8px 10px",
                  border: "1px solid #ddd",
                  borderRadius: 6,
                }}
              />
            </div>
          </div>

          {/* Banner or server error */}
          {error ? (
            <div style={{ color: "#b91c1c", marginTop: 8, fontSize: 12 }}>
              {error}
            </div>
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

          {/* Save */}
          <div style={{ marginTop: 10 }}>
            <button
              onClick={handleSave}
              disabled={disableSave}
              type="button"
              style={{
                padding: "8px 12px",
                background: saved ? "#16A34A" : "#2563EB",
                color: "#fff",
                borderRadius: 8,
                border: "none",
                fontWeight: 700,
                cursor: disableSave ? "not-allowed" : "pointer",
                opacity: disableSave ? 0.75 : 1,
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
