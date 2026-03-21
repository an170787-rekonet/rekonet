"use client";
import React, { Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export const dynamic = "force-dynamic"; // Important for stabilisation

function Guard({ children }) {
  const sp = useSearchParams();
  const router = useRouter();
  const qs = useMemo(() => new URLSearchParams(sp?.toString() || ""), [sp]);

  const id = qs.get("assessment_id");
  const lang = qs.get("language");

  // If either is missing → send user back to language page
  if (!id || !lang) {
    if (typeof window !== "undefined") {
      router.replace("/assessment/language");
    }
    return <div />;
  }

  return <>{children}</>;
}

export default function QuestionsPage() {
  return (
    <Suspense fallback={<div />}>
      <Guard>
        {/* YOUR existing Questions UI stays here */}
      </Guard>
    </Suspense>
  );
}
