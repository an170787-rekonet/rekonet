'use client';
import React from 'react';
import SummaryBand from '@/components/results/SummaryBand';
import GapChips from '@/components/results/GapChips';

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
      <div style={{ marginTop: 20, fontSize: 12, color: '#666' }}>
        <p><strong>Note:</strong> This is a demo view using example data. We’ll wire this to your real results object next.</p>
      </div>
    </div>
  );
}
