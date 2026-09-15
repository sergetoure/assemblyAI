const form = document.getElementById('upload-form');
const dropZone = document.getElementById('drop-zone');
const dropZoneText = document.getElementById('drop-zone-text');
const audioInput = document.getElementById('audio-input');
const submitBtn = document.getElementById('submit-btn');
const statusEl = document.getElementById('status');
const resultEl = document.getElementById('result');
const transcriptEl = document.getElementById('transcript-text');
const copyBtn = document.getElementById('copy-btn');

function setStatus(message, isError = false) {
  statusEl.hidden = !message;
  statusEl.textContent = message || '';
  statusEl.classList.toggle('error', isError);
}

function updateSelectedFile(file) {
  if (file) {
    dropZoneText.textContent = file.name;
    submitBtn.disabled = false;
  } else {
    dropZoneText.textContent = 'Choose an audio file or drag it here';
    submitBtn.disabled = true;
  }
}

audioInput.addEventListener('change', () => {
  updateSelectedFile(audioInput.files[0]);
});

['dragenter', 'dragover'].forEach((eventName) => {
  dropZone.addEventListener(eventName, (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });
});

['dragleave', 'drop'].forEach((eventName) => {
  dropZone.addEventListener(eventName, (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
  });
});

dropZone.addEventListener('drop', (e) => {
  const file = e.dataTransfer.files[0];
  if (file) {
    audioInput.files = e.dataTransfer.files;
    updateSelectedFile(file);
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const file = audioInput.files[0];
  if (!file) return;

  resultEl.hidden = true;
  submitBtn.disabled = true;
  setStatus('Uploading and transcribing… this can take a little while for longer recordings.');

  const formData = new FormData();
  formData.append('audio', file);

  try {
    const res = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || `Request failed (${res.status})`);
    }

    transcriptEl.textContent = data.text || '(No speech detected.)';
    resultEl.hidden = false;
    setStatus('');
  } catch (err) {
    setStatus(err.message || 'Something went wrong.', true);
  } finally {
    submitBtn.disabled = false;
  }
});

copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(transcriptEl.textContent);
    const original = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      copyBtn.textContent = original;
    }, 1500);
  } catch {
    setStatus('Could not copy to clipboard.', true);
  }
});
