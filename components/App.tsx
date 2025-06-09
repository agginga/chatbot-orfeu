import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ChatMessage, Sender, WebSource } from "../types";
import { GeminiService } from "../services/GeminiService";
import MessageBubble from "./MessageBubble";
import SendIcon from "./icons/SendIcon";
import SuggestionPrompts from "./SuggestionPrompts";
import GingaLogoNew from "./icons/GingaLogoNew";
import { SUGGESTION_PROMPTS } from "../constants";
import type { GenerateContentResponse } from "@google/genai";
import Background from "./Background";

const App: React.FC = () => {
  /* ---------------- estados ---------------- */
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- serviços ---------------- */
  const geminiServiceApiKey = process.env.API_KEY || "";
  const geminiService = useMemo(
    () => new GeminiService(geminiServiceApiKey),
    [geminiServiceApiKey]
  );

  /* ---------------- refs ---------------- */
  const containerRef = useRef<HTMLDivElement>(null);   // <- novo
  const inputRef = useRef<HTMLTextAreaElement>(null);

  /* ---------------- scroll helper ---------------- */
  const scrollToBottom = useCallback(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  /* mantém rolagem após cada render de mensagem */
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  /* ---------------- init ---------------- */
  useEffect(() => {
    if (!geminiService.isInitialized()) {
      const msg = "Chave da API não configurada. Por favor, defina API_KEY.";
      setError(msg);
      setMessages((p) =>
        p.some((m) => m.id === "apikey-error-init")
          ? p
          : [...p, { id: "apikey-error-init", text: msg, sender: Sender.SYSTEM, timestamp: new Date() }]
      );
      return;
    }
    inputRef.current?.focus();
  }, [geminiService]);

  /* ---------------- envio de mensagem ---------------- */
  const handleSendMessage = async (messageText?: string) => {
    const textToSend = (messageText || userInput).trim();
    if (!textToSend || isLoading) return;

    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      text: textToSend,
      sender: Sender.USER,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newUserMsg]);
    setUserInput("");
    setIsLoading(true);
    setError(null);
    setTimeout(scrollToBottom, 0); // garante scroll após render

    try {
      const aiResp: GenerateContentResponse = await geminiService.sendMessage(newUserMsg.text);
      const aiText = aiResp.text || "Desculpe, não consegui processar uma resposta.";

      let sources: WebSource[] | undefined;
      const gm = aiResp.candidates?.[0]?.groundingMetadata;
      if (gm?.groundingChunks?.length) {
        sources = gm.groundingChunks
          .map((c: any) => ({
            uri: c.web?.uri || "",
            title: c.web?.title || c.web?.uri || "Fonte desconhecida",
          }))
          .filter((s) => s.uri);
        if (!sources.length) sources = undefined;
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: aiText,
        sender: Sender.AI,
        timestamp: new Date(),
        sources,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setTimeout(scrollToBottom, 0); // rola depois do AI
    } catch (e) {
      const errText = e instanceof Error ? e.message : "Ocorreu um erro desconhecido.";
      setError(errText);
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), text: errText, sender: Sender.SYSTEM, timestamp: new Date() },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  /* ---------------- handlers auxiliares ---------------- */
  const handleSuggestionClick = (p: string) => !isLoading && handleSendMessage(p);
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [userInput]);

  const isApiKeyMissing = !geminiServiceApiKey;
  const showSuggestions = !messages.length && !isLoading && !error && !isApiKeyMissing;

  /* ---------------- JSX ---------------- */
  return (
    <>
      <Background />

      <div className="w-full h-screen flex flex-col overflow-hidden bg-transparent text-gray-800 sm:rounded-[32px]">
        {/* Header */}
        <div className="flex-shrink-0 bg-transparent z-10">
          <div className="flex flex-col items-center gap-3 md:gap-4 py-4 sm:py-6 animate-fadeIn w-full max-w-3xl mx-auto px-4">
            <GingaLogoNew className="w-20 h-20" />
            <div className="text-center text-xl">
              <span className="font-normal text-gray-700">Bem-vindo à </span>
              <span className="font-bold text-gray-800">GINGA.AI</span>
            </div>
          </div>
        </div>

        {/* Área do chat */}
        <div className="flex-grow flex flex-col relative overflow-hidden bg-transparent">
          <main
            ref={containerRef}
            className="flex-grow overflow-y-auto flex flex-col pt-4 pb-4 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            {messages.map((m) => <MessageBubble key={m.id} message={m} />)}

            {isLoading && messages.at(-1)?.sender === Sender.USER && (
              <MessageBubble
                key="typing"
                message={{ id: "typing-indicator", text: "", sender: Sender.AI, timestamp: new Date(), isTyping: true }}
              />
            )}
          </main>

          {showSuggestions && (
            <SuggestionPrompts prompts={SUGGESTION_PROMPTS} onSuggestionClick={handleSuggestionClick} disabled={isLoading} />
          )}

          {/* Barra de input */}
          <div className="flex-shrink-0 z-10 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-3 sm:pb-4">
            {isApiKeyMissing && (
              <div className="mb-2 p-2 text-xs text-center text-red-700 bg-red-100 border border-red-300 rounded-md">
                Atenção: API_KEY não configurada.
              </div>
            )}
            {error && !error.includes("API Key") && (
              <div className="mb-2 p-2 text-xs text-center text-red-700 bg-red-100 border border-red-300 rounded-md">
                {error}
              </div>
            )}

            <div className="flex items-end bg-white/35 backdrop-blur-md p-2.5 shadow-sm rounded-lg">
              <textarea
                ref={inputRef}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="O que você gostaria de perguntar?"
                className="flex-grow resize-none bg-transparent border-none placeholder-gray-500 text-gray-900 text-sm leading-tight focus:ring-0 p-1"
                rows={1}
                disabled={isLoading || isApiKeyMissing}
                aria-label="Digite sua mensagem"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !userInput.trim() || isApiKeyMissing}
                className="w-9 h-9 ml-2 flex items-center justify-center flex-shrink-0 rounded-md
                           bg-[#F9A01E] hover:bg-[#FFB938] transition-colors duration-150
                           disabled:opacity-50 disabled:cursor-not-allowed
                           focus:outline-none focus:ring-2 focus:ring-[#F9A01E]/70"
                aria-label="Enviar mensagem"
              >
                <SendIcon className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;