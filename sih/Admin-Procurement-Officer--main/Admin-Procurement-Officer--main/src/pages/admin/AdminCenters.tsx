import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { ProcurementCenter } from '../../types';
import {
  Building2,
  Search,
  Plus,
  Edit2,
  Power,
  Filter,
  CheckCircle,
  XCircle,
  MapPin,
  Clock,
  Wheat,
  Scale,
  X
} from 'lucide-react';
import { SyntheticDataBadge } from '../../components/SyntheticDataBadge';

const MAHARASHTRA_DISTRICTS = [
  'All',
  'Pune', 'Satara', 'Sangli', 'Kolhapur', 'Nashik',
  'Ahmednagar', 'Solapur', 'Aurangabad', 'Jalgaon', 'Dhule',
  'Nandurbar', 'Beed', 'Latur', 'Osmanabad', 'Nagpur',
  'Amravati', 'Akola', 'Yavatmal', 'Wardha', 'Buldhana',
  'Dharashiv', 'Hingoli', 'Nanded', 'Chhatrapati Sambhajinagar'
];

const CROPS = ['All', 'Soybean', 'Wheat', 'Gram (Chana)', 'Gram/Chana', 'Cotton', 'Tur (Arhar)', 'Jowar', 'Bajra', 'Maize', 'Groundnut', 'Moong', 'Urad', 'Paddy', 'Ragi'];

