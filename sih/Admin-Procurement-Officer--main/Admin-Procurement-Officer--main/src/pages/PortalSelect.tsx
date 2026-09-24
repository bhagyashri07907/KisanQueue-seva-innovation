import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Building2, UserCheck, ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react';
import { SyntheticDataBadge } from '../components/SyntheticDataBadge';

export const PortalSelect: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-sans">
      {/* Top Banner */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#FFD700] flex items-center justify-center text-[#064E3B] font-black text-xl shadow-xs border border-amber-400">
              K
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#064E3B] tracking-wider uppercase">
                Government of Maharashtra &bull; Agricultural Procurement System
              </div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">KisanQueue Web Portal</h1>
            </div>
          </div>
          <SyntheticDataBadge subtext />
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 flex flex-col justify-center">
        {/* Important Boundary Notice as requested */}
        <div className="mb-8 p-4.5 bg-emerald-50/80 border border-emerald-200/90 rounded-2xl flex items-start gap-3.5 shadow-2xs">
          <div className="p-1.5 bg-emerald-100 text-[#064E3B] rounded-lg shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4 text-[#064E3B]" />
          </div>
          <div className="text-xs text-emerald-950 leading-relaxed">
            <strong className="font-bold block text-sm text-[#064E3B] mb-0.5">Target Audience Notice:</strong>
            This Web Portal is exclusively for <strong>Government Admins</strong> and{' '}
            <strong>Procurement Officers</strong>. The Farmer Application is a completely separate Mobile/PWA
            application (which farmers use for slot booking and token generation) and connects to the same backend.
          </div>
        </div>

        <div className="text-center mb-9">
          <span className="text-[11px] font-bold tracking-widest text-[#064E3B] uppercase px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200/70 inline-block mb-2">
            Secure Digital Gateways
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Choose Portal Access</h2>
          <p className="text-slate-600 mt-2 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Role-based digital agricultural procurement management for Maharashtra APMC and State Procurement Centers.
          </p>
        </div>

        {/* Portals Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Admin Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition-all p-7 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#064E3B] text-[#FFD700] flex items-center justify-center font-bold text-xl shadow-xs border border-[#043327]">
                  <Shield className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-800 uppercase tracking-wider border border-slate-200/80">
                  State Administration
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-900 group-hover:text-[#064E3B] transition-colors">Admin Portal</h3>
              <p className="text-slate-600 text-xs mt-2 leading-relaxed">
                Manage government master data, 50 procurement centers, statewide booking slots, daily intake capacity,
                and create Procurement Officer accounts with secure credentials.
              </p>

              <div className="mt-5 space-y-2.5 border-t border-slate-100 pt-4 text-xs text-slate-700">
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-[#064E3B] shrink-0" />
                  <span className="font-medium">Procurement Centers &amp; Slot Management</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-[#064E3B] shrink-0" />
                  <span className="font-medium">Intake Capacity &amp; Utilization Analytics</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-[#064E3B] shrink-0" />
                  <span className="font-medium">Create Officer Accounts &amp; Center Assignment</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-[#064E3B] shrink-0" />
                  <span className="font-medium">Statewide Monitoring &amp; Reports</span>
                </div>
              </div>

              {/* Demo creds box */}
              <div className="mt-5 p-3.5 bg-slate-50 rounded-xl border border-slate-200/90 text-xs">
                <span className="font-bold text-slate-800 block mb-0.5">Demo Admin Credentials:</span>
                <span className="text-slate-600 text-[11px]">
                  Username: <strong className="font-mono text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">admin</strong> &bull; Password:{' '}
                  <strong className="font-mono text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">Admin@123</strong>
                </span>
              </div>
            </div>

            <div className="mt-6 pt-2">
              <Link
                id="login-as-admin-link"
                to="/admin/login"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#064E3B] hover:bg-[#053e2f] active:scale-[0.99] text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
              >
                <span>Access Admin Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Officer Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition-all p-7 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#064E3B] text-emerald-300 flex items-center justify-center font-bold text-xl shadow-xs border border-[#043327]">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 uppercase tracking-wider border border-emerald-200/80">
                  Center Field Operations
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-900 group-hover:text-[#064E3B] transition-colors">Procurement Officer Portal</h3>
              <p className="text-slate-600 text-xs mt-2 leading-relaxed">
                Log in with Admin-assigned credentials, access only your designated procurement center, verify farmer
                digital tokens, record weighing &amp; quality checks, and generate digital receipts.
              </p>

              <div className="mt-5 space-y-2.5 border-t border-slate-100 pt-4 text-xs text-slate-700">
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-[#064E3B] shrink-0" />
                  <span className="font-medium">Restricted to Assigned Procurement Center</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-[#064E3B] shrink-0" />
                  <span className="font-medium">Manual Digital Token Verification (Text-Based)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-[#064E3B] shrink-0" />
                  <span className="font-medium">Weighing &amp; Grain Quality Confirmation</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-[#064E3B] shrink-0" />
                  <span className="font-medium">Instant Digital Receipt &amp; Payment Status</span>
                </div>
              </div>

              {/* Demo creds box */}
              <div className="mt-5 p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200/90 text-xs">
                <span className="font-bold text-emerald-950 block mb-0.5">Demo Officer Credentials:</span>
                <span className="text-emerald-900 text-[11px]">
                  Officer ID: <strong className="font-mono text-emerald-950 bg-white px-1.5 py-0.5 rounded border border-emerald-300">OFF001</strong> &bull; Password:{' '}
                  <strong className="font-mono text-emerald-950 bg-white px-1.5 py-0.5 rounded border border-emerald-300">Officer@123</strong>
                </span>
              </div>
            </div>

            <div className="mt-6 pt-2">
              <Link
                id="login-as-officer-link"
                to="/officer/login"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#064E3B] hover:bg-[#053e2f] active:scale-[0.99] text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
              >
                <span>Access Officer Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Flow Architecture Diagram */}
        <div className="mt-10 bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs text-xs text-slate-600">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-[#064E3B]" />
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Integrated Agricultural Procurement Architecture
            </h4>
            <span className="w-2 h-2 rounded-full bg-[#064E3B]" />
          </div>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/90">
              <span className="font-bold text-slate-900 block mb-1">1. Master Governance (Admin)</span>
              <span className="text-[11px] text-slate-600">Admin provisions 50 centers, creates daily slots, sets intake caps, creates officer IDs.</span>
            </div>
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/90">
              <span className="font-bold text-slate-900 block mb-1">2. Farmer Slot Booking (Mobile)</span>
              <span className="text-[11px] text-slate-600">Farmers choose crop &amp; center, book slot, and receive unique text token (e.g. KQ-2026-00125).</span>
            </div>
            <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200/80">
              <span className="font-bold text-emerald-950 block mb-1">3. Center Verification (Officer)</span>
              <span className="text-[11px] text-emerald-900">Officer enters token, verifies farmer, records weight &amp; quality, issues receipt &amp; updates payment.</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        KisanQueue Digital Agricultural Procurement System &bull; Prototype Synthetic Government Dataset (Maharashtra)
      </footer>
    </div>
  );
};
