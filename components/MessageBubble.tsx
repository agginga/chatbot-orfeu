
import React from 'react';
import { ChatMessage, Sender, WebSource } from '../types';

// Simple markdown to HTML for bold, italic, and lists.
// Keeps basic paragraph structure and converts newlines within paragraphs to <br>.
const markdownToHtml = (text: string): { __html: string } => {
  if (typeof text !== 'string') {
    return { __html: '' };
  }
  let html = text;

  // Bold: **text** or __text__
  html = html.replace(/\*\*(.*?)\*\*|__(.*?)__/g, '<strong>$1$2</strong>');
  // Italic: *text* or _text_
  html = html.replace(/(?<!\*)\*(?!\s|\*)([^*]+?)(?<!\s|\*)\*(?!\*)|(?<!_)_{1}(?!\s|_)([^_]+?)(?<!\s|_)_{1}(?!_)/g, '<em>$1$2</em>');

  // Unordered lists
  html = html.replace(/^([ \t]*)(?:[-*+])\s+(.*(?:(?:\n^[ \t]*(?!(?:[-*+]|\d+\.))(?!\s*$)S*).*)*)/gm, (match, indent, content) => {
    const listItems = content.split('\n');
    let listHtml = `${indent}<ul class="list-disc pl-5 my-1">\n`;
    for (const item of listItems) {
      const itemContent = item.replace(/^[ \t]*(?:[-*+])?\s*/, '').trim(); 
      if (itemContent) { 
        listHtml += `${indent}  <li class="mb-0.5">${itemContent}</li>\n`;
      }
    }
    listHtml += `${indent}</ul>`;
    return listHtml;
  });

  // Ordered lists
  html = html.replace(/^([ \t]*)(\d+)\.\s+(.*(?:(?:\n^[ \t]*(?!(?:[-*+]|\d+\.))(?!\s*$)S*).*)*)/gm, (match, indent, startNum, content) => {
    const listItems = content.split('\n');
    let listHtml = `${indent}<ol class="list-decimal pl-5 my-1" start="${startNum}">\n`;
    for (const item of listItems) {
      const itemContent = item.replace(/^[ \t]*\d+\.?\s*/, '').trim();
      if (itemContent) { 
        listHtml += `${indent}  <li class="mb-0.5">${itemContent}</li>\n`;
      }
    }
    listHtml += `${indent}</ol>`;
    return listHtml;
  });
  
  // Paragraphs and line breaks
  html = html.split(/\n\s*\n/).map(paragraph => { // Split by double newlines for paragraphs
    if (paragraph.trim().startsWith('<ul') || paragraph.trim().startsWith('<ol') || paragraph.trim() === '') {
      return paragraph; // Don't wrap lists or empty lines in <p>
    }
    // For non-list paragraphs, replace single newlines with <br />
    return `<p class="my-0.5">${paragraph.replace(/\n/g, '<br />')}</p>`;
  }).join('');

  // Remove empty paragraphs that might have been created
  html = html.replace(/<p class="my-0.5"><\/p>/g, '');


  return { __html: html };
};

interface MessageBubbleProps {
  message: ChatMessage & { isTyping?: boolean }; 
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === Sender.USER;
  const isSystem = message.sender === Sender.SYSTEM;
  const isAI = message.sender === Sender.AI;

  // Reverted styles
  const bubbleContainerAlignmentClasses = isUser ? 'items-start self-start ml-0 mr-auto' : 'items-end self-end mr-0 ml-auto';
  
  const userBubbleClasses = 'bg-[#FFFFF8] text-[#1D1D1D]';
  const aiBubbleClasses = 'bg-[#F9A01E] text-[#1D1D1D]'; // Ginga Orange

  const commonBubbleStyles = 'py-2 px-4 rounded-lg shadow-md';
  
  const currentBubbleSpecificClasses = isUser ? userBubbleClasses : aiBubbleClasses;
  const currentMessageTextClasses = isUser ? "text-[#1D1D1D] text-sm leading-snug" : "text-[#1D1D1D] text-sm leading-snug";

  const senderLabel = isUser ? "EU" : isAI ? "GINGA.AI" : null;
  const labelClasses = `text-xs font-medium text-[#1D1D1D] mb-1`; 

  if (isSystem) {
    return (
      <div className="flex justify-center my-2 animate-fadeIn">
        <div className="px-3 py-1.5 bg-red-100 text-red-700 border border-red-200 rounded-md text-xs text-center max-w-md">
          <div dangerouslySetInnerHTML={markdownToHtml(message.text)} />
           {message.text.includes("API Key") && (
              <p className="mt-1 text-xs">
                  Por favor, configure a variável de ambiente <code className="bg-gray-200 text-red-600 px-0.5 rounded">API_KEY</code>.
              </p>
            )}
        </div>
      </div>
    );
  }
  
  if (message.isTyping) {
    return (
        <div className={`flex flex-col items-end self-end mr-0 ml-auto w-full mb-4 animate-fadeIn`}>
            <span className={`${labelClasses} self-end`}>GINGA.AI</span>
            <div className={`inline-block ${commonBubbleStyles} ${aiBubbleClasses} text-left`}>
                <div className="flex items-center space-x-1 animate-dots h-[14px]">
                    {/* Default dark dots from global animation should be visible on orange background */}
                    <span className="w-1.5 h-1.5 rounded-full bg-[rgba(29,29,29,0.3)]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[rgba(29,29,29,0.3)]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[rgba(29,29,29,0.3)]"></span>
                </div>
            </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${bubbleContainerAlignmentClasses} w-full mb-4 animate-fadeIn`}>
      {senderLabel && (
        <span className={`${labelClasses} ${isUser ? 'self-start' : 'self-end'}`}>
          {senderLabel}
        </span>
      )}
      <div
        className={`inline-block max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg ${commonBubbleStyles} ${currentBubbleSpecificClasses}`}
      >
        <div className={`${currentMessageTextClasses} prose prose-sm max-w-none`} dangerouslySetInnerHTML={markdownToHtml(message.text)} />
        
        {isAI && message.sources && message.sources.length > 0 && (
          <div className="mt-2 pt-1.5 border-t border-white/30"> {/* Adjusted border for orange bg */}
            <p className="text-xs font-semibold mb-0.5 text-white/80">Fontes:</p> {/* Adjusted text for orange bg */}
            <ul className="list-none pl-0 text-xs">
              {message.sources.map((source: WebSource, index: number) => (
                <li key={index} className="mb-0.5">
                  <a 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white hover:text-gray-200 underline" /* Link color for orange bg */
                    title={`Abrir fonte: ${source.title || source.uri}`}
                  >
                    {source.title || source.uri}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