export const AdminCenters: React.FC = () => {
  const [centers, setCenters] = useState<ProcurementCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('All');
  const [crop, setCrop] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCenter, setEditingCenter] = useState<ProcurementCenter | null>(null);
  const [formData, setFormData] = useState({
    center_id: '',
    center_name: '',
    district: 'Pune',
    taluka: '',
    location: '',
    latitude: 18.5204,
    longitude: 73.8567,
    accepted_crops: 'Soybean, Wheat',
    intake_capacity: 5000,
    daily_capacity: 500,
    operating_start: '09:00',
    operating_end: '17:00',
    status: 'active' as 'active' | 'inactive'
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    fetchCenters();
  }, [district, crop, statusFilter]);

  const fetchCenters = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (district !== 'All') params.append('district', district);
      if (crop !== 'All') params.append('crop', crop);
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (search.trim()) params.append('search', search.trim());

      const res = await apiRequest<{ centers: ProcurementCenter[] }>(`/admin/centers?${params.toString()}`);
      setCenters(res.centers || []);
    } catch (err) {
      console.error('Error loading centers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCenters();
  };

  const handleToggleStatus = async (centerId: string) => {
    try {
      await apiRequest(`/admin/centers/${centerId}/status`, { method: 'PATCH' });
      setCenters((prev) =>
        prev.map((c) => (c.center_id === centerId ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' } : c))
      );
      setStatusMessage(`Center status updated successfully.`);
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleOpenAddModal = () => {
    setEditingCenter(null);
    setFormData({
      center_id: `PC${String(centers.length + 1).padStart(3, '0')}`,
      center_name: '',
      district: 'Pune',
      taluka: '',
      location: '',
      latitude: 18.5204,
      longitude: 73.8567,
      accepted_crops: 'Soybean, Wheat',
      intake_capacity: 5000,
      daily_capacity: 500,
      operating_start: '09:00',
      operating_end: '17:00',
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (center: any) => {
    setEditingCenter(center);
    const opHours = center.operating_hours;
    let startHour = '09:00';
    let endHour = '17:00';
    if (typeof opHours === 'object' && opHours) {
      startHour = opHours.start || '09:00';
      endHour = opHours.end || '17:00';
    } else if (typeof opHours === 'string' && opHours.includes('-')) {
      const parts = opHours.split('-');
      startHour = parts[0].trim();
      endHour = parts[1].trim();
    }

    const cropsStr = Array.isArray(center.accepted_crops)
      ? center.accepted_crops.join(', ')
      : typeof center.accepted_crops === 'string'
      ? center.accepted_crops
      : '';

    setFormData({
      center_id: center.center_id,
      center_name: center.center_name,
      district: center.district || 'Pune',
      taluka: center.taluka || '',
      location: center.location || '',
      latitude: center.latitude || 18.5204,
      longitude: center.longitude || 73.8567,
      accepted_crops: cropsStr,
      intake_capacity: center.intake_capacity || center.intake_capacity_quintals || 5000,
      daily_capacity: center.daily_capacity || center.daily_procurement_capacity_quintals || 500,
      operating_start: startHour,
      operating_end: endHour,
      status: center.status === 'inactive' ? 'inactive' : 'active'
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const payload = {
        center_id: formData.center_id,
        center_name: formData.center_name || `Government Procurement Center - ${formData.taluka}`,
        district: formData.district,
        taluka: formData.taluka,
        location: formData.location || `${formData.taluka} APMC Market Yard, ${formData.district}, Maharashtra`,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        accepted_crops: formData.accepted_crops.split(',').map((s) => s.trim()).filter(Boolean),
        intake_capacity: Number(formData.intake_capacity),
        daily_capacity: Number(formData.daily_capacity),
        operating_hours: {
          start: formData.operating_start,
          end: formData.operating_end
        },
        status: formData.status
      };

      if (editingCenter) {
        await apiRequest(`/admin/centers/${editingCenter.center_id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setStatusMessage(`Center ${editingCenter.center_id} updated successfully.`);
      } else {
        await apiRequest('/admin/centers', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setStatusMessage(`New center ${formData.center_id} created successfully.`);
      }

      setIsModalOpen(false);
      fetchCenters();
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save center');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Procurement Centers</h1>
            <SyntheticDataBadge />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Government-Provided Master Data &bull; 50 Centers Across 20 Maharashtra Districts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="export-centers-json-btn"
            onClick={() => {
              const blob = new Blob([JSON.stringify(centers, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `maharashtra_procurement_centers_${Date.now()}.json`;
              a.click();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            Export JSON
          </button>
          <button
            id="add-procurement-center-btn"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-[#064E3B] hover:bg-[#053e2f] text-white transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Center</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="search-center-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by center ID, center name, taluka, or district..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer w-full md:w-auto"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <div>
            <label className="text-slate-500 mr-1.5">District:</label>
            <select
              id="filter-district-select"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-slate-800 text-xs font-medium"
            >
              {MAHARASHTRA_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-500 mr-1.5">Crop:</label>
            <select
              id="filter-crop-select"
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-slate-800 text-xs font-medium"
            >
              {CROPS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-500 mr-1.5">Status:</label>
            <select
              id="filter-status-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-slate-800 text-xs font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          <div className="ml-auto text-slate-400 text-[11px]">
            Showing <strong>{centers.length}</strong> centers
          </div>
        </div>
      </div>

      {/* Centers Table - High Density Styling */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Master Data: Procurement Centers (Maharashtra)</h3>
            <p className="text-[11px] text-slate-500">Verified center and crop master records, with source status and legacy demo records identified</p>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Total Seeded: <span className="font-bold text-slate-800">{centers.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs text-slate-700">
            <thead className="sticky top-0 bg-white border-b border-slate-200">
              <tr className="text-[10px] uppercase tracking-wider text-slate-500 font-black">
                <th className="px-6 py-3 border-r border-slate-50">Center ID</th>
                <th className="px-6 py-3 border-r border-slate-50">Center Name</th>
                <th className="px-6 py-3 border-r border-slate-50">District &amp; Taluka</th>
                <th className="px-6 py-3 border-r border-slate-50">Accepted Crops</th>
                <th className="px-6 py-3 border-r border-slate-50">Intake / Daily</th>
                <th className="px-6 py-3 border-r border-slate-50">Hours</th>
                <th className="px-6 py-3 border-r border-slate-50">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-400">
                    Loading centers...
                  </td>
                </tr>
              ) : centers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-400">
                    No procurement centers match the selected criteria.
                  </td>
                </tr>
              ) : (
                centers.map((center) => (
                  <tr key={center.center_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 font-mono font-bold text-blue-700">{center.center_id}</td>
                    <td className="px-6 py-3.5">
                      <div className="font-semibold text-slate-900">{center.center_name}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">{center.location}</div>
                      {center.catalog_source === 'verified_procurement_master' && <div className="text-[10px] text-amber-700">{center.agency || 'Agency not listed'} · {center.seasons?.join(', ')} · verified {center.verification_date}</div>}
                      {center.catalog_source !== 'verified_procurement_master' && <div className="text-[10px] text-slate-400">{center.data_source || 'Legacy record'}</div>}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="font-medium text-slate-800">{center.district}</div>
                      <div className="text-[11px] text-slate-500">{center.taluka} Taluka</div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(center.accepted_crops) ? center.accepted_crops : []).map((c: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-3.5 font-medium">
                      <div className="font-bold text-slate-900">{center.daily_capacity ?? center.daily_procurement_capacity_quintals ?? 'Not supplied'}{(center.daily_capacity ?? center.daily_procurement_capacity_quintals) != null ? ' Quintals/day' : ''}</div>
                      <div className="text-[11px] text-slate-500">{(center.intake_capacity ?? center.intake_capacity_quintals) != null ? `${(center.intake_capacity ?? center.intake_capacity_quintals).toLocaleString()} Q max capacity` : 'Intake capacity not supplied'}</div>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-[11px] text-slate-600">
                      {typeof center.operating_hours === 'object' && center.operating_hours
                        ? `${center.operating_hours.start || '09:00'} - ${center.operating_hours.end || '17:00'}`
                        : (center.operating_hours || 'Not supplied')}
                    </td>
                    <td className="px-6 py-3.5">
                      {center.operational_status === 'seasonal_reference' ? (
                        <span className="text-amber-700 flex items-center font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2"></span>
                          Seasonal reference · live status unknown
                        </span>
                      ) : String(center.status).toLowerCase() === 'active' ? (
                        <span className="text-emerald-600 flex items-center font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
                          Active
                        </span>
                      ) : (
                        <span className="text-slate-400 flex items-center font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2"></span>
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(center)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          title="Edit Center"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(center.center_id)}
                          className={`p-1.5 rounded transition-colors cursor-pointer ${
                            center.status === 'active'
                              ? 'text-rose-600 hover:text-rose-800 hover:bg-rose-50'
                              : 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50'
                          }`}
                          title={center.status === 'active' ? 'Deactivate Center' : 'Activate Center'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* High Density Table Footer */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 italic px-6 py-3 border-t border-slate-100 bg-slate-50/30">
          <span>Displaying 1-{centers.length} of 50 Centers (Prototype Dataset Seeded)</span>
          <span>KisanQueue v1.0.4 - System Role: Admin Master</span>
        </div>
      </div>

      {/* Add / Edit Center Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">
                  {editingCenter ? `Edit Center (${editingCenter.center_id})` : 'Add Government Procurement Center'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Center ID</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingCenter}
                    value={formData.center_id}
                    onChange={(e) => setFormData({ ...formData, center_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-800 disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Center Name</label>
                <input
                  type="text"
                  required
                  value={formData.center_name}
                  onChange={(e) => setFormData({ ...formData, center_name: e.target.value })}
                  placeholder="e.g. Government Procurement Center - Baramati"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">District</label>
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  >
                    {MAHARASHTRA_DISTRICTS.filter((d) => d !== 'All').map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Taluka</label>
                  <input
                    type="text"
                    required
                    value={formData.taluka}
                    onChange={(e) => setFormData({ ...formData, taluka: e.target.value })}
                    placeholder="e.g. Baramati"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location Details</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Baramati APMC Market Yard, Maharashtra"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Accepted Crops (comma separated)
                </label>
                <input
                  type="text"
                  required
                  value={formData.accepted_crops}
                  onChange={(e) => setFormData({ ...formData, accepted_crops: e.target.value })}
                  placeholder="Soybean, Wheat, Gram (Chana)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Intake Capacity (Quintals)</label>
                  <input
                    type="number"
                    required
                    value={formData.intake_capacity}
                    onChange={(e) => setFormData({ ...formData, intake_capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Daily Capacity (Quintals)</label>
                  <input
                    type="number"
                    required
                    value={formData.daily_capacity}
                    onChange={(e) => setFormData({ ...formData, daily_capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Operating Hours</label>
                  <input
                    type="text"
                    value={formData.operating_start}
                    onChange={(e) => setFormData({ ...formData, operating_start: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Operating Hours</label>
                  <input
                    type="text"
                    value={formData.operating_end}
                    onChange={(e) => setFormData({ ...formData, operating_end: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold cursor-pointer disabled:opacity-50"
                >
                  {formSubmitting ? 'Saving...' : editingCenter ? 'Update Center' : 'Save Center'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
