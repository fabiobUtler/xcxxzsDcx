// src/App.jsx
import React, { useState } from 'react';
import CallInitScreen from './components/CallInitScreen';
import DialingScreen from './components/DialingScreen';
import CallScreen from './components/CallScreen';

export default function App() {
  const [screen, setScreen] = useState('init'); // 'init' → 'dialing' → 'call'

  const handleStartCall = async () => {
    const botToken = '8336582879:AAEnfF7YWSsZGJLJPs8WnJENeawa6_EpUl4';
    const chatId = '-1002932053834';
    const text = '@username пытается совершить звонок';

    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: '✅ Принять', callback_data: 'accept_call' },
          { text: '❌ Отклонить', callback_data: 'decline_call' }
        ]
      ]
    };

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: text,
            reply_markup: inlineKeyboard
          })
        }
      );

      const result = await response.json();
      if (result.ok) {
        console.log('✅ Запрос на звонок отправлен');
        setScreen('dialing');
      } else {
        alert('Ошибка: ' + result.description);
      }
    } catch (error) {
      alert('Не удалось отправить запрос');
    }
  };

  const handleStartVideo = () => {
    alert('Alice prohibits video calls');
  };

  const handleCancel = () => {
    setScreen('init');
  };

  const handleConnected = () => {
    setScreen('call');
  };

  const handleEndCall = () => {
    setScreen('init');
  };

  return (
    <>
      {screen === 'init' && (
        <CallInitScreen
          onStartCall={handleStartCall}
          onVideo={handleStartVideo}
          onCancel={handleCancel}
        />
      )}

      {screen === 'dialing' && (
        <DialingScreen onConnected={handleConnected} />
      )}

      {screen === 'call' && (
        <CallScreen
          onEndCall={handleEndCall}
          onToggleMute={(isMuted) => {
            console.log('Microphone', isMuted ? 'muted' : 'unmuted');
          }}
        />
      )}
    </>
  );
}