import React from 'react';

interface SuggestionPromptsProps {
  prompts: string[];
  onSuggestionClick: (prompt: string) => void;
  disabled?: boolean;
}

const SuggestionPrompts: React.FC<SuggestionPromptsProps> = ({ prompts, onSuggestionClick, disabled }) => {
  if (!prompts || prompts.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 bg-transparent pt-2 pb-3 sm:pb-4 z-10 flex-shrink-0 animate-fadeIn text-left">
      <p className="text-sm font-medium text-[#1D1D1D] mb-2">
        ✨ Sugestões:
      </p>
      <div className="flex flex-wrap justify-start items-start gap-2 text-left">
        {prompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(prompt)}
            disabled={disabled}
            className="
              bg-[#FFFFF8]/35 hover:bg-[#FFFFF8]/75
              text-[#1D1D1D] border border-gray-300 rounded-full
              px-4 py-1.5 text-xs sm:text-sm
              text-left!important whitespace-normal break-words
              min-w-0 max-w-full
              transition-colors duration-150 ease-in-out
              focus:outline-none focus:ring-2 focus:ring-orange-300
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            aria-label={`Sugestão: ${prompt}`}
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestionPrompts;