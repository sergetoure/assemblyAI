require('dotenv').config();
const path = require('path');
const express = require('express');
const transcribeRouter = require('./routes/transcribe');

const apiKey = process.env.ASSEMBLYAI_API_KEY;
if (!apiKey) {
  console.error('Missing ASSEMBLYAI_API_KEY. Copy .env.example to .env and set your key.');
  process.exit(1);
}

const app = express();
app.locals.assemblyaiApiKey = apiKey;

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/transcribe', transcribeRouter);
app.use(express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
