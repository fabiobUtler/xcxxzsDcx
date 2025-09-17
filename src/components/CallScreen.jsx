// src/components/CallScreen.jsx
import React, { useState, useEffect } from 'react';
import { PhoneXMarkIcon, MicrophoneIcon } from '@heroicons/react/24/solid';
import { useVoiceCallRealtime } from '../hooks/useVoiceCallRealtime';

export default function CallScreen({ onEndCall, onToggleMute }) {
  const [muted, setMuted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [alertMessage, setAlertMessage] = useState('');

  // Используем наш хук
  const {
    isCalling,
    transcripts,
    startCall,
    endCall: hangup,
  } = useVoiceCallRealtime({
    onTranscript: (t) => console.log("🗣️", t),
    onAIResponse: (text) => console.log("🤖 AI:", text)
  });

  // Запуск звонка при монтировании
  useEffect(() => {
    startCall(); // автоматически запускаем аудио
    return () => hangup(); // при размонтировании — завершаем
  }, []);

  // Таймер
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const showAlert = (msg) => {
    setAlertMessage(msg);
    setTimeout(() => setAlertMessage(''), 2000);
  };

  const handleMute = () => {
    setMuted(!muted);
    onToggleMute?.(!muted);
    showAlert(muted ? 'Microphone unmuted' : 'Microphone muted');
  };

  const handleEndCall = () => {
    hangup(); // закрываем WebSocket
    onEndCall(); // переходим обратно
    showAlert('Call ended');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-white max-w-md mx-auto">
      {/* Аватарка */}
      <div className="relative mb-8">
        <img src="avatar.jpg" alt="Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-gray-700 shadow-lg" />
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      <h1 className="text-xl font-bold text-center">Alice Harris</h1>

      {/* Статус */}
      <p className="text-sm text-blue-400 mt-1 text-center">
        {isCalling ? 'Connected' : 'Connecting...'}
      </p>

      {/* Таймер */}
      <div className="text-lg font-mono text-gray-300 mt-4">
        {formatTime(timer)}
      </div>

      {/* Транскрипция (опционально) */}
      <div className="mt-4 text-xs text-gray-400 space-y-1 max-w-xs overflow-y-auto h-20">
        {transcripts.slice(-5).map((t, i) => (
          <div key={i} className={t.who === "AI" ? "text-blue-400" : ""}>
            <strong>{t.who}:</strong> {t.text}
          </div>
        ))}
      </div>

      {/* Кнопки */}
      <div className="flex space-x-4 mt-10">
        <button onClick={handleMute} className="flex flex-col items-center space-y-1">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            muted ? 'bg-red-600' : 'bg-gray-700'
          }`}>
            <MicrophoneIcon 
              className={`h-6 w-6 ${muted ? 'text-white' : 'text-gray-300'}`} 
            />
            {muted && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <svg className="w-8 h-8 text-white opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="4" x2="20" y2="20" />
                </svg>
              </div>
            )}
          </div>
          <span className="text-xs text-gray-400">{muted ? 'Unmute' : 'Mute'}</span>
        </button>

        <button onClick={handleEndCall} className="flex flex-col items-center space-y-1">
          <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
            <PhoneXMarkIcon className="h-6 w-6 text-white" />
          </div>
          <span className="text-xs text-red-500 font-semibold">End</span>
        </button>
      </div>

      <div className="mt-6 text-xs text-gray-500 text-center">
        Голосовой помощник по инвестициям
      </div>

      {alertMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {alertMessage}
        </div>
      )}
    </div>
  );
}