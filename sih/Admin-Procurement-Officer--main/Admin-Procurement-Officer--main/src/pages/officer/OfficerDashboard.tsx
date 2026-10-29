import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../lib/api';
import { OfficerDashboardData, OfficerNotification, AreaFarmer, Booking } from '../../types';
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
  MapPin,
  Bell,
  Search,
  Filter,
  RefreshCw,
  X,
  Eye,
  FileText,
  Check,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Sparkles
} from 'lucide-react';
import { SyntheticDataBadge } from '../../components/SyntheticDataBadge';

export const OfficerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<OfficerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState<OfficerNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // Farmers Directory State
  const [farmers, setFarmers] = useState<AreaFarmer[]>([]);
  const [farmerTotal, setFarmerTotal] = useState(0);
  const [farmerPage, setFarmerPage] = useState(1);
  const [farmerTotalPages, setFarmerTotalPages] = useState(1);
  const [farmersLoading, setFarmersLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('All');
  const [selectedTaluka, setSelectedTaluka] = useState('All');
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [villageOptions, setVillageOptions] = useState<string[]>([]);
  const [talukaOptions, setTalukaOptions] = useState<string[]>([]);

  // Booking Details Modal
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  // Polling management (Requirement 13: 15-30s polling, prevent overlapping, cancel on unmount)
  const isMountedRef = useRef(true);
  const isPollingRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;

    // Initial load
    fetchDashboardData(true);
    fetchNotifications();
    fetchAreaFarmers(1);

    // Polling interval (20 seconds)
    const intervalId = setInterval(() => {
      if (!isPollingRef.current && isMountedRef.current) {
        pollData();
      }
    }, 20000);

    return () => {
      isMountedRef.current = false;
      clearInterval(intervalId);
    };
  }, []);

  const fetchDashboardData = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    setError(null);
    try {
      const res = await apiRequest<OfficerDashboardData>('/officer/dashboard');
      if (isMountedRef.current) {
        setData(res);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setError(err.message || 'Failed to load officer dashboard.');
      }
    } finally {
      if (isMountedRef.current && isInitial) {
        setLoading(false);
      }
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await apiRequest<{ notifications: OfficerNotification[]; unread_count: number }>('/officer/notifications');
      if (isMountedRef.current) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unread_count || 0);
      }
    } catch (err) {
      console.error('Error fetching officer notifications:', err);
    }
  };

  const fetchAreaFarmers = async (page = 1) => {
    setFarmersLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        page_size: '10',
      });
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (selectedVillage !== 'All') params.append('village', selectedVillage);
      if (selectedTaluka !== 'All') params.append('taluka', selectedTaluka);
      if (selectedCrop !== 'All') params.append('crop', selectedCrop);
      if (selectedStatus !== 'All') params.append('status', selectedStatus);

      const res = await apiRequest<any>(`/officer/farmers?${params.toString()}`);
      if (isMountedRef.current) {
        setFarmers(res.farmers || []);
        setFarmerTotal(res.total || 0);
        setFarmerPage(res.page || 1);
        setFarmerTotalPages(res.total_pages || 1);
        if (res.filter_options) {
          if (res.filter_options.villages) setVillageOptions(res.filter_options.villages);
          if (res.filter_options.talukas) setTalukaOptions(res.filter_options.talukas);
        }
      }
    } catch (err) {
      console.error('Error fetching area farmers:', err);
    } finally {
      if (isMountedRef.current) {
        setFarmersLoading(false);
      }
    }
  };

  // Safe background poll
  const pollData = async () => {
    isPollingRef.current = true;
    try {
      const [dashRes, notifRes] = await Promise.all([
        apiRequest<OfficerDashboardData>('/officer/dashboard'),
        apiRequest<{ notifications: OfficerNotification[]; unread_count: number }>('/officer/notifications'),
      ]);
      if (isMountedRef.current) {
        setData(dashRes);
        setNotifications(notifRes.notifications || []);
        setUnreadCount(notifRes.unread_count || 0);
      }
    } catch (err) {
      console.warn('Silent polling update encountered an issue:', err);
    } finally {
      isPollingRef.current = false;
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchDashboardData(), fetchNotifications(), fetchAreaFarmers(farmerPage)]);
    setIsRefreshing(false);
  };

  const handleMarkAsRead = async (notifId: string) => {
    try {
      await apiRequest(`/officer/notifications/${notifId}/read`, { method: 'POST' });
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiRequest('/officer/notifications/read-all', { method: 'POST' });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  const handleViewBooking = async (bookingId: string) => {
    try {
      const res = await apiRequest<{ booking: any }>(`/officer/bookings/${bookingId}`);
      setSelectedBooking(res.booking);
    } catch (err) {
      // Fallback: check in local list
      const local = farmers.find(f => f.booking_id === bookingId) || (data?.todays_bookings || []).find(b => b.booking_id === bookingId);
      if (local) setSelectedBooking(local);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
          <span>Loading Center Operational Status &amp; Bookings...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error || 'Failed to load officer dashboard.'}</span>
        </div>
        <button
          onClick={() => fetchDashboardData(true)}
          className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  const { stats, center, todays_bookings } = data;
  const newBookingsCount = stats.new_bookings_count ?? unreadCount;

  const metricCards = [
    {
      title: 'New Bookings',
      value: newBookingsCount,
      icon: Bell,
      color: 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/20',
      desc: 'Unread booking notifications',
      highlight: true
    },
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
      {/* Center Identification & Control Banner */}
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
            {/* Notification Bell with Badge */}
            <div className="relative">
              <button
                id="officer-notifications-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span
                    id="unread-notifications-badge"
                    className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-pulse"
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden">
                  <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-800" />
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Center Notifications</span>
                      {unreadCount > 0 && (
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No notifications received yet for your center.
                      </div>
                    ) : (
                      notifications.slice(0, 15).map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 text-xs transition ${n.read ? 'bg-white opacity-75' : 'bg-emerald-50/60 font-medium'}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-slate-800 text-[11px] leading-relaxed">{n.message}</p>
                            {!n.read && (
                              <button
                                onClick={() => handleMarkAsRead(n.id)}
                                className="text-emerald-700 hover:text-emerald-900 shrink-0 p-1 cursor-pointer"
                                title="Mark read"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                            <span>{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {n.booking_id && (
                              <button
                                onClick={() => {
                                  setShowNotifications(false);
                                  handleViewBooking(n.booking_id);
                                }}
                                className="text-emerald-700 font-bold hover:underline cursor-pointer"
                              >
                                View Booking &rarr;
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Manual Refresh Button */}
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition cursor-pointer disabled:opacity-50"
              title="Refresh Center Data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-700' : ''}`} />
            </button>

            {/* Verify Farmer Token Primary CTA */}
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

      {/* 7 Metric Cards (Includes New Bookings Count) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`bg-white rounded-xl border p-3.5 shadow-2xs flex flex-col justify-between ${
                card.highlight ? 'border-emerald-400 bg-gradient-to-b from-emerald-50/50 to-white' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-1.5 rounded-lg border ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                {card.highlight && card.value > 0 && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                )}
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

      {/* Farmers in My Area (Section 7: Farmer Directory) */}
      <div id="farmers-directory-section" className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs space-y-4">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-800" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Farmers in My Area &amp; Bookings
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Authorized directory for {center.center_name} ({center.district} District)
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Total Farmers:</span>
            <span className="font-bold font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {farmerTotal}
            </span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="px-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="farmer-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchAreaFarmers(1)}
              placeholder="Search by farmer name, ID, or token..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>

          {/* Village Filter */}
          <div>
            <select
              value={selectedVillage}
              onChange={(e) => {
                setSelectedVillage(e.target.value);
              }}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none"
            >
              <option value="All">All Villages</option>
              {villageOptions.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          {/* Crop Filter */}
          <div>
            <select
              value={selectedCrop}
              onChange={(e) => {
                setSelectedCrop(e.target.value);
              }}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none"
            >
              <option value="All">All Crops</option>
              {center.accepted_crops.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Status Filter + Apply */}
          <div className="flex gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
              }}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="BOOKED">Booked</option>
              <option value="ARRIVED">Arrived</option>
              <option value="PROCURED">Procured</option>
            </select>
            <button
              onClick={() => fetchAreaFarmers(1)}
              className="px-3 py-2 bg-[#064E3B] hover:bg-[#053e2f] text-white rounded-lg text-xs font-bold cursor-pointer shrink-0"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="px-4 py-3">Farmer &amp; Contact</th>
                <th className="px-4 py-3">Farmer ID</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Crop &amp; Quantity</th>
                <th className="px-4 py-3">Date &amp; Slot</th>
                <th className="px-4 py-3">Digital Token</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {farmersLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
                      <span>Loading farmers in your area...</span>
                    </div>
                  </td>
                </tr>
              ) : farmers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    No farmers found matching the search criteria for your procurement area.
                  </td>
                </tr>
              ) : (
                farmers.map((farmer) => (
                  <tr key={farmer.booking_id || farmer.farmer_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{farmer.farmer_name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{farmer.mobile_masked}</div>
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-slate-700">
                      {farmer.farmerId || farmer.farmer_id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{farmer.village}</div>
                      <div className="text-[11px] text-slate-400">{farmer.taluka}, {farmer.district}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-900">{farmer.crop}</span>
                      <div className="text-[11px] font-bold text-emerald-800">{farmer.expected_quantity_quintals} Qtl</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{farmer.date}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{farmer.time_slot}</div>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                        {farmer.digital_token}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          farmer.booking_status === 'PROCURED'
                            ? 'bg-emerald-100 text-[#064E3B]'
                            : farmer.booking_status === 'ARRIVED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {farmer.booking_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewBooking(farmer.booking_id)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 rounded transition cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {farmer.booking_status !== 'PROCURED' && (
                          <Link
                            to={`/officer/verify-token?token=${farmer.digital_token}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#064E3B] hover:bg-[#053e2f] text-white font-bold text-[10px] rounded shadow-2xs transition-colors"
                          >
                            Process &rarr;
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {farmerTotalPages > 1 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing Page {farmerPage} of {farmerTotalPages} ({farmerTotal} total)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchAreaFarmers(Math.max(1, farmerPage - 1))}
                disabled={farmerPage <= 1}
                className="p-1.5 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => fetchAreaFarmers(Math.min(farmerTotalPages, farmerPage + 1))}
                disabled={farmerPage >= farmerTotalPages}
                className="p-1.5 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Today's Scheduled Farmer Bookings Table */}
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

      {/* Booking Details Modal / Panel (Section 13) */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Booking Inspection</span>
                <h3 className="text-base font-bold text-slate-900">Booking #{selectedBooking.booking_id}</h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">Digital Token</span>
                  <span className="font-mono text-base font-black text-emerald-900">{selectedBooking.digital_token}</span>
                </div>
                <span className="px-2.5 py-1 bg-emerald-700 text-white rounded-lg text-xs font-bold uppercase">
                  {selectedBooking.status || selectedBooking.booking_status || 'CONFIRMED'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block text-[11px]">Farmer Name:</span>
                  <strong className="text-slate-900 text-sm">{selectedBooking.farmer_name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Contact (Masked):</span>
                  <strong className="text-slate-900 font-mono">{selectedBooking.farmer_mobile || selectedBooking.mobile_masked || '****'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Crop:</span>
                  <strong className="text-slate-900 text-sm">{selectedBooking.crop}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Quantity:</span>
                  <strong className="text-emerald-800 text-sm font-bold">
                    {selectedBooking.quantity_quintals || selectedBooking.expected_quantity_quintals || selectedBooking.expected_quantity || 0} Quintals
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Date &amp; Slot:</span>
                  <strong className="text-slate-900">{selectedBooking.date || selectedBooking.slot_date} ({selectedBooking.time_slot || selectedBooking.slot_time})</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Procurement Center:</span>
                  <strong className="text-slate-900">{center.center_name}</strong>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Close
              </button>
              <Link
                to={`/officer/verify-token?token=${selectedBooking.digital_token}`}
                className="px-4 py-2 bg-[#064E3B] hover:bg-[#053e2f] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Process Token &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
