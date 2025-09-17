// Заглушка TTS — будет заменена на ElevenLabs/OpenAI Realtime
export class TTSService {
  async speak(text) {
    console.log('TTS: Озвучка:', text);

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    }
  }
}