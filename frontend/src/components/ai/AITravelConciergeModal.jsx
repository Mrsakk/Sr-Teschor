import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  Calendar, 
  Compass, 
  RefreshCw
} from 'lucide-react';
import { aiApi } from '../../api/endpoints';

export default function AITravelConciergeModal({ isOpen, onClose, onOpenPlanner }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "សួស្តីបាទ! ខ្ញុំជា **SR TesChor AI Travel Concierge** 🤖 មគ្គុទ្ទេសក៍ទេសចរណ៍ឆ្លាតវៃរបស់អ្នកនៅខេត្តសៀមរាប។\n\nតើខ្ញុំអាចជួយអ្វីដល់ដំណើរកម្សាន្តរបស់អ្នកនៅថ្ងៃនេះបានខ្លះបាទ? អ្នកអាចសាកសួរពីសំបុត្រអង្គរវត្ត ទីតាំងមើលថ្ងៃរះ ម្ហូបឆ្ងាញ់ៗ ឬឱ្យខ្ញុំរៀបចំកាលវិភាគដើរលេងបាន!",
      suggestions: [
        'តើសំបុត្រ Angkor Pass តម្លៃប៉ុន្មាន?',
        'តើកន្លែងណាខ្លះមើលថ្ងៃរះស្អាតបំផុត?',
        'ណែនាំមុខម្ហូបខ្មែរដែលត្រូវតែញ៉ាំ',
        'រៀបចំកាលវិភាគដើរលេង ៣ ថ្ងៃ'
      ],
      destinations: [],
      businesses: []
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lang, setLang] = useState('km'); // 'km' or 'en'
  const chatBottomRef = useRef(null);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSend = async (messageToSend = null) => {
    const text = messageToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    // Add user message
    const newMessages = [
      ...messages,
      { sender: 'user', text }
    ];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await aiApi.chat({ message: text, lang });
      const data = res.data;

      setMessages([
        ...newMessages,
        {
          sender: 'ai',
          text: data.answer,
          suggestions: data.suggestions || [],
          destinations: data.destinations || [],
          businesses: data.businesses || []
        }
      ]);
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          sender: 'ai',
          text: "សូមអភ័យទោស ខ្ញុំកំពុងមានបញ្ហាក្នុងការតភ្ជាប់ប្រព័ន្ធ។ សូមព្យាយាមសាកសួរម្តងទៀតបាទ!",
          suggestions: ['តើសំបុត្រ Angkor Pass តម្លៃប៉ុន្មាន?', 'កន្លែងមើលថ្ងៃរះស្អាតបំផុត'],
          destinations: [],
          businesses: []
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageSwitch = (newLang) => {
    setLang(newLang);
    const greeting = newLang === 'km' 
      ? "សួស្តីបាទ! ខ្ញុំជា **SR TesChor AI Assistant** 🤖 តើខ្ញុំអាចជួយរៀបចំដំណើរកម្សាន្ត ឬឆ្លើយចម្ងល់ទេសចរណ៍អ្វីដល់អ្នកដែរទេបាទ?"
      : "Hello! I am your **SR TesChor AI Travel Concierge** 🤖. Ask me anything about Angkor Pass tickets, sunrise spots, local foods, or let me plan your custom itinerary!";
    
    const sampleSuggestions = newLang === 'km'
      ? ['តើសំបុត្រ Angkor Pass តម្លៃប៉ុន្មាន?', 'តើកន្លែងណាខ្លះមើលថ្ងៃរះស្អាតបំផុត?', 'ណែនាំមុខម្ហូបខ្មែរដែលត្រូវតែញ៉ាំ', 'រៀបចំកាលវិភាគដើរលេង ៣ ថ្ងៃ']
      : ['How much is an Angkor Pass?', 'Where is the best sunrise spot?', 'What are must-try local dishes?', 'Plan a 3-day itinerary for me'];

    setMessages([
      ...messages,
      {
        sender: 'ai',
        text: greeting,
        suggestions: sampleSuggestions,
        destinations: [],
        businesses: []
      }
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl h-[90vh] max-h-[720px] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white flex items-center justify-between shadow-md relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
              <Sparkles className="w-5 h-5 text-yellow-200 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight font-heading">
                  SR TesChor AI Concierge
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 border border-white/30 uppercase tracking-wider">
                  Live
                </span>
              </div>
              <p className="text-xs text-orange-100 font-medium">
                មគ្គុទ្ទេសក៍ទេសចរណ៍ឆ្លាតវៃខេត្តសៀមរាប • Smart Travel Assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <div className="flex items-center bg-black/20 p-1 rounded-xl text-xs font-bold border border-white/20">
              <button
                type="button"
                onClick={() => handleLanguageSwitch('km')}
                className={`px-2 py-0.5 rounded-lg transition-all ${lang === 'km' ? 'bg-white text-orange-700 shadow-xs' : 'text-white/80 hover:text-white'}`}
              >
                🇰🇭 ខ្មែរ
              </button>
              <button
                type="button"
                onClick={() => handleLanguageSwitch('en')}
                className={`px-2 py-0.5 rounded-lg transition-all ${lang === 'en' ? 'bg-white text-orange-700 shadow-xs' : 'text-white/80 hover:text-white'}`}
              >
                🇬🇧 EN
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors border border-white/20 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Bar (Itinerary Shortcut) */}
        <div className="px-4 py-2 bg-amber-50/80 border-b border-amber-100 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2 font-medium">
            <Compass className="w-4 h-4 text-orange-500" />
            <span>ចង់បានកាលវិភាគដើរលេងពេញលេញ? (Full Multi-Day Plan)</span>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onOpenPlanner) onOpenPlanner();
            }}
            className="px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white rounded-xl font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer text-[11px]"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>AI Itinerary Planner</span>
          </button>
        </div>

        {/* Chat Conversation Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[78%] space-y-3`}>
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-orange-500 text-white font-medium rounded-tr-xs shadow-md shadow-orange-500/15'
                      : 'bg-white text-slate-800 border border-slate-200/80 shadow-xs rounded-tl-xs whitespace-pre-line'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Suggestion Chips */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.suggestions.map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSend(sug)}
                        className="px-2.5 py-1 bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-600 rounded-full border border-slate-200/80 hover:border-orange-300 text-[11px] font-medium transition-all shadow-2xs hover:shadow-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-orange-500" />
                        <span>{sug}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center flex-shrink-0 shadow-xs mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="px-4 py-3 bg-white rounded-2xl rounded-tl-xs border border-slate-200 shadow-xs flex items-center gap-2 text-xs text-slate-500">
                <RefreshCw className="w-3.5 h-3.5 text-orange-500 animate-spin" />
                <span>SR TesChor AI កំពុងគិត និងស្វែងរកព័ត៌មាន...</span>
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={lang === 'km' ? "សួរពីតម្លៃសំបុត្រ ទីតាំងដើរលេង ម្ហូបអាហារ..." : "Ask about tickets, sunrise, food, transport..."}
              className="flex-1 px-4 py-3 bg-slate-100 focus:bg-white rounded-2xl border border-transparent focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-xs sm:text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 sm:px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer flex-shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
