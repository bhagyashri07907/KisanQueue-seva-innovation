import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Building2, Check, Clock, ChevronRight } from 'lucide-react';
import { ProcurementCenter, Crop } from '../types';

interface CenterCardProps {
  center: ProcurementCenter;
  crops: Crop[];
  selectedCropId?: string;
  onSelect: (centerId: string) => void;
}

export const CenterCard: React.FC<CenterCardProps> = ({
  center,
  crops,
  selectedCropId,
  onSelect,
}) => {
  const { t, i18n } = useTranslation();

  const getLocalizedCenterName = () => {
    if (i18n.language === 'hi') return center.nameHi;
    if (i18n.language === 'mr') return center.nameMr;
    return center.name;
  };

  const acceptsSelectedCrop = selectedCropId
    ? center.acceptedCropIds.includes(selectedCropId)
    : true;

  return (
    <div
      id={`center-card-${center.id}`}
      className={`bg-white rounded-2xl border p-6 shadow-sm transition-all ${
        acceptsSelectedCrop
          ? 'border-slate-200 hover:border-emerald-600'
          : 'border-slate-200 opacity-60 bg-slate-50'
      }`}
    >
      {/* Header with Title & Status Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-100 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 leading-snug">
              {getLocalizedCenterName()}
            </h3>
            <div className="flex items-center gap-1 text-xs text-slate-400 font-medium mt-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>{center.location}, {center.state}</span>
            </div>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
          {center.status}
        </span>
      </div>

      {/* Details Box */}
      <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
            {t('centerAcceptedCrops')}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {center.acceptedCropIds.map((cropId) => {
              const crop = crops.find((c) => c.id === cropId);
              const isTargetCrop = cropId === selectedCropId;
              const cropName = crop
                ? i18n.language === 'mr'
                  ? crop.nameMr
                  : i18n.language === 'hi'
                  ? crop.nameHi
                  : crop.name
                : cropId;

              return (
                <span
                  key={cropId}
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 ${
                    isTargetCrop
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-700 border border-slate-200'
                  }`}
                >
                  {isTargetCrop && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  {cropName}
                </span>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1 text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{center.operatingHours}</span>
          </div>
          <span className="font-semibold text-slate-700">District: {center.district}</span>
        </div>
      </div>

      {/* Action Button */}
      <button
        id={`select-center-btn-${center.id}`}
        type="button"
        disabled={!acceptsSelectedCrop}
        onClick={() => onSelect(center.id)}
        className={`mt-4 w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-[0.99] ${
          acceptsSelectedCrop
            ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
        }`}
      >
        <span>{t('selectCenterBtn')}</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
