// app/assessment/result/components/LiveJobsLinks.jsx
"use client";

// NOTE: External links use a plain <a> to avoid Next.js client-side routing side-effects.
// import Link from "next/link"; // not needed

// Detect common UK postcode patterns
const UK_POSTCODE_REGEX =
  /\b([A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}|GIR ?0AA)\b/i;

function pickRadius(place) {
  if (!place) return null;
  return UK_POSTCODE_REGEX.test(place) ? 0 : 10; // exact for postcodes, wider for towns
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

function indeedJobTypeParam(availability) {
  const c = (availability?.contract || "").toLowerCase();
  if (c === "part_time") return "parttime";
  // extendable: fulltime, contract, temporary, internship
  return null;
}

function buildSearchQueries({ goal, level, city, keywords = [], availability }) {
  const title = (goal || "").trim();
  const place = (city || "").trim();

  const { positives: lvlPos, negatives: lvlNeg } = levelTokens(level);
  const syns = roleSynonyms(title);
  const skills = (keywords || []).slice(0, 5);
  const avail = availabilityTerms(availability);

  const titleQuoted = title ? `"${title}"` : "";

  // ----- Indeed UK (co.uk) — stable + anti-rewrite params -----
  const indeedParts = [
    titleQuoted,
    ...syns,
    ...skills,
    ...lvlPos,
    ...lvlNeg,
    ...avail,
  ].filter(Boolean);

  const indeedQ = encodeURIComponent(
    (indeedParts.length ? indeedParts : [titleQuoted]).join(" ").trim()
  );

  const radius = pickRadius(place);
  const l = place ? encodeURIComponent(place) : "";
  const jt = indeedJobTypeParam(availability);

  // Stable UK endpoint (co.uk)
  const indeedBase = "https://www.indeed.co.uk/jobs";
  const params = [
    `q=${indeedQ}`,
    l ? `l=${l}` : null,
    radius != null ? `radius=${radius}` : null,
    "sort=date",
    "fromage=7",
    jt ? `jt=${jt}` : null,
    // Anti-rewrite stabilisers (harmless, help preserve query on redirects)
    "vjk=",
    "filter=0",
    "wfh=0",
    "start=0",
  ]
    .filter(Boolean)
    .join("&");

  const indeedHref = `${indeedBase}?${params}`;

  // ----- Careers via Google operators -----
  const careersOps = [
    "site:workdayjobs.com",
    "site:greenhouse.io",
    "site:lever.co",
  ].join(" OR ");

  const careersTerms = [
    careersOps,
    titleQuoted,
    place ? `"${place}"` : "",
    ...skills,
    ...avail,
    ...lvlNeg,
  ]
    .filter(Boolean)
    .join(" ");

  const careersHref = `https://www.google.com/search?q=${encodeURIComponent(
    careersTerms
  )}`;

  // ----- Google jobs-leaning search -----
  const googleTerms = [
    titleQuoted,
    place ? `"${place}"` : "",
    ...syns.slice(0, 2),
    ...skills,
    ...avail,
    ...lvlNeg,
    "(job OR jobs)",
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
  availability,
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
        google: "Google (jobs)",
      },
      ar: {
        heading: "اعثر على وظائف مباشرة",
        indeed: "بحث Indeed (المملكة المتحدة)",
        careers: "صفحات وظائف الشركات",
        google: "بحث Google (وظائف)",
      },
    }[language] ||
    {
      heading: "Find live jobs",
      indeed: "Indeed (UK)",
      careers: "Company career pages",
      google: "Google (jobs)",
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
        {/* External links use <a> for clean, direct navigation */}
        <a
          href={indeedHref}
          target="_blank"
          rel="noopener noreferrer"
          style={chipStyle("#F3F4F6")}
        >
          {L.indeed}
        </a>
        <a
          href={careersHref}
          target="_blank"
          rel="noopener noreferrer"
          style={chipStyle("#E5F2FF")}
        >
          {L.careers}
        </a>
        <a
          href={googleHref}
          target="_blank"
          rel="noopener noreferrer"
          style={chipStyle("#F1F5F9")}
        >
          {L.google}
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
