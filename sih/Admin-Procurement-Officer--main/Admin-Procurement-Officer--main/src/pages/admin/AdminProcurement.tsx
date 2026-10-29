import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { ProcurementRecord, Receipt } from '../../types';
import {
  Scale,
  Search,
  Filter,
  ReceiptText,
  CheckCircle2,
  AlertCircle,
  Eye,
  FileCheck
} from 'lucide-react';
import { SyntheticDataBadge } from '../../components/SyntheticDataBadge';
import { ReceiptModal } from '../../components/ReceiptModal';

const formatAmount = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '—';
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toLocaleString() : '—';
};

export const AdminProcurement: React.FC = () => {
  const [records, setRecords] = useState<ProcurementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCenter, setSelectedCenter] = useState('All');
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    fetchProcurements();
  }, [selectedCenter, selectedCrop]);

  const fetchProcurements = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCenter !== 'All') params.append('center_id', selectedCenter);
      if (selectedCrop !== 'All') params.append('crop', selectedCrop);
      if (search.trim()) params.append('search', search.trim());

      const res = await apiRequest<{ records: ProcurementRecord[] }>(`/admin/procurements?${params.toString()}`);
      setRecords(res.records || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProcurements();
  };

  const handleViewReceipt = (rec: ProcurementRecord) => {
    setSelectedReceipt({
      receipt_id: rec.receipt_id,
      procurement_id: rec.procurement_id,
      farmer_id: rec.farmer_id,
      farmer_name: rec.farmer_name,
      crop: rec.crop,
      quantity_quintals: rec.actual_weight || rec.weight_quintals || 0,
      procurement_center: rec.center_name || rec.procurement_center || '',
      digital_token: rec.digital_token || rec.token_id || '',
      date: rec.procurement_date,
      status: rec.procurement_status || rec.status || 'Completed',
      quality_status: rec.quality_status,
      rate_per_quintal: rec.msp_rate,
      total_amount: rec.total_amount
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Procurement Monitoring</h1>
            <SyntheticDataBadge />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit trail of verified grain intake, moisture &amp; quality checks, MSP payments, and digital receipts
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Procurement ID, Receipt ID, Token ID, Farmer Name, or Center..."
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

        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
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

          <div className="ml-auto text-slate-500 text-[11px]">
            Showing <strong>{records.length}</strong> verified procurements
          </div>
        </div>
      </div>

      {/* Procurement Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="px-4 py-2.5">Procurement &amp; Receipt ID</th>
                <th className="px-4 py-2.5">Digital Token</th>
                <th className="px-4 py-2.5">Farmer Name</th>
                <th className="px-4 py-2.5">Procurement Center</th>
                <th className="px-4 py-2.5">Crop &amp; Weight</th>
                <th className="px-4 py-2.5">Quality Status</th>
                <th className="px-4 py-2.5 text-right">MSP Rate</th>
                <th className="px-4 py-2.5 text-right">Total Amount</th>
                <th className="px-4 py-2.5 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                    Loading procurement records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                    No procurement records match your search.
                  </td>
                </tr>
              ) : (
                records.map((rec) => (
                  <tr key={rec.procurement_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="font-mono font-bold text-slate-900">{rec.procurement_id}</div>
                      <div className="text-[11px] font-mono text-[#064E3B] font-bold">{rec.receipt_id}</div>
                    </td>
                    <td className="px-4 py-2.5 font-mono font-semibold text-slate-800">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        {rec.token_id}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="font-bold text-slate-900">{rec.farmer_name}</div>
                      <div className="text-[11px] text-slate-500">{rec.procurement_date}</div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="font-semibold text-slate-800">{rec.procurement_center}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{rec.center_id}</div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="font-bold text-slate-900">{rec.crop}</div>
                      <div className="text-[11px] text-[#064E3B] font-bold">{rec.weight_quintals} Quintals</div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-[#064E3B]">
                        <CheckCircle2 className="w-3 h-3 text-[#064E3B]" />
                        {rec.quality_status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold text-slate-800">
                      ₹{formatAmount(rec.msp_rate)} / Q
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900">
                      ₹{formatAmount(rec.total_amount)}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => handleViewReceipt(rec)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded bg-[#064E3B]/10 text-[#064E3B] border border-[#064E3B]/20 hover:bg-[#064E3B]/20 transition-colors cursor-pointer"
                        title="View Official Receipt"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for official printable receipt */}
      <ReceiptModal receipt={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
    </div>
  );
};
