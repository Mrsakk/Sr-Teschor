import React, { useState } from 'react';
import { X, Copy, Check, Share2, Send, MessageCircle, Facebook } from 'lucide-react';

export default function ShareModal({ isOpen, onClose, title, url, description }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = url || window.location.href;
  const shareTitle = title || 'Check out this place on Tes Chor!';
  const shareText = description || 'Discover amazing tourist destinations & local experiences in Siem Reap, Cambodia.';

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        onClose();
      } catch (err) {
        console.log('Share dismissed', err);
      }
    } else {
      handleCopy();
    }
  };

  const shareOptions = [
    {
      name: 'Telegram',
      icon: Send,
      color: 'bg-sky-500 text-white hover:bg-sky-600',
      action: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, '_blank'),
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-emerald-500 text-white hover:bg-emerald-600',
      action: () => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`, '_blank'),
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 text-white hover:bg-blue-700',
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank'),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">Share This Place</h3>
              <p className="text-xs text-slate-500">Inspire friends with Siem Reap discoveries</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Share preview */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
          <p className="text-xs font-bold text-slate-900 line-clamp-1">{shareTitle}</p>
          <p className="text-[11px] text-slate-500 line-clamp-2">{shareText}</p>
        </div>

        {/* Social Share Grid */}
        <div className="grid grid-cols-3 gap-3">
          {shareOptions.map((opt) => (
            <button
              key={opt.name}
              onClick={opt.action}
              className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl transition-all hover:scale-105 shadow-sm ${opt.color}`}
            >
              <opt.icon className="w-5 h-5" />
              <span className="text-xs font-bold">{opt.name}</span>
            </button>
          ))}
        </div>

        {/* Link Copy Box */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700">Or copy destination link</label>
          <div className="flex items-center gap-2 p-1.5 pl-3 rounded-2xl bg-slate-100 border border-slate-200">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-transparent text-xs text-slate-700 outline-none truncate font-mono"
            />
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/20'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Native Web Share Button if supported */}
        {typeof navigator !== 'undefined' && navigator.share && (
          <button
            onClick={handleNativeShare}
            className="w-full py-3 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4 text-orange-500" /> Use Device Share Menu
          </button>
        )}
      </div>
    </div>
  );
}
