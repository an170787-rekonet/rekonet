// app/assessment/result/components/CvInsights.jsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * CvInsights
 * - Lets the user upload a CV file (pdf/doc/docx) OR paste CV text
 * - Sends to /api/cv/parse (FormData for file, JSON for pasted text)
 * - Then pulls summary from /api/cv/summary?user_id=...&language=...
 * - Renders top keywords & sectors once available
 *
 * Props:
 *   userId: string | null
 *   language: "en" | "ar"
 */
export default function CvInsights({ userId, language = "en" }) {
  const isRTL = language === "ar";
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [summary, setSummary] = useState(null);

  // UI state for paste/upload
  const [pasted, setPasted] = useState("");
  const [file, setFile] = useState(null);
  const dropRef = useRef(null);

  const L = useMemo(
    () => ({
      heading: {
        en: "CV insights",
        ar: "لمحات من السيرة الذاتية",
      },
      emptyTitle: {
        en: "No CV uploaded yet.",
        ar: "لم يتم رفع سيرة ذاتية بعد.",
      },
      emptyLead: {
        en: "Add your CV to see personalised insights.",
        ar: "أضف سيرتك الذاتية لعرض لمحات مخصصة.",
      },
      uploadBtn: {
        en: "Upload CV (PDF/DOC/DOCX)",
        ar: "رفع السيرة الذاتية (PDF/DOC/DOCX)",
      },
      or: { en: "or", ar: "أو" },
      pasteLabel: {
        en: "Paste CV text (optional)",
        ar: "ألصق نص السيرة الذاتية (اختياري)",
      },
      analyze: { en: "Analyze CV", ar: "تحليل السيرة الذاتية" },
      parsing: { en: "Parsing…", ar: "جاري التحليل…" },
      topKeywords: { en: "Top keywords", ar: "أهم الكلمات" },
      sectors: { en: "Sectors", ar: "القطاعات" },
      tryAnother: { en: "Upload another CV", ar: "رفع سيرة ذاتية أخرى" },
      change: { en: "Change file", ar: "تغيير الملف" },
      dragHint: { en: "Drag & drop your CV here", ar: "اسحب وأفلت سيرتك الذاتية هنا" },
      max: { en: "Max 5MB", ar: "الحد الأقصى 5MB" },
      errorGeneric: { en: "Something went wrong. Please try again.", ar: "حدث خطأ ما. يرجى المحاولة مرة أخرى." },
    }),
    [language]
  );

  // Load existing summary (if any)
  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!userId) return;
      try {
        const r = await fetch(
          `/api/cv/summary?user_id=${encodeURIComponent(userId)}&language=${encodeURIComponent(
            (language || "en").toLowerCase()
          )}`,
          { cache: "no-store" }
        );
        const j = await r.json();
        if (!ignore) setSummary(j?.ok ? j : null);
      } catch {
        // ignore
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [userId, language]);

  // Drag & drop wiring
  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;
    const prevent = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const onDrop = (e) => {
      prevent(e);
      if (!e.dataTransfer?.files?.length) return;
      const f = e.dataTransfer.files[0];
      if (isAllowed(f)) setFile(f);
    };
    ["dragenter", "dragover", "dragleave", "drop"].forEach((evt) =>
      el.addEventListener(evt, prevent)
    );
    el.addEventListener("drop", onDrop);
    return () => {
      ["dragenter", "dragover", "dragleave", "drop"].forEach((evt) =>
        el.removeEventListener(evt, prevent)
      );
      el.removeEventListener("drop", onDrop);
    };
  }, []);

  function isAllowed(f) {
    if (!f) return false;
    const okTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const ok =
      okTypes.includes(f.type) ||
      /\.pdf$/i.test(f.name) ||
      /\.docx?$/i.test(f.name);
    return ok && f.size <= 5 * 1024 * 1024; // 5MB
  }

  async function handleAnalyze() {
    if (!userId) {
      setErr("No user id.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      let ok = false;

      // 1) If a file is selected, use FormData
      if (file && isAllowed(file)) {
        const fd = new FormData();
        fd.append("user_id", userId);
        fd.append("language", (language || "en").toLowerCase());
        fd.append("file", file);
        const r = await fetch("/api/cv/parse", { method: "POST", body: fd });
        const j = await r.json();
        ok = !!j?.ok;
      }

      // 2) If no file (or additionally), but pasted text exists, send JSON
      if (!ok && pasted.trim().length > 0) {
        const r = await fetch("/api/cv/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            language: (language || "en").toLowerCase(),
            text: pasted.trim(),
          }),
        });
        const j = await r.json();
        ok = !!j?.ok;
      }

      // 3) If parse worked, pull summary
      if (ok) {
        const r2 = await fetch(
          `/api/cv/summary?user_id=${encodeURIComponent(userId)}&language=${encodeURIComponent(
            (language || "en").toLowerCase()
          )}`,
          { cache: "no-store" }
        );
        const j2 = await r2.json();
        if (j2?.ok) {
          setSummary(j2);
        } else {
          setErr(L.errorGeneric[language]);
        }
      } else {
        setErr(L.errorGeneric[language]);
      }
    } catch {
      setErr(L.errorGeneric[language]);
    } finally {
      setBusy(false);
    }
  }

  // ---------- UI ----------
  return (
    <section
      dir={isRTL ? "rtl" : "ltr"}
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        background: "#fff",
        padding: 12,
        margin: "12px 0",
      }}
    >
      <header style={{ marginBottom: 8 }}>
        <strong>{L.heading[language]}</strong>
      </header>

      {/* EMPTY STATE with upload + paste */}
      {!summary && (
        <div
          style={{
            border: "1px dashed #d1d5db",
            borderRadius: 8,
            padding: 16,
            background: "#fafafa",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 4 }}>
            {L.emptyTitle[language]}
          </div>
          <div style={{ color: "#6b7280", marginBottom: 12 }}>
            {L.emptyLead[language]}
          </div>

          {/* Dropzone + button */}
          <div
            ref={dropRef}
            style={{
              padding: 16,
              border: "1px dashed #cbd5e1",
              borderRadius: 8,
              background: "#fff",
              textAlign: "center",
            }}
          >
            <div style={{ color: "#334155", marginBottom: 8 }}>
              {L.dragHint[language]} — {L.max[language]}
            </div>

            <label
              style={{
                display: "inline-block",
                padding: "10px 14px",
                background: "#111827",
                color: "#fff",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              {file ? L.change[language] : L.uploadBtn[language]}
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                style={{ display: "none" }}
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  if (isAllowed(f)) setFile(f);
                }}
              />
            </label>

            {file && (
              <div style={{ marginTop: 8, fontSize: 12, color: "#475569" }}>
                Selected: <strong>{file.name}</strong>
              </div>
            )}
          </div>

          {/* OR */}
          <div
            style={{
              textAlign: "center",
              color: "#6b7280",
              fontSize: 12,
              margin: "10px 0",
            }}
          >
            {L.or[language]}
          </div>

          {/* Paste textarea */}
          <div>
            <label style={{ fontSize: 12, color: "#374151" }}>
              {L.pasteLabel[language]}
            </label>
            <textarea
              value={pasted}
              onChange={(e) => setPasted(e.target.value)}
              rows={6}
              placeholder={language === "ar" ? "ألصق النص هنا…" : "Paste text here…"}
              style={{
                width: "100%",
                marginTop: 6,
                padding: 10,
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                resize: "vertical",
                direction: isRTL ? "rtl" : "ltr",
              }}
            />
          </div>

          {/* Analyze */}
          <div style={{ marginTop: 10 }}>
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={busy || (!file && pasted.trim().length === 0) || !userId}
              style={{
                padding: "8px 12px",
                background: "#2563EB",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontWeight: 700,
                cursor: busy ? "not-allowed" : "pointer",
                opacity: busy ? 0.75 : 1,
              }}
            >
              {busy ? L.parsing[language] : L.analyze[language]}
            </button>
            {err && (
              <div style={{ color: "#b91c1c", marginTop: 8, fontSize: 12 }}>{err}</div>
            )}
          </div>
        </div>
      )}

      {/* SUMMARY */}
      {summary && (
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: 12,
            background: "#fff",
          }}
        >
          {/* Keywords */}
          <div style={{ marginTop: 4 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>
              {L.topKeywords[language]}
            </div>
            {Array.isArray(summary.topKeywords) && summary.topKeywords.length > 0 ? (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {summary.topKeywords.map((k, i) => (
                  <span
                    key={`kw-${i}`}
                    style={{
                      background: "#f1f5f9",
                      border: "1px solid #e5e7eb",
                      padding: "4px 8px",
                      borderRadius: 999,
                      fontSize: 12,
                      color: "#1f2937",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {k}
                  </span>
                ))}
              </div>
            ) : (
              <div style={{ color: "#6b7280", fontSize: 12 }}>—</div>
            )}
          </div>

          {/* Sectors */}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>
              {L.sectors[language]}
            </div>
            {Array.isArray(summary.sectors) && summary.sectors.length > 0 ? (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {summary.sectors.map((s, i) => (
                  <span
                    key={`sec-${i}`}
                    style={{
                      background: "#fff7ed",
                      border: "1px solid #fde68a",
                      padding: "4px 8px",
                      borderRadius: 999,
                      fontSize: 12,
                      color: "#92400E",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <div style={{ color: "#6b7280", fontSize: 12 }}>—</div>
            )}
          </div>

          {/* CTA to upload another */}
          <div style={{ marginTop: 12 }}>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setPasted("");
                setSummary(null);
                setErr("");
              }}
              style={{
                padding: "6px 10px",
                background: "#F3F4F6",
                border: "1px solid #E5E7EB",
                borderRadius: 8,
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              {L.tryAnother[language]}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
