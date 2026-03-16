// app/components/journey/ProgressBar.jsx
"use client";

import React from "react";

export default function ProgressBar({ value, max }) {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full bg-green-500 transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}
