import WebSocket from "ws";
import fs from "fs";
import { Readable } from "stream";

// ⚡ Подключаемся к OpenAI Realtime
export function connectRealtime(sessionId, onEvent) {
  const url = `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview`;
  const ws = new WebSocket(url, {
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "OpenAI-Beta": "realtime=v1",
      "Content-Type": "application/sdp"
    }
  });

  ws.on("open", () => {
    console.log("✅ WS к OpenAI открыт");
  });

  ws.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw.toString("utf8"));
      if (onEvent) onEvent(msg);
    } catch (e) {
      console.error("⚠️ Ошибка парсинга", e);
    }
  });

  ws.on("close", () => {
    console.log("🔴 Соединение с OpenAI закрыто");
  });

  ws.on("error", (err) => {
    console.error("❌ Ошибка WS", err);
  });

  return ws;
}
