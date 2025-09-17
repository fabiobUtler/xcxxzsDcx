// server/realtime.js

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const WebSocket = require("ws");

import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();
console.log("✅ .env файл загружен");

if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY не найден");
  process.exit(1);
}

const PORT = process.env.PORT || 3001;
const wss = new WebSocket.Server({ port: PORT }, () => {
  console.log(`🟢 WebSocket сервер запущен на порту ${PORT}`);
});

wss.on("connection", async (ws) => {
  console.log("🟡 [WebSocket] Клиент подключился");

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    // ✅ Правильный способ: создание потока
    const stream = await openai.beta.chat.completions.run({
      model: "gpt-4o-realtime-preview-2024-12-17",
      messages: [
        {
          role: "system",
          content: `
            Ты — финансовый консультант. Отвечай кратко.
            Факты:
            - Инвестирую 5 лет в крипту и акции.
            - Помогаю новичкам.
          `,
        },
      ],
      eventHandler: {
        onAudioTranscript(delta) {
          console.log("🎙️ Распознано:", delta);
          ws.send(JSON.stringify({ type: "transcript", text: delta }));
        },
        onAudio(audio) {
          const audioBase64 = Buffer.from(audio).toString("base64");
          console.log("🔊 Ответ AI, длина:", audioBase64.length);
          ws.send(
            JSON.stringify({
              type: "response",
              text: "(аудио)",
              audio: audioBase64,
            })
          );
        },
        onError(err) {
          console.error("❌ OpenAI Error:", err);
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Ошибка AI",
              error: err.message,
            })
          );
        },
      },
    });

    // === Передача аудио от клиента ===
    ws.on("message", (data) => {
      if (data instanceof ArrayBuffer) {
        const buffer = Buffer.from(data);
        stream.appendInputAudio(buffer);
        console.log("🎧 Аудио получено и отправлено в OpenAI");
      }
    });

    ws.on("close", () => {
      console.log("🔴 Клиент отключился");
      stream?.stop?.();
    });
  } catch (err) {
    console.error("❌ Ошибка подключения к OpenAI:", err);
    ws.send(
      JSON.stringify({
        type: "error",
        message: "Ошибка подключения к OpenAI",
        error: err.message,
      })
    );
    ws.close();
  }
});