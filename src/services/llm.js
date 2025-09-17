// Заглушка LLM — будет заменена на OpenAI/Groq/Llama
export class LLMService {
  async process(text) {
    console.log('LLM: Получено:', text);

    // Имитация задержки ответа
    await new Promise(r => setTimeout(r, 1500));

    const responses = {
      'hello': 'Hi! How can I help you?',
      'test': 'Yes, I hear you. This is a real-time call.',
      'default': 'I understand. Tell me more.'
    };

    const key = Object.keys(responses).find(k => text.toLowerCase().includes(k)) || 'default';
    return responses[key];
  }
}