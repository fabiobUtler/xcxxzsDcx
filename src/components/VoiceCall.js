import { useVoiceCallRealtime } from "../hooks/useVoiceCallRealtime";
import { useEffect } from "react";

export function VoiceCall() {
  const {
    isCalling,
    transcripts,
    startCall,
    endCall,
  } = useVoiceCallRealtime({
    onTranscript: (t) => console.log("Транскрипция:", t),
    onAIResponse: (text) => console.log("AI сказал:", text),
  });

  useEffect(() => {
    return () => {
      // очистка при размонтировании
    };
  }, []);

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Голосовой помощник</h1>

      <button
        onClick={isCalling ? endCall : startCall}
        className={`w-full py-3 font-bold text-white rounded-lg ${
          isCalling ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
        }`}
      >
        {isCalling ? "⏹️ Завершить звонок" : "🎤 Начать разговор"}
      </button>

      <div className="mt-6 space-y-2">
        {transcripts.map((t, i) => (
          <div key={i} className={`${t.who === "AI" ? "text-blue-600" : "text-gray-800"}`}>
            <strong>{t.who}:</strong> {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}