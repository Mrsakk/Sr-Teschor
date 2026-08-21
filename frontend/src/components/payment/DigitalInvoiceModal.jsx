import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  Download, 
  X, 
  ShieldCheck, 
  Building2, 
  CheckCircle2, 
  QrCode, 
  FileText, 
  Sparkles,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { paymentApi } from '../../api/endpoints';

export default function DigitalInvoiceModal({ isOpen, onClose, reference }) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen || !reference) return;

    let isMounted = true;
    setLoading(true);
    setErrorMsg('');

    const fetchInvoice = async () => {
      try {
        const res = await paymentApi.getInvoice(reference);
        if (isMounted) setInvoice(res.data);
      } catch (err) {
        console.error('Invoice fetch error', err);
        if (isMounted) setErrorMsg('Failed to load official digital invoice.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchInvoice();

    return () => { isMounted = false; };
  }, [isOpen, reference]);

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200 my-8">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="print:hidden bg-slate-900 px-6 py-4 flex items-center justify-between text-white border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-500" />
            <span className="font-bold text-sm font-heading">Official Digital E-Invoice</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Area */}
        <div className="p-8 sm:p-10 space-y-8 bg-white text-slate-900 print:p-0">
          
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
              <p className="text-xs font-bold text-slate-500">Generating Official Digital Tax Invoice...</p>
            </div>
          ) : errorMsg || !invoice ? (
            <div className="py-12 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
              <p className="text-sm font-bold text-slate-700">{errorMsg || 'Invoice not found'}</p>
            </div>
          ) : (
            <>
              {/* Header: Company & Invoice Badges */}
              <div className="flex flex-col sm:flex-row justify-between gap-6 pb-6 border-b-2 border-slate-900">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center font-extrabold font-heading text-sm shadow-md">
                      SR
                    </div>
                    <div>
                      <h2 className="text-lg font-black tracking-tight text-slate-950 font-heading">
                        {invoice.company.name_en}
                      </h2>
                      <p className="text-xs font-khmer text-slate-600">
                        {invoice.company.name_kh}
                      </p>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 space-y-0.5 mt-2">
                    <p>VAT TIN: <strong>{invoice.company.vat_tin}</strong></p>
                    <p>{invoice.company.address}</p>
                    <p>{invoice.company.email} | {invoice.company.phone}</p>
                  </div>
                </div>

                <div className="sm:text-right space-y-1">
                  <div className="inline-block px-3 py-1 rounded-md bg-emerald-600 text-white text-xs font-black uppercase tracking-widest">
                    {invoice.status}
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-950 font-mono">
                    {invoice.invoice_number}
                  </h1>
                  <p className="text-[11px] text-slate-500">
                    Issued: <strong>{invoice.issue_date}</strong>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Method: <strong className="text-red-600 font-bold">{invoice.payment_method}</strong>
                  </p>
                </div>
              </div>

              {/* Bill To Customer Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    Billed To / ជូនចំពោះ
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-900 mt-0.5">
                    {invoice.customer.name}
                  </h3>
                  <p className="text-xs text-slate-600">{invoice.customer.email}</p>
                  <p className="text-xs text-slate-600">{invoice.customer.phone}</p>
                </div>

                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    Currency & Official Conversion
                  </span>
                  <p className="text-xs text-slate-700 font-semibold mt-0.5">
                    {invoice.currency.exchange_rate}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Authenticity Seal: <strong className="text-emerald-700">Verified by NBC Bakong KHQR</strong>
                  </p>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-2">Description / មុខទំនិញ</th>
                      <th className="py-3 px-2 text-center">Qty</th>
                      <th className="py-3 px-2 text-right">Unit Price</th>
                      <th className="py-3 px-2 text-right">Total (USD)</th>
                      <th className="py-3 px-2 text-right">Total (KHR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {invoice.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-2 font-semibold text-slate-900">
                          {item.description}
                        </td>
                        <td className="py-3.5 px-2 text-center font-bold text-slate-700">
                          {item.qty}
                        </td>
                        <td className="py-3.5 px-2 text-right font-mono text-slate-700">
                          ${Number(item.unit_price_usd).toFixed(2)}
                        </td>
                        <td className="py-3.5 px-2 text-right font-mono font-bold text-slate-900">
                          ${Number(item.amount_usd).toFixed(2)}
                        </td>
                        <td className="py-3.5 px-2 text-right font-mono font-bold text-red-600">
                          {Number(item.amount_khr).toLocaleString()} ៛
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Calculations */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t border-slate-200">
                
                {/* QR Authenticity Seal */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="w-16 h-16 bg-white p-1 rounded-xl shadow-xs border border-slate-200 shrink-0">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(invoice.qr_verification.verified_online_url || '')}`}
                      alt="Verification QR"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 space-y-0.5">
                    <div className="flex items-center gap-1 font-bold text-emerald-700">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Official Digital Signature</span>
                    </div>
                    <p className="font-mono text-[9px] text-slate-400 truncate max-w-[180px]">
                      {invoice.qr_verification.hash}
                    </p>
                    <p className="text-slate-500">Scan to verify authenticity on SR TesChor</p>
                  </div>
                </div>

                {/* Grand Total Box */}
                <div className="w-full sm:w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-mono font-bold">${Number(invoice.summary.subtotal_usd).toFixed(2)}</span>
                  </div>
                  {invoice.summary.discount_usd > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Promotion Discount</span>
                      <span className="font-mono">-${Number(invoice.summary.discount_usd).toFixed(2)}</span>
                    </div>
                  )}
                  {invoice.summary.service_fee_usd > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Platform Service Fee</span>
                      <span className="font-mono">${Number(invoice.summary.service_fee_usd).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>VAT / Tax (0%)</span>
                    <span className="font-mono">$0.00</span>
                  </div>
                  
                  <div className="pt-2 border-t-2 border-slate-900 flex justify-between items-baseline">
                    <span className="font-extrabold text-slate-900 text-sm">Grand Total</span>
                    <div className="text-right">
                      <div className="text-lg font-black text-slate-950 font-heading">
                        {invoice.currency.usd}
                      </div>
                      <div className="text-xs font-bold text-red-600 font-mono">
                        {invoice.currency.khr}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Footer Note */}
              <div className="pt-6 border-t border-slate-100 text-center text-[10px] text-slate-400 space-y-1">
                <p>Thank you for choosing SR TesChor. For billing support, contact billing@srteschor.com or Telegram @srteschor_support</p>
                <p>© 2026 SR TesChor Platform (Cambodia). All Rights Reserved.</p>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
}
