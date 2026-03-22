// app/dashboard/page.jsx
"use client";
import React, { Suspense, useEffect, useState } from "react";

export default function DashboardPage() {
  return (
    <Suspense fallback={<main className="container"><div className="my-8">Loading…</div></main>}>
      <DashboardClient />
    </Suspense>
  );
}

function DashboardClient() {
  // v1 seed — replace with real plan/jobs later
  const [plan, setPlan] = useState([]);
  const [courses, setCourses] = useState([]);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    setPlan([
      { label: "This week", items: [
        { text: "Add 1 evidence note", minutes: 5 },
        { text: "Tweak CV summary to match target role", minutes: 10 },
        { text: "Apply to 2 roles", minutes: 30 },
      ]},
    ]);
    setCourses([
      { title: "Customer Service Basics", minutes: 25, funded: false },
      { title: "Interview STAR Mini", minutes: 15, funded: false },
    ]);
    setRoles([
      { title: "Retail Assistant", url: "#", source: "Indeed" },
      { title: "Warehouse Operative", url: "#", source: "Reed" },
    ]);
  }, []);

  return (
    <main className="container">
      <h1 className="text-2xl font-semibold mb-3">Advisor / Org Dashboard (Preview)</h1>
      <p className="text-sm text-gray-600 mb-6">Activations • Completions • Interview Scores • CV Delta • Badges</p>

      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">SMART plan (this week)</h2>
        {plan.map((band, i) => (
          <div key={i} className="rounded border p-3 mb-3">
            <h3 className="font-semibold mb-1">{band.label}</h3>
            <ul className="list-disc ml-5">
              {band.items.map((it, j) => (
                <li key={j}>
                  {it.text} <span className="text-gray-500">({it.minutes} min)</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">Micro‑courses</h2>
        <ul className="list-disc ml-5">
          {courses.map((c, i) => (
            <li key={i}>
              {c.title} — <span className="text-gray-500">{c.minutes} min · {c.funded ? "funded" : "unfunded"}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-medium mb-2">Roles you can apply for now</h2>
        <ul className="list-disc ml-5">
          {roles.map((r, i) => (
            <li key={i}>
              <a className="underline" href={r.url} target="_blank" rel="noreferrer">{r.title}</a>
              <span className="text-gray-500"> ({r.source})</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
