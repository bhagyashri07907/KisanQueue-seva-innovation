import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2,
  Calendar,
  Clock,
  Building2,
  Sprout,
  Scale,
  IndianRupee,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { MobileLayout } from '../layouts/MobileLayout';
import { useBookingFlow } from '../hooks/useBookingFlow';
import { useAuth } from '../hooks/useAuth';
import { createBooking } from '../services/api';

export const BookingConfirmation: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { farmer } = useAuth();
  const { state, selectedCrop, selectedCenter, setQuantity, resetFlow } = useBookingFlow();

  const [quantity, setLocalQuantity] = useState<number>(state.expectedQuantityQuintals || 25);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!state.cropId || !state.centerId || !state.date || !state.timeSlotId) {
    return (
      <MobileLayout showBack backTitle="Back" onBack={() => navigate('/slots')}>
        <div className="p-6 text-center space-y-4">
          <p className="text-sm text-slate-600">Please complete previous booking steps first.</p>
          <button
            onClick={() => navigate('/select-crop')}
            className="px-6 py-2.5 bg-emerald-700 text-white font-bold rounded-xl text-sm"
          >
            Start Booking
          </button>
        </div>
      </MobileLayout>
    );
  }

  const mspRate = selectedCrop?.mspPerQuintal || 4892;
  const estimatedPayout = (quantity || 0) * mspRate;

  const handleConfirm = async () => {
    if (!farmer) {
      setError('Please login to confirm booking.');
      return;
    }

    if (!quantity || quantity <= 0) {
      setError('Please enter a valid quantity in quintals.');
      return;
    }

    if (quantity > 500) {
      setError('Maximum procurement limit per token is 500 quintals.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      setQuantity(quantity);
      const res = await createBooking({
        farmerId: farmer.id,
        farmerName: farmer.fullName,
        farmerMobile: farmer.mobileNumber,
        cropId: state.cropId || selectedCrop?.id || 'crop_soybean',
        centerId: state.centerId || selectedCenter?.id || 'PC001',
        date: state.date,
        timeSlotId: state.timeSlotId || 'SLOT001',
        expectedQuantityQuintals: quantity,
      });

      if (res.success && res.booking) {
        resetFlow();
        // Use digitalToken for the token page, falling back to booking id
        const tokenOrId = res.booking.digitalToken || res.booking.id;
        navigate(`/token/${tokenOrId}`);
      } else {
        setError(res.error || 'Failed to confirm booking. Please try another slot.');
      }
    } catch (err: unknown) {
      setError('Failed to confirm booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MobileLayout showBack backTitle={t('availableSlotsTitle')} onBack={() => navigate('/slots')}>
      <div className="p-4 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
              <span className="text-emerald-800 font-black">Step 4 of 4</span>
              <span>Confirm & Token</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full w-full rounded-full transition-all" />
            </div>
          </div>

          {/* Title */}
          <div className="flex justify-between items-start pt-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 leading-tight">
                {t('bookingConfirmationTitle')}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Verify your procurement slot reservation details
              </p>
            </div>
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
              className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0"
            >
              <CheckCircle2 className="w-6 h-6" />
            </motion.div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Booking Summary Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            {/* Farmer Info */}
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{t('farmerName')}</span>
                <span className="text-base font-bold text-slate-800 mt-0.5 block">{farmer?.fullName}</span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                {farmer?.farmerId}
              </span>
            </div>

            {/* Crop Details */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 flex items-center justify-center">
                  <Sprout className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{t('selectedCrop')}</span>
                  <span className="text-base font-bold text-slate-800 mt-0.5 block">{selectedCrop?.name}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{t('mspRate')}</span>
                <span className="text-sm font-bold text-emerald-800 mt-0.5 block">
                  ₹{mspRate.toLocaleString('en-IN')}/{t('perQuintal')}
                </span>
              </div>
            </div>

            {/* Center Details */}
            <div className="pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{t('procurementCenter')}</span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5 block">{selectedCenter?.name}</span>
                  <span className="text-xs text-slate-400 block">{selectedCenter?.location}</span>
                </div>
              </div>
            </div>

            {/* Date and Time Slot */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{t('date')}</span>
                </div>
                <span className="text-xs font-bold text-slate-800">{state.date}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{t('timeSlot')}</span>
                </div>
                <span className="text-xs font-bold text-slate-800">{state.timeSlotWindow}</span>
              </div>
            </div>
          </div>

          {/* Expected Quantity Input Field */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <label htmlFor="expected-quantity-input" className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-700" />
                <span>{t('expectedQuantity')} <span className="text-red-500">*</span></span>
              </label>
              <span className="text-xs text-slate-400 font-medium">(in Quintals)</span>
            </div>

            <div className="relative">
              <input
                id="expected-quantity-input"
                type="number"
                min={1}
                max={500}
                value={quantity || ''}
                onChange={(e) => setLocalQuantity(Number(e.target.value))}
                placeholder={t('quantityPlaceholder')}
                className="w-full pl-4 pr-20 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                required
              />
              <span className="absolute right-4 top-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Quintals
              </span>
            </div>

            {/* Estimated Payout calculation */}
            <div className="bg-emerald-50 rounded-xl p-3.5 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-emerald-800" />
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">{t('estimatedPayout')}:</span>
              </div>
              <span className="text-lg font-black text-emerald-950">
                ₹{estimatedPayout.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Government Assurance Banner */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              A digital token number will be generated immediately upon confirmation. Please present this token upon arrival at the procurement center.
            </p>
          </div>

          {/* Action Button */}
          <button
            id="confirm-booking-submit-btn"
            type="button"
            disabled={isSubmitting || !quantity || quantity <= 0}
            onClick={handleConfirm}
            className="w-full py-4 px-6 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-bold text-base rounded-2xl shadow-lg shadow-emerald-700/20 transition flex items-center justify-center gap-2 mt-4"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating Token...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>{t('confirmBookingBtn')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </MobileLayout>
  );
};
