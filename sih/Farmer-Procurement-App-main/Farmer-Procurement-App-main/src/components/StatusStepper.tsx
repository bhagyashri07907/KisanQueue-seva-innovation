import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Clock, Truck, CheckCircle2 } from 'lucide-react';
import { BookingStatus } from '../types';

interface StatusStepperProps {
  currentStatus: BookingStatus;
  verifiedAt?: string;
  procurementAt?: string;
  completedAt?: string;
}

export const StatusStepper: React.FC<StatusStepperProps> = ({
  currentStatus,
  verifiedAt,
  procurementAt,
  completedAt,
}) => {
  const { t } = useTranslation();

  const steps = [
    {
      key: 'Booked',
      label: t('stepBooked'),
      desc: t('statusBookedDesc'),
      icon: Clock,
      timestamp: 'Slot confirmed',
    },
    {
      key: 'Verified',
      label: t('stepVerified'),
      desc: t('statusVerifiedDesc'),
      icon: Check,
      timestamp: verifiedAt ? new Date(verifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
    },
    {
      key: 'In Procurement',
      label: t('stepInProcurement'),
      desc: t('statusInProcurementDesc'),
      icon: Truck,
      timestamp: procurementAt ? new Date(procurementAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
    },
    {
      key: 'Completed',
      label: t('stepCompleted'),
      desc: t('statusCompletedDesc'),
      icon: CheckCircle2,
      timestamp: completedAt ? new Date(completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
    },
  ];

  const getStepIndex = (status: BookingStatus) => {
    switch (status) {
      case 'Booked':
        return 0;
      case 'Verified':
        return 1;
      case 'In Procurement':
        return 2;
      case 'Completed':
        return 3;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(currentStatus);

  return (
    <div id="procurement-status-stepper" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
        Procurement Progress
      </h2>

      <div className="relative flex flex-col">
        {steps.map((step, index) => {
          const isFinished = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <div key={step.key} className="relative flex items-start gap-4 pb-8 last:pb-2">
              {/* Vertical connector line */}
              {index < steps.length - 1 && (
                <div
                  className={`absolute left-4 top-8 -ml-[1px] w-0.5 h-full transition-colors ${
                    index < currentIndex ? 'bg-emerald-600' : 'bg-slate-200'
                  }`}
                />
              )}

              {/* Step Icon Badge */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 font-bold text-xs transition-all ${
                  isFinished
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : isCurrent
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-xs'
                    : 'bg-slate-100 text-slate-300 border-2 border-slate-200'
                }`}
              >
                {isFinished ? (
                  '✓'
                ) : isCurrent ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 pt-0.5">
                <div className="flex items-center justify-between">
                  <h4
                    className={`text-sm font-bold ${
                      isFinished || isCurrent ? 'text-slate-800' : 'text-slate-300'
                    }`}
                  >
                    {step.label}
                  </h4>
                  {isCurrent && (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      Current
                    </span>
                  )}
                  {step.timestamp && (
                    <span className="text-[11px] font-medium text-slate-400">
                      {step.timestamp}
                    </span>
                  )}
                </div>
                <p
                  className={`text-xs mt-0.5 leading-relaxed ${
                    isFinished || isCurrent ? 'text-slate-500' : 'text-slate-300'
                  }`}
                >
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
