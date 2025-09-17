// Заглушка STT — будет заменена на WebRTC + Whisper/Deepgram
export class STTService {
  constructor(onTranscript) {
    this.onTranscript = onTranscript;
    this.isRunning = false;
  }

  async start(stream) {
    console.log('STT: Запуск распознавания...');
    this.isRunning = true;

    // Имитация распознавания
    const mockTranscripts = [
      'Hello, how are you?',
      'I am testing the voice call',
      'This should be sent to LLM'
    ];

    let i = 0;
    this.interval = setInterval(() => {
      if (i < mockTranscripts.length && this.isRunning) {
        this.onTranscript(mockTranscripts[i++]);
      } else {
        clearInterval(this.interval);
      }
    }, 3000);
  }

  stop() {
    this.isRunning = false;
    clearInterval(this.interval);
    console.log('STT: Остановлен');
  }
}