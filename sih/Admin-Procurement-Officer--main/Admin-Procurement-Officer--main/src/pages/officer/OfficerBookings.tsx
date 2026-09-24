import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../lib/api';
import { Booking } from '../../types';
import {
  CalendarCheck,
  Search,
  Filter,
  Wheat,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { SyntheticDataBadge } from '../../components/SyntheticDataBadge';

const STATUS_COLORS: Record<string, string> = {
  BOOKED: 'bg-blue-100 text-blue-800 border-blue-200',
  ARRIVED: 'bg-amber-100 text-amber-800 border-amber-200',
  WEIGHED: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  QUALITY_CHECKED: 'bg-purple-100 text-purple-800 border-purple-200',
  PROCURED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  CANCELLED: 'bg-rose-100 text-rose-800 border-rose-200',
};

export const OfficerBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    fetchCenterBookings();
  }, [selectedCrop, selectedStatus, selectedDate]);

  const fetchCenterBookings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCrop !== 'All') params.append('crop', selectedCrop);
      if (selectedStatus !== 'All') params.append('status', selectedStatus);
      if (selectedDate) params.append('date', selectedDate);
      if (search.trim()) params.append('search', search.trim());

      const res = await apiRequest<{ bookings: Booking[] }>(`/officer/bookings?${params.toString()}`);
      setBookings(res.bookings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCenterBookings();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Center Farmer Bookings</h1>
            <SyntheticDataBadge />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Farmer slot bookings scheduled exclusively for this procurement station
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="officer-search-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Token (e.g. KQ-2026-00125), Farmer Name, or Mobile..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#064E3B]"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-[#064E3B] hover:bg-[#053e2f] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer w-full md:w-auto"
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
            <label className="text-slate-500 mr-1.5">Crop:</label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-slate-800 font-medium text-xs focus:ring-1 focus:ring-[#064E3B]"
            >
              <option value="All">All Crops</option>
              <option value="Soybean">Soybean</option>
              <option value="Wheat">Wheat</option>
              <option value="Gram (Chana)">Gram (Chana)</option>
              <option value="Cotton">Cotton</option>
            </select>
          </div>

          <div>
            <label className="text-slate-500 mr-1.5">Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-slate-800 font-medium text-xs focus:ring-1 focus:ring-[#064E3B]"
            >
              <option value="All">All Statuses</option>
              <option value="BOOKED">BOOKED</option>
              <option value="ARRIVED">ARRIVED</option>
              <option value="WEIGHED">WEIGHED</option>
              <option value="QUALITY_CHECKED">QUALITY_CHECKED</option>
              <option value="PROCURED">PROCURED</option>
            </select>
          </div>

          <div>
            <label className="text-slate-500 mr-1.5">Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-slate-800 font-medium text-xs focus:ring-1 focus:ring-[#064E3B]"
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
                <th className="px-4 py-2.5">Farmer Name</th>
                <th className="px-4 py-2.5">Mobile</th>
                <th className="px-4 py-2.5">Crop</th>
                <th className="px-4 py-2.5">Quantity</th>
                <th className="px-4 py-2.5">Slot Schedule</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    Loading bookings for assigned center...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No bookings found for the selected criteria.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.booking_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-2.5">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                        {b.digital_token}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="font-bold text-slate-900">{b.farmer_name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">ID: {b.farmer_id}</div>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-700">{b.farmer_mobile}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-800">{b.crop}</td>
                    <td className="px-4 py-2.5 font-bold text-[#064E3B]">{b.quantity_quintals} Q</td>
                    <td className="px-4 py-2.5">
                      <div className="font-medium text-slate-800">{b.slot_date}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{b.slot_time}</div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                          STATUS_COLORS[b.status] || 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {b.status !== 'PROCURED' ? (
                        <Link
                          to={`/officer/verify-token?token=${b.digital_token}`}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-[#064E3B] hover:bg-[#053e2f] text-white font-bold text-[11px] rounded shadow-2xs transition-colors"
                        >
                          Verify &bull; Process &rarr;
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Completed</span>
                      )}
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
