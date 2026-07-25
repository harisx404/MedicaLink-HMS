import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react';
import { usePatientTriageChatMutation } from '../../ai/api/aiApi';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  urgency?: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
  recommendedDepartment?: string;
}

export const PortalAIChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I am your MedicaLink AI Triage & Health Copilot. Describe your symptoms or ask health questions for instant preliminary evaluation and department recommendations.',
    }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [triageChat, { isLoading: isTyping }] = usePatientTriageChatMutation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent, customText?: string) => {
    e?.preventDefault();
    const textToSend = customText || input.trim();
    if (!textToSend || isTyping) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInput('');

    try {
      const res = await triageChat({
        message: textToSend,
        history: messages.map(m => ({ role: m.role, content: m.content }))
      }).unwrap();

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.data.reply || 'Please consult a clinician for detailed medical advice.',
        urgency: res.data.urgency,
        recommendedDepartment: res.data.recommendedDepartment
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I am operating in offline triage mode. If you are experiencing severe symptoms, please visit the emergency room immediately.',
        urgency: 'MEDIUM',
        recommendedDepartment: 'General Medicine'
      };
      setMessages(prev => [...prev, fallbackMsg]);
    }
  };

  const getUrgencyBadge = (urgency?: string) => {
    switch (urgency) {
      case 'EMERGENCY':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">EMERGENCY (Seek Immediate Care)</span>;
      case 'HIGH':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">HIGH URGENCY</span>;
      case 'MEDIUM':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 border border-yellow-200">MEDIUM URGENCY</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">ROUTINE CARE</span>;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-128px)] bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-between shadow-sm border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-400/30">
            <Bot className="text-emerald-400" size={20} />
          </div>
          <div>
            <h2 className="text-white font-bold tracking-wide flex items-center gap-1.5 text-base">
              AI Symptom Triage Copilot <Sparkles size={14} className="text-emerald-400" />
            </h2>
            <p className="text-slate-300 text-xs flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Gemini 1.5 Clinical Engine
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                msg.role === 'user' ? 'bg-indigo-100 text-indigo-600 font-bold' : 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-sm'
              }`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm space-y-2 ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-sm' 
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm'
              }`}>
                <p>{msg.content}</p>

                {msg.urgency && (
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                    {getUrgencyBadge(msg.urgency)}
                    {msg.recommendedDepartment && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        Dept: {msg.recommendedDepartment}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex gap-2 max-w-[85%]">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-sm">
                <Bot size={16} />
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <div className="mb-2 px-1 flex flex-wrap gap-2">
          <button 
            type="button"
            onClick={() => handleSend(undefined, "I have severe chest pressure and shortness of breath")}
            className="text-xs bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1.5 rounded-full font-medium flex items-center gap-1 border border-red-200 transition-all"
          >
            <AlertCircle size={12} /> Chest Pressure & Shortness of Breath
          </button>
          <button 
            type="button"
            onClick={() => handleSend(undefined, "I have a mild headache and fever for 2 days")}
            className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-full font-medium transition-all"
          >
            Mild Fever & Headache
          </button>
        </div>
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your symptoms (e.g. fever, joint pain, cough)..."
            className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all text-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-sm"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
