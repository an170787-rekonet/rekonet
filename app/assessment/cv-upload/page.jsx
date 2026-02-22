import { Suspense } from 'react';
import ClientCvUpload from './ClientCvUpload';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Page() {
  return (
    <Suspense fallback={<main style={{ padding: 24 }}>Loading…</main>}>
      <ClientCvUpload />
    </Suspense>
  );
}
