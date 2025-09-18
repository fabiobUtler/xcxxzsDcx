// server.js
import express from "express";
import multer from "multer";
import fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

// Настройка multer (upload в /tmp)
const upload = multer({ dest: "/tmp/" });

// Простейшая база фактов (RAG/FAQ) — можно расширять или подключать векторную БД
const FACTS = [
  "Я занимаюсь инвестициями 5 лет.",
  "Я помогаю новичкам с выбором инвестиционных стратегий.",
  "Работаю с криптовалютами и акциями."
];

// Вспомогательная функция: формируем system prompt с фактами
function buildSystemPrompt() {
  return `Ты — финансовый консультант. Отвечай коротко, дружелюбно. Используй факты, которые тебе доступны:\n${FACTS.map((f, i) => `${i+1}. ${f}`).join("\n")}\nЕсли вопрос не относится к фактам — отвечай честно: \"Не уверен\".`;
}

// 1) STT endpoint — принимает multipart/form-data файл field 'file'
app.post("/stt", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "file required" });
    const form = new FormData();
    form.append("file", fs.createReadStream(req.file.path));
    form.append("model", "whisper-1");

    const r = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        // note: form.getHeaders will include content-type
        ...form.getHeaders(),
      },
      body: form,
    });

    const json = await r.json();
    // cleanup
    fs.unlink(req.file.path, () => {});
    return res.json({ text: json.text });
  } catch (err) {
    console.error("STT error:", err);
    return res.status(500).json({ error: String(err) });
  }
});

// 2) AI endpoint — принимает JSON { prompt: "..." }
app.post("/ai", async (req, res) => {
  try {
    const userText = req.body.prompt;
    if (!userText) return res.status(400).json({ error: "prompt required" });

    const systemPrompt = buildSystemPrompt();

    const body = {
      model: "gpt-4o-mini", // можно сменить на доступную модель
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userText }
      ],
      max_tokens: 300,
      temperature: 0.2
    };

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    const data = await r.json();
    const reply = data.choices?.[0]?.message?.content?.trim() ?? (data.choices?.[0]?.text ?? "");

    return res.json({ reply });
  } catch (err) {
    console.error("AI error:", err);
    return res.status(500).json({ error: String(err) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API server listening on ${PORT}`));
