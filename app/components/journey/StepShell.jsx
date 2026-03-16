// app/components/journey/StepShell.jsx
"use client";

import React from "react";

export default function StepShell({
  stepIndex,
  totalSteps,
  title,
  subtitle,
  children,
  primaryLabel = "Continue",
  onPrimary,
  secondaryLabel,
  onSecondary,
  footer,
  disabled = false,
}) {
  return (
    <section
      aria-label={`Step ${stepIndex + 1} of ${totalSteps}`}
      className="max-w-3xl mx-auto p-4 sm:p-6"
    >
      <header className="mb-4">
        <p className="text-sm text-gray-600">
          Step {stepIndex + 1} of {totalSteps}
        </p>
        <h2 className="text-2xl font-semibold mt-1">{title}</h2>
        {subtitle && <p className="text-gray-700 mt-2">{subtitle}</p>}
      </header>

      <div className="bg-white border rounded-lg p-4 sm:p-6 shadow-sm">
        {children}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {onPrimary && (
          <button
            onClick={onPrimary}
            disabled={disabled}
            className={
              "inline-flex items-center justify-center rounded-md px-4 py-2 text-white " +
              "bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            }
          >
            {primaryLabel}
          </button>
        )}
        {onSecondary && (
          <button
            onClick={onSecondary}
            className="inline-flex items-center justify-center rounded-md px-4 py-2 border border-gray-300 hover:bg-gray-50"
          >
            {secondaryLabel}
          </button>
        )}
      </div>

      {footer && <div className="mt-3 text-sm text-gray-600">{footer}</div>}
    </section>
  );
}
