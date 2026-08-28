import React, { useState, useEffect, useRef } from 'react';
import { 
  QrCode, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  AlertCircle,
  X,
  Smartphone,
  Zap,
  ArrowRight
} from 'lucide-react';
import { paymentApi } from '../../api/endpoints';

export default function KhqrPaymentModal({
  isOpen,
  onClose,
  amount,
  itemTitle,
  type = 'booking', // 'booking' | 'subscription' | 'package'
  bookingId = null,
  businessId = null,
  plan = null,
  reference = null,
  onSuccess,
}) {
  const [khqrData, setKhqrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [verifiedResult, setVerifiedResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes countdown

  const pollIntervalRef = useRef(null);

  // Generate KHQR on modal open
  useEffect(() => {
    if (!isOpen || !amount) return;

    let isMounted = true;
    setLoading(true);
    setErrorMsg('');
    setPaymentSuccess(false);
    setTimeLeft(300);

    const initKhqr = async () => {
      try {
        const res = await paymentApi.generateKhqr({
          type,
          amount: Number(amount),
          item_title: itemTitle || 'SR TesChor Booking',
          business_id: businessId,
          plan: plan,
          reference: reference || undefined,
        });

        if (isMounted) {
          setKhqrData(res.data.data);
        }
      } catch (err) {
        console.error('KHQR generation error', err);
        if (isMounted) {
          setErrorMsg(err.response?.data?.message || 'Failed to generate Bakong KHQR. Please try again.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initKhqr();

    return () => {
      isMounted = false;
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isOpen, amount, type, itemTitle, businessId, plan, reference]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || loading || paymentSuccess) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setErrorMsg('KHQR expired. Please generate a new QR code.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, loading, paymentSuccess]);

  // Auto-polling verification every 4 seconds
  useEffect(() => {
    if (!isOpen || !khqrData || paymentSuccess) return;

    pollIntervalRef.current = setInterval(async () => {
      // Background poll
      try {
        const verifyRes = await paymentApi.verifyKhqr({
          bill_number: khqrData.bill_number,
          type,
          amount: Number(amount),
          booking_id: bookingId,
          business_id: businessId,
          plan: plan,
          simulation: false, // passive check
        });

        if (verifyRes.data.status === 'paid' && !paymentSuccess) {
          clearInterval(pollIntervalRef.current);
          setPaymentSuccess(true);
          setVerifiedResult(verifyRes.data);
          if (onSuccess) {
            setTimeout(() => onSuccess(verifyRes.data), 1500);
          }
        }
      } catch (err) {
        // quiet ignore in passive polling
      }
    }, 4000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isOpen, khqrData, paymentSuccess, type, amount, bookingId, businessId, plan, onSuccess]);

  // Manual or instant simulation verification
  const handleVerify = async (isSimulation = false) => {
    if (!khqrData) return;
    setVerifying(true);
    setErrorMsg('');

    try {
      const res = await paymentApi.verifyKhqr({
        bill_number: khqrData.bill_number,
        type,
        amount: Number(amount),
        booking_id: bookingId,
        business_id: businessId,
        plan: plan,
        simulation: isSimulation,
      });

      if (res.data.status === 'paid') {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        setPaymentSuccess(true);
        setVerifiedResult(res.data);
        if (onSuccess) {
          setTimeout(() => onSuccess(res.data), 1200);
        }
      } else {
        setErrorMsg('Payment not yet detected. Please complete the transfer in your mobile banking app.');
      }
    } catch (err) {
      console.error('Verification error', err);
      setErrorMsg(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const copyBillNumber = () => {
    if (!khqrData?.bill_number) return;
    navigator.clipboard.writeText(khqrData.bill_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-md overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Top Official Bakong Red Bar Header */}
        <div className="bg-gradient-to-r from-red-600 via-red-600 to-rose-700 p-5 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-md">
                <span className="text-xs font-black text-red-600 tracking-tighter">KHQR</span>
              </div>
              <div>
                <h3 className="text-base font-extrabold tracking-tight font-heading">
                  Bakong KHQR Payment
                </h3>
                <p className="text-[11px] text-red-100 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-red-200" />
                  National Bank of Cambodia Standard
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={paymentSuccess}
              className="p-1.5 rounded-full bg-black/15 hover:bg-black/30 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-10 h-10 text-red-600 animate-spin" />
              <p className="text-xs font-bold text-slate-600">Generating secure Bakong KHQR...</p>
              <p className="text-[11px] text-slate-400">Connecting to NBC Financial Switch</p>
            </div>
          ) : paymentSuccess ? (
            /* Success State */
            <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm shadow-sm">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold mb-1">
                  <Sparkles className="w-3.5 h-3.5" /> Instant Confirmation
                </div>
                <h4 className="text-xl font-extrabold text-slate-900">
                  Payment Completed! 🎉
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                  Your transaction has been verified and registered on the platform.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Amount Paid</span>
                  <span className="font-bold text-slate-900">${Number(amount).toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Reference ID</span>
                  <span className="font-mono font-bold text-slate-700">{khqrData?.bill_number}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 animate-pulse">
                Redirecting you to your digital receipt...
              </p>
            </div>
          ) : (
            /* QR Code Display & Scan View */
            <>
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Amount Display */}
              <div className="text-center bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="text-xs text-slate-500 font-semibold mb-0.5">
                  {itemTitle || 'Total Payment Due'}
                </div>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-3xl font-extrabold text-slate-950 tracking-tight font-heading">
                    ${Number(amount).toFixed(2)}
                  </span>
                  <span className="text-sm font-extrabold text-red-600">
                    ({Number(khqrData?.amount_khr || amount * 4100).toLocaleString()} ៛)
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Official NBC Rate: 1 USD = 4,100 KHR
                </div>
              </div>

              {/* QR Code Container */}
              <div className="relative mx-auto w-64 h-64 p-3 bg-white rounded-xl border-2 border-red-500/30 shadow-sm shadow-sm flex flex-col items-center justify-center group">
                
                {/* Decorative Red Corner Marks */}
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-red-600 rounded-tl-lg" />
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-red-600 rounded-tr-lg" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-red-600 rounded-bl-lg" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-red-600 rounded-br-lg" />

                {/* Real High-Resolution QR Generator via Google Charts API or fallback */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(khqrData?.qr_string || '')}`}
                  alt="Bakong KHQR"
                  className="w-full h-full object-contain rounded-xl"
                  loading="eager"
                />

                {/* Center KHQR Emblem */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-xl bg-red-600 border-2 border-white shadow-lg flex items-center justify-center">
                    <span className="text-[9px] font-black text-white tracking-tighter">KHQR</span>
                  </div>
                </div>
              </div>

              {/* Countdown Timer & Supported Banks */}
              <div className="flex items-center justify-between text-xs font-semibold px-2">
                <div className="flex items-center gap-1.5 text-amber-600">
                  <Clock className="w-4 h-4 animate-spin-slow" />
                  <span>Expires in: <strong className="font-mono text-slate-900">{formatTime(timeLeft)}</strong></span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <span>Merchant:</span>
                  <strong className="text-slate-700">SR TES CHOR</strong>
                </div>
              </div>

              {/* Supported Apps Pills */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
                  Scan with any Bakong Supported App
                </p>
                <div className="flex flex-wrap items-center justify-center gap-1.5 text-[10px] font-bold text-slate-600">
                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 shadow-2xs text-red-600">Bakong</span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 shadow-2xs text-blue-600">ABA Mobile</span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 shadow-2xs text-blue-800">ACLEDA</span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 shadow-2xs text-emerald-600">Canadia</span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 shadow-2xs text-purple-600">Wing</span>
                  <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 shadow-2xs text-slate-700">+35 Banks</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                
                {/* Mobile Deep Link */}
                {khqrData?.deep_link && (
                  <a
                    href={khqrData.deep_link}
                    className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Open in Bakong App</span>
                  </a>
                )}

                {/* Instant Simulation Test Mode Button */}
                <button
                  onClick={() => handleVerify(true)}
                  disabled={verifying}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  {verifying ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4 fill-current" />
                  )}
                  <span>Simulate Instant Pay (Test Mode)</span>
                </button>

                {/* Copy Bill / Reference Button */}
                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                  <span>Bill Ref: <strong className="font-mono text-slate-600">{khqrData?.bill_number}</strong></span>
                  <button
                    onClick={copyBillNumber}
                    className="inline-flex items-center gap-1 font-semibold text-red-600 hover:text-red-700"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy Ref'}</span>
                  </button>
                </div>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
}
