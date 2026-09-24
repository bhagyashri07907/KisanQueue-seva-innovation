import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { Receipt } from '../../types';
import {
  ReceiptText,
  Search,
  Printer,
  Eye,
  Calendar,
  Wheat,
  Scale,
  CheckCircle2
} from 'lucide-react';
import { SyntheticDataBadge } from '../../components/SyntheticDataBadge';
import { ReceiptModal } from '../../components/ReceiptModal';

export const OfficerReceipts: React.FC = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const res = await apiRequest<{ receipts: Receipt[] }>('/officer/receipts');
      setReceipts(res.receipts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = receipts.filter((r) => {
    const q = search.toLowerCase();
    return (
      !q ||
      r.receipt_id.toLowerCase().includes(q) ||
      r.digital_token.toLowerCase().includes(q) ||
      r.farmer_name.toLowerCase().includes(q) ||
      r.crop.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Issued Procurement Receipts</h1>
            <SyntheticDataBadge />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Official digital procurement vouchers issued to farmers at this center
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="search-receipts-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Receipt ID (REC-...), Token (KQ-...), or Farmer Name..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#064E3B]"
          />
        </div>

        <div className="text-slate-500 text-xs">
          Showing <strong>{filtered.length}</strong> receipts
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="px-4 py-2.5">Receipt ID</th>
                <th className="px-4 py-2.5">Digital Token</th>
                <th className="px-4 py-2.5">Farmer Name</th>
                <th className="px-4 py-2.5">Crop</th>
                <th className="px-4 py-2.5">Procured Weight</th>
                <th className="px-4 py-2.5 text-right">Total Amount</th>
                <th className="px-4 py-2.5">Issue Date</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    Loading receipts...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No receipts found for this procurement center.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.receipt_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-2.5 font-mono font-bold text-[#064E3B]">{r.receipt_id}</td>
                    <td className="px-4 py-2.5 font-mono font-semibold text-slate-800">
                      <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">{r.digital_token}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="font-bold text-slate-900">{r.farmer_name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">ID: {r.farmer_id}</div>
                    </td>
                    <td className="px-4 py-2.5 font-medium text-slate-800">{r.crop}</td>
                    <td className="px-4 py-2.5 font-bold text-[#064E3B]">{r.quantity_quintals} Quintals</td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900">
                      {r.total_amount ? `₹${r.total_amount.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-slate-700">{r.date}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => setSelectedReceipt(r)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-[#064E3B] hover:bg-[#053e2f] text-white font-bold text-[11px] rounded shadow-2xs transition-colors cursor-pointer"
                      >
                        <Printer className="w-3 h-3" />
                        Print
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Receipt Modal */}
      <ReceiptModal receipt={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
    </div>
  );
};
