const express = require('express');
const multer = require('multer');
const { transcribeBuffer } = require('../lib/assemblyai');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2.2 * 1024 * 1024 * 1024 }, // AssemblyAI's /v2/upload cap
});

const router = express.Router();

router.post('/', upload.single('audio'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Missing 'audio' file in form data." });
  }

  try {
    const transcript = await transcribeBuffer(req.app.locals.assemblyaiApiKey, req.file.buffer);
    res.json({ id: transcript.id, text: transcript.text });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: err.message });
  }
});

module.exports = router;
