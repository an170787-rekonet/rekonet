// app/availability/page.jsx
"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic";

function AvailabilityInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const qs = sp.toString();
  const backHref = qs ? `/assessment/result?${qs}` : "/assessment/result";

  return (
    <main style={{ background: "#f9fafb", minHeight: "100vh" }}>
      <section className="max-w-3xl mx-auto p-4">
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Availability</h1>
        <p style={{ color: "#374151", marginTop: 8 }}>
          Set days and times that work best for you.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert("Save availability — scaffold page.");
            router.push(backHref);
          }}
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 16,
            marginTop: 12,
          }}
        >
          <label style={{ display: "block", fontWeight: 600, marginBottom: 8 }}>
            Working pattern
          </label>
          <select>
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Evenings</option>
          </select>

          <div style={{ height: 12 }} />

          <button
            type="submit"
            style={{
              background: "#000",
              color: "#fff",
              borderRadius: 8,
              padding: "10px 16px",
            }}
          >
            Save
          </button>
        </form>
      </section>
    </main>
  );
}

export default function AvailabilityPage() {
  // ✅ Wrap the hook-using component with Suspense
  return (
    <Suspense fallback={<div />}>
      <AvailabilityInner />
    </Suspense>
  );
}
