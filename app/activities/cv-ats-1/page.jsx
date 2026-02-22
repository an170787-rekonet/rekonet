import { Suspense } from 'react';
import ClientCvAts from './ClientCvAts';

// Make sure this route never tries to prerender statically
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Page() {
  return (
    <Suspense fallback={<main style={{ padding: 24 }}>Loading…</main>}>
      <ClientCvAts />
    </Suspense>
  );
}
