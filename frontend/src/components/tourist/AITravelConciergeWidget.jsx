import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Compass, 
  MapPin, 
  ExternalLink, 
  Calendar, 
  RefreshCw,
  MessageSquare
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
      text: 'សួស្តីបាទ! ខ្ញុំជា **SR TesChor AI Concierge** 🤖 មគ្គុទ្ទេសក៍ទេសចរណ៍ឆ្លាតវៃខេត្តសៀមរាប។\n\nតើខ្ញុំអាចជួយអ្វីដល់ដំណើរកម្សាន្តរបស់អ្នកបានខ្លះបាទ?',
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

    setMessages((prev) => [
      ...prev,
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
            className="group relative px-4 py-2.5 sm:px-5 sm:py-3 rounded-full bg-white hover:bg-slate-50 text-slate-900 font-extrabold text-xs sm:text-sm shadow-xl flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 cursor-pointer border border-slate-200"
            aria-label="Open AI Tourist Concierge"
          >
            {/* Pulsing indicator */}
            <span className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-4 h-4" />
            </span>

            <div className="text-left leading-tight hidden sm:block">
              <div className="font-heading font-black text-slate-900 text-xs flex items-center gap-1">
                <span>SR TesChor AI</span>
                <Sparkles className="w-3 h-3 text-orange-600" />
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Online 24/7</span>
              </span>
            </div>

            <span className="font-heading font-black text-slate-900 text-xs sm:hidden">
              សួរ AI 🤖
            </span>
          </button>
        )}
      </div>

      {/* Interactive Chat Window Modal */}
      {isOpen && (
        <div className="fixed bottom-20 lg:bottom-6 right-3 sm:right-6 z-50 w-[calc(100vw-24px)] sm:w-[420px] max-h-[calc(100vh-120px)] sm:max-h-[640px] h-[560px] bg-white border border-slate-200 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="bg-white p-4 border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shrink-0 shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900 font-heading leading-tight flex items-center gap-1.5">
                  <span>អ្នកសម្របសម្រួល SR TesChor AI</span>
                  <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                </h3>
                <span className="text-[11px] text-emerald-700 flex items-center gap-1.5 font-semibold mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>ជំនួយការទេសចរណ៍ 24/7 សៀមរាប</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Language Switch */}
              <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs font-bold border border-slate-200">
                <button
                  type="button"
                  onClick={() => handleLanguageSwitch('km')}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    lang === 'km' ? 'bg-white text-orange-600 shadow-xs font-black' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  🇰🇭
                </button>
                <button
                  type="button"
                  onClick={() => handleLanguageSwitch('en')}
                  className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                    lang === 'en' ? 'bg-white text-orange-600 shadow-xs font-black' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  🇬🇧
                </button>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close Chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* AI Itinerary Planner Shortcut Bar */}
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-700 shrink-0">
            <span className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Compass className="w-4 h-4 text-orange-600" />
              <span>រៀបចំដំណើរកម្សាន្ត (Trip Planner)</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setPlannerOpen(true);
              }}
              className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-xs transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>ចាប់ផ្តើមផែនការ AI</span>
            </button>
          </div>

          {/* Chat Messages Canvas */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs bg-[#FAF6EE]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[90%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-orange-600 text-white rounded-br-xs shadow-xs text-xs font-medium'
                      : 'bg-white text-slate-900 rounded-tl-xs border border-slate-200/90 shadow-xs'
                  }`}
                >
                  {msg.text}

                  {/* Destination Recommendations */}
                  {msg.destinations && msg.destinations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                      <p className="text-[11px] font-bold text-orange-700 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-orange-600" /> ទីតាំងណែនាំ (ការណែនាំ)
                      </p>
                      <div className="grid grid-cols-1 gap-1.5">
                        {msg.destinations.map((dest) => (
                          <Link
                            key={dest.id}
                            to={dest.link}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-orange-50/50 rounded-xl border border-slate-200 transition-colors group"
                          >
                            <img
                              src={typeof dest.image === 'string' ? dest.image : (dest.image?.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500')}
                              alt={dest.name}
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-slate-200"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500';
                              }}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-slate-900 group-hover:text-orange-600 truncate text-xs">
                                {dest.name}
                              </p>
                              <span className="text-[10px] text-slate-500 font-medium">{dest.category}</span>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-600 mr-1 shrink-0" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Chips */}
                  {msg.quickChips && msg.quickChips.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {msg.quickChips.map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(chip)}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-orange-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-slate-200 hover:border-orange-200 text-left shadow-2xs"
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
              <div className="flex items-center gap-2 p-3 bg-white rounded-2xl rounded-tl-xs text-slate-600 text-xs border border-slate-200 shadow-xs w-fit">
                <RefreshCw className="w-3.5 h-3.5 text-orange-600 animate-spin" />
                <span className="font-medium">SR TesChor AI កំពុងឆ្លើយ...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-slate-200 shrink-0">
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
                className="flex-1 bg-slate-50 text-slate-900 placeholder:text-slate-400 text-xs px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-600 focus:bg-white transition-all font-medium"
              />
              <button
                type="submit"
                disabled={!inputQuestion.trim() || isTyping}
                className="p-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-40 transition-colors cursor-pointer shadow-xs shrink-0"
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
