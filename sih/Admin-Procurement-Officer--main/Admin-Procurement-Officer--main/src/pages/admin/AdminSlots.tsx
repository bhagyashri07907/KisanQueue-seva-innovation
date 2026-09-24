import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { Slot, ProcurementCenter } from '../../types';
import {
  CalendarDays,
  Plus,
  Edit2,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Building2,
  X
} from 'lucide-react';
import { SyntheticDataBadge } from '../../components/SyntheticDataBadge';

export const AdminSlots: React.FC = () => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [centers, setCenters] = useState<ProcurementCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCenter, setSelectedCenter] = useState('All');
  const [selectedDate, setSelectedDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);
  const [formData, setFormData] = useState({
    center_id: 'PC001',
    date: '2026-09-10',
    start_time: '09:00 AM',
    end_time: '11:00 AM',
    capacity: 20,
    booked_count: 0,
    status: 'AVAILABLE'
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  useEffect(() => {
    fetchCenters();
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [selectedCenter, selectedDate, statusFilter]);

  const fetchCenters = async () => {
    try {
      const res = await apiRequest<{ centers: ProcurementCenter[] }>('/admin/centers');
      setCenters(res.centers || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCenter !== 'All') params.append('center_id', selectedCenter);
      if (selectedDate) params.append('date', selectedDate);
      if (statusFilter !== 'All') params.append('status', statusFilter);

      const res = await apiRequest<{ slots: Slot[] }>(`/admin/slots?${params.toString()}`);
      setSlots(res.slots || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingSlot(null);
    setFormData({
      center_id: centers[0]?.center_id || 'PC001',
      date: '2026-09-10',
      start_time: '09:00 AM',
      end_time: '11:00 AM',
      capacity: 20,
      booked_count: 0,
      status: 'AVAILABLE'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (slot: Slot) => {
    setEditingSlot(slot);
    setFormData({
      center_id: slot.center_id,
      date: slot.date,
      start_time: slot.start_time,
      end_time: slot.end_time,
      capacity: slot.capacity,
      booked_count: slot.booked_count,
      status: slot.status
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const cap = Number(formData.capacity);
      const booked = Number(formData.booked_count);
      const remaining = Math.max(0, cap - booked);
      const calculatedStatus = remaining === 0 ? 'FULL' : 'AVAILABLE';

      const payload = {
        center_id: formData.center_id,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        capacity: cap,
        booked_count: booked,
        remaining_capacity: remaining,
        status: calculatedStatus
      };

      if (editingSlot) {
        await apiRequest(`/admin/slots/${editingSlot.slot_id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        setFeedbackMessage(`Slot ${editingSlot.slot_id} updated successfully.`);
      } else {
        await apiRequest('/admin/slots', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setFeedbackMessage('New procurement slot created successfully.');
      }

      setIsModalOpen(false);
      fetchSlots();
      setTimeout(() => setFeedbackMessage(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Error saving slot');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Slot Management</h1>
            <SyntheticDataBadge />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Predefined intake slot management with automatic capacity &amp; saturation calculations
          </p>
        </div>
        <button
          id="create-slot-btn"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg bg-[#064E3B] text-white hover:bg-[#053e2f] transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#FFD700]" />
          Create Procurement Slot
        </button>
      </div>

      {feedbackMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-[#064E3B] text-xs rounded-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#064E3B]" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter Slots:</span>
        </div>

        <div>
          <label className="text-slate-500 mr-1.5">Procurement Center:</label>
          <select
            id="slot-filter-center-select"
            value={selectedCenter}
            onChange={(e) => setSelectedCenter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-slate-800 font-medium max-w-[260px] truncate focus:ring-1 focus:ring-[#064E3B]"
          >
            <option value="All">All Centers (50)</option>
            {centers.map((c) => (
              <option key={c.center_id} value={c.center_id}>
                {c.center_id} - {c.center_name.replace('Government Procurement Center - ', '')} ({c.district})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-slate-500 mr-1.5">Date:</label>
          <input
            id="slot-filter-date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-slate-800 font-medium focus:ring-1 focus:ring-[#064E3B]"
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="ml-1 text-[11px] text-slate-400 hover:text-slate-700 underline"
            >
              Clear
            </button>
          )}
        </div>

        <div>
          <label className="text-slate-500 mr-1.5">Slot Status:</label>
          <select
            id="slot-filter-status-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-slate-800 font-medium focus:ring-1 focus:ring-[#064E3B]"
          >
            <option value="All">All Statuses</option>
            <option value="AVAILABLE">AVAILABLE Only</option>
            <option value="FULL">FULL Only</option>
          </select>
        </div>

        <div className="ml-auto text-slate-500 text-[11px]">
          Total Slots: <strong>{slots.length}</strong>
        </div>
      </div>

      {/* Slots Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="px-4 py-2.5">Slot ID</th>
                <th className="px-4 py-2.5">Procurement Center</th>
                <th className="px-4 py-2.5">Slot Date</th>
                <th className="px-4 py-2.5">Operating Time</th>
                <th className="px-4 py-2.5 text-center">Capacity</th>
                <th className="px-4 py-2.5 text-center">Booked</th>
                <th className="px-4 py-2.5 text-center">Remaining</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                    Loading slots...
                  </td>
                </tr>
              ) : slots.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                    No slots found for the selected criteria.
                  </td>
                </tr>
              ) : (
                slots.map((slot) => {
                  const isFull = slot.remaining_capacity === 0 || slot.status === 'FULL';
                  return (
                    <tr key={slot.slot_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-2.5 font-mono font-bold text-slate-900">{slot.slot_id}</td>
                      <td className="px-4 py-2.5">
                        <div className="font-semibold text-slate-800">{slot.center_name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{slot.center_id}</div>
                      </td>
                      <td className="px-4 py-2.5 font-medium text-slate-800">{slot.date}</td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-slate-600">
                        {slot.start_time} - {slot.end_time}
                      </td>
                      <td className="px-4 py-2.5 text-center font-bold text-slate-900">{slot.capacity}</td>
                      <td className="px-4 py-2.5 text-center font-bold text-indigo-700">{slot.booked_count}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span
                          className={`font-extrabold ${
                            slot.remaining_capacity === 0 ? 'text-rose-600' : 'text-[#064E3B]'
                          }`}
                        >
                          {slot.remaining_capacity}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            isFull ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-[#064E3B]'
                          }`}
                        >
                          {isFull ? 'FULL' : 'AVAILABLE'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          onClick={() => handleOpenEdit(slot)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          title="Edit Slot"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Slot Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#064E3B] text-white">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-[#FFD700]" />
                <h3 className="font-bold text-sm">
                  {editingSlot ? `Edit Slot (${editingSlot.slot_id})` : 'Create Procurement Slot'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Procurement Center</label>
                <select
                  disabled={!!editingSlot}
                  value={formData.center_id}
                  onChange={(e) => setFormData({ ...formData, center_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 disabled:opacity-60 focus:ring-1 focus:ring-[#064E3B]"
                >
                  {centers.map((c) => (
                    <option key={c.center_id} value={c.center_id}>
                      {c.center_id} - {c.center_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Slot Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-1 focus:ring-[#064E3B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="text"
                    required
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    placeholder="09:00 AM"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-800 focus:ring-1 focus:ring-[#064E3B]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="text"
                    required
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    placeholder="11:00 AM"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-800 focus:ring-1 focus:ring-[#064E3B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Farmer Capacity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-800 focus:ring-1 focus:ring-[#064E3B]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Booked Count</label>
                  <input
                    type="number"
                    min="0"
                    max={formData.capacity}
                    value={formData.booked_count}
                    onChange={(e) => setFormData({ ...formData, booked_count: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-800 focus:ring-1 focus:ring-[#064E3B]"
                  />
                </div>
              </div>

              {/* Calculated preview */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Calculated Remaining Capacity:</span>
                  <strong
                    className={
                      formData.capacity - formData.booked_count <= 0 ? 'text-rose-600 font-bold' : 'text-[#064E3B]'
                    }
                  >
                    {Math.max(0, formData.capacity - formData.booked_count)} farmers
                  </strong>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-slate-500">Resulting Status:</span>
                  <strong className="font-bold">
                    {formData.capacity - formData.booked_count <= 0 ? 'FULL' : 'AVAILABLE'}
                  </strong>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
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
                  className="px-4 py-2 bg-[#064E3B] hover:bg-[#053e2f] text-white rounded-lg font-bold cursor-pointer disabled:opacity-50"
                >
                  {formSubmitting ? 'Saving...' : editingSlot ? 'Update Slot' : 'Create Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
