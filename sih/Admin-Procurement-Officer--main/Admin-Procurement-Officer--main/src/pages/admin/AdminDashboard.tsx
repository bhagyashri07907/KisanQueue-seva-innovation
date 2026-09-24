import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../lib/api';
import { AdminDashboardData } from '../../types';
import {
  Building2,
  CalendarDays,
  Scale,
  Users,
  Clock,
  CheckCircle2,
  CreditCard,
  UserCheck,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon
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
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await apiRequest<AdminDashboardData>('/admin/dashboard');
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const weeklyIntakeData = [
    { day: 'Mon', target: 4000, actual: 3650 },
    { day: 'Tue', target: 4000, actual: 3920 },
    { day: 'Wed', target: 4200, actual: 4150 },
    { day: 'Thu', target: 4200, actual: 3880 },
    { day: 'Fri', target: 4500, actual: 4420 },
    { day: 'Sat', target: 3500, actual: 3200 },
    { day: 'Sun', target: 1500, actual: 980 }
  ];

  const cropShareData = [
    { name: 'Soybean', value: 540, fill: '#064E3B' },
    { name: 'Wheat', value: 310, fill: '#F59E0B' },
    { name: 'Gram (Chana)', value: 180, fill: '#4F46E5' },
    { name: 'Cotton', value: 150, fill: '#9333EA' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <span>Loading State Procurement Master Statistics...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-rose-600" />
        <span>{error || 'Error loading dashboard'}</span>
      </div>
    );
  }

  const { stats } = data;

  const metricCards = [
    {
      title: 'Total Procurement Centers',
      value: stats.total_procurement_centers ?? 0,
      unit: 'Centers Across 20 Districts',
      icon: Building2,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      link: '/admin/centers'
    },
    {
      title: 'Total Daily Slots',
      value: (stats.total_daily_slots ?? 0).toLocaleString(),
      unit: 'Scheduled Slots Across Centers',
      icon: CalendarDays,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      link: '/admin/slots'
    },
    {
      title: 'Total Intake Capacity',
      value: `${(stats.total_intake_capacity_quintals ?? 0).toLocaleString()}`,
      unit: 'Quintals Storage Capacity',
      icon: Scale,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      link: '/admin/capacity'
    },
    {
      title: 'Total Registered Farmers',
      value: (stats.total_registered_farmers ?? 0).toLocaleString(),
      unit: 'Synthetic Kisan Profiles',
      icon: Users,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
      link: '/admin/bookings'
    },
    {
      title: "Today's Bookings",
      value: stats.todays_bookings ?? 0,
      unit: 'Active Slot Allocations',
      icon: Clock,
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      link: '/admin/bookings'
    },
    {
      title: 'Completed Procurements',
      value: stats.completed_procurements ?? 0,
      unit: 'Verified & Weighed Batches',
      icon: CheckCircle2,
      color: 'bg-green-50 text-green-700 border-green-200',
      link: '/admin/procurement'
    },
    {
      title: 'Pending Payments',
      value: stats.pending_payments ?? 0,
      unit: 'DBT Direct Credit In-Queue',
      icon: CreditCard,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      link: '/admin/procurement'
    },
    {
      title: 'Active Officers',
      value: stats.active_officers ?? 0,
      unit: 'Assigned Center In-charges',
      icon: UserCheck,
      color: 'bg-slate-50 text-slate-800 border-slate-300',
      link: '/admin/officers'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Disclaimer Banner */}
      <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-amber-200 text-amber-900 rounded-md shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                Prototype Synthetic Government Dataset
              </span>
              <span className="text-[10px] bg-amber-200/80 text-amber-900 font-semibold px-2 py-0.5 rounded-full">
                Simulated Demonstration
              </span>
            </div>
            <p className="text-xs text-amber-900 mt-0.5">
              Notice: All numbers, centers, slots, and capacities shown are generated synthetic prototype data for
              evaluation. They do not claim or represent official government statistics.
            </p>
          </div>
        </div>
        <SyntheticDataBadge />
      </div>

      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Statewide Procurement Overview</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Agricultural Procurement Centers, Booking Slots, Intake Capacities &amp; Officer Management
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            id="add-officer-quick-btn"
            to="/admin/officers"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[#064E3B] text-white hover:bg-[#053e2f] transition-colors shadow-2xs"
          >
            <UserCheck className="w-3.5 h-3.5" />
            Create Officer
          </Link>
          <Link
            to="/admin/centers"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Building2 className="w-3.5 h-3.5" />
            Manage Centers
          </Link>
          <Link
            to="/admin/slots"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <CalendarDays className="w-3.5 h-3.5" />
            Slot Controls
          </Link>
        </div>
      </div>

      {/* 8 Metric Cards Grid - High Density Architecture */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              to={card.link}
              className="bg-white p-4.5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider truncate">
                  {card.title}
                </span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-black text-slate-900 group-hover:text-[#064E3B] transition-colors tabular-nums tracking-tight">
                  {card.value}
                </div>
                <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                  <span>{card.unit}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all ml-auto" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Visual Analytics - Recharts Engine */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Intake Trend BarChart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#064E3B] flex items-center justify-center border border-emerald-200">
                <BarChart3 className="w-4 h-4 text-[#064E3B]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Statewide Grain Intake vs. Target Capacity</h2>
                <p className="text-[11px] text-slate-400">Daily intake quota execution against allocated procurement ceiling</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
              Current Week (Quintals)
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height={240} minWidth={0} minHeight={200}>
              <BarChart data={weeklyIntakeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                  formatter={(val: any) => [`${val} Q`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="target" name="Allocated Capacity (Q)" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" name="Actual Intake (Q)" fill="#064E3B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Crop Share Donut Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                <PieChartIcon className="w-4 h-4 text-amber-700" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Procurement Crop Share</h2>
                <p className="text-[11px] text-slate-400">Volume distribution by crop</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">MSP Kharif</span>
          </div>

          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height={210} minWidth={0} minHeight={180}>
              <PieChart>
                <Pie
                  data={cropShareData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {cropShareData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '10px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                  formatter={(val: any) => [`${val} Quintals`, 'Volume']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-[11px]">
            {cropShareData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                <span className="text-slate-600 truncate">{item.name}</span>
                <span className="font-bold text-slate-900 ml-auto tabular-nums">{item.value}Q</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Center Operational Summary & Quick Nav */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Master Data Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-xl">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Government Master Dataset Structure</h2>
              <p className="text-xs text-slate-500">
                50 Procurement Centers across 20 Maharashtra districts with assigned daily capacities
              </p>
            </div>
            <Link
              to="/admin/centers"
              className="px-3 py-1.5 text-xs font-bold bg-[#064E3B] text-white rounded hover:bg-[#053e2f] transition-colors inline-flex items-center gap-1"
            >
              <span>View All Centers</span>
              <span>&rarr;</span>
            </Link>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">Key Major Districts Covered</span>
                <p className="text-slate-600 leading-relaxed">
                  Pune, Satara, Sangli, Kolhapur, Nashik, Ahmednagar, Solapur, Aurangabad, Jalgaon, Dhule, Nandurbar,
                  Beed, Latur, Osmanabad, Nagpur, Amravati, Akola, Yavatmal, Wardha, Buldhana.
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">Accepted Kharif/Rabi Crops</span>
                <p className="text-slate-600 leading-relaxed">
                  Soybean (MSP: ₹4,892), Wheat (MSP: ₹2,275), Gram / Chana (MSP: ₹5,440), Cotton (MSP: ₹6,620), Tur,
                  Jowar, Bajra, Maize.
                </p>
              </div>
            </div>

            {/* Quick Stats bar */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Average Center Daily Intake</div>
                <div className="text-lg font-bold text-slate-900 mt-0.5">500 Quintals</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Operating Schedule</div>
                <div className="text-lg font-bold text-slate-900 mt-0.5">09:00 AM - 05:00 PM</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Digital Token Architecture</div>
                <div className="text-lg font-bold text-[#064E3B] mt-0.5 font-mono">TEXT_TOKEN_HASH</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Role Separation Guide */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
            <h2 className="text-sm font-bold text-slate-800">Role Separation &amp; Security</h2>
          </div>
          <div className="p-6 space-y-3 text-xs text-slate-600">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-bold text-slate-900 block">Admin Privileges:</span>
              Authoritative control over procurement centers, daily capacity, booking slots, and generating officer credentials.
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-900">
              <span className="font-bold text-emerald-950 block">Officer Privileges:</span>
              Restricted to their assigned center. Cannot modify master center data. Performs token verification and procurement.
            </div>
          </div>

          <div className="p-6 pt-0 border-t border-slate-100 mt-auto">
            <Link
              to="/admin/reports"
              className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded transition-colors shadow-2xs"
            >
              Open State Analytics &amp; Reports &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
