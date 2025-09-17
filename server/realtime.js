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
    // ✅ Правильный способ подключения к Realtime
    const stream = await openai.beta.realtime.connect({
      model: "gpt-4o-realtime-preview-2024-12-17",
    });

    console.log("✅ Подключено к OpenAI Realtime");

    // Настройка сессии
    stream.sendEvent("session.update", {
      session: {
        instructions: `
          Ты — финансовый консультант. Отвечай кратко.
          Факты:
          - Инвестирую 5 лет в крипту и акции.
          - Помогаю новичкам.
        `,
        voice: "alloy",
        turn_detection: { type: "server_vad" },
        input_audio_transcription: { enabled: true },
      },
    });

    // Распознанная речь
    stream.on("content.audio_transcript", (event) => {
      if (event.type === "input") {
        console.log("🎙️ Распознано:", event.transcript);
        ws.send(
          JSON.stringify({ type: "transcript", text: event.transcript })
        );
      }
    });

    // Аудио-ответ от AI
    stream.on("content.audio", (event) => {
      if (event.role === "assistant") {
        const audioBase64 = Buffer.from(event.audio).toString("base64");
        console.log("🔊 Ответ AI, длина:", audioBase64.length);
        ws.send(
          JSON.stringify({
            type: "response",
            text: event.transcript || "(аудио)",
            audio: audioBase64,
          })
        );
      }
    });

    // Приём аудио от клиента
    ws.on("message", (data) => {
      if (data instanceof ArrayBuffer) {
        const buffer = Buffer.from(data);
        stream.sendEvent("input_audio_buffer.append", { audio: buffer });
        console.log("🎧 Аудио отправлено в OpenAI");
      }
    });

    // Обработка закрытия
    ws.on("close", () => {
      console.log("🔴 Клиент отключился");
      stream.connection?.close();
    });

    stream.on("error", (err) => {
      console.error("❌ OpenAI ошибка:", err);
      ws.send(
        JSON.stringify({ type: "error", message: "Ошибка AI", error: err.message })
      );
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