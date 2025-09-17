// src/hooks/useVoiceCallRealtime.js
import { useState, useRef, useCallback } from "react";

export function useVoiceCallRealtime({ onTranscript, onAIResponse }) {
  const [isCalling, setIsCalling] = useState(false);
  const [transcripts, setTranscripts] = useState([]);
  const wsRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);

  const addTranscript = useCallback(
    (who, text) => {
      const entry = { who, text };
      setTranscripts((prev) => [...prev, entry]);
      onTranscript?.(entry);
    },
    [onTranscript]
  );

  const startCall = async () => {
    try {
      // Через Vite proxy: /api/realtime → ws://localhost:3001
      wsRef.current = new WebSocket("ws://localhost:5173/api/realtime");

      wsRef.current.onopen = async () => {
        console.log("✅ Соединение с сервером установлено");
      
            // Добавь эти логи!
      wsRef.current.onerror = (err) => {
        console.error("❌ Ошибка WebSocket (внутри startCall):", err);
      };

      wsRef.current.onclose = () => {
        console.log("🔴 Соединение закрыто (возможно, ошибка)");
      };

        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              sampleRate: 24000,
            },
          });

          audioContextRef.current = new AudioContext({
            sampleRate: 24000,
          });
          const source = audioContextRef.current.createMediaStreamSource(stream);
          const processor = audioContextRef.current.createScriptProcessor(2048, 1, 1);
          processorRef.current = processor;

          source.connect(processor);
          processor.connect(audioContextRef.current.destination);

          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const samples = new Int16Array(inputData.length);

            for (let i = 0; i < inputData.length; i++) {
              let s = Math.max(-1, Math.min(1, inputData[i]));
              samples[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
            }

            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(samples.buffer);
            }
          };

          setIsCalling(true);
        } catch (err) {
          console.error("❌ Ошибка микрофона:", err);
          alert("Не удалось получить доступ к микрофону");
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "transcript") {
            addTranscript("You", data.text);
          }

          if (data.type === "response") {
            addTranscript("AI", data.text);
            onAIResponse?.(data.text);

            if (data.audio) {
              const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
              audio.play().catch(console.error);
            }
          }
        } catch (e) {
          console.warn("Не удалось распарсить сообщение:", event.data);
        }
      };

      wsRef.current.onerror = (err) => {
        console.error("WebSocket ошибка:", err);
      };

      wsRef.current.onclose = () => {
        console.log("Соединение закрыто");
        endCall();
      };
    } catch (err) {
      console.error("Ошибка старта звонка:", err);
    }
  };

  const endCall = () => {
    processorRef.current?.disconnect();
    audioContextRef.current?.close().catch(console.warn);
    wsRef.current?.close();
    setIsCalling(false);
    setTranscripts([]);
  };

  return {
    isCalling,
    transcripts,
    startCall,
    endCall,
  };
}