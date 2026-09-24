import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Clock,
  Layers,
  Key,
  ShieldCheck,
  Scale,
  CalendarCheck,
  Wheat,
  FileCheck2,
  ArrowRight
} from 'lucide-react';
import { SyntheticDataBadge } from '../../components/SyntheticDataBadge';

interface OfficerProfileData {
  officer_id: string;
  officer_name: string;
  username: string;
  email: string;
  mobile_number: string;
  status: string;
  created_at: string;
  designation: string;
  cadre_code: string;
  security_clearance: string;
  department: string;
  assigned_center_id: string;
  assigned_center_name: string;
  center_details: {
    center_id: string;
    center_name: string;
    district: string;
    taluka: string;
    location: string;
    contact_person: string;
    contact_phone: string;
    daily_capacity: number;
    intake_capacity: number;
    accepted_crops: string[];
  };
  authorities: string[];
  stats: {
    total_center_bookings: number;
    todays_verified_tokens: number;
    total_procurement_batches: number;
    total_procured_quintals: number;
    todays_procured_quintals: number;
    cleared_payments_count: number;
  };
}

export const OfficerProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<OfficerProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Change password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await apiRequest<{ profile: OfficerProfileData }>('/officer/profile');
      if (res.profile) {
        setProfile(res.profile);
      }
    } catch (err) {
      console.error('Failed to load officer profile:', err);
      // Fallback data
      setProfile({
        officer_id: user?.id || 'OFF001',
        officer_name: user?.name || 'Pandurang Jadhav',
        username: user?.username || 'OFF001',
        email: user?.email || 'officer.off001@kisanqueue.gov.in',
        mobile_number: '+91 9810003421',
        status: 'active',
        created_at: '2026-08-15T10:00:00Z',
        designation: 'Procurement Station In-Charge & Quality Verifier',
        cadre_code: `MH-APMC-OFF-${user?.id || 'OFF001'}`,
        security_clearance: 'Level 2 (Field Station Operational Authority)',
        department: 'Maharashtra State Agricultural Marketing Board (MSAMB)',
        assigned_center_id: user?.assigned_center_id || 'PC001',
        assigned_center_name: user?.assigned_center_name || 'Government Procurement Center - Baramati',
        center_details: {
          center_id: user?.assigned_center_id || 'PC001',
          center_name: user?.assigned_center_name || 'Government Procurement Center - Baramati',
          district: 'Pune',
          taluka: 'Baramati',
          location: 'MIDC Road, Baramati APMC Yard, Pune District - 413102',
          contact_person: 'Station Desk',
          contact_phone: '+91 2112 224150',
          daily_capacity: 500,
          intake_capacity: 5000,
          accepted_crops: ['Soybean', 'Wheat', 'Gram (Chana)']
        },
        authorities: [
          'Farmer Digital Token Verification & Status Validation',
          'Electronic Weighbridge Metric Calibration & Input',
          'Grain Moisture & Quality Standard Grade Confirmation',
          'Digital Procurement Receipt Generation',
          'PFMS DBT Clearing Status Tracking & Verification'
        ],
        stats: {
          total_center_bookings: 24,
          todays_verified_tokens: 14,
          total_procurement_batches: 18,
          total_procured_quintals: 1240,
          todays_procured_quintals: 142.5,
          cleared_payments_count: 15
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation password do not match.');
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await apiRequest<{ success: boolean; message: string }>('/officer/change-password', {
        method: 'POST',
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword
        })
      });

      setPasswordSuccess(res.message || 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password. Please verify current password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#064E3B] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Loading Officer Profile & Center Details...</span>
        </div>
      </div>
    );
  }

  const p = profile!;

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-sans">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Procurement Officer Profile</h1>
            <SyntheticDataBadge />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Procurement Station Credentials, Assigned Center Jurisdictions &amp; Account Security
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-300 rounded-lg text-xs font-bold text-[#064E3B]">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span>Active Station Officer Session</span>
        </div>
      </div>

      {/* Main Identity Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
        <div className="bg-[#064E3B] p-6 sm:p-8 text-white relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-20 h-20 bg-amber-400 text-[#064E3B] rounded-2xl flex items-center justify-center font-black text-3xl shrink-0 border-2 border-amber-300/60 shadow-md">
              PO
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">{p.officer_name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-700 text-emerald-100 border border-emerald-500">
                  {p.status === 'active' ? 'Active In-Charge' : p.status}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-white/10 text-emerald-100 border border-white/20">
                  {p.cadre_code}
                </span>
              </div>
              <p className="text-sm text-emerald-100 font-medium">{p.designation}</p>
              <p className="text-xs text-emerald-200/80">{p.department}</p>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-emerald-300/80 font-bold block">Officer ID</span>
              <span className="font-mono font-bold text-white text-sm">{p.officer_id}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-emerald-300/80 font-bold block">Login Username</span>
              <span className="font-mono font-bold text-white text-sm">{p.username}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-emerald-300/80 font-bold block">Assigned Station</span>
              <span className="font-semibold text-white text-sm truncate block" title={p.assigned_center_name}>
                {p.assigned_center_id}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-emerald-300/80 font-bold block">Clearance</span>
              <span className="font-semibold text-amber-300 text-sm">Station Authority</span>
            </div>
          </div>
        </div>

        {/* Administration Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-200 bg-slate-50">
          <div className="p-4">
            <span className="text-[11px] font-semibold text-slate-500 block">Total Center Bookings</span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">{p.stats?.total_center_bookings ?? 0} Bookings</span>
            <span className="text-[10px] text-slate-400">Recorded for Center</span>
          </div>
          <div className="p-4">
            <span className="text-[11px] font-semibold text-slate-500 block">Today Verified Tokens</span>
            <span className="text-xl font-bold text-[#064E3B] mt-1 block">{p.stats?.todays_verified_tokens ?? 0} Verified</span>
            <span className="text-[10px] text-slate-400">Tokens validated at gate</span>
          </div>
          <div className="p-4">
            <span className="text-[11px] font-semibold text-slate-500 block">Total Intake Weight</span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">
              {(p.stats?.total_procured_quintals ?? 0).toLocaleString()} Qtl
            </span>
            <span className="text-[10px] text-slate-400">Today: {p.stats?.todays_procured_quintals ?? 0} Qtl</span>
          </div>
          <div className="p-4">
            <span className="text-[11px] font-semibold text-slate-500 block">DBT Payments Cleared</span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">{p.stats?.cleared_payments_count ?? 0} Batches</span>
            <span className="text-[10px] text-slate-400">Direct Benefit Transfer</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Assigned Center & Password Change */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Assigned Center & Duties */}
        <div className="space-y-6">
          {/* Assigned Center Information */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5.5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#064E3B]" />
                <h3 className="font-bold text-slate-900 text-sm">Assigned Procurement Center</h3>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {p.center_details?.center_id || p.assigned_center_id || 'PC001'}
              </span>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div>
                <span className="text-slate-400 text-[11px] block">Center Name</span>
                <span className="font-bold text-slate-900 text-sm">{p.center_details?.center_name || p.assigned_center_name || 'Procurement Center'}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">District</span>
                  <span className="font-bold text-slate-800">{p.center_details?.district || 'Pune'}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Taluka</span>
                  <span className="font-bold text-slate-800">{p.center_details?.taluka || 'Baramati'}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 block">Station Physical Location</span>
                  <span className="text-slate-600 leading-relaxed text-[11px]">{p.center_details?.location || 'Maharashtra'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/80">
                <div>
                  <span className="font-bold text-emerald-950 block text-[11px]">Daily Intake Capacity</span>
                  <span className="text-slate-600 text-[10px]">Maximum allowed quintals per day</span>
                </div>
                <span className="font-bold font-mono text-emerald-900 text-sm">
                  {p.center_details?.daily_capacity || 500} Q / day
                </span>
              </div>

              <div>
                <span className="text-slate-500 font-bold block text-[11px] mb-1.5 flex items-center gap-1.5">
                  <Wheat className="w-3.5 h-3.5 text-amber-600" />
                  <span>Accepted MSP Crops</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(p.center_details?.accepted_crops || ['Soybean', 'Wheat', 'Gram']).map((crop) => (
                    <span
                      key={crop}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200"
                    >
                      {crop}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details & Official Authorities */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5.5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-4 h-4 text-[#064E3B]" />
              <h3 className="font-bold text-slate-900 text-sm">Official Contact &amp; Responsibilities</h3>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-800">Email:</span>
                </div>
                <span className="font-mono text-slate-600">{p.email}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-800">Mobile (OTP alerts):</span>
                </div>
                <span className="font-mono text-slate-600">{p.mobile_number}</span>
              </div>

              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-700 block mb-2">Delegated Station Authorities:</span>
                <div className="space-y-1.5">
                  {(p.authorities || [
                    'Farmer Digital Token Verification & Status Validation',
                    'Electronic Weighbridge Metric Calibration & Input',
                    'Grain Moisture & Quality Standard Grade Confirmation',
                    'Digital Procurement Receipt Generation',
                    'PFMS DBT Clearing Status Tracking & Verification'
                  ]).map((auth, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{auth}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Change Password Box */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5.5 shadow-2xs">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#064E3B] flex items-center justify-center border border-emerald-200">
                <Key className="w-4 h-4 text-[#064E3B]" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Change Account Password</h3>
                <p className="text-[11px] text-slate-500">Update your procurement officer login password</p>
              </div>
            </div>

            {/* Success message */}
            {passwordSuccess && (
              <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-medium">{passwordSuccess}</span>
              </div>
            )}

            {/* Error message */}
            {passwordError && (
              <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-medium">{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="officer-current-password"
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="Enter current password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#064E3B] focus:border-[#064E3B] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Default prototype credential is <strong className="font-mono text-slate-600">Officer@123</strong>
                </span>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="officer-new-password"
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Enter new password (min 6 characters)"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#064E3B] focus:border-[#064E3B] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="officer-confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Confirm new password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#064E3B] focus:border-[#064E3B] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
                <span className="font-bold block">Security Guidelines:</span>
                <ul className="list-disc list-inside space-y-0.5 text-[10px] text-amber-800">
                  <li>Minimum 6 characters long with letters and numbers</li>
                  <li>Do not share station credentials with unauthorized personnel</li>
                  <li>All changes are audited in the government transaction log</li>
                </ul>
              </div>

              <button
                id="officer-change-password-btn"
                type="submit"
                disabled={passwordLoading}
                className="w-full py-2.5 px-4 bg-[#064E3B] hover:bg-[#053e2f] active:scale-[0.99] text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Key className="w-3.5 h-3.5" />
                <span>{passwordLoading ? 'Updating Password...' : 'Save New Password'}</span>
              </button>
            </form>
          </div>

          {/* Account Integrity Box */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 text-xs text-slate-600 space-y-2">
            <span className="font-bold text-slate-800 block text-xs">Officer Governance Protocol</span>
            <p className="text-[11px] leading-relaxed text-slate-600">
              Procurement Officer accounts are bound to their assigned center ID (<strong>{p.assigned_center_id}</strong>).
              Center reassignments can only be made by the State Admin through the Master Governance portal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
