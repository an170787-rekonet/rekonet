// RESULTS CATEGORY CONFIGURATION (v26)
// Single source of truth for Results UI

export const RESULTS_CATEGORIES = {
  general: {
    label: "Overall employability",
    order: 1,
    description: "Confidence, readiness, and self-direction"
  },
  literacy: {
    label: "Literacy & communication",
    order: 2,
    description: "Reading, writing, and understanding information"
  },
  digital: {
    label: "Digital skills",
    order: 3,
    description: "Using digital tools safely and effectively"
  },
  behaviour: {
    label: "Work behaviours",
    order: 4,
    description: "Reliability, teamwork, and problem-solving"
  }
} as const;

export type ResultsCategory = keyof typeof RESULTS_CATEGORIES;

export const RESULTS_CATEGORY_KEYS = Object.keys(
  RESULTS_CATEGORIES
) as ResultsCategory[];

export function isValidResultsCategory(value: string): value is ResultsCategory {
  return value in RESULTS_CATEGORIES;
}
