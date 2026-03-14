'use client';
import React from 'react';

// Relative imports (your project places components under app/components)
import SummaryBand from '../components/results/SummaryBand';
import GapChips from '../components/results/GapChips';
import RoleRecommendations from '../components/results/RoleRecommendations';

export default function ResultsDemoPage() {
  const example = {
    level: 3,
    score: 68,
    gaps: [
      {
        id: 'confidence',
        label: 'Spoken confidence',
        hint: 'Record a short (30–60s) example talking about a strong moment at work or study.',
        actionText: 'Record 30s example',
        href: '/recorder',
      },
      {
        id: 'evidence',
        label: 'Add evidence for customer focus',
        hint: 'Upload or record one example that shows how you helped a customer or learner.',
        actionText: 'Open evidence',
        href: '/evidence',
      },
      {
        id: 'role-summary',
        label: 'Clear role summary',
        hint: 'Draft a short “What I did” (3 bullet points).',
        actionText: 'Add summary (coming soon)',
        href: null,
      },
    ],
  };

  return (
    <div style={{ maxWidth: 980, margin: '40px auto', padding: '0 16px', fontFamily: 'system-ui, Arial' }}>
      <h1 style={{ marginBottom: 12 }}>Your Results</h1>

      <SummaryBand level={example.level} score={example.score} nextId="actions" />

      <GapChips id="actions" title="Suggested next steps" items={example.gaps} />

      <RoleRecommendations
        score={example.score}
        goalTitle="Recruitment Consultant"
        currentRoles={[
          { id: 'r1', title: 'Recruitment Administrator', link: '/jobs?role=Recruitment+Administrator', note: 'Great fit for your current document and organisation strengths.' },
          { id: 'r2', title: 'Talent Acquisition Assistant', link: '/jobs?role=Talent+Acquisition+Assistant', note: 'Pairs well with your communication and scheduling strengths.' },
          { id: 'r3', title: 'Customer Success Associate', link: '/jobs?role=Customer+Success+Associate', note: 'Highlights your service mindset while you build more recruiting exposure.' },
        ]}
        pathway={[
          { id: 'p1', label: 'Add a short “Why I like working with people” example', hint: 'Record 30–60 seconds showing your people focus.', href: '/recorder', actionText: 'Create quick example' },
          { id: 'p2', label: 'Show a coordination win', hint: 'Add one evidence item where you kept things organised and on time.', href: '/evidence', actionText: 'Add evidence' },
          { id: 'p3', label: 'Polish a 3‑bullet role summary', hint: 'Write “What I did • How I did it • Outcome”.', href: null, actionText: 'Add summary (coming soon)' },
        ]}
      />

      <div style={{ marginTop: 20, fontSize: 12, color: '#666' }}>
        <p><strong>Note:</strong> This is a demo view using example data. We’ll wire this to your real results object next.</p>
      </div>
    </div>
  );
}
``
