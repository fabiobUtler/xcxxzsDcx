// src/hooks/useVoiceCallRealtime.js
import { useEffect, useRef } from "react";

export function useVoiceCallRealtime({ apiBase = "" }) {
  const wsRef = useRef(null);
  const audioCtxRef = useRef(null);
  const sourceRef = useRef(null);
  const bufferQueue = useRef([]);

  useEffect(() => {
    const ws = new WebSocket(`${apiBase}/api/realtime`.replace("http", "ws"));
    ws.binaryType = "arraybuffer";

    ws.onopen = () => {
      console.log("✅ Подключение к серверу установлено:", apiBase);
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
    };

    ws.onmessage = async (event) => {
      if (typeof event.data === "string") {
        try {
          const data = JSON.parse(event.data);
          console.log("📩 Ответ (JSON):", data);
        } catch {
          console.warn("⚠️ Пришёл текст, но не JSON:", event.data);
        }
      } else {
        try {
          let arrayBuffer;
          if (event.data instanceof Blob) {
            arrayBuffer = await event.data.arrayBuffer();
          } else if (event.data instanceof ArrayBuffer) {
            arrayBuffer = event.data;
          } else {
            console.warn("⚠️ Неожиданный тип данных:", typeof event.data);
            return;
          }

          const audioBuffer = await audioCtxRef.current.decodeAudioData(arrayBuffer);
          bufferQueue.current.push(audioBuffer);
          if (!sourceRef.current) {
            playNextBuffer();
          }
        } catch (err) {
          console.error("❌ Ошибка при обработке аудио:", err);
        }
      }
    };

    ws.onclose = () => console.log("🔴 Соединение закрыто");
    ws.onerror = (err) => console.error("❌ Ошибка WebSocket", err);

    wsRef.current = ws;
    return () => ws.close();
  }, [apiBase]);

  const playNextBuffer = () => {
    if (bufferQueue.current.length === 0) {
      sourceRef.current = null;
      return;
    }
    const buffer = bufferQueue.current.shift();
    const source = audioCtxRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtxRef.current.destination);
    source.onended = playNextBuffer;
    source.start();
    sourceRef.current = source;
  };

  return wsRef;
}
