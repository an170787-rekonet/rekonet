import InterviewSimulator from "./InterviewSimulator";

export default function Page({ searchParams }) {
  const assessmentId = searchParams?.assessment_id || "demo";
  const language = searchParams?.language || "en-GB";

  return (
    <main style={{ padding: 20, maxWidth: 820, margin: "0 auto" }}>
      <InterviewSimulator
        assessmentId={assessmentId}
        language={language}
      />
    </main>
  );
}
