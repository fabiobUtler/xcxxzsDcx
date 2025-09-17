// server/realtime.js
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const WebSocket = require("ws");
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3001;

const wss = new WebSocket.Server({ port: PORT }, () => {
  console.log(`🟢 WebSocket сервер запущен на порту ${PORT}`);
});

wss.on("connection", (ws) => {
  console.log("🟡 Клиент подключился");

  let audioChunks = [];

  ws.on("message", async (data) => {
    if (data instanceof ArrayBuffer) {
      audioChunks.push(Buffer.from(data));
      console.log("🎧 Получен кусок аудио:", Buffer.from(data).length);
    } else {
      console.log("⚠️ Получен текст:", data.toString());
    }
  });

  ws.on("close", async () => {
    console.log("🔴 Клиент отключился, отправляем аудио в OpenAI");

    if (audioChunks.length === 0) return;

    const audioBuffer = Buffer.concat(audioChunks);

    try {
      const resp = await fetch("https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/sdp",
        },
        body: audioBuffer,
      });

      const result = await resp.json();
      console.log("✅ Ответ OpenAI:", result);

      ws.send(JSON.stringify({
        type: "response",
        text: result.text || "🤖 (ответ без текста)",
      }));

    } catch (err) {
      console.error("❌ Ошибка при запросе в OpenAI:", err);
      ws.send(JSON.stringify({
        type: "error",
        message: "Ошибка AI",
        error: err.message,
      }));
    }
  });
});
