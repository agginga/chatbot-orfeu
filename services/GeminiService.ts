import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";

export class GeminiService {
  private ai: GoogleGenAI;
  private chat: Chat | null = null;
  private apiKey: string;

  // Modelos primário e secundário (fallback)
  private primaryModel = "gemini-2.5-flash";
  private fallbackModel = "gemini-1.5-pro-latest";

  constructor(apiKey: string) {
    if (!apiKey) {
      console.error("API key is missing. GeminiService cannot be initialized.");
    }
    this.apiKey = apiKey;
    this.ai = new GoogleGenAI({ apiKey: this.apiKey });
  }

  public isInitialized(): boolean {
    return !!this.apiKey && !!this.ai;
  }

  // 🔁 Cria uma sessão de chat com o modelo escolhido
  private async createChat(model: string): Promise<Chat> {
    return this.ai.chats.create({
      model,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        // tools: [{ googleSearch: {} }], // opcional
      },
    });
  }

  // 🚀 Inicializa o chat com fallback automático
  public async startChat(): Promise<boolean> {
    if (!this.isInitialized()) {
      console.error("Gemini AI SDK not initialized due to missing API Key.");
      return false;
    }

    try {
      this.chat = await this.createChat(this.primaryModel);
      console.log(`✅ Chat iniciado com modelo: ${this.primaryModel}`);
      return true;
    } catch (error) {
      console.warn(`⚠️ Falha ao iniciar com ${this.primaryModel}. Tentando fallback...`, error);

      try {
        this.chat = await this.createChat(this.fallbackModel);
        console.log(`✅ Fallback bem-sucedido com modelo: ${this.fallbackModel}`);
        return true;
      } catch (fallbackError) {
        console.error(`❌ Fallback também falhou:`, fallbackError);
        return false;
      }
    }
  }

  // 💬 Envia mensagens e trata erros
  public async sendMessage(message: string): Promise<GenerateContentResponse> {
    if (!this.chat) {
      const started = await this.startChat();
      if (!started || !this.chat) {
        throw new Error("Desculpe, não consegui iniciar a conversa. Verifique a configuração.");
      }
    }

    try {
      const response = await this.chat.sendMessage({ message });
      return response;
    } catch (error: any) {
      console.error("❌ Erro ao enviar mensagem:", error);

      // Se for erro de sobrecarga (503), tenta novamente com fallback
      if (error.message?.includes("503") || error.status === "UNAVAILABLE") {
        console.warn("⚙️ Modelo sobrecarregado. Tentando fallback...");

        try {
          this.chat = await this.createChat(this.fallbackModel);
          const response = await this.chat.sendMessage({ message });
          console.log(`✅ Mensagem enviada com sucesso usando fallback (${this.fallbackModel})`);
          return response;
        } catch (retryError) {
          console.error("❌ Fallback também falhou:", retryError);
          throw new Error("O servidor da IA está sobrecarregado no momento. Tente novamente em alguns segundos.");
        }
      }

      // Erros genéricos
      if (error instanceof Error) {
        throw new Error(`Erro ao comunicar com a IA: ${error.message}. Tente novamente.`);
      }
      throw new Error("Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.");
    }
  }
}