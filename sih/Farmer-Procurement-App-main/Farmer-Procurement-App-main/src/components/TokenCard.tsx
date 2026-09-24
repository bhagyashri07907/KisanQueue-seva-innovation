import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Ticket, Copy, Check, Info, ShieldCheck } from 'lucide-react';
import { Booking } from '../types';

interface TokenCardProps {
  booking: Booking;
  showActions?: boolean;
}

export const TokenCard: React.FC<TokenCardProps> = ({ booking, showActions = true }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(booking.digitalToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div id="digital-token-container" className="bg-white rounded-2xl shadow-md border-t-4 border-emerald-600 border-x border-b border-slate-200 overflow-hidden relative">
      {/* Geometric circular accent */}
      <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-50 rounded-full opacity-50 pointer-events-none" />

      {/* Top Banner / Token Display */}
      <div className="p-6 text-center border-b border-slate-100 relative">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
          {t('tokenLabel')}
        </h2>

        {/* Big Prominent Human-Readable Token Number (Geometric Balance style, strictly no QR code) */}
        <div className="py-2">
          <div className="inline-block bg-slate-50 px-4 py-1.5 rounded-lg border border-slate-200 mb-2.5 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">TOKEN ID</span>
          </div>
          <p
            id="digital-token-value"
            className="text-3xl sm:text-4xl font-black tracking-tighter text-emerald-800 font-mono select-all"
          >
            {booking.digitalToken}
          </p>
        </div>

        {showActions && (
          <button
            id="copy-token-btn"
            type="button"
            onClick={handleCopy}
            className="mt-4 w-full bg-slate-800 hover:bg-slate-900 text-white p-3.5 rounded-xl flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest active:scale-[0.99] transition shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{t('tokenCopied')}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>{t('copyToken')}</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Ticket Details in Geometric Grid */}
      <div className="p-6 space-y-4">
        {/* Row 1: Booking ID & Status */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">{t('bookingId')}</span>
            <span className="text-sm font-bold text-slate-900">{booking.id}</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">{t('bookingStatus')}</span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              {t('statusConfirmed')}
            </span>
          </div>
        </div>

        {/* Row 2: Farmer Name */}
        <div className="pb-3 border-b border-slate-100">
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">{t('farmerName')}</span>
          <span className="text-base font-bold text-slate-900">{booking.farmerName}</span>
          <span className="text-xs text-slate-500 font-medium block mt-0.5">Mobile: {booking.farmerMobile}</span>
        </div>

        {/* Row 3: Crop & Quantity */}
        <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">{t('selectedCrop')}</span>
            <span className="text-base font-bold text-emerald-800">{booking.cropName}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">{t('expectedQuantity')}</span>
            <span className="text-base font-bold text-slate-900">
              {booking.expectedQuantityQuintals} {t('quintals')}
            </span>
          </div>
        </div>

        {/* Row 4: Center, Date & Time */}
        <div className="space-y-3 pb-2">
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">{t('procurementCenter')}</span>
            <span className="text-sm font-bold text-slate-900 block">{booking.centerName}</span>
            <span className="text-xs text-slate-500 font-medium block">{booking.centerLocation}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">{t('date')}</span>
              <span className="text-xs font-bold text-slate-900 mt-0.5 block">{booking.date}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">{t('timeWindow')}</span>
              <span className="text-xs font-bold text-slate-900 mt-0.5 block">{booking.timeSlot}</span>
            </div>
          </div>
        </div>

        {/* Official Guideline Message */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700">
            <p className="font-bold text-slate-900">{t('tokenInstructions')}</p>
            <p className="mt-1 text-slate-600 leading-relaxed">
              {t('tokenImportantNotice')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
