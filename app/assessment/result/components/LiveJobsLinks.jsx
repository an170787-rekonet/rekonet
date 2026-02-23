// app/assessment/result/components/LiveJobsLinks.jsx
"use client";

import Link from "next/link";

/**
 * Build outbound search links for Indeed, company careers (via Google operators),
 * and general Google Jobs, enriched with availability signals (part-time, evening, weekend, flexible).
 * We only open searches in new tabs. No scraping.
 */
function buildSearchQueries({ goal, level, city, keywords = [], availability }) {
  const title = (goal || "").trim();
  const place = (city || "").trim(); // may be a UK postcode like "SE1 2AA"

  // Seniority control
  const lowLevel = ["new", "growing"].includes((level || "").toLowerCase());
  const seniorFilter = lowLevel ? "-senior -lead -manager" : "";

  // Keywords: keep top 3–5
  const topKw = (keywords || []).slice(0, 5).join(" ");

  // Availability-derived terms
  const availTerms = [];
  const contract = (availability?.contract || "").toLowerCase();
  const times = availability?.times || {};

  if (contract === "part_time") availTerms.push("part time");
  if (contract === "weekends") availTerms.push("weekend");
  if (contract === "any") availTerms.push("flexible");

  if (times?.evening) availTerms.push("evening");
  if (times?.morning) availTerms.push("morning");
  if (times?.afternoon) availTerms.push("afternoon");

  const availText = availTerms.join(" ").trim();

  // ----- 1) Indeed UK search (fixes) -----
  // - Use indeed.co.uk for UK relevance
  // - Properly encode q and l
  // - Use & (not &amp;)
  // - radius=0 for postcode-precise results (adjust if you want a wider area)
  const indeedQuery = encodeURIComponent(
    [title, topKw, seniorFilter, availText].filter(Boolean).join(" ")
  );
  const indeedLoc = encodeURIComponent(place);
  const indeedBase = "https://www.indeed.co.uk/jobs";
  const indeedParams =
    `?q=${indeedQuery}` +
    (indeedLoc ? `&l=${indeedLoc}&radius=0` : "");
  const indeedHref = `${indeedBase}${indeedParams}`;

  // ----- 2) Company careers (Workday / Greenhouse / Lever) via Google operators -----
  const careersOps = [
    "site:workdayjobs.com",
    "site:greenhouse.io",
    "site:lever.co",
  ].join(" OR ");

  const careersTerms = [
    careersOps,
    title ? `"${title}"` : "",
    place ? `"${place}"` : "",
    topKw,
    availText,
    seniorFilter,
  ]
    .filter(Boolean)
    .join(" ");

  const careersHref = `https://www.google.com/search?q=${encodeURIComponent(
    careersTerms
  )}`;

  // ----- 3) General Google Jobs -----
  const googleTerms = [
    title ? `"${title}"` : "",
    place ? `"${place}"` : "",
    topKw,
    availText,
    seniorFilter,
    "jobs",
  ]
    .filter(Boolean)
    .join(" ");

  const googleHref = `https://www.google.com/search?q=${encodeURIComponent(
    googleTerms
  )}`;

  return { indeedHref, careersHref, googleHref };
}

export default function LiveJobsLinks({
  goal,
  level,
  city,
  keywords = [],
  language = "en",
  availability, // <-- NEW
}) {
  const { indeedHref, careersHref, googleHref } = buildSearchQueries({
    goal,
    level,
    city,
    keywords,
    availability,
  });

  const L =
    {
      en: {
        heading: "Find live jobs",
        indeed: "Indeed (UK)",
        careers: "Company career pages",
        google: "Google Jobs",
      },
      ar: {
        heading: "اعثر على وظائف مباشرة",
        indeed: "بحث Indeed (المملكة المتحدة)",
        careers: "صفحات وظائف الشركات",
        google: "وظائف Google",
      },
    }[language] ||
    {
      heading: "Find live jobs",
      indeed: "Indeed (UK)",
      careers: "Company career pages",
      google: "Google Jobs",
    };

  const dir = language === "ar" ? "rtl" : "ltr";

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
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <Link
          href={indeedHref}
          target="_blank"
          rel="noopener noreferrer"
          style={chipStyle("#F3F4F6")}
        >
          {L.indeed}
        </Link>
        <Link
          href={careersHref}
          target="_blank"
          rel="noopener noreferrer"
          style={chipStyle("#E5F2FF")}
        >
          {L.careers}
        </Link>
        <Link
          href={googleHref}
          target="_blank"
          rel="noopener noreferrer"
          style={chipStyle("#F1F5F9")}
        >
          {L.google}
        </Link>
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
