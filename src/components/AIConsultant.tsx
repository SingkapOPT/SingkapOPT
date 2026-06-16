import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, OPTReport } from '../types';
import { MessageSquare, Send, Sparkles, AlertCircle, RefreshCw, X } from 'lucide-react';

interface AIConsultantProps {
  onSendMessage: (messages: ChatMessage[], reportContext?: OPTReport | null) => Promise<string>;
  activeReportContext?: OPTReport | null;
  onClearContext?: () => void;
}

const PRESET_PROMPTS = [
  'Bagaimana membudidayakan Beauveria Bassiana secara mandiri?',
  'Resep pesnab sirsak dan tembakau untuk ulat kubis',
  'Penanganan tikus sawah ramah lingkungan menggunakan burung hantu',
  'Cara membuat perangkap kuning lekat untuk cabai'
];

export default function AIConsultant({ onSendMessage, activeReportContext, onClearContext }: AIConsultantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Salam Tani! Saya Konsultan Hayati SINGKAP OPT. Ada yang bisa saya bantu terkait penanganan organisme pengganggu tumbuhan (OPT) menggunakan agens hayati, musuh alami, atau ramuan organik nabati yang ramah lingkungan?',
      timestamp: new Date().toLocaleTimeString(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState('');

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputText('');
    setLoading(true);
    setErrorStatus('');

    try {
      const responseText = await onSendMessage(updatedMessages, activeReportContext);
      
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      setErrorStatus('Konsultan AI terputus. Silakan coba kirim ulang pesan Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(inputText);
  };

  // Quick preset helper
  const handlePresetClick = (preset: string) => {
    handleSend(preset);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: 'Salam Tani! Riwayat konsultasi telah dibersihkan. Silakan tanyakan seputar agens hayati, tanaman refugia, atau pestisida ramah lingkungan lainnya.',
        timestamp: new Date().toLocaleTimeString(),
      }
    ]);
    setErrorStatus('');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs flex flex-col h-[520px] overflow-hidden">
      
      {/* Consultant Head banner */}
      <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 text-white px-5 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-emerald-300">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-xs">Konsultan Hayati AI Singkap</h3>
            <p className="text-[10px] text-emerald-100 leading-none mt-0.5">Pendampingan Pengendalian PHT & Pestisida Organik</p>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          className="text-xs text-emerald-50 hover:text-white px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition flex items-center gap-1 font-semibold"
        >
          <RefreshCw className="w-3 h-3" />
          Reset Chat
        </button>
      </div>

      {/* Conditionally Attached Report Context Notification */}
      {activeReportContext && (
        <div className="bg-amber-50 px-4 py-2 border-b border-amber-100/50 flex justify-between items-center text-xs text-amber-900 animate-fade-in font-medium">
          <div className="flex items-center space-x-1.5 leading-snug">
            <AlertCircle className="w-3.8 h-3.8 text-amber-600 flex-shrink-0" />
            <span>
              Sedang berkonsultasi terkait Lahan <strong>Desa {activeReportContext.locationVillage}</strong> ({activeReportContext.cropType} - {activeReportContext.pestName})
            </span>
          </div>
          <button 
            type="button"
            onClick={onClearContext}
            className="p-1 hover:bg-amber-100 rounded text-amber-700 flex items-center"
            title="Hilangkan fokus laporan"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Chat Messages Panel */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3.5 shadow-2xs whitespace-pre-line text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-none'
                  : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
              }`}
            >
              <div>{msg.text}</div>
              <span className={`block text-[8px] text-right mt-1.5 ${msg.sender === 'user' ? 'text-slate-400' : 'text-slate-400'}`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl p-4 border border-slate-150 rounded-tl-none space-y-2 flex items-center space-x-3 text-xs text-slate-500 shadow-2xs">
              <div className="flex space-x-1">
                <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
              <span>Merumuskan resep biologi ramah lingkungan...</span>
            </div>
          </div>
        )}

        {errorStatus && (
          <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-1.5 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorStatus}</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Quick Prompts Panel (Shown only at bottom helper if conversation is short) */}
      {messages.length < 3 && (
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 overflow-x-auto whitespace-nowrap flex gap-2 scrollbar-none">
          {PRESET_PROMPTS.map((preset, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handlePresetClick(preset)}
              className="inline-block bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200 hover:border-emerald-200 rounded-full px-3 py-1 text-[10px] font-bold transition flex-shrink-0"
            >
              🙋‍♂️ {preset}
            </button>
          ))}
        </div>
      )}

      {/* Form Area */}
      <form onSubmit={handleFormSubmit} className="p-3 bg-white border-t border-slate-100 flex space-x-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={activeReportContext ? `Tanyakan detail penanganan untuk Desa ${activeReportContext.locationVillage}...` : "Tulis pertanyaan, misal: ulat grayak jagung..."}
          className="flex-1 text-xs px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl disabled:bg-slate-100 disabled:text-slate-400 transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
