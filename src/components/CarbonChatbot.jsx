import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MessageSquare, Send, Bot, User, X } from 'lucide-react';
import { getApiUrl } from '../utils/api';
import { generateResponse } from '../utils/chatbotHelpers';

/**
 * CarbonChatbot React Component (Floating Widget)
 */
export default function CarbonChatbot({ userProfile, emissionBreakdown, recommendations }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hello! I am your CarbonMind sustainability assistant. Ask me questions about your emissions breakdown or reduction advice.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll chat history to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setInput('');
    
    // Add user message
    const userMsg = { id: Date.now(), sender: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);

    // Show typing indicator
    setIsTyping(true);

    try {
      const response = await fetch(getApiUrl('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          profile: userProfile,
          emissions: emissionBreakdown,
          recommendations: recommendations
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.response) {
          setMessages(prev => [
            ...prev,
            { id: Date.now() + 1, sender: 'bot', text: data.response }
          ]);
          setIsTyping(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Backend chat failed, falling back to local KB:", err);
    }

    // Local rules-based engine fallback
    const context = { userProfile, emissionBreakdown, recommendations };
    const botResponseText = generateResponse(userText, context);
    
    setMessages(prev => [
      ...prev,
      { id: Date.now() + 1, sender: 'bot', text: botResponseText }
    ]);
    setIsTyping(false);
  };

  const widgetContent = (
    <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] h-[480px] z-[9999] flex flex-col bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* Header */}
      <div className="bg-slate-950 border-b border-slate-850 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-emerald-400" aria-hidden="true" />
          <span className="font-bold text-white text-sm">AI Sustainability Assistant</span>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-slate-900"
          aria-label="Close chat"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      {/* Chat Box Container */}
      <div className="flex-grow flex flex-col min-h-0 bg-slate-950/40">
        
        {/* Chat History Panel */}
        <div 
          className="flex-grow p-4 overflow-y-auto space-y-4"
          aria-live="polite"
          role="log"
        >
          {messages.map((msg) => {
            const isBot = msg.sender === 'bot';
            return (
              <div 
                key={msg.id} 
                className={`flex gap-3 max-w-[85%] ${isBot ? 'mr-auto text-left' : 'ml-auto flex-row-reverse text-right'}`}
              >
                {/* Avatar Icon */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border 
                  ${isBot 
                    ? 'bg-emerald-950/40 border-emerald-900/40 text-emerald-400' 
                    : 'bg-slate-900 border-slate-800 text-slate-350'
                  }`}
                  aria-hidden="true"
                >
                  {isBot ? <Bot size={16} /> : <User size={16} />}
                </div>

                {/* Message Bubble */}
                <div className={`p-3.5 rounded-xl text-xs md:text-sm leading-relaxed shadow-sm
                  ${isBot 
                    ? 'bg-slate-900 border border-slate-850 text-slate-300' 
                    : 'bg-emerald-400 text-slate-950 font-semibold'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 max-w-[80%] mr-auto text-left" aria-hidden="true">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-950/40 border border-emerald-900/40 text-emerald-400">
                <Bot size={16} />
              </div>
              <div className="p-3 bg-slate-900 border border-slate-850 text-slate-400 text-xs rounded-xl flex items-center gap-1.5 font-semibold">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-700" />
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-1000" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Controls form */}
        <form onSubmit={handleSend} className="p-3 bg-slate-900/60 border-t border-slate-850 flex gap-2">
          <input
            type="text"
            placeholder="Ask a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow px-3.5 py-2 bg-slate-950 text-slate-100 border border-slate-800 focus:outline-none focus:border-emerald-500 rounded-lg text-xs"
            aria-label="Sustainability question input"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-emerald-400 hover:bg-emerald-350 text-slate-950 font-bold rounded-lg flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Send message"
          >
            <Send size={14} aria-hidden="true" />
          </button>
        </form>

      </div>
    </div>
  );

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none"
        aria-label="Toggle chatbot assistant"
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={24} aria-hidden="true" /> : <MessageSquare size={24} aria-hidden="true" />}
      </button>

      {/* Render Chat Panel using Portal */}
      {isOpen && createPortal(widgetContent, document.body)}
    </>
  );
}
