// src/components/CallInitScreen.jsx
import React from 'react';

export default function CallInitScreen({ onStartCall, onVideo, onCancel }) {
  const handleVideoClick = () => {
    alert('Alice prohibits video calls');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-white max-w-md mx-auto">
      {/* Аватарка */}
      <div className="relative mb-8">
        <img
          src="../photo_2025-09-16_22-05-36 (2).jpg"
          alt="Avatar"
          className="w-32 h-32 rounded-full object-cover border-4 border-gray-700 shadow-lg"
        />
      </div>

      {/* Имя пользователя */}
      <h1 className="text-xl font-bold text-center">Alice Harris</h1>

      {/* Подпись */}
      <p className="text-sm text-gray-400 mt-1 text-center">
        StartCall
      </p>

      {/* Кнопки */}
      <div className="flex space-x-6 mt-12">
         {/* Start Call */}
        <button
          onClick={onStartCall}
          className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center hover:bg-blue-600 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.042 11.042 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C9.083 18 3 11.917 3 6V3z" />
          </svg>
        </button>
      </div>

      {/* Нижняя подпись */}
      <div className="mt-8 text-xs text-gray-500 text-center">
        MVP: UI звонка + микрофон + заглушка TTS
      </div>
    </div>
  );
}