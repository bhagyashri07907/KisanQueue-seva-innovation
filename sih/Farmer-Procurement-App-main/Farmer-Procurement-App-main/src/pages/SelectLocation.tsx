import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Building2,
  Navigation,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Compass,
} from 'lucide-react';
import { MobileLayout } from '../layouts/MobileLayout';
import { useAuth } from '../hooks/useAuth';
import { useBookingFlow } from '../hooks/useBookingFlow';
import { getProcurementDistricts, ProcurementDistrict } from '../services/api';

export const SelectLocation: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { farmer } = useAuth();
  const { state, setDistrict } = useBookingFlow();

  const defaultDistrict = state.district || farmer?.district || 'Pune';
  const defaultTaluka = state.taluka || farmer?.taluka || 'Baramati';

  const [selectedDistrict, setSelectedDistrict] = useState<string>(defaultDistrict);
  const [selectedTaluka, setSelectedTaluka] = useState<string>(defaultTaluka);
  const [detectingGps, setDetectingGps] = useState<boolean>(false);
  const [gpsSuccessMessage, setGpsSuccessMessage] = useState<string | null>(null);
  const [districts, setDistricts] = useState<ProcurementDistrict[]>([]);

  useEffect(() => {
    getProcurementDistricts().then((items) => {
      setDistricts(items);
      if (items.length && !items.some((item) => item.name.toLowerCase() === selectedDistrict.toLowerCase())) {
        setSelectedDistrict(items[0].name);
        setSelectedTaluka(items[0].talukas[0] || '');
      }
    });
  }, []);

  // Update taluka when district changes if not in new district
  useEffect(() => {
    const currentDist = districts.find(
      (d) => d.name.toLowerCase() === selectedDistrict?.toLowerCase()
    );
    if (currentDist && !currentDist.talukas.includes(selectedTaluka)) {
      setSelectedTaluka(currentDist.talukas[0] || '');
    }
  }, [districts, selectedDistrict, selectedTaluka]);

  // Count centers in district
  const getCenterCount = (districtName: string) => {
    return districts.find((district) => district.name.toLowerCase() === districtName.toLowerCase())?.center_count || 0;
  };

  const handleGpsDetect = () => {
    setDetectingGps(true);
    setGpsSuccessMessage(null);

    setTimeout(() => {
      setDetectingGps(false);
      // Simulate GPS resolving to farmer's district
      const matchedDistrict = districts.find((district) => district.name.toLowerCase() === farmer?.district?.toLowerCase()) || districts[0];
      const targetDistrict = matchedDistrict?.name || '';
      const targetTaluka = matchedDistrict?.talukas.includes(farmer?.taluka || '') ? farmer!.taluka : (matchedDistrict?.talukas[0] || '');
      setSelectedDistrict(targetDistrict);
      setSelectedTaluka(targetTaluka);
    setGpsSuccessMessage(t('selectedGpsLocation', { taluka: targetTaluka, district: targetDistrict }));
    }, 800);
  };

  const handleUseRegistered = () => {
    if (farmer) {
      const registeredDistrict = districts.find((district) => district.name.toLowerCase() === farmer.district.toLowerCase());
      if (registeredDistrict) {
        setSelectedDistrict(registeredDistrict.name);
        setSelectedTaluka(registeredDistrict.talukas.includes(farmer.taluka) ? farmer.taluka : registeredDistrict.talukas[0] || '');
      }
    }
  };

  const handleProceed = () => {
    setDistrict(selectedDistrict, selectedTaluka);
    navigate('/select-crop');
  };

  const currentDistObj = districts.find(
    (d) => d.name.toLowerCase() === selectedDistrict?.toLowerCase()
  );

  return (
    <MobileLayout
      showBack
      backTitle={t('navHome')}
      onBack={() => navigate('/dashboard')}
    >
      <div className="p-4 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
              <span className="text-emerald-800 font-black">{t('stepProgress', { current: 1 })}</span>
              <span>{t('stepSetLocation')}</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full w-1/4 rounded-full transition-all" />
            </div>
          </div>

          {/* Heading */}
          <div className="flex justify-between items-start pt-1">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-emerald-800 border border-emerald-200 uppercase tracking-widest mb-1.5">
                <MapPin className="w-3 h-3 text-emerald-700" />
                <span>{t('locationConfirmation')}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 leading-tight">
                {t('selectDistrictTitle')}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {t('districtMasterDescription')}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0">
              <Compass className="w-6 h-6" />
            </div>
          </div>

          {/* Registered Location Quick Select */}
          {farmer && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                  {t('registeredFarmLocation')}
                </span>
                <p className="text-sm font-black text-slate-800 mt-0.5">
                  {farmer.village}, Tal. {farmer.taluka}, Dist. {farmer.district}
                </p>
                <p className="text-xs text-slate-500">
                  {t('farmerId')}: <span className="font-semibold text-slate-700">{farmer.farmerId}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={handleUseRegistered}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                  farmer.district && farmer.taluka &&
                  selectedDistrict.toLowerCase() === farmer.district.toLowerCase() &&
                  selectedTaluka.toLowerCase() === farmer.taluka.toLowerCase()
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('useRegistered')}</span>
              </button>
            </div>
          )}

          {/* GPS Auto-Detect Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGpsDetect}
              disabled={detectingGps}
              className="flex-1 border border-dashed border-emerald-300 bg-emerald-50/60 hover:bg-emerald-50 text-emerald-800 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
            >
              <Navigation className={`w-3.5 h-3.5 ${detectingGps ? 'animate-spin' : ''}`} />
              <span>{detectingGps ? t('detectingGps') : t('autoDetectGps')}</span>
            </button>
          </div>

          {gpsSuccessMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{gpsSuccessMessage}</span>
            </div>
          )}

          {/* District Grid */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {t('selectDistrict')}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5" id="district-selector-grid">
              {districts.map((dist) => {
                const count = getCenterCount(dist.name);
                const isSelected = selectedDistrict?.toLowerCase() === dist.name.toLowerCase();

                return (
                  <button
                    key={dist.name}
                    type="button"
                    onClick={() => setSelectedDistrict(dist.name)}
                    className={`p-3.5 rounded-2xl text-left border transition relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-700 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-700'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-slate-900">
                          {dist.name}
                        </span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium block">
                          {t('listedCentersCount', { count: dist.center_count })}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 text-[10px]">
                <span className="text-slate-400 font-medium">{t('listedCenters')}</span>
                      <span className="font-bold text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                        {t('listedCentersCount', { count })}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Taluka Selector */}
          {currentDistObj && (
            <div className="space-y-1.5 pt-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {t('selectTaluka', { district: selectedDistrict })}
              </label>
              <div className="flex flex-wrap gap-2">
                {currentDistObj.talukas.map((tal) => {
                  const isTalSelected = selectedTaluka?.toLowerCase() === tal.toLowerCase();
                  return (
                    <button
                      key={tal}
                      type="button"
                      onClick={() => setSelectedTaluka(tal)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        isTalSelected
                          ? 'bg-slate-800 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {tal}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Informational Guidance */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {t('districtConfirmationNotice', { district: selectedDistrict })}
            </p>
          </div>

          {/* Proceed Button */}
          <button
            type="button"
            id="btn-confirm-location"
            onClick={handleProceed}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-4 rounded-2xl font-bold text-base shadow-lg shadow-emerald-700/20 active:scale-[0.99] flex items-center justify-center gap-2 transition"
          >
            <span>{t('proceedSelectCrop')}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </MobileLayout>
  );
};
