import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import {
  Scale,
  Building2,
  Filter,
  Search,
  TrendingUp,
  AlertTriangle,
  Wheat,
  CheckCircle2
} from 'lucide-react';
import { SyntheticDataBadge } from '../../components/SyntheticDataBadge';

interface CapacityItem {
  center_id: string;
  center_name: string;
  district: string;
  taluka: string;
  accepted_crops: string[];
  daily_capacity_quintals: number | null;
  total_intake_capacity_quintals: number | null;
  used_capacity_quintals: number;
  remaining_capacity_quintals: number | null;
  utilization_percent: number | null;
}

export const AdminCapacity: React.FC = () => {
  const [capacities, setCapacities] = useState<CapacityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All');

  useEffect(() => {
    fetchCapacity();
  }, []);

  const fetchCapacity = async () => {
    try {
      setLoading(true);
      const [response, centersResponse, procurementResponse] = await Promise.all([
        apiRequest<any>('/admin/capacity'),
        apiRequest<any>('/admin/centers'),
        apiRequest<any>('/admin/procurements'),
      ]);
      const rows: any[] = Array.isArray(response)
        ? response
        : Array.isArray(response?.capacity)
          ? response.capacity
          : [];
      const centers: any[] = Array.isArray(centersResponse?.centers) ? centersResponse.centers : [];
      const centersById = new Map(centers.map((center) => [center.center_id, center]));
      const procurements: any[] = Array.isArray(procurementResponse?.records) ? procurementResponse.records : [];
      const usedByCenter = new Map<string, number>();
      for (const record of procurements) {
        const weight = Number(record.actual_weight ?? record.weight_quintals ?? 0) || 0;
        usedByCenter.set(record.center_id, (usedByCenter.get(record.center_id) || 0) + weight);
      }
      setCapacities(rows.map((item) => {
        const center = centersById.get(item.center_id) || {};
        const rawTotal = item.total_intake_capacity_quintals ?? item.intake_capacity_quintals ?? item.intake_capacity;
        const total = rawTotal == null ? null : (Number(rawTotal) || 0);
        const used = Number(item.used_capacity_quintals ?? usedByCenter.get(item.center_id) ?? 0) || 0;
        const remaining = total == null ? null : (Number(item.remaining_capacity_quintals ?? Math.max(0, total - used)) || 0);
        return {
          center_id: item.center_id || '',
          center_name: item.center_name || center.center_name || 'Procurement Center',
          district: item.district || center.district || '',
          taluka: item.taluka || center.taluka || '',
          accepted_crops: Array.isArray(item.accepted_crops) ? item.accepted_crops : (center.accepted_crops || []),
          daily_capacity_quintals: item.daily_capacity_quintals ?? item.daily_procurement_capacity_quintals ?? item.daily_capacity ?? null,
          total_intake_capacity_quintals: total,
          used_capacity_quintals: used,
          remaining_capacity_quintals: remaining,
          utilization_percent: total == null ? null : (Number(item.utilization_percent ?? (total ? used / total * 100 : 0)) || 0),
        };
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = capacities.filter((c) => {
    const matchesDistrict = districtFilter === 'All' || c.district.toLowerCase() === districtFilter.toLowerCase();
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      c.center_name.toLowerCase().includes(q) ||
      c.center_id.toLowerCase().includes(q) ||
      c.district.toLowerCase().includes(q) ||
      c.taluka.toLowerCase().includes(q);
    return matchesDistrict && matchesSearch;
  });

  const totalIntake = capacities.reduce((sum, c) => sum + (c.total_intake_capacity_quintals ?? 0), 0);
  const totalUsed = capacities.reduce((sum, c) => sum + c.used_capacity_quintals, 0);
  const totalRemaining = Math.max(0, totalIntake - totalUsed);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Intake Capacity Management</h1>
            <SyntheticDataBadge />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Procurement storage quotas, daily intake capacities, and grain intake utilization metrics
          </p>
          <p className="text-[11px] text-amber-800 mt-1">The verified center master has no capacity or live utilization figures. “Not supplied” means the source did not provide a value; totals only include centers with recorded capacity.</p>
        </div>
      </div>

      {/* Aggregate Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1.5">
            <span>Total State Intake Capacity</span>
            <Scale className="w-4 h-4 text-[#064E3B]" />
          </div>
          <div className="text-xl font-black text-slate-900">{totalIntake.toLocaleString()} Quintals</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Sum of all 50 Government Centers</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1.5">
            <span>Procured / Used Capacity</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-black text-indigo-900">{totalUsed.toLocaleString()} Quintals</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Total physical grain accepted &amp; stored</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1.5">
            <span>Available Storage Headroom</span>
            <CheckCircle2 className="w-4 h-4 text-[#064E3B]" />
          </div>
          <div className="text-xl font-black text-[#064E3B]">{totalRemaining.toLocaleString()} Quintals</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Remaining statewide storage capacity</div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by center, taluka, or district..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#064E3B]"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-slate-500 font-semibold">District:</label>
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-md px-2 py-1.5 text-slate-800 font-medium focus:ring-1 focus:ring-[#064E3B]"
          >
            <option value="All">All Districts</option>
            {Array.from(new Set(capacities.map((c) => c.district))).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="ml-auto text-slate-500 text-[11px]">
          Showing <strong>{filtered.length}</strong> centers
        </div>
      </div>

      {/* Capacity Grid / Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="px-4 py-2.5">Center</th>
                <th className="px-4 py-2.5">Accepted Crops</th>
                <th className="px-4 py-2.5 text-right">Daily Intake Cap</th>
                <th className="px-4 py-2.5 text-right">Total Storage Cap</th>
                <th className="px-4 py-2.5 text-right">Used Capacity</th>
                <th className="px-4 py-2.5 text-right">Remaining Headroom</th>
                <th className="px-4 py-2.5" style={{ width: '180px' }}>
                  Utilization Rate
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    Loading capacity statistics...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No centers found.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.center_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="font-bold text-slate-900">{item.center_name}</div>
                      <div className="text-[11px] text-slate-500">
                        {item.center_id} &bull; {item.taluka}, {item.district}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {item.accepted_crops.map((cr, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium"
                          >
                            {cr}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-800">
                      {item.daily_capacity_quintals == null ? 'Not supplied' : `${item.daily_capacity_quintals} Q`}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900">
                      {item.total_intake_capacity_quintals == null ? 'Not supplied' : `${item.total_intake_capacity_quintals.toLocaleString()} Q`}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-indigo-700">
                      {item.used_capacity_quintals} Q
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-[#064E3B]">
                      {item.remaining_capacity_quintals == null ? 'Not supplied' : `${item.remaining_capacity_quintals} Q`}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="font-semibold text-slate-700">{item.utilization_percent == null ? 'Not available' : `${item.utilization_percent}%`}</span>
                          <span className="text-slate-400">{item.remaining_capacity_quintals == null ? 'Not available' : `${item.remaining_capacity_quintals} Q left`}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                            (item.utilization_percent ?? 0) > 80
                                ? 'bg-rose-500'
                              : (item.utilization_percent ?? 0) > 50
                                ? 'bg-amber-500'
                                : 'bg-[#064E3B]'
                            }`}
                            style={{ width: `${Math.min(100, item.utilization_percent ?? 0)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
