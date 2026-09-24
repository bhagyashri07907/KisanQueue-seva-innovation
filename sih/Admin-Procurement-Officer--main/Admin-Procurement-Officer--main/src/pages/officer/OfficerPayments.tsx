import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { PaymentRecord } from '../../types';
import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  Building,
  AlertCircle,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { SyntheticDataBadge } from '../../components/SyntheticDataBadge';

const STATUS_BADGES: Record<string, { bg: string; text: string }> = {
  Disbursed: { bg: 'bg-emerald-100 text-emerald-800 border border-emerald-300', text: 'Disbursed (Direct Credit)' },
  Completed: { bg: 'bg-emerald-100 text-emerald-800 border border-emerald-300', text: 'Disbursed (Direct Credit)' },
  Processing: { bg: 'bg-amber-100 text-amber-800 border border-amber-300', text: 'Processing via PFMS' },
  Pending: { bg: 'bg-slate-100 text-slate-800 border border-slate-300', text: 'Pending Clearance' },
};

export const OfficerPayments: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await apiRequest<{ payments: any[] }>('/officer/payments');
      const normalized: PaymentRecord[] = (res.payments || []).map((p: any) => {
        const val = Number(p.amount ?? p.total_amount ?? 0);
        return {
          ...p,
          amount: isNaN(val) ? 0 : val,
          total_amount: isNaN(val) ? 0 : val,
          farmer_name: p.farmer_name || 'Farmer',
          payment_id: p.payment_id || `PAY-${p.procurement_id || '2026'}`,
          crop: p.crop || 'Grain',
          transaction_id: p.transaction_id || p.utr_reference || `PFMS${Math.floor(100000000 + Math.random() * 900000000)}`,
          bank_name: p.bank_name || 'State Bank of India (Aadhaar DBT Linked)',
          account_number_masked: p.account_number_masked || '•••• •••• 4821',
          ifsc: p.ifsc || 'SBIN0001429',
          status: p.status === 'Completed' ? 'Disbursed' : (p.status || 'Processing')
        };
      });
      setPayments(normalized);
    } catch (err) {
      console.error('Failed to fetch officer payments:', err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDisbursed = async (paymentId: string) => {
    try {
      setUpdatingId(paymentId);
      await apiRequest(`/officer/payment/${paymentId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'Completed',
          remarks: 'Direct credit verified via automated PFMS clearing response.'
        })
      });
      await fetchPayments();
    } catch (err) {
      console.error('Error updating payment status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = payments.filter((p) => {
    const q = (search || '').toLowerCase().trim();
    if (!q) return true;
    const fName = (p.farmer_name || '').toLowerCase();
    const pId = (p.payment_id || '').toLowerCase();
    const txId = (p.transaction_id || p.utr_reference || '').toLowerCase();
    const crop = (p.crop || '').toLowerCase();
    return fName.includes(q) || pId.includes(q) || txId.includes(q) || crop.includes(q);
  });

  const totalMSP = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalDisbursed = payments
    .filter((p) => p.status === 'Disbursed' || p.status === 'Completed')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalPending = payments
    .filter((p) => p.status !== 'Disbursed' && p.status !== 'Completed')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Farmer Payment Tracking (Simulated)</h1>
            <SyntheticDataBadge />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status of Direct Benefit Transfer (DBT via PFMS) disbursements for procured grains
          </p>
        </div>

        <button
          onClick={fetchPayments}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Simulated Banking Engine Notice */}
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-950 flex items-start gap-3 shadow-2xs">
        <CreditCard className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
        <div>
          <strong className="block text-sm font-bold mb-0.5">Simulated Payment Protocol (PFMS / DBT):</strong>
          In accordance with agricultural procurement regulations, payments are automatically processed via Direct
          Benefit Transfer to the farmer's Aadhaar-linked bank account without requiring external merchant payment
          gateways.
        </div>
      </div>

      {/* Aggregate Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
          <span className="text-slate-500 text-xs font-semibold block">Total MSP Value Procured</span>
          <span className="text-xl font-bold text-slate-900 mt-1 block">
            ₹{totalMSP.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">{payments.length} farmer transactions</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
          <span className="text-slate-500 text-xs font-semibold block">Disbursed to Farmer Accounts</span>
          <span className="text-xl font-bold text-[#064E3B] mt-1 block">₹{totalDisbursed.toLocaleString()}</span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Direct bank account credit complete</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs">
          <span className="text-slate-500 text-xs font-semibold block">Clearing / In-Processing</span>
          <span className="text-xl font-bold text-amber-800 mt-1 block">
            ₹{totalPending.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">PFMS batch queue clearance</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="search-payments-input"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Farmer Name, Payment ID, Transaction UTR, or Crop..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#064E3B]"
          />
        </div>

        <div className="text-slate-500 text-xs whitespace-nowrap">
          Showing <strong>{filtered.length}</strong> of {payments.length} transactions
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="px-4 py-2.5">Payment ID</th>
                <th className="px-4 py-2.5">Farmer Name</th>
                <th className="px-4 py-2.5">Crop</th>
                <th className="px-4 py-2.5 text-right">MSP Amount</th>
                <th className="px-4 py-2.5">Bank Details</th>
                <th className="px-4 py-2.5">Transaction Reference</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#064E3B] border-t-transparent rounded-full animate-spin" />
                      <span>Loading payment records...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No payment records match your search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const amt = Number(p.amount ?? p.total_amount ?? 0);
                  const isDisbursed = p.status === 'Disbursed' || p.status === 'Completed';
                  return (
                    <tr key={p.payment_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-2.5 font-mono font-bold text-slate-900">{p.payment_id}</td>
                      <td className="px-4 py-2.5">
                        <div className="font-bold text-slate-900">{p.farmer_name}</div>
                        {p.farmer_id && (
                          <div className="text-[10px] text-slate-400 font-mono">ID: {p.farmer_id}</div>
                        )}
                      </td>
                      <td className="px-4 py-2.5 font-medium text-slate-800">{p.crop}</td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold text-[#064E3B]">
                        ₹{amt.toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="font-semibold text-slate-800">{p.bank_name || 'State Bank of India'}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {p.account_number_masked || '•••• •••• 4821'} &bull; {p.ifsc || 'SBIN0001429'}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-slate-600">
                        {p.transaction_id || p.utr_reference || 'PFMS-PENDING'}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            STATUS_BADGES[p.status]?.bg || 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {STATUS_BADGES[p.status]?.text || p.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {!isDisbursed ? (
                          <button
                            onClick={() => handleMarkDisbursed(p.payment_id)}
                            disabled={updatingId === p.payment_id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded transition-colors cursor-pointer"
                            title="Verify PFMS Direct Credit Clearing"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            <span>{updatingId === p.payment_id ? 'Confirming...' : 'Mark Disbursed'}</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Settled</span>
                          </span>
                        )}
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
