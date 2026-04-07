
import React, { useState, useRef, useEffect } from 'react';
import { SendIcon } from './icons';
import { ChatMessage } from '../services/geminiService';

interface FollowUpChatProps {
  chatHistory: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
}

export const FollowUpChat: React.FC<FollowUpChatProps> = ({ chatHistory, onSendMessage, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    const currentPrompt = prompt.trim();
    setPrompt('');
    await onSendMessage(currentPrompt);
  };

  return (
    <div className="mt-8 border-t border-slate-700 pt-6 animate-fade-in">
      <h3 className="text-lg font-semibold text-slate-300 mb-4">Ask a follow-up question</h3>
      
      <div ref={chatContainerRef} className="max-h-60 overflow-y-auto pr-2 space-y-4 mb-4">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xl px-4 py-2 rounded-lg shadow-md ${
                msg.role === 'user' 
                ? 'bg-cyan-600 text-white rounded-br-none' 
                : 'bg-slate-600 text-slate-200 rounded-bl-none'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
         {isLoading && chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === 'user' && (
           <div className="flex justify-start">
             <div className="max-w-xl px-4 py-2 rounded-lg bg-slate-600 text-slate-200 rounded-bl-none shadow-md">
                <div className="flex items-center gap-2 p-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0s]"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.15s]"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:0.3s]"></div>
                </div>
             </div>
           </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isLoading}
          placeholder="e.g., What's the history of this place?"
          className="flex-grow bg-slate-700 border border-slate-600 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors disabled:bg-slate-800 disabled:cursor-not-allowed"
          aria-label="Follow-up question"
        />
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold p-3 rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 shadow-lg flex-shrink-0"
          aria-label="Send message"
        >
          <SendIcon className="w-6 h-6" />
        </button>
      </form>
    </div>
  );
};
