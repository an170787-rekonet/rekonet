// app/availability/page.jsx
"use client";

import React, { Suspense, useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AvailabilityPage() {
  return (
    <Suspense fallback={
      <main className="container"><div className="my-8">Loading…</div></main>
    }>
      <AvailabilityClient />
    </Suspense>
  );
}

function AvailabilityClient() {
  const sp = useSearchParams();
  const router = useRouter();

  // read ?id=<uuid>&language=<code>
  const qs = useMemo(() => new URLSearchParams(sp?.toString() ?? ""), [sp]);
  const assessmentId = qs.get("id");
  const language = (qs.get("language") || "en").toLowerCase();

  // simple UI: free‑text notes for now (you can expand to checkboxes later)
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSave = useCallback(async () => {
    setMsg("");
    if (!assessmentId) {
      setMsg("Missing assessment id.");
      return;
    }
    try {
      setBusy(true);
      const payload = {
        assessment_id: assessmentId,
        availability: { notes } // store as JSON for now
      };
      const res = await fetch("/api/availability/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && json?.ok) {
        // Redirect back to Results hub with open=availability
        router.push(
          `/assessment/result?id=${encodeURIComponent(assessmentId)}&language=${encodeURIComponent(language)}&open=availability`
        );
      } else {
        setMsg(json?.error || "Sorry — could not save availability.");
      }
    } catch (e) {
      setMsg(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }, [assessmentId, language, notes, router]);

  return (
    <main className="container">
      <h1 className="text-2xl font-semibold mb-4">Your availability</h1>
      <p className="text-sm text-gray-600 mb-4">
        Add a quick note about when you can usually meet or work this week.
      </p>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="e.g. Mon–Wed mornings, Thu afternoon"
        rows={5}
        className="border rounded w-full max-w-2xl px-3 py-2"
      />

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          className="btn btn-primary"
          disabled={busy}
        >
          {busy ? "Saving…" : "Save"}
        </button>
        {msg ? <span className="text-sm ml-2">{msg}</span> : null}
      </div>
    </main>
  );
}
