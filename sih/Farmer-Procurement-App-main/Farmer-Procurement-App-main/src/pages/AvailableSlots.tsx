import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, AlertCircle, Users, ArrowRight, Ban, CheckCircle2 } from 'lucide-react';
import { MobileLayout } from '../layouts/MobileLayout';
import { useBookingFlow } from '../hooks/useBookingFlow';
import { getAvailableSlots } from '../services/api';
import { DateSlots, TimeSlot } from '../types';

export const AvailableSlots: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state, setDate, setTimeSlot, selectedCenter, selectedCrop } = useBookingFlow();

  const [selectedDateStr, setSelectedDateStr] = useState<string>(state.date || '10 September 2026');
  const [selectedSlotId, setSelectedSlotId] = useState<string | undefined>(state.timeSlotId);
  const [error, setError] = useState<string | null>(null);

  const { data: dateSlotsList = [] } = useQuery({
    queryKey: ['availableSlots', state.centerId],
    queryFn: () => getAvailableSlots(state.centerId!),
    enabled: !!state.centerId,
  });

  useEffect(() => {
    if (!state.centerId) {
      navigate('/select-center');
      return;
    }
  }, [state.centerId, navigate]);

  useEffect(() => {
    if (dateSlotsList.length > 0) {
      const defaultDateObj = dateSlotsList.find((d) => d.displayDate === '10 September 2026') || dateSlotsList[0];
      const dateVal = defaultDateObj.displayDate;
      if (!state.date || state.date !== dateVal) {
        setSelectedDateStr(dateVal);
        setDate(dateVal);
      }
    }
  }, [dateSlotsList, setDate, state.date]);

  const activeDateObj = dateSlotsList.find(
    (d) => d.displayDate === selectedDateStr || d.date === selectedDateStr
  );

  const handleDateChange = (dateVal: string) => {
    setSelectedDateStr(dateVal);
    setDate(dateVal);
    setSelectedSlotId(undefined);
    setError(null);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (slot.isFull || slot.available <= 0) {
      setError(t('fullSlotWarning'));
      return;
    }
    setError(null);
    setSelectedSlotId(slot.id);
    setTimeSlot(slot.id, slot.timeWindow);
  };

  const handleProceed = () => {
    if (!selectedSlotId) {
      setError(t('selectSlotError'));
      return;
    }
    navigate('/booking-confirmation');
  };

  return (
    <MobileLayout showBack backTitle={t('selectCenterTitle')} onBack={() => navigate('/select-center')}>
      <div className="p-4 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
              <span className="text-emerald-800 font-black">{t('stepProgress', { current: 4 })}</span>
              <span>{t('stepChooseSlot')}</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full w-full rounded-full transition-all" />
            </div>
          </div>

          {/* Location, Center & Crop Summary Chip */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <span>{selectedCenter?.name}</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">
                  {t('districtShort')} {selectedCenter?.district}
                </span>
              </div>
              <div className="text-slate-500 text-[11px]">
                {t('cropShort')} <span className="font-semibold text-slate-700">{selectedCrop?.name}</span>{selectedCrop?.mspPerQuintal == null ? ` (${t('mspNotListed')})` : ` (MSP ₹${selectedCrop.mspPerQuintal}/Qtl)`}
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/select-center')}
              className="text-emerald-800 hover:text-emerald-950 font-bold underline text-[11px] shrink-0 ml-2"
            >
              {t('changeCenter')}
            </button>
          </div>

          {/* Heading */}
          <div className="flex justify-between items-start pt-1">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 leading-tight">
                {t('availableSlotsTitle')}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {t('slotDateSubtitle')}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          {/* Date Selector Pills */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
              {t('selectDate')}
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none" id="date-selection-pills">
              {dateSlotsList.map((d) => {
                const isSelected = d.displayDate === selectedDateStr || d.date === selectedDateStr;
                return (
                  <button
                    key={d.date}
                    id={`date-pill-${d.date}`}
                    type="button"
                    onClick={() => handleDateChange(d.displayDate)}
                    className={`px-4 py-3 rounded-xl text-xs font-bold shrink-0 border transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>{d.displayDate}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Available Slots List */}
          <div className="space-y-3" id="slots-list-container">
            {dateSlotsList.length === 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                {t('noWindowsConfigured')}
              </div>
            )}
            {dateSlotsList.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                {t('appConfiguredWindowsNotice')}
              </div>
            )}
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
              <span>{t('timeSlot')}</span>
              <span>{t('availability')}</span>
            </div>

            {activeDateObj?.slots.map((slot) => {
              const isSelected = selectedSlotId === slot.id;
              const isFull = slot.isFull || slot.available <= 0;

              return (
                <button
                  key={slot.id}
                  id={`slot-card-${slot.id}`}
                  type="button"
                  disabled={isFull}
                  onClick={() => handleSlotSelect(slot)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    isFull
                      ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                      : isSelected
                      ? 'bg-emerald-50 border-emerald-600 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-emerald-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isFull
                          ? 'bg-slate-200 text-slate-500'
                          : isSelected
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                      }`}
                    >
                      {isFull ? <Ban className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <div>
                      <span className="text-base font-bold text-slate-800 block leading-tight">
                        {slot.timeWindow}
                      </span>
                      <span className="text-xs text-slate-400 font-medium mt-0.5 block">
                        {t('capacity')}: {slot.capacity} {t('farmers')}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    {isFull ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-md border border-red-200 uppercase tracking-wider">
                        {t('full')}
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg ${
                            isSelected
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'bg-slate-50 text-slate-700 border border-slate-200'
                          }`}
                        >
                          <Users className="w-3.5 h-3.5" />
                          {slot.available} {t('available')}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Proceed Action Button */}
          <button
            id="proceed-to-confirmation-btn"
            type="button"
            disabled={!selectedSlotId}
            onClick={handleProceed}
            className={`w-full py-4 px-6 font-bold text-base rounded-2xl shadow-lg transition flex items-center justify-center gap-2 active:scale-[0.99] mt-4 ${
              selectedSlotId
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-700/20'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>{t('continueToBooking')}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </MobileLayout>
  );
};
