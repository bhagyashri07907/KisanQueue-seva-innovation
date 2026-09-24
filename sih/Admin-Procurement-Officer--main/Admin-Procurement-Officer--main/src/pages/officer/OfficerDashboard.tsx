import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../lib/api';
import { OfficerDashboardData } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  KeyRound,
  Scale,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Building2,
  ArrowRight,
  AlertCircle,
  Wheat,
  MapPin
} from 'lucide-react';
import { SyntheticDataBadge } from '../../components/SyntheticDataBadge';

export const OfficerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<OfficerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOfficerDashboard();
  }, []);

  const fetchOfficerDashboard = async () => {
    try {
      setLoading(true);
      const res = await apiRequest<OfficerDashboardData>('/officer/dashboard');
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
          <span>Loading Center Operational Status...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-rose-600" />
        <span>Failed to load officer dashboard.</span>
      </div>
    );
  }

  const { stats, center, todays_bookings } = data;

  const metricCards = [
    {
      title: "Today's Expected Farmers",
      value: stats.todays_expected_farmers,
      icon: Users,
      color: 'bg-blue-50 text-blue-800 border-blue-200',
      desc: 'Active slots booked for today'
    },
    {
      title: 'Tokens Verified',
      value: stats.tokens_verified,
      icon: KeyRound,
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      desc: 'Farmers checked-in at gate'
    },
    {
      title: 'Weighing Completed',
      value: stats.weighing_completed,
      icon: Scale,
      color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      desc: 'Gross & tare weight logged'
    },
    {
      title: 'Quality Checks Completed',
      value: stats.quality_checks_completed,
      icon: ShieldCheck,
      color: 'bg-purple-50 text-purple-800 border-purple-200',
      desc: 'Moisture & purity approved'
    },
    {
      title: 'Procurement Completed',
      value: stats.procurement_completed,
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      desc: 'Digital receipts issued'
    },
    {
      title: 'Pending Farmers',
      value: stats.pending_farmers,
      icon: Clock,
      color: 'bg-slate-50 text-slate-800 border-slate-200',
      desc: 'Yet to arrive or in-progress'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Center Identification Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#064E3B] text-[#FFD700] uppercase tracking-wider">
                Assigned Center
              </span>
              <span className="text-xs font-mono text-slate-500 font-semibold">{center.center_id}</span>
              <SyntheticDataBadge />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{center.center_name}</h1>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {center.location} &bull; {center.taluka} Taluka, {center.district} District
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              id="verify-token-cta"
              to="/officer/verify-token"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#064E3B] hover:bg-[#053e2f] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              Verify Farmer Token
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Center Operating Specs */}
        <div className="mt-5 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block">Daily Intake Capacity:</span>
            <strong className="text-sm text-slate-900 font-mono">{center.daily_capacity} Quintals</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Operating Hours:</span>
            <strong className="text-sm text-slate-900 font-mono">
              {center.operating_hours.start} - {center.operating_hours.end}
            </strong>
          </div>
          <div>
            <span className="text-slate-500 block">Assigned Officer:</span>
            <strong className="text-sm text-slate-900">{user?.name}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Accepted Crops:</span>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {center.accepted_crops.map((c, i) => (
                <span key={i} className="text-[10px] font-semibold text-[#064E3B] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 6 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-1.5 rounded-lg border ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-xl font-bold text-slate-900">{card.value}</div>
                <div className="text-xs font-semibold text-slate-700 mt-1 leading-tight">{card.title}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{card.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Today's Bookings Quick Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Today's Scheduled Farmer Bookings</h2>
            <p className="text-[11px] text-slate-500">Farmers scheduled for procurement at this center today</p>
          </div>
          <Link to="/officer/bookings" className="text-xs font-bold text-[#064E3B] hover:text-[#053e2f]">
            View All Bookings &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="px-4 py-2.5">Digital Token</th>
                <th className="px-4 py-2.5">Farmer Name</th>
                <th className="px-4 py-2.5">Crop</th>
                <th className="px-4 py-2.5">Expected Quantity</th>
                <th className="px-4 py-2.5">Slot Time</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {todays_bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No bookings scheduled for today.
                  </td>
                </tr>
              ) : (
                todays_bookings.map((booking) => (
                  <tr key={booking.booking_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-2.5 font-mono font-bold text-slate-900">
                      <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                        {booking.digital_token}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="font-bold text-slate-900">{booking.farmer_name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{booking.farmer_mobile}</div>
                    </td>
                    <td className="px-4 py-2.5 font-medium text-slate-800">{booking.crop}</td>
                    <td className="px-4 py-2.5 font-bold text-[#064E3B]">{booking.quantity_quintals} Q</td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-slate-600">{booking.slot_time}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          booking.status === 'PROCURED'
                            ? 'bg-emerald-100 text-[#064E3B]'
                            : booking.status === 'ARRIVED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {booking.status !== 'PROCURED' ? (
                        <Link
                          to={`/officer/verify-token?token=${booking.digital_token}`}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-[#064E3B] hover:bg-[#053e2f] text-white font-bold text-[11px] rounded shadow-2xs transition-colors"
                        >
                          Process &rarr;
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
