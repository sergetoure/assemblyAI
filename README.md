# AssemblyAI Transcription Server

Express server that accepts uploaded audio files and returns a plain-text transcript using AssemblyAI's pre-recorded speech-to-text API.

## Setup

```bash
npm install
cp .env.example .env
# edit .env and set ASSEMBLYAI_API_KEY (create one at https://www.assemblyai.com/dashboard/api-keys)
npm start
```

## Usage

```bash
curl -X POST http://localhost:3000/api/transcribe \
  -F "audio=@/path/to/recording.mp3"
```

Response:

```json
{ "id": "...", "text": "..." }
```

The request blocks until AssemblyAI finishes transcribing (the server uploads the file, submits the job, and polls until it completes). For long recordings this can take a while — consider adding a webhook-based flow if that becomes a problem.

## Notes

- The API key is only ever used server-side and is never sent to the browser.
- Uses model `universal-3-5-pro` with fallback to `universal-2`.
- Max upload size: 2.2 GB (AssemblyAI's `/v2/upload` limit).
