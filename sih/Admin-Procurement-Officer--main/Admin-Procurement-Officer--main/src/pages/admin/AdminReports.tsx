import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import {
  BarChart3,
  Download,
  Printer,
  Building2,
  Scale,
  Wheat,
  CreditCard,
  Calendar,
  PieChart as PieChartIcon,
  FileSpreadsheet,
  TrendingUp
} from 'lucide-react';
import { SyntheticDataBadge } from '../../components/SyntheticDataBadge';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

export const AdminReports: React.FC = () => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/admin/reports');
      setReportData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cropVolumeData = [
    { crop: 'Soybean', volume: 540, mspRate: 4892, fill: '#064E3B' },
    { crop: 'Wheat', volume: 310, mspRate: 2275, fill: '#F59E0B' },
    { crop: 'Gram (Chana)', volume: 180, mspRate: 5440, fill: '#4F46E5' },
    { crop: 'Cotton', volume: 150.5, mspRate: 6620, fill: '#9333EA' }
  ];

  const paymentStatusData = [
    { name: 'Disbursed (Direct Credit)', value: 48.2, count: 35, fill: '#064E3B' },
    { name: 'Account Validation', value: 7.15, count: 5, fill: '#F59E0B' },
    { name: 'Awaiting Batch Run', value: 2.4, count: 2, fill: '#94A3B8' }
  ];

  const payoutTimelineData = [
    { day: 'Day 1', disbursed: 6.2, cumulative: 6.2 },
    { day: 'Day 2', disbursed: 8.5, cumulative: 14.7 },
    { day: 'Day 3', disbursed: 11.2, cumulative: 25.9 },
    { day: 'Day 4', disbursed: 9.8, cumulative: 35.7 },
    { day: 'Day 5', disbursed: 12.5, cumulative: 48.2 }
  ];

  const handleExportCSV = () => {
    if (!reportData) return;
    const headers = ['Metric', 'Category', 'Value', 'Unit'];
    const rows: string[][] = [
      headers,
      ['Total Centers', 'Statewise', '50', 'Centers'],
      ['Total Procurement Slots', 'Statewise', '1000', 'Slots'],
      ['Total Intake Capacity', 'Statewise', '25000', 'Quintals'],
      ['Total Registered Farmers', 'Statewise', '120', 'Farmers'],
      ['Completed Procurements', 'Statewise', '42', 'Batches'],
      ['Total Volume Procured', 'Statewise', '1180.5', 'Quintals'],
      ['Total MSP Disbursed', 'Statewise', '₹5,775,000', 'INR'],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'KisanQueue_Statewise_Procurement_Report_2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <span>Generating Analytics Reports...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reports &amp; Procurement Analytics</h1>
            <SyntheticDataBadge />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistical breakdown of slot occupancy, crop volume distributions, and DBT payment states
          </p>
        </div>

        <div className="flex items-center gap-2.5 print:hidden">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[#064E3B] text-white hover:bg-[#053e2f] transition-colors shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print State Report
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-slate-500 text-xs font-semibold">Total Grain Procured</div>
          <div className="text-xl font-black text-[#064E3B] mt-1">1,180.5 Q</div>
          <div className="text-[11px] text-slate-400 mt-0.5">MSP Kharif Batch 2026</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-slate-500 text-xs font-semibold">Total Value Disbursed</div>
          <div className="text-xl font-black text-slate-900 mt-1">₹57.75 Lakhs</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Direct Benefit Transfer</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-slate-500 text-xs font-semibold">State Capacity Saturation</div>
          <div className="text-xl font-black text-indigo-700 mt-1">24.2%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Total 25,000 Q Cap</div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="text-slate-500 text-xs font-semibold">PFMS Success Rate</div>
          <div className="text-xl font-black text-purple-700 mt-1">96.8%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Simulated Direct Credit</div>
        </div>
      </div>

      {/* Analytics Visual Breakdown Cards - Powered by Recharts */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Crop Procurement Volume BarChart */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <Wheat className="w-4 h-4 text-[#064E3B]" />
              <h2 className="text-sm font-bold text-slate-900">Procured Volume by Crop</h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Total 1,180.5 Q</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height={210} minWidth={0} minHeight={180}>
              <BarChart data={cropVolumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="crop" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px' }}
                  formatter={(val: any) => [`${val} Q`, 'Volume']}
                />
                <Bar dataKey="volume" radius={[4, 4, 0, 0]}>
                  {cropVolumeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-100 text-[11px]">
            {cropVolumeData.map((c) => (
              <div key={c.crop} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.fill }} />
                <span className="text-slate-600 truncate">{c.crop}</span>
                <span className="font-bold text-slate-900 ml-auto">{c.volume}Q</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Disbursement Distribution PieChart */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-purple-700" />
              <h2 className="text-sm font-bold text-slate-900">PFMS / DBT Status Share</h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Total ₹57.75 L</span>
          </div>

          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height={210} minWidth={0} minHeight={180}>
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {paymentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px' }}
                  formatter={(val: any) => [`₹${val} Lakhs`, 'Amount']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px]">
            {paymentStatusData.map((p) => (
              <div key={p.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill }} />
                  <span className="text-slate-700 truncate max-w-[140px]">{p.name}</span>
                </div>
                <div className="font-bold text-slate-900">₹{p.value}L ({p.count})</div>
              </div>
            ))}
          </div>
        </div>

        {/* Cumulative MSP Payout Curve AreaChart */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#064E3B]" />
              <h2 className="text-sm font-bold text-slate-900">Cumulative DBT Disbursal</h2>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 font-bold">96.8% Settled</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height={210} minWidth={0} minHeight={180}>
              <AreaChart data={payoutTimelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="payoutGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#064E3B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#064E3B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px' }}
                  formatter={(val: any) => [`₹${val} Lakhs`, 'Cumulative']}
                />
                <Area type="monotone" dataKey="cumulative" stroke="#064E3B" strokeWidth={2} fillOpacity={1} fill="url(#payoutGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Fastest Direct Benefit Transfer:</span>
            <span className="font-bold text-[#064E3B] font-mono">&lt; 48 Hours via PFMS</span>
          </div>
        </div>
      </div>

      {/* Top 5 Centers Performance Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="px-5 py-3 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-slate-900">High-Volume Procurement Centers</h2>
            <p className="text-xs text-slate-500">Highest intake activity recorded across Maharashtra APMCs</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="px-4 py-2.5">Center ID</th>
                <th className="px-4 py-2.5">Center Name &amp; District</th>
                <th className="px-4 py-2.5 text-right">Daily Intake</th>
                <th className="px-4 py-2.5 text-right">Total Procured</th>
                <th className="px-4 py-2.5 text-right">Capacity Saturation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-2.5 font-mono font-bold text-slate-900">PC001</td>
                <td className="px-4 py-2.5">
                  <span className="font-semibold text-slate-900">Government Procurement Center - Baramati</span>
                  <span className="text-[11px] text-slate-500 block">Pune District</span>
                </td>
                <td className="px-4 py-2.5 text-right font-mono">500 Q</td>
                <td className="px-4 py-2.5 text-right font-mono font-bold text-[#064E3B]">410 Q</td>
                <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900">82.0%</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-2.5 font-mono font-bold text-slate-900">PC009</td>
                <td className="px-4 py-2.5">
                  <span className="font-semibold text-slate-900">Government Procurement Center - Niphad</span>
                  <span className="text-[11px] text-slate-500 block">Nashik District</span>
                </td>
                <td className="px-4 py-2.5 text-right font-mono">500 Q</td>
                <td className="px-4 py-2.5 text-right font-mono font-bold text-[#064E3B]">385 Q</td>
                <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900">77.0%</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-2.5 font-mono font-bold text-slate-900">PC015</td>
                <td className="px-4 py-2.5">
                  <span className="font-semibold text-slate-900">Government Procurement Center - Pandharpur</span>
                  <span className="text-[11px] text-slate-500 block">Solapur District</span>
                </td>
                <td className="px-4 py-2.5 text-right font-mono">500 Q</td>
                <td className="px-4 py-2.5 text-right font-mono font-bold text-[#064E3B]">320 Q</td>
                <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900">64.0%</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-2.5 font-mono font-bold text-slate-900">PC033</td>
                <td className="px-4 py-2.5">
                  <span className="font-semibold text-slate-900">Government Procurement Center - Katol</span>
                  <span className="text-[11px] text-slate-500 block">Nagpur District</span>
                </td>
                <td className="px-4 py-2.5 text-right font-mono">500 Q</td>
                <td className="px-4 py-2.5 text-right font-mono font-bold text-[#064E3B]">295 Q</td>
                <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900">59.0%</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-2.5 font-mono font-bold text-slate-900">PC027</td>
                <td className="px-4 py-2.5">
                  <span className="font-semibold text-slate-900">Government Procurement Center - Udgir</span>
                  <span className="text-[11px] text-slate-500 block">Latur District</span>
                </td>
                <td className="px-4 py-2.5 text-right font-mono">500 Q</td>
                <td className="px-4 py-2.5 text-right font-mono font-bold text-[#064E3B]">270 Q</td>
                <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900">54.0%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
