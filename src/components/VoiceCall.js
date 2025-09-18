import { useVoiceCallRealtime } from "../hooks/useVoiceCallRealtime";

export function VoiceCall() {
  const wsRef = useVoiceCallRealtime({
    apiBase: "" // если фронт и сервер вместе
    // apiBase: "https://tg-callapp.com:3000" // если сервер отдельно
  });

  return (
    <div className="p-4">
      <h1>🎤 Голосовой помощник</h1>
      <button
        onClick={() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ action: "ping" }));
          }
        }}
      >
        Проверить соединение
      </button>
    </div>
  );
}
