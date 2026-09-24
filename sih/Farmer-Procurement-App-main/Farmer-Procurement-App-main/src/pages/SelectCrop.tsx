import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, AlertCircle, Info, MapPin } from 'lucide-react';
import { MobileLayout } from '../layouts/MobileLayout';
import { CropCard } from '../components/CropCard';
import { useAuth } from '../hooks/useAuth';
import { useBookingFlow } from '../hooks/useBookingFlow';
import { getCrops } from '../services/api';
import { Crop } from '../types';
import { DEMO_CENTERS } from '../data/mockData';

export const SelectCrop: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { farmer } = useAuth();
  const { state, setCrop, setDistrict } = useBookingFlow();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCropId, setSelectedCropId] = useState<string>(state.cropId || 'crop_soybean');
  const [error, setError] = useState<string | null>(null);

  const activeDistrict = state.district || farmer?.district || 'Pune';
  const activeTaluka = state.taluka || farmer?.taluka || 'Baramati';

  useEffect(() => {
    if (!state.district && farmer?.district) {
      setDistrict(farmer.district, farmer.taluka);
    }
  }, [state.district, farmer, setDistrict]);

  useEffect(() => {
    getCrops().then((data) => {
      setCrops(data);
      if (!state.cropId && data.length > 0) {
        setSelectedCropId(data[0].id);
        setCrop(data[0].id);
      }
    });
  }, [state.cropId, setCrop]);

  const handleSelect = (cropId: string) => {
    setSelectedCropId(cropId);
    setCrop(cropId);
    setError(null);
  };

  const handleContinue = () => {
    if (!selectedCropId) {
      setError('Please select a crop to proceed.');
      return;
    }
    setCrop(selectedCropId);
    navigate('/select-center');
  };

  // Count centers in active district accepting a given crop
  const getCenterCountForCrop = (cropId: string) => {
    return DEMO_CENTERS.filter(
      (c) =>
        c.district.toLowerCase() === activeDistrict.toLowerCase() &&
        c.acceptedCropIds.includes(cropId)
    ).length;
  };

  return (
    <MobileLayout showBack backTitle="Location" onBack={() => navigate('/select-location')}>
      <div className="p-4 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
              <span className="text-emerald-800 font-black">Step 2 of 4</span>
              <span>Select Crop</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full w-2/4 rounded-full transition-all" />
            </div>
          </div>

          {/* District Banner with Change Option */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <span className="text-slate-500 font-medium">Procurement District: </span>
                <span className="font-bold text-slate-900">{activeDistrict}</span>
                {activeTaluka && <span className="text-slate-500"> ({activeTaluka})</span>}
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/select-location')}
              className="text-emerald-800 hover:text-emerald-950 font-bold underline text-[11px]"
            >
              Change
            </button>
          </div>

          {/* Heading */}
          <div className="flex justify-between items-start pt-1">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 leading-tight">
                {t('selectCropTitle')}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Choose the harvested crop you want to submit. Centers in {activeDistrict} will be displayed.
              </p>
            </div>
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center text-2xl shrink-0 shadow-xs">
              🌾
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Crop Selection Cards */}
          <div className="space-y-3" id="crop-selection-list">
            {crops.map((crop) => (
              <CropCard
                key={crop.id}
                crop={crop}
                isSelected={selectedCropId === crop.id}
                onSelect={handleSelect}
                centerCount={getCenterCountForCrop(crop.id)}
                districtName={activeDistrict}
              />
            ))}
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-slate-600">
            <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Procurement centers in <span className="font-bold text-slate-800">{activeDistrict} District</span> accepting your crop will be filtered in the next step.
            </p>
          </div>

          {/* Action Button */}
          <button
            id="continue-to-center-btn"
            type="button"
            onClick={handleContinue}
            className="w-full py-4 px-6 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-bold text-base rounded-2xl shadow-lg shadow-emerald-700/20 transition flex items-center justify-center gap-2 mt-4"
          >
            <span>Show Procurement Centers in {activeDistrict}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </MobileLayout>
  );
};
