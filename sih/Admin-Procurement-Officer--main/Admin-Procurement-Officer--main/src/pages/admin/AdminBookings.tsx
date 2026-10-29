import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { Booking, ProcurementCenter } from '../../types';
import {
  ClipboardList,
  Search,
  Filter,
  Calendar,
  Building2,
  Wheat,
  Clock,
  Phone,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { SyntheticDataBadge } from '../../components/SyntheticDataBadge';

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  BOOKED: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  ARRIVED: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  WEIGHED: { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' },
  QUALITY_CHECKED: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
  PROCURED: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  CANCELLED: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' },
};

export const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [centers, setCenters] = useState<ProcurementCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCenter, setSelectedCenter] = useState('All');
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    fetchCenters();
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [selectedCenter, selectedCrop, selectedStatus, selectedDate]);

  const fetchCenters = async () => {
    try {
      const res = await apiRequest<{ centers: ProcurementCenter[] }>('/admin/centers');
      setCenters(res.centers || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCenter !== 'All') params.append('center_id', selectedCenter);
      if (selectedCrop !== 'All') params.append('crop', selectedCrop);
      if (selectedStatus !== 'All') params.append('status', selectedStatus);
      if (selectedDate) params.append('date', selectedDate);
      if (search.trim()) params.append('search', search.trim());

      const res = await apiRequest<{ bookings: Booking[] }>(`/admin/bookings?${params.toString()}`);
      setBookings(res.bookings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookings();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Statewise Bookings Monitoring</h1>
            <SyntheticDataBadge />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time monitoring of farmer slot bookings and digital token lifecycle across all centers
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="admin-search-bookings"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Token (e.g. KQ-2026-00125), Farmer Name, Mobile, or Center..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#064E3B]"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-1.5 bg-[#064E3B] hover:bg-[#053e2f] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer w-full md:w-auto"
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
            <label className="text-slate-500 mr-1.5">Center:</label>
            <select
              value={selectedCenter}
              onChange={(e) => setSelectedCenter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-slate-800 font-medium max-w-[200px] truncate focus:ring-1 focus:ring-[#064E3B]"
            >
              <option value="All">All Centers (50)</option>
              {centers.map((c) => (
                <option key={c.center_id} value={c.center_id}>
                  {c.center_id} - {c.center_name.replace('Government Procurement Center - ', '')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-500 mr-1.5">Crop:</label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-slate-800 font-medium focus:ring-1 focus:ring-[#064E3B]"
            >
              <option value="All">All Crops</option>
              <option value="Soybean">Soybean</option>
              <option value="Wheat">Wheat</option>
              <option value="Gram (Chana)">Gram (Chana)</option>
              <option value="Cotton">Cotton</option>
              <option value="Tur (Arhar)">Tur (Arhar)</option>
            </select>
          </div>

          <div>
            <label className="text-slate-500 mr-1.5">Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-slate-800 font-medium focus:ring-1 focus:ring-[#064E3B]"
            >
              <option value="All">All Statuses</option>
              <option value="BOOKED">BOOKED</option>
              <option value="ARRIVED">ARRIVED</option>
              <option value="WEIGHED">WEIGHED</option>
              <option value="QUALITY_CHECKED">QUALITY_CHECKED</option>
              <option value="PROCURED">PROCURED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div>
            <label className="text-slate-500 mr-1.5">Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-slate-800 font-medium focus:ring-1 focus:ring-[#064E3B]"
            />
          </div>

          <div className="ml-auto text-slate-500 text-[11px]">
            Showing <strong>{bookings.length}</strong> bookings
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="px-4 py-2.5">Digital Token</th>
                <th className="px-4 py-2.5">Farmer Information</th>
                <th className="px-4 py-2.5">Procurement Center</th>
                <th className="px-4 py-2.5">Crop &amp; Quantity</th>
                <th className="px-4 py-2.5">Slot Schedule</th>
                <th className="px-4 py-2.5">Procurement Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Loading bookings...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No bookings found matching the filters.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => {
                  const style = STATUS_COLORS[booking.status] || {
                    bg: 'bg-slate-100',
                    text: 'text-slate-800',
                    border: 'border-slate-200'
                  };
                  return (
                    <tr key={booking.booking_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 inline-block">
                          {booking.digital_token}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{booking.booking_id}</div>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="font-bold text-slate-900">{booking.farmer_name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{booking.farmer_mobile}</div>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="font-semibold text-slate-800">{booking.procurement_center}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{booking.center_id}</div>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="font-bold text-slate-900">{booking.crop}</div>
                        <div className="text-[11px] text-[#064E3B] font-bold">
                          {booking.quantity_quintals} Quintals
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="font-medium text-slate-800">{booking.slot_date}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{booking.slot_time}</div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${style.bg} ${style.text} ${style.border}`}
                        >
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
