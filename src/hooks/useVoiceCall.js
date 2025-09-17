// src/hooks/useVoiceCall.js
import { useState, useRef, useCallback } from 'react';
import { STTService } from '../services/stt';
import { LLMService } from '../services/llm';
import { TTSService } from '../services/tts';

export function useVoiceCall({ onTranscript, onAIResponse }) {
  const [isCalling, setIsCalling] = useState(false);
  const [transcripts, setTranscripts] = useState([]);

  const sttRef = useRef(null);
  const llm = new LLMService();
  const tts = new TTSService();

  const addTranscript = useCallback((who, text) => {
    const entry = { who, text };
    setTranscripts(prev => [...prev, entry]);
    onTranscript?.(entry);
  }, [onTranscript]);

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      sttRef.current = new STTService(async (text) => {
        addTranscript('You', text);
        
        const response = await llm.process(text);
        addTranscript('AI', response);
        onAIResponse?.(response);
        
        await tts.speak(response);
      });

      sttRef.current.start(stream);
      setIsCalling(true);
    } catch (err) {
      console.error('Ошибка запуска звонка:', err);
    }
  };

  const endCall = () => {
    sttRef.current?.stop();
    setIsCalling(false);
    setTranscripts([]);
  };

  return {
    isCalling,
    transcripts,
    startCall,
    endCall
  };
}