import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sprout, Wheat, Flower2, TreePine, Sun, CheckCircle2 } from 'lucide-react';
import { Crop } from '../types';

interface CropCardProps {
  crop: Crop;
  isSelected: boolean;
  onSelect: (cropId: string) => void;
  centerCount?: number;
  districtName?: string;
}

export const CropCard: React.FC<CropCardProps> = ({ crop, isSelected, onSelect, centerCount, districtName }) => {
  const { t, i18n } = useTranslation();

  const getLocalizedName = () => {
    if (i18n.language === 'hi') return crop.nameHi;
    if (i18n.language === 'mr') return crop.nameMr;
    return crop.name;
  };

  const getSecondaryName = () => {
    if (i18n.language === 'en') return `${crop.nameMr} / ${crop.nameHi}`;
    return crop.name;
  };

  const getCropIcon = () => {
    switch (crop.icon) {
      case 'Wheat':
        return <Wheat className="w-8 h-8 text-amber-600" />;
      case 'Flower2':
        return <Flower2 className="w-8 h-8 text-sky-600" />;
      case 'TreePine':
        return <TreePine className="w-8 h-8 text-emerald-600" />;
      case 'Sun':
        return <Sun className="w-8 h-8 text-orange-600" />;
      default:
        return <Sprout className="w-8 h-8 text-emerald-600" />;
    }
  };

  return (
    <button
      id={`crop-card-${crop.id}`}
      type="button"
      onClick={() => onSelect(crop.id)}
      className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${
        isSelected
          ? 'border-emerald-600 bg-emerald-50 shadow-sm'
          : 'border-slate-100 hover:border-emerald-200 bg-white shadow-sm'
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
            isSelected ? 'bg-white shadow-sm' : 'bg-slate-50 border border-slate-200'
          }`}
        >
          {getCropIcon()}
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <h3 className={`text-base font-bold leading-tight ${isSelected ? 'text-emerald-900' : 'text-slate-800'}`}>
              {getLocalizedName()}
            </h3>
            <span className="text-xs text-slate-400 font-medium">({getSecondaryName()})</span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-emerald-800 bg-white border border-emerald-200 px-2.5 py-0.5 rounded-lg">
              {t('mspRate')}: ₹{crop.mspPerQuintal.toLocaleString('en-IN')}/{t('perQuintal')}
            </span>
            {centerCount !== undefined && districtName && (
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                centerCount > 0
                  ? 'bg-slate-100 text-slate-700'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {centerCount > 0 ? `${centerCount} centers in ${districtName}` : `No centers in ${districtName}`}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0 ml-2">
        {isSelected ? (
          <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
        ) : (
          <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
        )}
      </div>
    </button>
  );
};
