'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * Recorder (Test) — Record → Stop → Upload → Play
 * - Uses MediaRecorder to capture mic as audio/webm (Opus).
 * - On Stop: computes duration synchronously, uploads to /api/upload-audio,
 *   and shows an <audio> player using the signed URL returned by the API.
 *
 * Notes:
 * - Works reliably in Chrome/Edge. Safari support for MediaRecorder may vary.
 * - If permissions are blocked, you’ll see a helpful error.
 */

export default function RecorderPage() {
  const [isSupported, setIsSupported] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState('');
  const [playbackUrl, setPlaybackUrl] = useState('');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [lastPath, setLastPath] = useState('');

  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const startedAtRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    // Feature detection
    if (
      typeof window === 'undefined' ||
      !navigator?.mediaDevices?.getUserMedia ||
      !window.MediaRecorder
    ) {
      setIsSupported(false);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopTracks(mediaStreamRef.current);
    };
  }, []);

  function stopTracks(stream) {
    if (!stream) return;
    stream.getTracks().forEach((t) => t.stop());
  }

  async function startRecording() {
    setError('');
    setPlaybackUrl('');
    setLastPath('');
    setElapsedMs(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // Request webm/opus; if unsupported, the constructor will throw.
      const options = { mimeType: 'audio/webm;codecs=opus' };
      const mr = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mr;

      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
      };

      mr.onstart = () => {
        startedAtRef.current = Date.now();
        setIsRecording(true);
        timerRef.current = setInterval(() => {
          setElapsedMs(Date.now() - startedAtRef.current);
        }, 100);
      };

      // ⬇⬇ KEY FIX: compute duration synchronously at stop (not from possibly stale state)
      mr.onstop = async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setIsRecording(false);
        stopTracks(mediaStreamRef.current);

        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const ms = Math.max(0, Date.now() - (startedAtRef.current || Date.now()));
        await handleStopRecording(blob, ms);
      };

      mr.start();
    } catch (e) {
      console.error(e);
      setError(
        'Could not start recording. Check microphone permissions. If you’re on Safari, try Chrome/Edge or allow mic access.'
      );
      setIsSupported(!!window.MediaRecorder);
    }
  }

  function stopRecording() {
    try {
      mediaRecorderRef.current?.stop();
    } catch (e) {
      console.error(e);
      setError('Stopping recorder failed. Try again.');
    }
  }

  async function uploadAudioBlob(blob, { userId = 'anon', roleId, durationMs }) {
    const form = new FormData();
    const file = new File([blob], 'recording.webm', { type: 'audio/webm' });
    form.append('file', file);
    form.append('user_id', userId);
    if (roleId) form.append('role_id', roleId);
    if (typeof durationMs === 'number') form.append('duration_ms', String(durationMs));

    const res = await fetch('/api/upload-audio', { method: 'POST', body: form });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      throw new Error(data?.error || 'Upload failed');
    }
    return data;
  }

  async function handleStopRecording(blob, ms) {
    try {
      setUploading(true);
      const result = await uploadAudioBlob(blob, {
        userId: 'anon',               // Replace with a real UUID when auth is wired
        roleId: 'interview',
        durationMs: ms,               // <-- send the freshly computed duration
      });
      setPlaybackUrl(result.signedUrl);
      setLastPath(result.path || '');
      setElapsedMs(ms);
    } catch (e) {
      console.error(e);
      setError(e.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  const mm = Math.floor(elapsedMs / 60000);
  const ss = Math.floor((elapsedMs % 60000) / 1000).toString().padStart(2, '0');

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', padding: '0 16px', fontFamily: 'system-ui, Arial' }}>
      <h1>Recorder (Test)</h1>
      <p>Record your voice, then Stop to upload to <code>/api/upload-audio</code> and get a playback link.</p>

      {!isSupported && (
        <div style={{ padding: 12, background: '#fff3cd', border: '1px solid #ffeeba', borderRadius: 6, marginBottom: 12 }}>
          Your browser does not support MediaRecorder. Try Chrome or Edge on desktop.
        </div>
      )}

      {error && (
        <div style={{ padding: 12, background: '#f8d7da', border: '1px solid #f5c2c7', borderRadius: 6, marginBottom: 12 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
        <button
          onClick={startRecording}
          disabled={isRecording || !isSupported}
          style={{ padding: '10px 14px', background: '#111', color: '#fff', borderRadius: 6, border: 0 }}
        >
          ● Start
        </button>
        <button
          onClick={stopRecording}
          disabled={!isRecording}
          style={{ padding: '10px 14px', background: isRecording ? '#e11d48' : '#999', color: '#fff', borderRadius: 6, border: 0 }}
        >
          ■ Stop
        </button>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          {isRecording ? `Recording… ${mm}:${ss}` : 'Idle'}
          {uploading ? ' • Uploading…' : ''}
        </span>
      </div>

      {lastPath && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 12, color: '#666' }}>Stored path:</div>
          <code style={{ fontSize: 12 }}>{lastPath}</code>
        </div>
      )}

      {playbackUrl && (
        <div style={{ marginTop: 12 }}>
          <audio controls src={playbackUrl} style={{ width: '100%' }} />
          <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>
            Playback uses a signed URL (expires in ~1 hour).
          </div>
        </div>
      )}
    </div>
  );
}
