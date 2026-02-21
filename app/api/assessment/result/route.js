function flightPathFor(category, avg) {
  const L = levelFromAvg(avg).n;
  const base = {
    cv: {
      1: {
        headline: 'Start with one quick CV win',
        description: 'Use a clean template and add two short bullet points that show your impact.',
      },
      2: {
        headline: 'Tailor your CV in 15 minutes',
        description: 'Pick one job ad and match your top 3 bullets to its keywords.',
      },
      3: {
        headline: 'Proof and polish',
        description: 'Run a spell/grammar check and ask one person for a small suggestion.',
      },
      4: {
        headline: 'Show impact upfront',
        description: 'Move your strongest results to the top section of page one.',
      },
    },
    interview: {
      1: {
        headline: 'Build your first example',
        description: 'Write a short story about a time you solved a problem.',
      },
      2: {
        headline: 'Practice one core question',
        description: 'Record a 60‑second answer to “Tell me about yourself” and listen once.',
      },
      3: {
        headline: 'Add a clear result',
        description: 'End your story with one result and one thing you learned.',
      },
      4: {
        headline: 'Rotate your stories',
        description: 'Keep three short stories and swap which one you lead with.',
      },
    },
    skills: {
      1: {
        headline: 'Name your top strengths',
        description: 'Write 2–3 strengths and one example for each.',
      },
      2: {
        headline: 'Collect quick examples',
        description: 'Add one sentence that shows your part in the result.',
      },
      3: {
        headline: 'Match to job keywords',
        description: 'Link your strengths to a real job ad you like.',
      },
      4: {
        headline: 'Show how you apply them',
        description: 'Add a short “how I use this” line for each strength.',
      },
    },
    jobsearch: {
      1: {
        headline: 'Pick two places to look',
        description: 'Choose two job boards or groups and bookmark them.',
      },
      2: {
        headline: 'Light weekly check',
        description: 'Spend 10–15 minutes once a week to scan and save roles.',
      },
      3: {
        headline: 'Simple tracking',
        description: 'Note job title, link, and one reason it fits you.',
      },
      4: {
        headline: 'Personal touch',
        description: 'Send one short message to someone who works in a team you like.',
      },
    },
  };
  const steps = base[category] || {};
  const pick =
    steps[L] ||
    steps[2] ||
    { headline: 'Next small step', description: 'Choose one simple action you can take this week.' };
  return { level: L, ...pick };
}
