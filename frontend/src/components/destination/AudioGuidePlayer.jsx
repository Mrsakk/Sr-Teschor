import React, { useState, useEffect, useRef } from 'react';
import { 
  Headphones, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles,
  Info
} from 'lucide-react';

export default function AudioGuidePlayer({ 
  title = 'Angkor Wat Audio Guide', 
  englishText = ''
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [rate, setRate] = useState(1); // 1, 1.2
  const [progress, setProgress] = useState(0);
  const [supported, setSupported] = useState(true);

  const activeText = englishText || `Welcome to ${title}. This is a world-renowned historical wonder and UNESCO World Heritage site located in Siem Reap, Cambodia. Please enjoy your journey and respect this sacred cultural sanctuary.`;

  const synthRef = useRef(null);
  const progressTimerRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    } else {
      setSupported(false);
    }

    return () => {
      stopAllAudio();
    };
  }, []);

  const stopAllAudio = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }
    setIsPlaying(false);
  };

  const handleTogglePlay = () => {
    if (!synthRef.current) return;

    if (isPlaying) {
      stopAllAudio();
    } else {
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(activeText);
      utterance.rate = rate;
      utterance.lang = 'en-US';

      // Pick natural English voice if available
      const voices = synthRef.current.getVoices() || [];
      const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('David')));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      utterance.onend = () => {
        setIsPlaying(false);
        setProgress(100);
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      };

      synthRef.current.speak(utterance);
      setIsPlaying(true);
      setProgress(0);

      const estimatedDurationSec = (activeText.length / 12) / rate;
      const intervalMs = 200;
      const stepPct = (intervalMs / (estimatedDurationSec * 1000)) * 100;

      progressTimerRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return 95;
          return prev + stepPct;
        });
      }, intervalMs);
    }
  };

  const handleReset = () => {
    stopAllAudio();
    setProgress(0);
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl border border-slate-700/60 space-y-4">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
            <Headphones className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                Audio Tour Guide
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
              Smart Voice Narration
            </h3>
          </div>
        </div>
        {/* Speed Controls */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-700">
          <button
            type="button"
            onClick={() => { setRate(1); if (isPlaying) { stopAllAudio(); } }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              rate === 1 ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            1.0x
          </button>
          <button
            type="button"
            onClick={() => { setRate(1.2); if (isPlaying) { stopAllAudio(); } }}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              rate === 1.2 ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            1.2x
          </button>
        </div>
      </div>

      {/* Waveform / Visual Animation */}
      <div className="bg-slate-950/50 rounded-2xl p-3.5 border border-slate-800 flex items-center gap-3">
        <div className="flex items-center gap-1 h-6 px-1">
          {[40, 70, 30, 90, 50, 80, 45, 65, 85, 35].map((h, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-300 ${
                isPlaying ? 'bg-orange-500 animate-pulse' : 'bg-slate-700'
              }`}
              style={{
                height: isPlaying ? `${Math.max(20, (h * (Math.random() + 0.5)) % 100)}%` : '25%',
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-orange-500 to-amber-400 h-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Audio Controls */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleTogglePlay}
            className="w-12 h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/25 transition-transform active:scale-95 cursor-pointer"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Reset Audio"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="text-[11px] text-slate-400 italic max-w-xs truncate text-right">
          {isPlaying ? 'កំពុងចាក់សំឡេងរៀបរាប់...' : 'ចុច Play ដើម្បីស្ដាប់ការរៀបរាប់'}
        </div>
      </div>

      {/* Transcript Text Box */}
      <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-800 text-xs text-slate-300 leading-relaxed max-h-24 overflow-y-auto">
        <span className="text-[10px] font-bold uppercase text-orange-400 block mb-1">អត្ថបទរៀបរាប់ (Transcript):</span>
        {activeText}
      </div>

    </div>
  );
}
