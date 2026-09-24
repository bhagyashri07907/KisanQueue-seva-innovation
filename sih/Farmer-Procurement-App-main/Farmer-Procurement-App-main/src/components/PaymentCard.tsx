import React from 'react';
import { useTranslation } from 'react-i18next';
import { IndianRupee, Clock, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';
import { Booking } from '../types';

interface PaymentCardProps {
  booking: Booking;
}

export const PaymentCard: React.FC<PaymentCardProps> = ({ booking }) => {
  const { t } = useTranslation();

  const getStatusBadge = () => {
    switch (booking.paymentStatus) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t('paymentCompleted')}
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-black text-blue-800 bg-blue-100 px-3 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            {t('paymentProcessing')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-black text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
            <AlertCircle className="w-3.5 h-3.5" />
            {t('paymentPending')}
          </span>
        );
    }
  };

  const getStatusDescription = () => {
    switch (booking.paymentStatus) {
      case 'Completed':
        return t('paymentCompletedDesc');
      case 'Processing':
        return t('paymentProcessingDesc');
      default:
        return t('paymentPendingDesc');
    }
  };

  // Estimated payout: ~ ₹4,892 or provided
  const estimatedAmount =
    booking.paymentAmount ||
    booking.expectedQuantityQuintals * (booking.cropId === 'crop_wheat' ? 2275 : 4892);

  return (
    <div id={`payment-card-${booking.id}`} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Booking ID: {booking.id}</span>
          <h3 className="text-base font-bold text-slate-800 mt-0.5">{booking.cropName}</h3>
        </div>
        {getStatusBadge()}
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{t('procurementStatusTitle')}</span>
          <span className="text-sm font-bold text-emerald-800 mt-0.5 block">{booking.status}</span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{t('expectedQuantity')}</span>
          <span className="text-sm font-bold text-slate-900 mt-0.5 block">
            {booking.weighbridgeWeightQuintals || booking.expectedQuantityQuintals} {t('quintals')}
          </span>
        </div>
      </div>

      {/* Financial Details */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold shadow-xs">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest block">{t('payoutAmount')}</span>
            <span className="text-2xl font-black text-emerald-950">
              ₹{estimatedAmount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
        {booking.paymentStatus === 'Completed' && (
          <span className="text-[10px] font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-md border border-emerald-200 uppercase tracking-wider">
            DBT Credited
          </span>
        )}
      </div>

      {/* DBT Details or Pending Note */}
      <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
        <p className="font-medium text-slate-700">{getStatusDescription()}</p>
        {booking.paymentRefNumber && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 font-mono text-[11px] text-slate-700">
            <span className="text-slate-500 font-sans">{t('dbtRef')}:</span>
            <span className="font-bold text-slate-900">{booking.paymentRefNumber}</span>
          </div>
        )}
        {booking.paymentDate && (
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Credit Date:</span>
            <span className="font-medium text-slate-700">{booking.paymentDate}</span>
          </div>
        )}
      </div>

      <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
        <span className="font-bold uppercase text-[10px] tracking-wider">Center:</span>
        <span className="font-medium text-slate-700 truncate">{booking.centerName}</span>
      </div>
    </div>
  );
};
