import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { useChatWithAssistantMutation } from '../api/aiApi';

export const ClinicalAssistantDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<{sender: 'user' | 'ai'; text: string}[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [chatWithAssistant, { isLoading }] = useChatWithAssistantMutation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInput('');

    try {
      const res = await chatWithAssistant({ message: userMessage }).unwrap();
      setMessages(prev => [...prev, { sender: 'ai', text: res.data }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, I encountered an error. Please try again.' }]);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 bg-indigo-600 rounded-full shadow-2xl flex items-center justify-center text-white z-40 hover:bg-indigo-700 transition-colors"
      >
        <Bot className="h-7 w-7" />
        <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
      </motion.button>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed bottom-24 right-6 bg-white rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col border border-slate-200 transition-all duration-300 ${isExpanded ? 'w-[600px] h-[80vh]' : 'w-[400px] h-[600px]'}`}
          >
            {/* Header */}
            <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Clinical Assistant AI</h3>
                  <p className="text-xs text-indigo-200">Powered by Gemini 1.5</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsExpanded(!isExpanded)} className="text-white/80 hover:text-white transition-colors">
                  {isExpanded ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                </button>
                <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center px-4">
                  <Bot className="h-16 w-16 text-slate-300 mb-4" />
                  <p className="font-medium text-slate-700">Hello, Doctor.</p>
                  <p className="text-sm">I can help with medical queries, drug interactions, clinical guidelines, or summarize patient records.</p>
                  
                  <div className="mt-8 flex flex-col gap-2 w-full">
                    <button onClick={() => setInput('What is the recommended dosage for Amoxicillin for a 10kg child?')} className="text-xs bg-white border border-slate-200 p-2 rounded text-left hover:bg-slate-100 transition-colors">
                      What is the recommended dosage for Amoxicillin for a 10kg child?
                    </button>
                    <button onClick={() => setInput('Check interactions between Warfarin and Ibuprofen')} className="text-xs bg-white border border-slate-200 p-2 rounded text-left hover:bg-slate-100 transition-colors">
                      Check interactions between Warfarin and Ibuprofen
                    </button>
                  </div>
                </div>
              )}
              
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${m.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'}`}>
                    <div className="whitespace-pre-wrap">{m.text}</div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2 shadow-sm">
                    <Loader2 className="h-4 w-4 text-indigo-600 animate-spin" />
                    <span className="text-sm text-slate-500">Assistant is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-200">
              <div className="flex items-end gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200 transition-all">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask anything..."
                  className="flex-1 bg-transparent border-none resize-none px-4 py-3 text-sm focus:outline-none max-h-32 min-h-[44px]"
                  rows={1}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-3 bg-indigo-600 text-white rounded-xl mb-1 mr-1 disabled:opacity-50 hover:bg-indigo-700 transition-colors"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
