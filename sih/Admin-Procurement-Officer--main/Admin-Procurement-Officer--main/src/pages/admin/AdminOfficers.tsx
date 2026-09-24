import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { Officer, ProcurementCenter } from '../../types';
import {
  Users,
  Plus,
  Edit2,
  Power,
  RotateCcw,
  Search,
  CheckCircle,
  XCircle,
  Building2,
  ShieldCheck,
  Copy,
  Check,
  X,
  Lock,
  KeyRound
} from 'lucide-react';
import { SyntheticDataBadge } from '../../components/SyntheticDataBadge';

export const AdminOfficers: React.FC = () => {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [centers, setCenters] = useState<ProcurementCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<Officer | null>(null);
  const [formData, setFormData] = useState({
    officer_name: '',
    mobile_number: '',
    email: '',
    assigned_center_id: 'PC001',
    temp_password: 'Officer@123',
    status: 'active'
  });
  const [submitting, setSubmitting] = useState(false);

  // Secure Credentials Display Modal (Section 28)
  const [createdCredentials, setCreatedCredentials] = useState<{
    officer_id: string;
    username: string;
    temporary_password: string;
    assigned_center: string;
    officer_name: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [offRes, cenRes] = await Promise.all([
        apiRequest<{ officers: Officer[] }>('/admin/officers'),
        apiRequest<{ centers: ProcurementCenter[] }>('/admin/centers')
      ]);
      setOfficers(offRes.officers || []);
      setCenters(cenRes.centers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingOfficer(null);
    setFormData({
      officer_name: '',
      mobile_number: '+91 98',
      email: '',
      assigned_center_id: centers[0]?.center_id || 'PC001',
      temp_password: 'Officer@' + Math.floor(100 + Math.random() * 900),
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (officer: Officer) => {
    setEditingOfficer(officer);
    setFormData({
      officer_name: officer.officer_name,
      mobile_number: officer.mobile_number,
      email: officer.email,
      assigned_center_id: officer.assigned_center_id,
      temp_password: '',
      status: officer.status
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (officerId: string) => {
    try {
      await apiRequest(`/admin/officers/${officerId}/status`, { method: 'PATCH' });
      setOfficers((prev) =>
        prev.map((o) => (o.officer_id === officerId ? { ...o, status: o.status === 'active' ? 'inactive' : 'active' } : o))
      );
      setFeedback(`Officer ${officerId} status updated.`);
      setTimeout(() => setFeedback(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to toggle officer status');
    }
  };

  const handleResetPassword = async (officerId: string) => {
    if (!confirm(`Reset temporary password for ${officerId}?`)) return;
    try {
      const res = await apiRequest(`/admin/officers/${officerId}/reset-password`, { method: 'POST' });
      const officer = officers.find((o) => o.officer_id === officerId);
      setCreatedCredentials({
        officer_id: officerId,
        username: officerId,
        temporary_password: res.temporary_password,
        assigned_center: officer ? officer.assigned_center_name : 'Assigned Center',
        officer_name: officer ? officer.officer_name : officerId
      });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to reset password');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingOfficer) {
        await apiRequest(`/admin/officers/${editingOfficer.officer_id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
        setFeedback(`Officer ${editingOfficer.officer_id} updated successfully.`);
        setIsModalOpen(false);
        fetchData();
      } else {
        // Section 28 flow: Admin creates officer account
        const res = await apiRequest('/admin/officers', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        setIsModalOpen(false);
        fetchData();
        // Display credentials securely to Admin
        setCreatedCredentials(res.credentials);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save officer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `KisanQueue Officer Account Credentials
Officer ID: ${createdCredentials.officer_id}
Username: ${createdCredentials.username}
Temporary Password: ${createdCredentials.temporary_password}
Assigned Center: ${createdCredentials.assigned_center}
Login URL: /officer/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filtered = officers.filter((o) => {
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      o.officer_name.toLowerCase().includes(q) ||
      o.officer_id.toLowerCase().includes(q) ||
      o.assigned_center_name.toLowerCase().includes(q) ||
      o.mobile_number.includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Procurement Officers</h1>
            <SyntheticDataBadge />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Admin provisions officer accounts and assigns each officer to a single procurement center
          </p>
        </div>
        <button
          id="add-officer-btn"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg bg-[#064E3B] text-white hover:bg-[#053e2f] transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#FFD700]" />
          Add Procurement Officer
        </button>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-[#064E3B] text-xs rounded-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#064E3B]" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Account Creation Rule Notice (Section 12 & 28) */}
      <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-950 flex items-start gap-3 shadow-2xs">
        <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <div>
          <strong className="block text-sm font-bold mb-0.5">Mandatory Governance Rule:</strong>
          Procurement Officers CANNOT self-register. The Admin creates each officer account, generates their Officer ID
          and temporary password, and assigns their designated APMC procurement center.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="search-officers-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by officer ID, name, or assigned center..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#064E3B]"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-slate-500 font-semibold">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-md px-2 py-1.5 text-slate-800 font-medium focus:ring-1 focus:ring-[#064E3B]"
          >
            <option value="All">All Officers</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        <div className="ml-auto text-slate-500 text-[11px]">
          Total Officers: <strong>{filtered.length}</strong>
        </div>
      </div>

      {/* Officers Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="px-4 py-2.5">Officer ID</th>
                <th className="px-4 py-2.5">Officer Name</th>
                <th className="px-4 py-2.5">Assigned Center</th>
                <th className="px-4 py-2.5">Contact Details</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Loading officer records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No officers match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((officer) => (
                  <tr key={officer.officer_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-2.5 font-mono font-bold text-slate-900">
                      <div className="inline-block px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                        {officer.officer_id}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="font-bold text-slate-900">{officer.officer_name}</div>
                      <div className="text-[11px] text-slate-500">Username: {officer.username}</div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="font-semibold text-[#064E3B] flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>{officer.assigned_center_name}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Center ID: {officer.assigned_center_id}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="font-mono text-slate-800">{officer.mobile_number}</div>
                      <div className="text-[11px] text-slate-500">{officer.email}</div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          officer.status === 'active'
                            ? 'bg-emerald-100 text-[#064E3B]'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {officer.status === 'active' ? (
                          <CheckCircle className="w-3 h-3 text-[#064E3B]" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {officer.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleResetPassword(officer.officer_id)}
                          className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
                          title="Reset Password"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(officer)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          title="Edit Officer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(officer.officer_id)}
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            officer.status === 'active'
                              ? 'text-rose-600 hover:text-rose-800 hover:bg-rose-50'
                              : 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50'
                          }`}
                          title={officer.status === 'active' ? 'Deactivate Officer' : 'Activate Officer'}
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
      </div>

      {/* Add / Edit Officer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#064E3B] text-white">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#FFD700]" />
                <h3 className="font-bold text-sm">
                  {editingOfficer ? `Edit Officer (${editingOfficer.officer_id})` : 'Create Procurement Officer Account'}
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
                <label className="block font-semibold text-slate-700 mb-1">Officer Full Name</label>
                <input
                  id="new-officer-name"
                  type="text"
                  required
                  value={formData.officer_name}
                  onChange={(e) => setFormData({ ...formData, officer_name: e.target.value })}
                  placeholder="e.g. Raj Patil"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-1 focus:ring-[#064E3B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assign to Procurement Center</label>
                <select
                  id="new-officer-center"
                  value={formData.assigned_center_id}
                  onChange={(e) => setFormData({ ...formData, assigned_center_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-1 focus:ring-[#064E3B]"
                >
                  {centers.map((c) => (
                    <option key={c.center_id} value={c.center_id}>
                      {c.center_id} - {c.center_name.replace('Government Procurement Center - ', '')} ({c.district})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Officer will have field permissions restricted exclusively to this center.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={formData.mobile_number}
                    onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                    placeholder="+91 98XXXXXXXX"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono focus:ring-1 focus:ring-[#064E3B]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="officer@kisanqueue.gov.in"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-1 focus:ring-[#064E3B]"
                  />
                </div>
              </div>

              {!editingOfficer && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Temporary Initial Password</label>
                  <input
                    type="text"
                    required
                    value={formData.temp_password}
                    onChange={(e) => setFormData({ ...formData, temp_password: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono focus:ring-1 focus:ring-[#064E3B]"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    You will receive a credentials card upon submission to hand over to the officer.
                  </span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="submit-officer-form-btn"
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#064E3B] hover:bg-[#053e2f] text-white rounded-lg font-bold cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Creating Account...' : editingOfficer ? 'Update Officer' : 'Create Officer Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Section 28 Mandatory Credential Presentation Modal */}
      {createdCredentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#064E3B] text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#FFD700]" />
                <h3 className="font-bold text-sm">Officer Credentials Generated</h3>
              </div>
              <button
                onClick={() => setCreatedCredentials(null)}
                className="text-slate-300 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-[#064E3B]">
                <span className="font-bold block">Action Required by Admin:</span>
                Provide the credentials below directly to the Procurement Officer. The officer can now log in at{' '}
                <strong>/officer/login</strong>.
              </div>

              <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="block text-[11px] text-slate-500 font-semibold uppercase">Officer Name:</span>
                  <span className="text-sm font-bold text-slate-900">{createdCredentials.officer_name}</span>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-500 font-semibold uppercase">Officer ID / Username:</span>
                  <span className="text-base font-bold font-mono text-[#064E3B]">
                    {createdCredentials.officer_id}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-500 font-semibold uppercase">Temporary Password:</span>
                  <span className="text-base font-bold font-mono text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300 inline-block">
                    {createdCredentials.temporary_password}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-500 font-semibold uppercase">Assigned Center:</span>
                  <span className="text-xs font-semibold text-slate-800">{createdCredentials.assigned_center}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={handleCopyCredentials}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#064E3B] hover:bg-[#053e2f] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-4 h-4 text-[#FFD700]" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied to Clipboard!' : 'Copy Credentials'}
                </button>
                <button
                  onClick={() => setCreatedCredentials(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
