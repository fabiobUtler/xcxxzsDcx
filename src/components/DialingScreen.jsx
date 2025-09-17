// src/components/DialingScreen.jsx
import React, { useEffect } from 'react';

export default function DialingScreen({ onConnected }) {
  useEffect(() => {
    // Через 6 секунд имитируем "принятие звонка"
    const timer = setTimeout(() => {
      onConnected();
    }, 6000);

    return () => clearTimeout(timer);
  }, [onConnected]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-white max-w-md mx-auto">
      {/* Аватарка */}
      <div className="relative mb-8">
        <img src="avatar.jpg" alt="Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-gray-700 shadow-lg" />
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>

      {/* Имя */}
      <h1 className="text-xl font-bold text-center">Alice Harris</h1>

      {/* Статус: Calling... */}
      <p className="text-sm text-gray-400 mt-1 text-center animate-pulse">
        Calling...
      </p>

      {/* Индикатор вызова */}
      <div className="flex space-x-2 mt-8">
        <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-3 h-3 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>

      {/* Подпись */}
      <div className="mt-8 text-xs text-gray-500 text-center">
        Ожидание ответа...
      </div>
    </div>
  );
}