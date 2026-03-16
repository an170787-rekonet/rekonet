// app/components/journey/useJourneyProgress.js
"use client";

import { useEffect, useState } from "react";

const KEY = "rekonet_results_step";

export function useJourneyProgress(initial = 0) {
  const [step, setStep] = useState(initial);

  useEffect(() => {
    const saved = Number(window.localStorage.getItem(KEY));
    if (!Number.isNaN(saved) && saved >= 0) setStep(saved);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(KEY, String(step));
  }, [step]);

  return [step, setStep];
}
