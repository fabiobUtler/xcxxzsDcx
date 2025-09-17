// server/realtime.js

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const WebSocket = require("ws");

import OpenAI from "openai";
import dotenv from "dotenv";

// Загружаем переменные окружения
dotenv.config();
console.log("✅ .env файл загружен");

// Проверяем наличие API-ключа
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ ОШИБКА: OPENAI_API_KEY не найден в .env");
  process.exit(1);
} else {
  console.log("✅ OPENAI_API_KEY загружен (первые 8 символов):", process.env.OPENAI_API_KEY.slice(0, 8) + "...");
}

const PORT = process.env.PORT || 3001;

// Создаём WebSocket-сервер
const wss = new WebSocket.Server({ port: PORT }, () => {
  console.log(`🟢 WebSocket сервер запущен на порту ${PORT}`);
  console.log(`🔗 Ожидаем подключения клиента по ws://localhost:${PORT}`);
});

wss.on("connection", async (ws) => {
  console.log("🟡 [WebSocket] Клиент подключился");

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  let stream; // будем хранить stream

  try {
    console.log("🟡 [OpenAI] Подключение к Realtime API...");

    // === 🔥 ВАЖНО: Используем правильный способ подключения ===
    stream = await openai.beta.realtime.connect({
      model: "gpt-4o-realtime-preview-2024-12-17",
    });

    console.log("✅ [OpenAI] Успешно подключено к Realtime API");

    // === Настройка сессии ===
    console.log("⚙️ [Realtime] Настраиваем сессию...");
    stream.sendEvent("session.update", {
      session: {
        instructions: `
          Ты — финансовый консультант. Отвечай кратко и дружелюбно.
          Факты:
          - Я инвестирую 5 лет в крипту и акции.
          - Помогаю инвестировать
          - Даю гарантий прибыли.
        `,
        voice: "alloy",
        turn_detection: { type: "server_vad" },
        input_audio_transcription: { enabled: true },
      },
    });
    console.log("✅ [Realtime] Сессия настроена");

    // === Обработка событий от OpenAI ===

    stream.on("error", (event) => {
      console.error("❌ [OpenAI] Ошибка:", event.error);
      ws.send(
        JSON.stringify({
          type: "error",
          source: "openai",
          message: "Ошибка соединения с OpenAI",
          error: event.error?.message,
        })
      );
    });

    stream.on("session.created", (event) => {
      console.log("🆕 [OpenAI] Сессия создана:", event.model);
    });

    // Получение транскрипции пользователя
    stream.on("content.audio_transcript", (event) => {
      if (event.type === "input") {
        console.log("🎙️ [Transcript] Пользователь сказал:", event.transcript);
        ws.send(
          JSON.stringify({
            type: "transcript",
            text: event.transcript,
          })
        );
      }
    });

    // Получение аудио-ответа от AI
    stream.on("content.audio", (event) => {
      if (event.role === "assistant") {
        const audioBase64 = Buffer.from(event.audio).toString("base64");
        console.log("🔊 [Response] AI ответил, аудио отправлено, длина:", audioBase64.length);

        ws.send(
          JSON.stringify({
            type: "response",
            text: event.transcript || "(аудио ответ)",
            audio: audioBase64,
          })
        );
      }
    });

    // Дополнительные события (для отладки)
    stream.on("input_audio_buffer.committed", (event) => {
      console.log("📨 [Audio Buffer] Аудио добавлено в буфер");
    });

    stream.on("response.done", (event) => {
      console.log("🤖 [Response] Ответ завершён:", event.response?.output?.[0]?.text || "(аудио)");
    });

    // === Приём аудио от фронтенда (через WebSocket) ===
    ws.on("message", (data) => {
      console.log("📩 [WebSocket] Получено сообщение, размер:", data.length);

      if (data instanceof ArrayBuffer) {
        const buffer = Buffer.from(data);
        console.log("🎧 [Audio] Аудио принято, длина:", buffer.length, "байт");

        try {
          stream.sendEvent("input_audio_buffer.append", {
            audio: buffer,
          });
          console.log("📤 [OpenAI] Аудио отправлено в буфер");
        } catch (err) {
          console.error("❌ [OpenAI] Ошибка отправки аудио:", err);
        }
      } else {
        try {
          const msg = JSON.parse(data);
          console.log("🔍 [Control] Сообщение:", msg.type);
        } catch (e) {
          console.warn("⚠️ [Unknown] Не удалось распарсить как JSON");
        }
      }
    });

    // === Обработка закрытия соединений ===
    ws.on("close", () => {
      console.log("🔴 [WebSocket] Клиент отключился");
      if (stream && !stream.closed) {
        stream.connection?.close();
      }
    });

    ws.on("error", (err) => {
      console.error("❌ [WebSocket] Ошибка:", err);
      if (stream && !stream.closed) {
        stream.connection?.close();
      }
    });

    // Если stream сам закроется
    stream.on("disconnect", () => {
      console.log("🔴 [OpenAI] Соединение с Realtime разорвано");
      ws.close();
    });
  } catch (err) {
    console.error("❌ [Critical] Ошибка при подключении к OpenAI:", err.message || err);
    if (err.error) console.error("Детали ошибки:", err.error);

    ws.send(
      JSON.stringify({
        type: "error",
        source: "connection",
        message: "Не удалось подключиться к OpenAI",
        error: err.message,
      })
    );

    ws.close();
  }
});