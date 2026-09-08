const BASE_URL = 'https://api.assemblyai.com';
const SPEECH_MODELS = ['universal-3-5-pro', 'universal-2'];
const POLL_INTERVAL_MS = 3000;

function authHeaders(apiKey, extra = {}) {
  return { Authorization: apiKey, ...extra };
}

async function uploadAudio(apiKey, buffer) {
  const res = await fetch(`${BASE_URL}/v2/upload`, {
    method: 'POST',
    headers: authHeaders(apiKey, { 'Content-Type': 'application/octet-stream' }),
    body: buffer,
  });

  if (!res.ok) {
    throw new Error(`AssemblyAI upload failed (${res.status}): ${await res.text()}`);
  }

  const { upload_url } = await res.json();
  return upload_url;
}

async function submitTranscript(apiKey, audioUrl) {
  const res = await fetch(`${BASE_URL}/v2/transcript`, {
    method: 'POST',
    headers: authHeaders(apiKey, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      audio_url: audioUrl,
      speech_models: SPEECH_MODELS,
    }),
  });

  if (!res.ok) {
    throw new Error(`AssemblyAI transcript submission failed (${res.status}): ${await res.text()}`);
  }

  const { id } = await res.json();
  return id;
}

async function getTranscript(apiKey, id) {
  const res = await fetch(`${BASE_URL}/v2/transcript/${id}`, {
    headers: authHeaders(apiKey),
  });

  if (!res.ok) {
    throw new Error(`AssemblyAI transcript fetch failed (${res.status}): ${await res.text()}`);
  }

  return res.json();
}

async function pollTranscript(apiKey, id) {
  while (true) {
    const transcript = await getTranscript(apiKey, id);

    if (transcript.status === 'completed') {
      return transcript;
    }
    if (transcript.status === 'error') {
      throw new Error(`AssemblyAI transcription failed: ${transcript.error}`);
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
}

async function transcribeBuffer(apiKey, buffer) {
  const audioUrl = await uploadAudio(apiKey, buffer);
  const id = await submitTranscript(apiKey, audioUrl);
  return pollTranscript(apiKey, id);
}

module.exports = { transcribeBuffer };
