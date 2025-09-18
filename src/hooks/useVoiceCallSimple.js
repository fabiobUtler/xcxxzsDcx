// src/hooks/useVoiceCallSimple.js
import { useState, useRef, useCallback } from "react";

export function useVoiceCallSimple({ apiBase = "" , onTranscript, onAIResponse }) {
  const [isCalling, setIsCalling] = useState(false);
  const [transcripts, setTranscripts] = useState([]);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);

  const addTranscript = useCallback((who, text) => {
    const entry = { who, text };
    setTranscripts(prev => [...prev, entry]);
    onTranscript?.(entry);
  }, [onTranscript]);

  // send blob to /stt -> get text -> /ai -> get reply
  async function processBlob(blob) {
    try {
      const fd = new FormData();
      fd.append("file", blob, "chunk.webm");

      const sttResp = await fetch(`${apiBase}/stt`, { method: "POST", body: fd });
      const sttJson = await sttResp.json();
      if (sttJson.text) {
        addTranscript("You", sttJson.text);

        // AI
        const aiResp = await fetch(`${apiBase}/ai`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: sttJson.text })
        });
        const aiJson = await aiResp.json();
        const reply = aiJson.reply ?? "Извини, ошибка.";
        addTranscript("AI", reply);
        onAIResponse?.(reply);

        // quick client-side TTS for now
        if ('speechSynthesis' in window) {
          const utt = new SpeechSynthesisUtterance(reply);
          utt.lang = 'ru-RU'; // сменить если нужно
          speechSynthesis.speak(utt);
        }
      } else {
        console.warn("No STT text", sttJson);
      }
    } catch (err) {
      console.error("processBlob error", err);
    }
  }

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      recorderRef.current = new MediaRecorder(stream, { mimeType: "audio/webm" });
      recorderRef.current.ondataavailable = async (e) => {
        if (e.data && e.data.size > 0) {
          // отправляем каждый кусок на сервер (почти realtime)
          await processBlob(e.data);
        }
      };

      // каждые 3.5 секунды отправляем chunk
      recorderRef.current.start(3500);
      setIsCalling(true);
    } catch (err) {
      console.error("startCall error", err);
      alert("Не получилось включить микрофон: " + err.message);
    }
  };

  const endCall = () => {
    try {
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    } catch (e) { console.warn(e); }
    setIsCalling(false);
    setTranscripts([]);
  };

  return { isCalling, transcripts, startCall, endCall };
}
