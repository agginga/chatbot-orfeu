
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { SYSTEM_PROMPT } from '../constants';

export class GeminiService {
  private ai: GoogleGenAI;
  private chat: Chat | null = null;
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      console.error("API key is missing. GeminiService cannot be initialized.");
      // We don't throw here to allow the UI to render an error message
      // The App component will handle the case where apiKey is missing.
    }
    this.apiKey = apiKey;
    this.ai = new GoogleGenAI({ apiKey: this.apiKey });
  }

  public isInitialized(): boolean {
    return !!this.apiKey && !!this.ai;
  }
  
  public async startChat(): Promise<boolean> {
    if (!this.isInitialized()) {
        console.error("Gemini AI SDK not initialized due to missing API Key.");
        return false;
    }
    try {
      this.chat = this.ai.chats.create({
        model: 'gemini-2.5-flash-preview-04-17',
        config: {
            systemInstruction: SYSTEM_PROMPT,
            // tools: [{googleSearch: {}}], // Google Search tool disabled as per request
        }
      });
      return true;
    } catch (error) {
      console.error("Error starting chat session:", error);
      return false;
    }
  }

  public async sendMessage(message: string): Promise<GenerateContentResponse> {
    if (!this.chat) {
      // Attempt to start chat if not already started and API key is present
      if (this.apiKey) {
        const started = await this.startChat();
        if (!started || !this.chat) {
           throw new Error("Desculpe, não consegui iniciar a conversa. Verifique a configuração.");
        }
      } else {
        throw new Error("Erro: A chave da API não foi configurada. Não consigo enviar mensagens.");
      }
    }

    try {
      const response: GenerateContentResponse = await this.chat.sendMessage({ message });
      return response;
    } catch (error) {
      console.error("Error sending message to Gemini:", error);
      if (error instanceof Error) {
        throw new Error(`Erro ao comunicar com a IA: ${error.message}. Tente novamente.`);
      }
      throw new Error("Ocorreu um erro inesperado ao processar sua mensagem. Por favor, tente mais tarde.");
    }
  }
}
