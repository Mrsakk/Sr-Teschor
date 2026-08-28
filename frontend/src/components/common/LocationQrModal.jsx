import React, { useState } from 'react';
import { QrCode, X, Copy, Check, Download, Share2, Sparkles, MapPin } from 'lucide-react';

export default function LocationQrModal({ isOpen, onClose, placeName, url, khmerName }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const targetUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  // Generate reliable high-res QR code image using qrserver API
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(targetUrl)}&margin=12`;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrImageUrl;
    link.download = `${placeName?.replace(/\s+/g, '_') || 'sr_techor'}_qr.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white rounded-xl shadow-md overflow-hidden border border-slate-100 p-6 space-y-6 text-center">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto shadow-inner">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-slate-900 pt-1">{placeName}</h3>
          {khmerName && <p className="text-xs text-orange-600 font-semibold">{khmerName}</p>}
          <p className="text-[11px] text-slate-500">
            ស្កេនដើម្បីបើកមើលព័ត៌មានលម្អិត ឬចែករំលែកបន្ត
          </p>
        </div>

        {/* QR Image Container */}
        <div className="relative inline-block p-4 rounded-xl bg-slate-50 border border-slate-200/80 shadow-inner">
          <img
            src={qrImageUrl}
            alt="Place QR Code"
            className="w-48 h-48 rounded-xl object-contain mx-auto"
          />
          <div className="text-[10px] font-bold text-slate-400 mt-2 flex items-center justify-center gap-1">
            <span>SR Techor Digital Tourism</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="py-2.5 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download QR</span>
          </button>
        </div>

      </div>
    </div>
  );
}
