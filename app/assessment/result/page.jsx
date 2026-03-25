// app/assessment/result/page.jsx
"use client";

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import SummaryBand from "../../components/results/SummaryBand";
import GapChips from "../../components/results/GapChips";
import RoleRecommendations from "../../components/results/RoleRecommendations";

export default function AssessmentResultPage() {
  return (
    <Suspense
      fallback={
        <main className="container">
          <div className="my-8">Loading your result…</div>
        </main>
      }
    >
      <ResultContent />
    </Suspense>
  );
}

function ResultContent() {
  const sp = useSearchParams();
  const router = useRouter();

  const qs = useMemo(() => new URLSearchParams(sp?.toString() ?? ""), [sp]);
  const assessmentId = qs.get("id");
  const language = (qs.get("language") || "en").toLowerCase();
  const openTarget = qs.get("open");

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [justScrolled, setJustScrolled] = useState(false);
  const [jumpMsg, setJumpMsg] = useState("");

  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [evMsg, setEvMsg] = useState("");
  const [evBusy, setEvBusy] = useState(false);

  const [finishBusy, setFinishBusy] = useState(false);

  // ✅ NEW: Availability summary state
  const [availabilitySummary, setAvailabilitySummary] = useState("");

  const pathwayRef = useRef(null);

  const flashHighlight = useCallback(() => {
    setJustScrolled(true);
    setJumpMsg("Jumped to your pathway");
    setTimeout(() => {
      setJustScrolled(false);
      setJumpMsg("");
    }, 900);
  }, []);

  const scrollToPathway = useCallback(() => {
    const el = pathwayRef.current || document.getElementById("pathway");
    if (!el || typeof window === "undefined") return;

    const OFFSET = 120;
    const rect = el.getBoundingClientRect();
    const currentY =
      window.pageYOffset || document.documentElement.scrollTop || 0;
    let targetTop = currentY + rect.top - OFFSET;

    const MIN_DELTA = 80;
    if (Math.abs(targetTop - currentY) < MIN_DELTA) {
      targetTop = currentY + (rect.top >= 0 ? MIN_DELTA : -MIN_DELTA);
    }

    window.scrollTo({ top: targetTop, behavior: "smooth" });

    setTimeout(() => el?.focus?.(), 350);
    flashHighlight();
  }, [flashHighlight]);

  const handleGoToPathway = useCallback(
    (e) => {
      e.preventDefault();
      scrollToPathway();
    },
    [scrollToPathway]
  );

  // === Quick Evidence Add ===
  const handleAddEvidence = useCallback(async () => {
    setEvMsg("");
    const url = evidenceUrl.trim();

    if (!url) {
      setEvMsg("Please paste a link to add as evidence.");
      return;
    }
    if (!assessmentId) {
      setEvMsg("Missing assessment id.");
      return;
    }

    try {
      setEvBusy(true);
      const res = await fetch("/api/evidence/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessment_id: assessmentId, url }),
      });
      const json = await res.json();

      if (res.ok && json?.ok) {
        setEvMsg("Added to your evidence — well done!");
        setEvidenceUrl("");
      } else {
        setEvMsg(json?.error || "Sorry — could not add evidence.");
      }
    } catch (e) {
      setEvMsg(String(e?.message || e));
    } finally {
      setEvBusy(false);
    }
  }, [assessmentId, evidenceUrl]);

  // === Finish For Now ===
  const finishForNow = useCallback(async () => {
    if (!assessmentId) return;
    try {
      setFinishBusy(true);
      await fetch("/api/journey/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessment_id: assessmentId,
          step_key: "dashboard",
          payload: { from: "result" },
        }),
      });
      router.push("/dashboard");
    } finally {
      setFinishBusy(false);
    }
  }, [assessmentId, router]);

  // === Load result ===
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        if (!assessmentId) {
          setError("Missing assessment id");
          setLoading(false);
          return;
        }
        setLoading(true);
        const res = await fetch(
          `/api/assessment/result?id=${encodeURIComponent(
            assessmentId
          )}&language=${encodeURIComponent(language)}`
        );
        const json = await res.json();
        if (cancelled) return;

        if (res.ok && json?.ok) {
          setResult(json.result ?? null);
          setError("");
        } else {
          setError(json?.error || "Unable to load result");
        }
      } catch (e) {
        if (!cancelled) setError(String(e?.message || e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [assessmentId, language]);

  // === ✅ NEW: Load Availability Summary ===
  useEffect(() => {
    async function loadAvailability() {
      if (!assessmentId) return;
      try {
        const res = await fetch(`/api/availability/get?id=${assessmentId}`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (res.ok && json?.ok) {
          const notes = json.availability?.availability?.notes ?? "";
          if (notes) setAvailabilitySummary(notes);
        }
      } catch {}
    }
    loadAvailability();
  }, [assessmentId]);

  // === After returning from availability page ===
  useEffect(() => {
    if (openTarget === "availability") {
      scrollToPathway();
    }
  }, [openTarget, scrollToPathway]);

  if (loading) {
    return (
      <main className="container">
        <div className="my-8">Loading your result…</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container">
        <div role="alert" className="my-8 text-red-600">
          {error}
        </div>
      </main>
    );
  }

  const pathway = result?.pathway ?? [];

  return (
    <main className="container" style={{ scrollBehavior: "smooth" }}>
      <header className="mb-6">
        <SummaryBand
          level={result?.level}
          score={result?.score}
          goalTitle={result?.goal_title}
          language={language}
        />

        {/* ✅ NEW AVAILABILITY SUMMARY BAND */}
        {availabilitySummary ? (
          <div className="mt-3 rounded border p-3 bg-blue-50 text-sm">
            <strong>Availability saved:</strong> {availabilitySummary}
          </div>
        ) : null}

        {/* Top actions */}
        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleGoToPathway}
            className="btn btn-primary"
            aria-describedby="pathway"
          >
            View your suggested pathway
          </button>

          {jumpMsg ? (
            <span
              className="text-sm"
              style={{ color: "#2563eb", marginLeft: "6px" }}
              aria-live="polite"
            >
              {jumpMsg}
            </span>
          ) : null}

          <button
            type="button"
            onClick={finishForNow}
            className="btn btn-outline"
            disabled={finishBusy}
          >
            {finishBusy ? "Saving…" : "Finish for now"}
          </button>
        </div>
      </header>

      <section className="mb-8" aria-label="Suggested next steps overview">
        <GapChips result={result} />
      </section>

      <section className="mb-10" aria-label="Role recommendations">
        <RoleRecommendations items={result?.role_suggestions ?? []} />
      </section>

      <section className="mb-6" aria-label="Quick evidence add">
        <h4 className="text-lg font-medium mb-2">Add a quick piece of evidence</h4>
        <p className="text-sm text-gray-600 mb-2">
          Paste a link that shows your progress (a document, portfolio item, or anything
          you’re proud of).
        </p>
        <div className="flex items-center gap-2">
          <input
            type="url"
            value={evidenceUrl}
            onChange={(e) => setEvidenceUrl(e.target.value)}
            placeholder="https://example.com/my-proof"
            className="border rounded px-3 py-2 w-full max-w-xl"
            aria-label="Evidence link"
          />
          <button
            type="button"
            onClick={handleAddEvidence}
            className="btn btn-secondary"
            disabled={evBusy}
          >
            {evBusy ? "Adding…" : "Add to my evidence"}
          </button>
        </div>
        {evMsg ? <div className="mt-2 text-sm">{evMsg}</div> : null}
      </section>

      <div className="mb-10">
        <Link
          href={`/availability?id=${encodeURIComponent(
            assessmentId || ""
          )}&language=${encodeURIComponent(language)}`}
          className="btn btn-outline"
        >
          Set my availability
        </Link>
      </div>

      <section aria-label="Suggested pathway" className="mb-14">
        <h3
          id="pathway"
          ref={pathwayRef}
          tabIndex={-1}
          className="text-xl font-semibold mb-4"
          style={{
            outline: justScrolled ? "3px solid #3b82f6" : "none",
            outlineOffset: justScrolled ? "4px" : "0",
            scrollMarginTop: "120px",
          }}
        >
          Your suggested pathway
        </h3>

        {Array.isArray(pathway) && pathway.length > 0 ? (
          <div className="space-y-6">
            {pathway.map((band, idx) => (
              <div key={band?.label ?? idx} className="rounded-lg border p-4">
                <h4 className="text-lg font-medium">{band?.label}</h4>
                <ul className="list-disc ml-6 mt-2">
                  {(band?.steps ?? []).map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            We’ll suggest a simple set of actions to help you keep momentum. (No wrong
            answers — just next steps.)
          </p>
        )}
      </section>
    </main>
  );
}
``
