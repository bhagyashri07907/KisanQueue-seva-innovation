import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { ProcurementCenter } from '../../types';
import {
  Building2,
  MapPin,
  Clock,
  Wheat,
  Scale,
  ShieldAlert,
  CheckCircle,
  Globe
} from 'lucide-react';
import { SyntheticDataBadge } from '../../components/SyntheticDataBadge';

export const OfficerCenter: React.FC = () => {
  const [center, setCenter] = useState<ProcurementCenter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCenter();
  }, []);

  const fetchCenter = async () => {
    try {
      setLoading(true);
      const res = await apiRequest<{ center: ProcurementCenter }>('/officer/my-center');
      setCenter(res.center);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
          <span>Loading Assigned Center Master Record...</span>
        </div>
      </div>
    );
  }

  if (!center) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm">
        Assigned center record not found.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Assigned Procurement Center</h1>
            <SyntheticDataBadge />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Designated field operations station assigned by State Administration
          </p>
        </div>
      </div>

      {/* Strict Read-Only Authority Notice */}
      <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-950 flex items-start gap-3 shadow-2xs">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <strong className="block text-sm font-bold mb-0.5">Government Master Data Notice:</strong>
          Center information is managed exclusively by the <strong>Government Admin</strong> and is strictly{' '}
          <strong>read-only</strong> for Procurement Officers. To request modifications to daily capacity, operating hours,
          or accepted crops, please contact the Directorate of Agricultural Marketing.
        </div>
      </div>

      {/* Main Details Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="bg-[#064E3B] text-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#053e2f] text-[#FFD700] border border-[#043326]">
              {center.center_id}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/10 text-emerald-200 border border-white/20">
              <CheckCircle className="w-3.5 h-3.5 text-[#FFD700]" />
              Operational &bull; Active Master Data
            </span>
          </div>
          <h2 className="text-lg font-bold">{center.center_name}</h2>
          <p className="text-xs text-emerald-100/80 mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#FFD700]" />
            {center.location}
          </p>
        </div>

        <div className="p-5 divide-y divide-slate-100 text-xs">
          {/* Geographical Specs */}
          <div className="py-4 first:pt-0 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <span className="block text-slate-500 font-semibold uppercase tracking-wider text-[10px]">District</span>
              <span className="text-sm font-bold text-slate-800">{center.district}</span>
            </div>
            <div>
              <span className="block text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Taluka</span>
              <span className="text-sm font-bold text-slate-800">{center.taluka}</span>
            </div>
            <div>
              <span className="block text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                Coordinates (GPS)
              </span>
              <span className="text-sm font-mono text-slate-800">
                {(center.latitude ?? 18.5204).toFixed(4)}° N, {(center.longitude ?? 73.8567).toFixed(4)}° E
              </span>
            </div>
          </div>

          {/* Operating & Storage Specs */}
          <div className="py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <span className="block text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                Total Intake Capacity
              </span>
              <span className="text-base font-extrabold text-slate-900 font-mono">
                {(center.intake_capacity ?? 5000).toLocaleString()} Quintals
              </span>
            </div>
            <div>
              <span className="block text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                Daily Intake Limit
              </span>
              <span className="text-base font-extrabold text-emerald-700 font-mono">
                {center.daily_capacity ?? 500} Q / Day
              </span>
            </div>
            <div>
              <span className="block text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                Daily Operating Hours
              </span>
              <span className="text-sm font-mono font-bold text-slate-800">
                {typeof center.operating_hours === 'object' && center.operating_hours
                  ? `${center.operating_hours.start || '09:00'} - ${center.operating_hours.end || '17:00'}`
                  : (center.operating_hours || '09:00 - 17:00')}
              </span>
            </div>
          </div>

          {/* Crops */}
          <div className="py-4">
            <span className="block text-slate-500 font-semibold uppercase tracking-wider text-[10px] mb-2">
              Government Mandated Procurement Crops
            </span>
            <div className="flex flex-wrap gap-2">
              {(center.accepted_crops || ['Soybean', 'Wheat', 'Gram']).map((crop, i) => (
                <div
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 font-semibold text-xs"
                >
                  <Wheat className="w-3.5 h-3.5 text-emerald-700" />
                  {crop}
                </div>
              ))}
            </div>
          </div>

          {/* Security & Access Boundary Note */}
          <div className="pt-4 text-slate-500 leading-relaxed text-[11px]">
            This officer login is authorized to perform procurement verification, digital weighment, quality testing,
            and receipt issuance specifically for <strong>{center.center_name}</strong>. Transactions conducted here are
            instantly synced to the Maharashtra Central Agricultural Registry.
          </div>
        </div>
      </div>
    </div>
  );
};
