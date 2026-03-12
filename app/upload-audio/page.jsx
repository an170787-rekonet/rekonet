'use client';

import { useState } from 'react';

export default function UploadAudioTest() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleUpload(e) {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!file) {
      setError('Choose an audio file first.');
      return;
    }

    try {
      setLoading(true);
      const form = new FormData();
      form.append('file', file);
      form.append('user_id', 'anon');        // replace with a real user id later if needed
      form.append('duration_ms', '0');

      const res = await fetch('/api/upload-audio', { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || 'Upload failed');
      setResult(json);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 560, margin: '32px auto', padding: 16 }}>
      <h1>Upload Audio (Test)</h1>
      <p>Pick a small audio file and send it to <code>/api/upload-audio</code>.</p>

      <form onSubmit={handleUpload}>
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={loading}>
            {loading ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </form>

      {error && <p style={{ color: 'crimson', marginTop: 12 }}>{error}</p>}

      {result?.signedUrl && (
        <section style={{ marginTop: 24 }}>
          <h3>Uploaded ✔</h3>
          <p><code>{result.path}</code></p>
          <audio controls src={result.signedUrl} style={{ width: '100%' }} />
        </section>
      )}
    </main>
  );
}
