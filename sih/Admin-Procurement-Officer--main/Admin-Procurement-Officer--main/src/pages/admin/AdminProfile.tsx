import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Lock,
  Award,
  Clock,
  Calendar,
  Layers,
  Key,
  FileText,
  Sliders,
  Users,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SyntheticDataBadge } from '../../components/SyntheticDataBadge';

interface AdminProfileData {
  admin_id: string;
  username: string;
  full_name: string;
  designation: string;
  cadre_code: string;
  department: string;
  email: string;
  alt_email: string;
  phone: string;
  mobile: string;
  office_address: string;
  jurisdiction: string;
  role: string;
  security_clearance: string;
  status: string;
  last_login: string;
  login_ip: string;
  mfa_enabled: boolean;
  authorities: string[];
  stats: {
    centers_managed: number;
    officers_supervised: number;
    total_intake_capacity_quintals: number;
    disbursed_batches_count: number;
  };
}

export const AdminProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<AdminProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await apiRequest<{ profile: AdminProfileData }>('/admin/profile');
      if (res.profile) {
        setProfile(res.profile);
      }
    } catch (err) {
      console.error('Failed to load admin profile:', err);
      // Fallback data
      setProfile({
        admin_id: 'ADM001',
        username: user?.username || 'admin',
        full_name: user?.name || 'Dr. Vikramaditya Salve',
        designation: 'State Procurement Director & Commissioner of Agricultural Marketing',
        cadre_code: 'MH-IAS-AGRI-0428',
        department: 'Department of Agricultural Marketing, Govt. of Maharashtra',
        email: user?.email || 'admin@kisanqueue.gov.in',
        alt_email: 'director.marketing@maharashtra.gov.in',
        phone: '+91 20 2553 8291',
        mobile: '+91 94220 18492',
        office_address: 'State Central Agricultural Directorate, Sakhar Sankul, Shivajinagar, Pune, Maharashtra - 411005',
        jurisdiction: 'Statewide (All 36 Districts, Maharashtra)',
        role: 'Super Administrator',
        security_clearance: 'Level 4 (State Apex Clearance)',
        status: 'Active',
        last_login: '2026-09-07T09:15:00.000Z',
        login_ip: '10.14.22.8 (Govt Intranet State Data Center)',
        mfa_enabled: true,
        authorities: [
          'Statewide Center Configuration & Decommissioning',
          'Dynamic Intake Capacity & Slot Allocation Control',
          'Procurement Officer Credential Issuance & Revocation',
          'Kharif & Rabi MSP Price Benchmarking',
          'PFMS / DBT Public Finance Clearing Audits',
          'Automated SMS & FCM Broadcast Supervision'
        ],
        stats: {
          centers_managed: 50,
          officers_supervised: 25,
          total_intake_capacity_quintals: 305000,
          disbursed_batches_count: 31
        }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#064E3B] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Loading Official Profile & Credentials...</span>
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
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Official Administrator Profile</h1>
            <SyntheticDataBadge />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Government of Maharashtra &bull; State Directorate of Agricultural Marketing & Procurement
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-300 rounded-lg text-xs font-bold text-[#064E3B]">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span>Active Government Session &bull; Level 4 Clearance</span>
        </div>
      </div>

      {/* Main Identity Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="bg-[#064E3B] p-6 sm:p-8 text-white relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-20 h-20 bg-amber-400 text-[#064E3B] rounded-2xl flex items-center justify-center font-black text-3xl shrink-0 border-2 border-amber-300/60 shadow-md">
              VS
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">{p.full_name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-[#064E3B]">
                  {p.role}
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
              <span className="text-[10px] uppercase tracking-wider text-emerald-300/80 font-bold block">Official ID</span>
              <span className="font-mono font-bold text-white text-sm">{p.admin_id}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-emerald-300/80 font-bold block">System Login</span>
              <span className="font-mono font-bold text-white text-sm">{p.username}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-emerald-300/80 font-bold block">Jurisdiction</span>
              <span className="font-semibold text-white text-sm">{p.jurisdiction}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-emerald-300/80 font-bold block">Clearance</span>
              <span className="font-semibold text-amber-300 text-sm">{p.security_clearance}</span>
            </div>
          </div>
        </div>

        {/* Administration Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-200 bg-slate-50">
          <div className="p-4">
            <span className="text-[11px] font-semibold text-slate-500 block">Centers Governed</span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">{p.stats.centers_managed} Centers</span>
            <span className="text-[10px] text-slate-400">All 36 Districts</span>
          </div>
          <div className="p-4">
            <span className="text-[11px] font-semibold text-slate-500 block">Field Officers</span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">{p.stats.officers_supervised} Active</span>
            <span className="text-[10px] text-slate-400">APMC & State Cadre</span>
          </div>
          <div className="p-4">
            <span className="text-[11px] font-semibold text-slate-500 block">Intake Capacity</span>
            <span className="text-xl font-bold text-[#064E3B] mt-1 block">
              {p.stats.total_intake_capacity_quintals.toLocaleString()} Qtl
            </span>
            <span className="text-[10px] text-slate-400">Total Statewide Quota</span>
          </div>
          <div className="p-4">
            <span className="text-[11px] font-semibold text-slate-500 block">PFMS DBT Batches</span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">{p.stats.disbursed_batches_count} Cleared</span>
            <span className="text-[10px] text-slate-400">Direct Benefit Transfer</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Details & Authorities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact & Office Information */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="w-4 h-4 text-[#064E3B]" />
            <h3 className="font-bold text-slate-900 text-sm">Official Office & Contact Information</h3>
          </div>

          <div className="space-y-3.5 text-xs text-slate-700">
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-slate-900">Primary Official Email</span>
                <span className="font-mono text-slate-600">{p.email}</span>
                <span className="block font-mono text-[11px] text-slate-400 mt-0.5">{p.alt_email}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-slate-900">Official Directorate Desk Telephone</span>
                <span className="font-mono text-slate-600">{p.phone}</span>
                <span className="block font-mono text-[11px] text-slate-400 mt-0.5">Mobile: {p.mobile} (Emergency Desk)</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-slate-900">Headquarters Address</span>
                <span className="text-slate-600 leading-relaxed block mt-0.5">
                  {p.office_address}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-slate-900">Cadre & Service Details</span>
                <span className="text-slate-600 block mt-0.5">
                  Indian Administrative Service (IAS) &bull; Maharashtra Cadre (Batch 2011)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Security, Role & System Authorities */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Shield className="w-4 h-4 text-[#064E3B]" />
            <h3 className="font-bold text-slate-900 text-sm">Delegated Administrative Authorities</h3>
          </div>

          <div className="space-y-2 text-xs">
            {p.authorities.map((auth, index) => (
              <div key={index} className="flex items-start gap-2.5 p-2 bg-slate-50 border border-slate-200/70 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span className="font-semibold text-slate-800">{auth}</span>
              </div>
            ))}
          </div>

          {/* Active Security Session Details */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Authentication Audit &amp; Session Guard
            </span>
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-[11px] space-y-1.5 font-mono text-slate-600">
              <div className="flex justify-between">
                <span>Session Algorithm:</span>
                <span className="font-bold text-slate-800">JWT (HS256) Encrypted</span>
              </div>
              <div className="flex justify-between">
                <span>Multi-Factor Status:</span>
                <span className="font-bold text-emerald-700">Govt NIC e-Sign Verified</span>
              </div>
              <div className="flex justify-between">
                <span>Intranet Gateway IP:</span>
                <span className="font-bold text-slate-800">{p.login_ip}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Authenticated:</span>
                <span className="font-bold text-slate-800">{new Date(p.last_login).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Direct Administrative Quick Action Navigation */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <h3 className="font-bold text-slate-900 text-sm mb-3">Governance Control Shortcuts</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            to="/admin/centers"
            className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-[#064E3B]" />
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#064E3B]">Manage Centers</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
          </Link>

          <Link
            to="/admin/officers"
            className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-[#064E3B]" />
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#064E3B]">Supervise Officers</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
          </Link>

          <Link
            to="/admin/reports"
            className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-[#064E3B]" />
              <span className="text-xs font-bold text-slate-800 group-hover:text-[#064E3B]">Procurement Audits</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
          </Link>
        </div>
      </div>
    </div>
  );
};
