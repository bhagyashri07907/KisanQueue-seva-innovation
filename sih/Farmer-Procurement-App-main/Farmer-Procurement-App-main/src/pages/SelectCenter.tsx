import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Building2, ShieldCheck, MapPin, Filter, AlertCircle, ArrowLeft } from 'lucide-react';
import { MobileLayout } from '../layouts/MobileLayout';
import { CenterCard } from '../components/CenterCard';
import { useAuth } from '../hooks/useAuth';
import { useBookingFlow } from '../hooks/useBookingFlow';
import { getProcurementCenters, getCrops } from '../services/api';
import { ProcurementCenter, Crop } from '../types';

const DISTRICT_LIST = ['Pune', 'Satara', 'Nashik', 'Ahmednagar', 'Solapur', 'Kolhapur'];

export const SelectCenter: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { farmer } = useAuth();
  const { state, setCenter, setDistrict, selectedCrop } = useBookingFlow();

  const [centers, setCenters] = useState<ProcurementCenter[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [activeDistrict, setActiveDistrict] = useState<string>(
    state.district || farmer?.district || 'Pune'
  );

  useEffect(() => {
    // If no crop selected, redirect back to crop selection
    if (!state.cropId) {
      navigate('/select-crop');
      return;
    }

    Promise.all([getProcurementCenters(), getCrops()]).then(([centersData, cropsData]) => {
      setCenters(centersData);
      setCrops(cropsData);
    });
  }, [state.cropId, navigate]);

  const handleSelectCenter = (centerId: string) => {
    setCenter(centerId);
    navigate('/slots');
  };

  const handleDistrictChange = (district: string) => {
    setActiveDistrict(district);
    if (district !== 'All') {
      setDistrict(district);
    }
  };

  // Filter centers on the basis of district AND selected crop
  const filteredCenters = centers.filter((center) => {
    const matchesDistrict =
      activeDistrict === 'All' ||
      center.district.toLowerCase() === activeDistrict.toLowerCase();
    const acceptsCrop = state.cropId
      ? center.acceptedCropIds.includes(state.cropId)
      : true;
    return matchesDistrict && acceptsCrop;
  });

  return (
    <MobileLayout
      showBack
      backTitle={t('selectCropTitle')}
      onBack={() => navigate('/select-crop')}
    >
      <div className="p-4 sm:p-6 space-y-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
          {/* Progress Indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
              <span className="text-emerald-800 font-black">Step 3 of 4</span>
              <span>Select Center</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full w-3/4 rounded-full transition-all" />
            </div>
          </div>

          {/* Heading */}
          <div className="flex justify-between items-start pt-1">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 leading-tight">
                {t('selectCenterTitle')}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Showing available procurement centers in{' '}
                <span className="font-bold text-slate-800">{activeDistrict} District</span> for{' '}
                <span className="font-bold text-emerald-800">{selectedCrop?.name || 'your crop'}</span>.
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
          </div>

          {/* Selected Crop Banner Reminder */}
          {selectedCrop && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Crop:</span>
                <span className="font-bold text-emerald-900 bg-white border border-emerald-200 px-2.5 py-0.5 rounded-lg shadow-2xs">
                  {selectedCrop.name} (MSP ₹{selectedCrop.mspPerQuintal}/Qtl)
                </span>
              </div>
              <button
                type="button"
                onClick={() => navigate('/select-crop')}
                className="text-emerald-800 hover:text-emerald-950 font-bold underline text-[11px]"
              >
                Change Crop
              </button>
            </div>
          )}

          {/* District Filter Selector Tabs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-700" />
                <span>Filter by District</span>
              </label>
              <button
                type="button"
                onClick={() => navigate('/select-location')}
                className="text-xs text-emerald-800 hover:text-emerald-950 font-bold underline"
              >
                Change Location
              </button>
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none" id="district-filter-pills">
              {DISTRICT_LIST.map((dist) => {
                const isSelected = activeDistrict.toLowerCase() === dist.toLowerCase();
                return (
                  <button
                    key={dist}
                    type="button"
                    onClick={() => handleDistrictChange(dist)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {dist}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => handleDistrictChange('All')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
                  activeDistrict === 'All'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                All Districts
              </button>
            </div>
          </div>

          {/* Government Authorized Notice */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Procurement centers are government-monitored. After selecting a center, you will choose an available date and time slot.
            </p>
          </div>

          {/* Center Cards List */}
          <div className="space-y-3.5" id="procurement-centers-list">
            {filteredCenters.length > 0 ? (
              filteredCenters.map((center) => (
                <CenterCard
                  key={center.id}
                  center={center}
                  crops={crops}
                  selectedCropId={state.cropId}
                  onSelect={handleSelectCenter}
                />
              ))
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
                <h3 className="text-sm font-black text-amber-900">
                  No Centers Found in {activeDistrict} for {selectedCrop?.name}
                </h3>
                <p className="text-xs text-amber-700 max-w-sm mx-auto">
                  Try switching to a neighboring district or select "All Districts" to view all active centers.
                </p>
                <div className="flex justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleDistrictChange('Pune')}
                    className="px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-amber-900"
                  >
                    Try Pune
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDistrictChange('Satara')}
                    className="px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-amber-900"
                  >
                    Try Satara
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDistrictChange('All')}
                    className="px-3 py-1.5 bg-emerald-700 text-white rounded-xl text-xs font-bold"
                  >
                    Show All Districts
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};
