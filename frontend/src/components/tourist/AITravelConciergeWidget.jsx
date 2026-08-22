import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Compass, 
  MapPin, 
  ExternalLink, 
  HelpCircle,
  Clock,
  CheckCircle2,
  ChevronDown,
  Calendar,
  Star,
  RefreshCw,
  Languages
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { aiApi } from '../../api/endpoints';
import AITripPlannerModal from '../common/AITripPlannerModal';

export default function AITravelConciergeWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lang, setLang] = useState('km'); // 'km' or 'en'
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'សួស្តីបាទ! ខ្ញុំជា **SR TesChor AI Concierge** 🤖 មគ្គុទ្ទេសក៍ទេសចរណ៍ឆ្លាតវៃខេត្តសៀមរាប។ តើខ្ញុំអាចជួយអ្វីដល់ដំណើរកម្សាន្តរបស់អ្នកបានខ្លះបាទ?',
      quickChips: [
        '🎟️ តម្លៃសំបុត្រ Angkor Pass?',
        '🌅 ទីតាំង និងម៉ោងមើលថ្ងៃរះ?',
        '🍲 មុខម្ហូបល្បីៗនៅសៀមរាប?',
        '🛺 តម្លៃជិះកង់បី Tuk-Tuk?',
        '👗 ច្បាប់ស្លៀកពាក់ចូលប្រាសាទ?'
      ],
      destinations: [],
      businesses: []
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleLanguageSwitch = (newLang) => {
    setLang(newLang);
    const greeting = newLang === 'km' 
      ? "សួស្តីបាទ! ខ្ញុំជា **SR TesChor AI Concierge** 🤖 តើខ្ញុំអាចជួយរៀបចំដំណើរកម្សាន្ត ឬឆ្លើយចម្ងល់ទេសចរណ៍អ្វីដល់អ្នកដែរទេបាទ?"
      : "Hello! I am your **SR TesChor AI Concierge** 🤖. Ask me anything about Angkor Pass tickets, sunrise spots, local foods, or let me plan your custom itinerary!";
    
    const chips = newLang === 'km'
      ? ['🎟️ តម្លៃសំបុត្រ Angkor Pass?', '🌅 ទីតាំង និងម៉ោងមើលថ្ងៃរះ?', '🍲 មុខម្ហូបល្បីៗនៅសៀមរាប?', '🛺 តម្លៃជិះកង់បី Tuk-Tuk?', '👗 ច្បាប់ស្លៀកពាក់ចូលប្រាសាទ?']
      : ['🎟️ Angkor Pass ticket prices?', '🌅 Best Angkor sunrise spots?', '🍲 Must-try Khmer foods?', '🛺 Tuk-Tuk fares guide?', '👗 Temple dress code?'];

    setMessages([
      ...messages,
      {
        id: Date.now().toString(),
        sender: 'ai',
        text: greeting,
        quickChips: chips,
        destinations: [],
        businesses: []
      }
    ]);
  };

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputQuestion;
    if (!query.trim() || isTyping) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query.trim()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsTyping(true);

    try {
      // Call Live Backend AI Service Engine
      const res = await aiApi.chat({ message: query, lang });
      const data = res.data;

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.answer,
        quickChips: data.suggestions || [],
        destinations: data.destinations || [],
        businesses: data.businesses || []
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      // Fallback response
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "សូមអភ័យទោស ខ្ញុំកំពុងមានបញ្ហាតភ្ជាប់ប្រព័ន្ធបន្តិចបន្តួច។ សូមសាកល្បងសួរម្តងទៀតបាទ!",
        quickChips: ['🎟️ សំបុត្រ Angkor Pass', '🌅 ទីតាំងមើលថ្ងៃរះ', '🍲 ម្ហូបឆ្ងាញ់ៗ'],
        destinations: [],
        businesses: []
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-20 lg:bottom-6 right-3 sm:right-6 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white font-extrabold text-[11px] sm:text-xs shadow-2xl shadow-orange-600/40 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer border border-white/30"
            aria-label="Open AI Tourist Concierge"
          >
            {/* Ping indicator */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3 sm:h-3.5 sm:w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 sm:h-3.5 sm:w-3.5 bg-amber-300"></span>
            </span>

            <Sparkles className="w-4 h-4 text-amber-200 group-hover:rotate-12 transition-transform shrink-0" />
            <span className="font-heading tracking-wide">សួរមគ្គទេសក៍ AI 🤖</span>
          </button>
        )}
      </div>

      {/* Interactive Chat Window Modal */}
      {isOpen && (
        <div className="fixed bottom-20 lg:bottom-6 right-3 sm:right-6 z-50 w-[calc(100vw-24px)] sm:w-[420px] max-h-[calc(100vh-140px)] sm:max-h-[620px] h-[540px] bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 p-4 text-white flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm font-heading leading-tight flex items-center gap-1.5">
                  <span>SR TesChor AI Concierge</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                </h3>
                <span className="text-[10px] text-amber-100 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>24/7 Siem Reap Travel Assistant</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Language Switch */}
              <div className="flex bg-black/20 p-0.5 rounded-lg text-[10px] font-bold border border-white/20">
                <button
                  type="button"
                  onClick={() => handleLanguageSwitch('km')}
                  className={`px-1.5 py-0.5 rounded ${lang === 'km' ? 'bg-white text-orange-700' : 'text-white/80'}`}
                >
                  🇰🇭
                </button>
                <button
                  type="button"
                  onClick={() => handleLanguageSwitch('en')}
                  className={`px-1.5 py-0.5 rounded ${lang === 'en' ? 'bg-white text-orange-700' : 'text-white/80'}`}
                >
                  🇬🇧
                </button>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* AI Itinerary Planner Shortcut Bar */}
          <div className="px-3.5 py-2 bg-slate-800/90 border-b border-slate-700/80 flex items-center justify-between text-[11px] text-slate-300">
            <span className="flex items-center gap-1.5 font-medium">
              <Compass className="w-3.5 h-3.5 text-orange-400" />
              <span>រៀបចំកាលវិភាគដើរលេង (Trip Planner)</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setPlannerOpen(true);
              }}
              className="px-2.5 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold text-[10px] transition-colors shadow-xs cursor-pointer flex items-center gap-1"
            >
              <Calendar className="w-3 h-3" />
              <span>Start AI Planner</span>
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-orange-600 text-white rounded-br-none shadow-md'
                      : 'bg-slate-800/95 text-slate-100 rounded-bl-none border border-slate-700/60 shadow'
                  }`}
                >
                  {msg.text}

                  {/* Destination Recommendations */}
                  {msg.destinations && msg.destinations.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-700/60 space-y-1.5">
                      <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> ទីតាំងណែនាំ (Recommendations)
                      </p>
                      <div className="grid grid-cols-1 gap-1.5">
                        {msg.destinations.map((dest) => (
                          <Link
                            key={dest.id}
                            to={dest.link}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 p-1.5 bg-slate-900/60 hover:bg-slate-700/60 rounded-xl border border-slate-700/40 transition-colors group"
                          >
                            <img
                              src={typeof dest.image === 'string' ? dest.image : (dest.image?.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500')}
                              alt={dest.name}
                              className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500';
                              }}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-slate-200 group-hover:text-orange-400 truncate text-[11px]">
                                {dest.name}
                              </p>
                              <span className="text-[9px] text-slate-400">{dest.category}</span>
                            </div>
                            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-orange-400 mr-1" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Chips */}
                  {msg.quickChips && msg.quickChips.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex flex-wrap gap-1.5">
                      {msg.quickChips.map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(chip)}
                          className="px-2.5 py-1 bg-slate-700/70 hover:bg-orange-500 text-slate-200 hover:text-white rounded-lg text-[10px] font-medium transition-colors cursor-pointer border border-slate-600/50 hover:border-orange-400 text-left"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 p-3 bg-slate-800/60 rounded-2xl rounded-bl-none text-slate-400 text-xs border border-slate-700/40 w-fit">
                <RefreshCw className="w-3.5 h-3.5 text-orange-400 animate-spin" />
                <span>SR TesChor AI is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                placeholder={lang === 'km' ? "សួរពីសំបុត្រ ថ្ងៃរះ ម្ហូបអាហារ..." : "Ask AI about Angkor, hotels, food..."}
                className="flex-1 bg-slate-800 text-white placeholder:text-slate-500 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
              />
              <button
                type="submit"
                disabled={!inputQuestion.trim() || isTyping}
                className="p-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white disabled:opacity-40 disabled:hover:bg-orange-600 transition-colors cursor-pointer"
                aria-label="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}

      {/* Standalone AI Trip Planner Modal */}
      <AITripPlannerModal
        isOpen={plannerOpen}
        onClose={() => setPlannerOpen(false)}
      />
    </>
  );
}
