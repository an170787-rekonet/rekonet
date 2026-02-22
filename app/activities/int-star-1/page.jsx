import { Suspense } from 'react';
import ClientIntStar from './ClientIntStar';

// Make sure this route never tries to prerender statically
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Page() {
  return (
    <Suspense fallback={<main style={{ padding: 24 }}>Loading…</main>}>
      <ClientIntStar />
    </Suspense>
  );
}
