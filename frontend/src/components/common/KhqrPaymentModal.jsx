import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Smartphone, 
  QrCode, 
  Clock, 
  ArrowRight,
  Zap,
  Building2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function KhqrPaymentModal({ 
  isOpen, 
  onClose, 
  planName = 'PRO Partner Plan', 
  amount = 10, 
  currency = 'USD', 
  businessName = 'My Business', 
  onSuccess 
}) {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes countdown
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  // Generate simulated KHQR payload string
  const khrAmount = (amount * 4100).toLocaleString();
  const txId = `SRT-${Date.now().toString().slice(-6)}`;
  const qrData = `KHQR:00020101021229340016bakong@srtechor0108123456785303840540${amount.toFixed(2)}5802KH5916SR TECHOR HUB6010SIEM REAP6212${txId}6304`;
  const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(qrData)}&margin=10`;

  useEffect(() => {
    if (!isOpen) return;
    setTimeLeft(180);
    setIsPaid(false);
    setIsProcessing(false);

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaid(true);

      // Trigger celebration confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 2500);
    }, 1500);
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('srtechor@aba');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[95vh]">
        
        {/* KHQR Header Banner */}
        <div className="bg-[#E11D48] text-white p-4 relative text-center">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-block bg-white text-[#E11D48] px-3 py-0.5 rounded-full text-xs font-black tracking-widest uppercase mb-1">
            KHQR
          </div>
          <h3 className="font-extrabold text-sm text-white">Bakong Universal QR Payment</h3>
          <p className="text-[11px] text-rose-100">ស្កេនទូទាត់ជាមួយគ្រប់ App ធនាគារនៅកម្ពុជា</p>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-center">
          
          {isPaid ? (
            <div className="py-8 space-y-4 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-black text-slate-900">ទូទាត់ប្រាក់ជោគជ័យ!</h4>
                <p className="text-xs text-slate-500 font-medium">Payment Completed Successfully</p>
                <div className="text-xs font-bold text-emerald-700 bg-emerald-50 py-2 px-3 rounded-xl mt-3 inline-block">
                  {planName} ត្រូវបាន Activate រួចរាល់
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Merchant Details */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70 text-left text-xs space-y-1">
                <div className="flex justify-between items-center text-slate-500 text-[11px]">
                  <span>Merchant:</span>
                  <span className="font-bold text-slate-800">SR TECHOR HUB (SIEM REAP)</span>
                </div>
                <div className="flex justify-between items-center text-slate-500 text-[11px]">
                  <span>Item:</span>
                  <span className="font-bold text-orange-600 truncate max-w-[180px]">{planName}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500 text-[11px]">
                  <span>Business:</span>
                  <span className="font-bold text-slate-800 truncate max-w-[180px]">{businessName}</span>
                </div>
              </div>

              {/* Amount Display */}
              <div className="space-y-0.5">
                <div className="text-3xl font-black text-slate-900 font-heading">
                  ${Number(amount).toFixed(2)}
                </div>
                <div className="text-xs font-bold text-slate-400">
                  ≈ {khrAmount} KHR
                </div>
              </div>

              {/* KHQR Code Display Box */}
              <div className="relative p-3 bg-slate-50 rounded-2xl border border-slate-200 inline-block shadow-inner">
                <img
                  src={qrImage}
                  alt="KHQR Code"
                  className="w-48 h-48 rounded-xl object-contain mx-auto"
                />

                <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-500 mt-2">
                  <Clock className="w-3.5 h-3.5 text-rose-500" />
                  <span>ផុតកំណត់ក្នុង: <strong className="text-rose-600">{formattedTime}</strong></span>
                </div>
              </div>

              {/* Supported Banks Badges */}
              <div className="text-[10px] text-slate-400 flex items-center justify-center gap-2 pt-1 font-semibold">
                <span>ABA Bank</span> • <span>Bakong</span> • <span>ACLEDA</span> • <span>Wing</span> • <span>Canadia</span>
              </div>

              {/* Simulate Payment Button for Live Demo */}
              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={isProcessing}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all hover:scale-102 cursor-pointer"
              >
                {isProcessing ? (
                  <span>កំពុងផ្ទៀងផ្ទាត់ការទូទាត់...</span>
                ) : (
                  <>
                    <Smartphone className="w-4 h-4" />
                    <span>ស្កេនសាកល្បង (Simulate KHQR Pay)</span>
                  </>
                )}
              </button>
            </>
          )}

        </div>

      </div>
    </div>
  );
}
