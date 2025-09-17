import { useEffect, useRef } from "react";

export default function useVoiceCallRealtime(serverUrl) {
  const wsRef = useRef(null);
  const audioCtxRef = useRef(null);
  const sourceRef = useRef(null);
  const bufferQueue = useRef([]);

  useEffect(() => {
    const ws = new WebSocket(`${serverUrl}/api/realtime`);

    ws.binaryType = "arraybuffer"; // ⚡ важно для аудио

    ws.onopen = () => {
      console.log("✅ Подключение к серверу установлено");

      // Создаем AudioContext (лучше при первом user gesture)
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
          console.warn("⚠️ Пришёл текст, но не JSON");
        }
      } else {
        // 🔊 Пришло аудио
        const audioBuffer = await audioCtxRef.current.decodeAudioData(event.data.slice(0));
        bufferQueue.current.push(audioBuffer);

        if (!sourceRef.current) {
          playNextBuffer();
        }
      }
    };

    ws.onclose = () => {
      console.log("🔴 Соединение закрыто");
    };

    ws.onerror = (err) => {
      console.error("❌ Ошибка WebSocket", err);
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [serverUrl]);

  // Функция проигрывания очереди аудио
  const playNextBuffer = () => {
    if (bufferQueue.current.length === 0) {
      sourceRef.current = null;
      return;
    }

    const buffer = bufferQueue.current.shift();
    const source = audioCtxRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtxRef.current.destination);

    source.onended = () => {
      playNextBuffer();
    };

    source.start();
    sourceRef.current = source;
  };

  return wsRef;
}
