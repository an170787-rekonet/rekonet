// app/assessment/result/components/LiveJobsLinks.jsx
"use client";

import Link from "next/link";

/**
 * Build outbound search links for Indeed, company careers (via Google operators),
 * and general Google Jobs from goal + level + city + keywords.
 * These links simply open searches in new tabs. No scraping.
 */
function buildSearchQueries({ goal, level, city, keywords = [] }) {
  const title = (goal || "").trim();
  const place = (city || "").trim();

  // Level handling (seniority filter)
  const lowLevel = ["new", "growing"].includes((level || "").toLowerCase());
  const seniorFilter = lowLevel ? "-senior -lead -manager" : "";

  // Keywords: keep top 3-5
  const topKw = (keywords || []).slice(0, 5).join(" ");

  // 1) Indeed search URL: q = title + keywords + senior filter, l = city
  const indeedQuery = encodeURIComponent(
    [title, topKw, seniorFilter].filter(Boolean).join(" ")
  );
  const indeedLoc = encodeURIComponent(place);
  const indeedHref = `https://www.indeed.com/jobs?q=${indeedQuery}${
    indeedLoc ? `&l=${indeedLoc}` : ""
  }`;

  // 2) Company careers (Workday, Greenhouse, Lever)
  // Uses Google search operators
  const careersOps = [
    "site:workdayjobs.com",
    "site:greenhouse.io",
    "site:lever.co"
  ].join(" OR ");

  const careersTerms = [
    careersOps,
    `"${title}"`,
    place ? `"${place}"` : "",
    topKw,
    seniorFilter
  ]
    .filter(Boolean)
    .join(" ");

  const careersHref = `https://www.google.com/search?q=${encodeURIComponent(
    careersTerms
  )}`;

  // 3) General Google Jobs
  const googleTerms = [
    `"${title}"`,
    place ? `"${place}"` : "",
    topKw,
    seniorFilter,
    "jobs"
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
  language = "en"
}) {
  const { indeedHref, careersHref, googleHref } = buildSearchQueries({
    goal,
    level,
    city,
    keywords
  });

  const L =
    {
      en: {
        heading: "Find live jobs",
        indeed: "Indeed search",
        careers: "Company career pages",
        google: "Google Jobs"
      },
      ar: {
        heading: "اعثر على وظائف مباشرة",
        indeed: "بحث Indeed",
        careers: "صفحات وظائف الشركات",
        google: "وظائف Google"
      }
    }[language] ||
    {
      heading: "Find live jobs",
      indeed: "Indeed search",
      careers: "Company career pages",
      google: "Google Jobs"
    };

  const dir = language === "ar" ? "rtl" : "ltr";

  return (
    <div
      dir={dir}
      style={{
        marginTop: 12,
        border: "1px solid #eee",
        borderRadius: 8,
        padding: 10
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
    fontWeight: 600
  };
}
