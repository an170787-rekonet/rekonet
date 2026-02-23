// app/assessment/result/components/LiveJobsLinks.jsx
"use client";

import React, { useState, useMemo } from "react";

// We use plain <a> for external links to avoid Next.js client-side routing side-effects.

const UK_POSTCODE_REGEX =
  /\b([A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}|GIR ?0AA)\b/i;

// ---- Small toggle chip (accessible) ----
function ToggleChip({ active, onClick, children, bgOn = "#111827", bgOff = "#F3F4F6", lang = "en" }) {
  const dir = lang === "ar" ? "rtl" : "ltr";
  return (
    <button
      type="button"
      aria-pressed={!!active}
      onClick={onClick}
      dir={dir}
      style={{
        padding: "6px 10px",
        borderRadius: 999,
        border: "1px solid #E5E7EB",
        background: active ? bgOn : bgOff,
        color: active ? "#fff" : "#1F2937",
        fontWeight: 600,
        fontSize: 12,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function pickInitialRadius(place) {
  // If it's a UK postcode → start Exact(0), else Nearby(10)
  if (!place) return 10;
  return UK_POSTCODE_REGEX.test(place) ? 0 : 10;
}

function levelTokens(level) {
  const lv = (level || "").toLowerCase();
  if (["new", "growing"].includes(lv)) {
    return {
      positives: ["junior", "trainee", "entry level"],
      negatives: ["-senior", "-lead", "-manager"],
    };
  }
  if (["established", "advancing"].includes(lv)) {
    return { positives: ["experienced"], negatives: [] };
  }
  return { positives: [], negatives: [] };
}

function roleSynonyms(title) {
  const t = (title || "").toLowerCase();
  const out = [];
  if (t.includes("customer service")) {
    out.push("customer support", "customer care", "contact centre", "call centre");
  }
  if (t.includes("advisor") || t.includes("agent")) {
    out.push("agent", "advisor");
  }
  return out;
}

function availabilityTerms(availability) {
  const terms = [];
  const contract = (availability?.contract || "").toLowerCase();
  const times = availability?.times || {};

  if (contract === "part_time") terms.push("part time");
  if (contract === "weekends") terms.push("weekend");
  if (contract === "any") terms.push("flexible");

  if (times?.evening) terms.push("evening");
  if (times?.morning) terms.push("morning");
  if (times?.afternoon) terms.push("afternoon");
  return terms;
}

function availabilitySummary(availability, lang) {
  if (!availability) return "";
  const c = (availability.contract || "").toLowerCase();
  const t = availability.times || {};
  const parts = [];

  if (c === "part_time") parts.push(lang === "ar" ? "دوام جزئي" : "PT");
  else if (c === "weekends") parts.push(lang === "ar" ? "عطلات" : "Weekends");
  else if (c === "full_time") parts.push(lang === "ar" ? "دوام كامل" : "FT");
  else if (c === "any") parts.push(lang === "ar" ? "مرن" : "Flexible");

  if (t.morning) parts.push(lang === "ar" ? "صباح" : "Morning");
  if (t.afternoon) parts.push(lang === "ar" ? "بعد الظهر" : "Afternoon");
  if (t.evening) parts.push(lang === "ar" ? "مساء" : "Evening");

  return parts.join(lang === "ar" ? " · " : " · ");
}

function indeedJobTypeParam(availability) {
  const c = (availability?.contract || "").toLowerCase();
  if (c === "part_time") return "parttime";
  return null;
}

/**
 * Build the Indeed UK link and a user-facing suggestion string.
 */
function buildIndeed({ goal, level, city, keywords = [], availability, radiusMiles, freshnessDays }) {
  const title = (goal || "").trim();
  const place = (city || "").trim();

  const { positives: lvlPos, negatives: lvlNeg } = levelTokens(level);
  const syns = roleSynonyms(title);
  const skills = (keywords || []).slice(0, 5);
  const avail = availabilityTerms(availability);

  const titleQuoted = title ? `"${title}"` : "";
  const suggestionParts = [titleQuoted, ...syns, ...skills, ...lvlPos, ...lvlNeg, ...avail].filter(Boolean);
  const suggestionText = suggestionParts.join(" ").replace(/\s+/g, " ").trim();

  const indeedQ = encodeURIComponent(suggestionText);
  const l = place ? encodeURIComponent(place) : "";
  const jt = indeedJobTypeParam(availability);

  const indeedBase = "https://www.indeed.co.uk/jobs";
  const params = [
    `q=${indeedQ}`,
    l ? `l=${l}` : null,
    Number.isFinite(radiusMiles) ? `radius=${radiusMiles}` : null,
    "sort=date",
    Number.isFinite(freshnessDays) ? `fromage=${freshnessDays}` : "fromage=7",
    jt ? `jt=${jt}` : null,
    // Anti-rewrite stabilisers
    "vjk=",
    "filter=0",
    "wfh=0",
    "start=0",
  ]
    .filter(Boolean)
    .join("&");

  const indeedHref = `${indeedBase}?${params}`;
  return { indeedHref, suggestionText };
}

export default function LiveJobsLinks({
  goal,
  level,
  city,
  keywords = [],
  language = "en",
  availability,
}) {
  const dir = language === "ar" ? "rtl" : "ltr";

  // Chips state
  const initialRadius = pickInitialRadius(city);
  const [radius, setRadius] = useState(initialRadius);    // 0 / 5 / 10 / 25
  const [freshness, setFreshness] = useState(7);          // 1 / 3 / 7 / 14

  // Build Indeed link + suggestion
  const { indeedHref, suggestionText } = useMemo(
    () =>
      buildIndeed({
        goal,
        level,
        city,
        keywords,
        availability,
        radiusMiles: radius,
        freshnessDays: freshness,
      }),
    [goal, level, city, keywords, availability, radius, freshness]
  );

  const L =
    {
      en: {
        heading: "Find live jobs",
        indeed: "Indeed (UK)",
        radius: "Radius",
        freshness: "Freshness",
        rExact: "Exact",
        rLocal: "Local",
        rNear: "Nearby",
        rCity: "City‑wide",
        d1: "1d",
        d3: "3d",
        d7: "7d",
        d14: "14d",
        avail: "Availability",
        suggestion: "Suggested search",
        copy: "Copy",
        copied: "Copied!",
      },
      ar: {
        heading: "اعثر على وظائف مباشرة",
        indeed: "بحث Indeed (المملكة المتحدة)",
        radius: "المسافة",
        freshness: "الحداثة",
        rExact: "دقيق",
        rLocal: "محلي",
        rNear: "بالقرب",
        rCity: "على مستوى المدينة",
        d1: "يوم",
        d3: "3 أيام",
        d7: "7 أيام",
        d14: "14 يومًا",
        avail: "التوفر",
        suggestion: "البحث المقترح",
        copy: "نسخ",
        copied: "تم النسخ!",
      },
    }[language] ||
    {
      heading: "Find live jobs",
      indeed: "Indeed (UK)",
      radius: "Radius",
      freshness: "Freshness",
      rExact: "Exact",
      rLocal: "Local",
      rNear: "Nearby",
      rCity: "City‑wide",
      d1: "1d",
      d3: "3d",
      d7: "7d",
      d14: "14d",
      avail: "Availability",
      suggestion: "Suggested search",
      copy: "Copy",
      copied: "Copied!",
    };

  const availText = availabilitySummary(availability, language);
  const [copied, setCopied] = useState(false);

  async function doCopy() {
    try {
      await navigator.clipboard.writeText(suggestionText || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <div
      dir={dir}
      style={{
        marginTop: 12,
        border: "1px solid #eee",
        borderRadius: 8,
        padding: 10,
        background: "#fff",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{L.heading}</div>

      {/* Controls row */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, marginBottom: 8 }}>
        {/* Radius */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, color: "#475569", minWidth: 58 }}>{L.radius}:</span>
          <ToggleChip lang={language} active={radius === 0} onClick={() => setRadius(0)}>{L.rExact}</ToggleChip>
          <ToggleChip lang={language} active={radius === 5} onClick={() => setRadius(5)}>{L.rLocal}</ToggleChip>
          <ToggleChip lang={language} active={radius === 10} onClick={() => setRadius(10)}>{L.rNear}</ToggleChip>
          <ToggleChip lang={language} active={radius === 25} onClick={() => setRadius(25)}>{L.rCity}</ToggleChip>
        </div>

        {/* Freshness */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, color: "#475569", minWidth: 66 }}>{L.freshness}:</span>
          <ToggleChip lang={language} active={freshness === 1} onClick={() => setFreshness(1)}>{L.d1}</ToggleChip>
          <ToggleChip lang={language} active={freshness === 3} onClick={() => setFreshness(3)}>{L.d3}</ToggleChip>
          <ToggleChip lang={language} active={freshness === 7} onClick={() => setFreshness(7)}>{L.d7}</ToggleChip>
          <ToggleChip lang={language} active={freshness === 14} onClick={() => setFreshness(14)}>{L.d14}</ToggleChip>
        </div>

        {/* Availability summary */}
        {availText ? (
          <div style={{ marginInlineStart: "auto", fontSize: 12, color: "#334155" }}>
            <span style={{ opacity: 0.7 }}>{L.avail}: </span>{availText}
          </div>
        ) : null}
      </div>

      {/* Suggested search + button */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 12, color: "#475569", minWidth: 110 }}>{L.suggestion}:</span>
        <div
          style={{
            flex: 1,
            minWidth: 220,
            padding: "6px 10px",
            border: "1px solid #E5E7EB",
            borderRadius: 6,
            background: "#F8FAFC",
            fontSize: 12,
            color: "#111827",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={suggestionText}
        >
          {suggestionText || "—"}
        </div>
        <button
          type="button"
          onClick={doCopy}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid #E5E7EB",
            background: copied ? "#DCFCE7" : "#F3F4F6",
            color: "#1F2937",
            fontWeight: 600,
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          {copied ? L.copied : L.copy}
        </button>
      </div>

      {/* Link row (Indeed only) */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <a
          href={indeedHref}
          target="_blank"
          rel="noopener noreferrer"
          style={chipStyle("#F3F4F6")}
        >
          {L.indeed}
        </a>
      </div>
    </div>
  );
}

function chipStyle(bg) {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 10px",
    background: bg,
    border: "1px solid #E5E7EB",
    borderRadius: 999,
    textDecoration: "none",
    color: "#1F2937",
    fontSize: 12,
    fontWeight: 600,
  };
}
