// app/cv/page.jsx
"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";

export default function CvToolsPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const qs = sp.toString();
  const backHref = qs ? `/assessment/result?${qs}` : "/assessment/result";

  return (
    <main style={{ background: "#f9fafb", minHeight: "100vh" }}>
      <section className="max-w-3xl mx-auto p-4">
        <header className="mb-4">
          <p style={{ color: "#6b7280", fontSize: 12 }}>
            Language: {(sp.get("language") || sp.get("lang") || "en").toUpperCase()}
          </p>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>CV tools (beta)</h1>
          <p style={{ color: "#374151", marginTop: 8 }}>
            Add your CV to see supportive insights. You can paste text or upload a file.
          </p>
        </header>

        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("CV analysis coming next — this is a scaffold page.");
            }}
          >
            <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
              Upload CV (PDF/DOC/DOCX)
            </label>
            <input type="file" accept=".pdf,.doc,.docx" />
            <p style={{ color: "#6b7280", fontSize: 12, marginTop: 6 }}>
              Max ~5MB (adjust in implementation).
            </p>

            <div style={{ height: 16 }} />

            <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
              Or paste CV text
            </label>
            <textarea
              placeholder="Paste your CV text here…"
              rows={8}
              style={{
                width: "100%",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: 10,
              }}
            />

            <div style={{ height: 16 }} />

            <button
              type="submit"
              style={{
                background: "#000",
                color: "#fff",
                borderRadius: 8,
                padding: "10px 16px",
              }}
            >
              Analyze CV
            </button>
          </form>
        </div>

        <div style={{ marginTop: 16 }}>
          <button
            onClick={() => router.push(backHref)}
            style={{
              background: "#fff",
              border: "1px solid #d1d5db",
              borderRadius: 8,
              padding: "10px 16px",
            }}
          >
            Back to results
          </button>
        </div>
      </section>
    </main>
  );
}
``
