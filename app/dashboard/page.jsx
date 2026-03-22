// app/dashboard/page.jsx
"use client";

import React, { Suspense, useEffect, useState } from "react";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <main className="container">
          <div className="my-8">Loading…</div>
        </main>
      }
    >
      <DashboardClient />
    </Suspense>
  );
}

function DashboardClient() {
  const [plan, setPlan] = useState([]);
  const [courses, setCourses] = useState([]);
  const [roles, setRoles] = useState([]);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    // ✅ TEMP: use the same assessment id you used to test the API
    // e.g. /api/plan?id=caa5db40-2c6a-4eb1-8c27-353d6fe18b0a&language=en returned { ok:true, plan:… }
    const assessmentId = "caa5db40-2c6a-4eb1-8c27-353d6fe18b0a";

    async function load() {
      try {
        const res = await fetch(
          `/api/plan?id=${encodeURIComponent(assessmentId)}&language=en`,
          { cache: "no-store" } // always get the latest for now
        );
        const json = await res.json();

        if (res.ok && json?.ok) {
          setPlan([{ label: "This week", items: json.plan.weekly ?? [] }]);
          setCourses(json.plan.courses ?? []);
          setRoles(json.plan.roles ?? []);
          setErrorText("");
        } else {
          setErrorText(json?.error || "Could not load plan.");
        }
      } catch (e) {
        setErrorText(String(e?.message || e));
      }
    }

    load();
  }, []);

  return (
    <main className="container">
      <h1 className="text-2xl font-semibold mb-3">Advisor / Org Dashboard (Preview)</h1>
      <p className="text-sm text-gray-600 mb-6">
        Activations • Completions • Interview Scores • CV Delta • Badges
      </p>

      {errorText ? (
        <div role="alert" className="mb-4 text-red-600">
          {errorText}
        </div>
      ) : null}

      {/* SMART plan */}
      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">SMART plan (this week)</h2>
        {plan.length === 0 ? (
          <p className="text-sm text-gray-600">No plan yet — please refresh in a moment.</p>
        ) : (
          plan.map((band, i) => (
            <div key={i} className="rounded border p-3 mb-3">
              <h3 className="font-semibold mb-1">{band.label}</h3>
              <ul className="list-disc ml-5">
                {(band.items ?? []).map((it, j) => (
                  <li key={j}>
                    {it.text}{" "}
                    <span className="text-gray-500">
                      {typeof it.minutes === "number" ? `(${it.minutes} min)` : null}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>

      {/* Micro‑courses */}
      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">Micro‑courses</h2>
        {courses.length === 0 ? (
          <p className="text-sm text-gray-600">No suggestions yet.</p>
        ) : (
          <ul className="list-disc ml-5">
            {courses.map((c, i) => (
              <li key={i}>
                {c.title}{" "}
                <span className="text-gray-500">
                  {typeof c.minutes === "number" ? `— ${c.minutes} min · ` : "— "}
                  {c.funded ? "funded" : "unfunded"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Roles */}
      <section>
        <h2 className="text-xl font-medium mb-2">Roles you can apply for now</h2>
        {roles.length === 0 ? (
          <p className="text-sm text-gray-600">No role suggestions yet.</p>
        ) : (
          <ul className="list-disc ml-5">
            {roles.map((r, i) => (
              <li key={i}>
                <a className="underline" href={r.url} target="_blank" rel="noreferrer">
                  {r.title}
                </a>{" "}
                <span className="text-gray-500">{r.source ? `(${r.source})` : ""}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
