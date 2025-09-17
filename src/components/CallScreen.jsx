// src/components/CallScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  CameraIcon,
  VideoCameraIcon,
  PhoneXMarkIcon,
  MicrophoneIcon,
  UserGroupIcon
} from '@heroicons/react/24/solid';

export default function CallScreen({ onEndCall, onToggleMute }) {
  const [muted, setMuted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [alertMessage, setAlertMessage] = useState('');

  // Запуск таймера
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(t => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Формат времени: MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Показывать всплывающее сообщение
  const showAlert = (msg) => {
    setAlertMessage(msg);
    setTimeout(() => setAlertMessage(''), 2000);
  };

  // Обработчики
  const handleScreencast = () => {
    showAlert('Alice prohibits the display of the screen');
  };

  const handleStartVideo = () => {
    showAlert('Alice prohibits video calls');
  };

  const handleMute = () => {
    setMuted(!muted);
    onToggleMute?.(!muted);
    showAlert(muted ? 'Microphone unmuted' : 'Microphone muted');
  };

  const handleEndCall = () => {
    onEndCall();
    showAlert('Call ended');
  };

  const handleAddPeople = () => {
    showAlert('Alice does not make group calls');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-white max-w-md mx-auto">
      {/* Аватарка */}
      <div className="relative mb-8">
        <img
          src="../photo_2025-09-16_22-05-36 (2).jpg"
          alt="Avatar"
          className="w-32 h-32 rounded-full object-cover border-4 border-gray-800 shadow-lg"
        />
        {/* Онлайн статус */}
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Имя */}
      <h1 className="text-xl font-bold text-center">Alice Harris</h1>

      {/* Статус */}
      <p className="text-sm text-gray-400 mt-1 text-center">exchanging encryption keys...</p>

      {/* Таймер */}
      <div className="text-lg font-mono text-gray-300 mt-4">
        {formatTime(timer)}
      </div>

      {/* Кнопки */}
      <div className="flex space-x-4 mt-10">
        {/* Screencast */}
        <button onClick={handleScreencast} className="flex flex-col items-center space-y-1 opacity-70 hover:opacity-100">
          <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
            <CameraIcon className="h-6 w-6 text-gray-300" />
          </div>
          <span className="text-xs text-gray-400">Screencast</span>
        </button>

        {/* Start Video */}
        <button onClick={handleStartVideo} className="flex flex-col items-center space-y-1 opacity-70 hover:opacity-100">
          <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
            <VideoCameraIcon className="h-6 w-6 text-gray-300" />
          </div>
          <span className="text-xs text-gray-400">Video</span>
        </button>

        {/* End Call */}
        <button onClick={handleEndCall} className="flex flex-col items-center space-y-1">
          <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
            <PhoneXMarkIcon className="h-6 w-6 text-white" />
          </div>
          <span className="text-xs text-red-500 font-semibold">End</span>
        </button>

        {/* Mute */}
        <button onClick={handleMute} className="flex flex-col items-center space-y-1 opacity-70 hover:opacity-100">
        <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center relative">
            <MicrophoneIcon 
            className={`h-6 w-6 ${muted ? 'text-red-500' : 'text-gray-300'}`} 
            />
            {muted && (
            <>
                {/* Красная линия через микрофон */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <svg className="w-8 h-8 text-red-500 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="4" y1="4" x2="20" y2="20" />
                </svg>
                </div>
                {/* Жёлтая точка сверху */
        }
            </>
            )}
        </div>
        <span className="text-xs text-gray-400">{muted ? 'Unmute' : 'Mute'}</span>
        </button>

        {/* Add People */}
        <button onClick={handleAddPeople} className="flex flex-col items-center space-y-1 opacity-70 hover:opacity-100">
          <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
            <UserGroupIcon className="h-6 w-6 text-gray-300" />
          </div>
          <span className="text-xs text-gray-400">Add</span>
        </button>
      </div>

      {/* Подпись внизу */}
      <div className="mt-6 text-xs text-gray-500 text-center">
        MVP: UI звонка + микрофон + заглушка TTS
      </div>

      {/* Всплывающее сообщение */}
      {alertMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {alertMessage}
        </div>
      )}
    </div>
    
  );
}