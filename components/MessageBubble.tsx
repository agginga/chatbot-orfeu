import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { ChatMessage, Sender } from "../types";

interface MessageBubbleProps {
  message: ChatMessage;
  onQuestionClick?: (q: string) => void;
}

// 💡 Componente de Perguntas Sugeridas
const SuggestedQuestions: React.FC<{
  questions: string[];
  show: boolean;
  onClick?: (q: string) => void;
}> = ({ questions, show, onClick }) => {
  const [visibleQuestions, setVisibleQuestions] = useState<string[]>([]);

  useEffect(() => {
    if (show) {
      questions.forEach((q, i) => {
        const timer = setTimeout(() => {
          setVisibleQuestions((prev) => [...prev, q]);
        }, i * 150);
        return () => clearTimeout(timer);
      });
    } else {
      setVisibleQuestions([]);
    }
  }, [show, questions]);

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      <AnimatePresence>
        {visibleQuestions.map((q) => (
          <motion.div
            key={q}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="bg-[#F9A01E]/10 px-3 py-1 rounded-full text-sm cursor-pointer select-none hover:bg-[#F9A01E]/20"
            onClick={() => onClick?.(q)}
          >
            {q}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// 💬 Componente principal de mensagens
const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onQuestionClick }) => {
  const isAI = message.sender === Sender.AI;
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Delay natural para exibir sugestões
  useEffect(() => {
    setShowSuggestions(false);

    if (!message.isTyping && message.suggestedQuestions?.length) {
      const timer = setTimeout(() => setShowSuggestions(true), 200);
      return () => clearTimeout(timer);
    }
  }, [message.id, message.isTyping, message.suggestedQuestions]);

  // Loader animado (3 bolinhas)
  if (message.isTyping) {
    return (
      <div className="my-2 flex justify-start animate-fadeIn">
        <div className="flex flex-col items-start bg-[#F9A01E]/10 rounded-2xl px-4 py-3 shadow-sm">
          <div className="flex items-center space-x-2">
            <span className="text-gray-600 text-xs italic">Pensando</span>
            <div className="flex space-x-1">
              <span className="w-1.5 h-1.5 bg-[#F9A01E] rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-[#F9A01E] rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-[#F9A01E] rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 💬 Mensagem normal (usuário ou IA)
  return (
    <>
      <motion.div
        className={`my-2 flex ${isAI ? "justify-start" : "justify-end"}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <div
          className={`max-w-[90%] rounded-2xl px-4 py-3 shadow-sm ${
            isAI
              ? "bg-[#F9A01E]/10 text-gray-900 text-[13.5px] leading-snug"
              : "bg-[#F9A01E] text-gray-900 text-[13.5px] leading-snug"
          }`}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ ...props }) => (
                <p style={{ margin: "0.45em 0", lineHeight: "1.3em" }} {...props} />
              ),
              li: ({ ...props }) => (
                <li style={{ marginBottom: "0.45em", lineHeight: "1.3em" }} {...props} />
              ),
              ul: ({ ...props }) => (
                <ul style={{ margin: "0.5em 0", paddingLeft: "1.3em" }} {...props} />
              ),
              ol: ({ ...props }) => (
                <ol style={{ margin: "0.5em 0", paddingLeft: "1.3em" }} {...props} />
              ),
              strong: ({ ...props }) => (
                <strong style={{ color: "#151515", fontWeight: 600 }} {...props} />
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#F9A01E] underline hover:text-[#d88715]"
                >
                  {children}
                </a>
              ),
            }}
          >
            {message.text}
          </ReactMarkdown>
        </div>
      </motion.div>

      {/* 💡 Perguntas sugeridas (animadas) */}
      {isAI && message.suggestedQuestions && (
        <SuggestedQuestions
          questions={message.suggestedQuestions}
          show={showSuggestions}
          onClick={onQuestionClick}
        />
      )}
    </>
  );
};

export default MessageBubble;