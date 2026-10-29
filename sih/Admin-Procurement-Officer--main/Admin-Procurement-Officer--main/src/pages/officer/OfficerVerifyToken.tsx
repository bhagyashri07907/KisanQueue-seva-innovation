import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { apiRequest } from '../../lib/api';
import { Booking } from '../../types';
import {
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  User,
  Wheat,
  Scale,
  Calendar,
  Clock,
  ArrowRight,
  ShieldAlert,
  AlertTriangle
} from 'lucide-react';
import { SyntheticDataBadge } from '../../components/SyntheticDataBadge';

export const OfficerVerifyToken: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [tokenInput, setTokenInput] = useState(searchParams.get('token') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verifiedBooking, setVerifiedBooking] = useState<Booking | null>(null);
  const [arrivalConfirmed, setArrivalConfirmed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const paramToken = searchParams.get('token');
    if (paramToken) {
      setTokenInput(paramToken);
      handleVerify(paramToken);
    }
  }, [searchParams]);

  const handleVerify = async (tokenToVerify?: string) => {
    const token = (tokenToVerify || tokenInput).trim();
    if (!token) return;

    setError('');
    setVerifiedBooking(null);
    setArrivalConfirmed(false);
    setLoading(true);

    try {
      const res = await apiRequest<{ booking: Booking }>('/officer/verify-token', {
        method: 'POST',
        body: JSON.stringify({ token })
      });
      setVerifiedBooking(res.booking);
      if (res.booking.status === 'ARRIVED' || res.booking.status === 'Verified') {
        setArrivalConfirmed(true);
      }
    } catch (err: any) {
      setError(err.message || 'Token verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmArrival = async () => {
    if (!verifiedBooking) return;
    try {
      setLoading(true);
      const res = await apiRequest<{ booking: Booking }>(`/officer/bookings/${verifiedBooking.booking_id}/arrive`, {
        method: 'POST'
      });
      setVerifiedBooking(res.booking);
      setArrivalConfirmed(true);
    } catch (err: any) {
      setError(err.message || 'Failed to confirm arrival');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Farmer Token Verification</h1>
            <SyntheticDataBadge />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Gate check-in: manual entry and cryptographic verification of farmer procurement tokens
          </p>
        </div>
      </div>

      {/* Mandatory No QR Notice as per prompt specifications */}
      <div className="p-4 bg-[#064E3B] text-slate-200 rounded-xl text-xs flex items-start gap-3 shadow-sm border border-[#053e2f]">
        <KeyRound className="w-5 h-5 text-[#FFD700] shrink-0 mt-0.5" />
        <div>
          <strong className="block text-sm font-bold text-white mb-0.5">Manual Text Token System:</strong>
          Farmers display their alphanumeric digital token (e.g.{' '}
          <span className="font-mono text-[#FFD700] font-bold">KQ-2026-00125</span>) on their phone screen or SMS.
          Officers type the token below for instant validation against assigned center records.
        </div>
      </div>

      {/* Verification Input Box */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Enter Digital Token
            </label>
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-mono text-xs">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  id="officer-token-input"
                  type="text"
                  required
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                  placeholder="e.g. KQ-2026-00125"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#064E3B] uppercase tracking-wider"
                />
              </div>

              <button
                id="verify-token-btn"
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-[#064E3B] hover:bg-[#053e2f] text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Verify Token
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-xs text-rose-900">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-sm font-bold text-rose-950">Verification Failed:</strong>
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Verified Details Card (Section 18) */}
      {verifiedBooking && (
        <div className="bg-white rounded-xl border border-[#064E3B] p-6 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#064E3B]" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Valid Token Confirmed</h3>
                <p className="text-[11px] text-[#064E3B] font-semibold">
                  Authorized for procurement at this assigned center
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black px-2.5 py-1 bg-emerald-50 text-[#064E3B] rounded-md border border-emerald-200">
                {verifiedBooking.digital_token}
              </span>
              <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-slate-100 text-slate-800 border border-slate-200">
                Status: {verifiedBooking.status}
              </span>
            </div>
          </div>

          {/* Farmer & Booking Breakdown Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Farmer Identity
              </span>
              <span className="text-base font-bold text-slate-900 block">{verifiedBooking.farmer_name}</span>
              <span className="text-slate-600 block">Farmer ID: {verifiedBooking.farmer_id}</span>
              <span className="text-slate-600 font-mono block">Mobile: {verifiedBooking.farmer_mobile}</span>
              <span className="text-slate-600 font-mono block">
                Aadhaar (Last 4): •••• •••• {verifiedBooking.aadhaar_last4 || '4928'}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Procurement Specifications
              </span>
              <span className="text-base font-bold text-[#064E3B] block">{verifiedBooking.crop}</span>
              <span className="text-slate-700 font-bold block">
                Expected Quantity: {verifiedBooking.quantity_quintals || verifiedBooking.expected_quantity} Quintals
              </span>
              <span className="text-slate-600 block">Center: {verifiedBooking.procurement_center || verifiedBooking.center_name}</span>
              <span className="text-slate-600 block font-mono">
                Slot: {verifiedBooking.slot_date || verifiedBooking.date} ({verifiedBooking.slot_time || verifiedBooking.time_slot})
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            {!arrivalConfirmed && (verifiedBooking.status === 'BOOKED' || verifiedBooking.status === 'Booked') ? (
              <button
                id="confirm-arrival-btn"
                onClick={handleConfirmArrival}
                className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Confirm Farmer Gate Arrival
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#064E3B]">
                <CheckCircle2 className="w-4 h-4 text-[#064E3B]" />
                Gate Arrival Confirmed
              </div>
            )}

            <Link
              id="proceed-procurement-btn"
              to={`/officer/procurement?token=${verifiedBooking.digital_token}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#064E3B] hover:bg-[#053e2f] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <span>Proceed to Weighing &amp; Quality Check</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
