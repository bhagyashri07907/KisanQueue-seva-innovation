import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiRequest } from '../../lib/api';
import { Booking, Receipt } from '../../types';
import {
  Scale,
  ShieldCheck,
  ReceiptText,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Wheat,
  Calculator,
  Printer,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import { SyntheticDataBadge } from '../../components/SyntheticDataBadge';
import { ReceiptModal } from '../../components/ReceiptModal';

const MSP_RATES: Record<string, number> = {
  Soybean: 4892,
  Wheat: 2275,
  'Gram (Chana)': 5440,
  Cotton: 6620,
  'Tur (Arhar)': 7000,
  Jowar: 3180,
  Bajra: 2500,
  Maize: 2090,
  Groundnut: 6377,
};

export const OfficerProcurement: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [tokenInput, setTokenInput] = useState(searchParams.get('token') || 'KQ-2026-00125');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Workflow State: Step 1 (Token), Step 2 (Weighing), Step 3 (Quality), Step 4 (Complete & Receipt)
  const [currentStep, setCurrentStep] = useState(1);

  // Weighing State
  const [grossWeight, setGrossWeight] = useState<number>(27.2);
  const [tareWeight, setTareWeight] = useState<number>(2.5);
  const netWeight = Math.max(0, Number((grossWeight - tareWeight).toFixed(2)));

  // Quality State
  const [moisturePercent, setMoisturePercent] = useState<number>(10.8);
  const [foreignMatterPercent, setForeignMatterPercent] = useState<number>(1.2);
  const [qualityStatus, setQualityStatus] = useState<'Passed' | 'Rejected'>('Passed');
  const [qualityNotes, setQualityNotes] = useState('Clean grain, moisture within 12% MSP threshold.');

  // Receipt Modal
  const [generatedReceipt, setGeneratedReceipt] = useState<Receipt | null>(null);
  const [submittingProcurement, setSubmittingProcurement] = useState(false);

  // Auto-calculate quality status
  useEffect(() => {
    if (moisturePercent > 12.0 || foreignMatterPercent > 2.0) {
      setQualityStatus('Rejected');
    } else {
      setQualityStatus('Passed');
    }
  }, [moisturePercent, foreignMatterPercent]);

  useEffect(() => {
    const paramToken = searchParams.get('token');
    if (paramToken) {
      setTokenInput(paramToken);
      fetchBookingDetails(paramToken);
    }
  }, [searchParams]);

  const fetchBookingDetails = async (token: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await apiRequest<{ booking: Booking }>('/officer/verify-token', {
        method: 'POST',
        body: JSON.stringify({ token: token.trim() })
      });
      setBooking(res.booking);
      // Pre-fill realistic weights based on expected quantity
      const expected = res.booking.quantity_quintals || res.booking.expected_quantity || 25;
      setGrossWeight(Number((expected + 2.5).toFixed(2)));
      setTareWeight(2.5);
      setCurrentStep(2);
    } catch (err: any) {
      setError(err.message || 'Token verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    fetchBookingDetails(tokenInput.trim());
  };

  const cropMsp = booking ? MSP_RATES[booking.crop] || 4892 : 4892;
  const totalAmount = Math.round(netWeight * cropMsp);

  const handleCompleteProcurement = async () => {
    if (!booking) return;
    setSubmittingProcurement(true);
    try {
      const payload = {
        booking_id: booking.booking_id,
        gross_weight: grossWeight,
        tare_weight: tareWeight,
        net_weight: netWeight,
        moisture_percent: moisturePercent,
        foreign_matter_percent: foreignMatterPercent,
        quality_status: qualityStatus,
        msp_rate: cropMsp,
        total_amount: totalAmount,
        notes: qualityNotes
      };

      const res = await apiRequest<{ receipt: Receipt; booking: Booking }>('/officer/procure', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setBooking(res.booking);
      setGeneratedReceipt(res.receipt);
      setCurrentStep(4);
    } catch (err: any) {
      alert(err.message || 'Failed to complete procurement');
    } finally {
      setSubmittingProcurement(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Procurement Execution Process</h1>
            <SyntheticDataBadge />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            End-to-end field protocol: Token &rarr; Digital Weighment &rarr; Quality Testing &rarr; Receipt Generation
          </p>
        </div>
      </div>

      {/* 5-Step Visual Progress Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs">
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          <div className={`p-2 rounded-lg font-bold ${currentStep >= 1 ? 'bg-[#064E3B] text-[#FFD700]' : 'text-slate-400 bg-slate-50'}`}>
            <span className="block text-[10px] uppercase tracking-wider opacity-90">Step 1</span>
            <span>Token Check</span>
          </div>
          <div className={`p-2 rounded-lg font-bold ${currentStep >= 2 ? 'bg-[#064E3B] text-[#FFD700]' : 'text-slate-400 bg-slate-50'}`}>
            <span className="block text-[10px] uppercase tracking-wider opacity-90">Step 2</span>
            <span>Weighbridge</span>
          </div>
          <div className={`p-2 rounded-lg font-bold ${currentStep >= 3 ? 'bg-[#064E3B] text-[#FFD700]' : 'text-slate-400 bg-slate-50'}`}>
            <span className="block text-[10px] uppercase tracking-wider opacity-90">Step 3</span>
            <span>Quality Lab</span>
          </div>
          <div className={`p-2 rounded-lg font-bold ${currentStep >= 4 ? 'bg-[#064E3B] text-[#FFD700]' : 'text-slate-400 bg-slate-50'}`}>
            <span className="block text-[10px] uppercase tracking-wider opacity-90">Step 4</span>
            <span>Receipt Issued</span>
          </div>
          <div className={`p-2 rounded-lg font-bold ${currentStep >= 4 ? 'bg-purple-900 text-purple-100' : 'text-slate-400 bg-slate-50'}`}>
            <span className="block text-[10px] uppercase tracking-wider opacity-90">Step 5</span>
            <span>PFMS / DBT</span>
          </div>
        </div>
      </div>

      {/* Step 1: Token Lookup if no booking loaded yet */}
      {!booking && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
          <h2 className="text-sm font-bold text-slate-900 mb-2">Step 1: Enter Token for Active Procurement</h2>
          <form onSubmit={handleManualTokenSubmit} className="flex gap-3">
            <input
              type="text"
              required
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
              placeholder="e.g. KQ-2026-00125"
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 uppercase text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#064E3B]"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-[#064E3B] hover:bg-[#053e2f] text-white font-bold text-xs rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Validating...' : 'Load Booking'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}

      {/* If Booking is loaded, show procurement workflow steps */}
      {booking && (
        <div className="space-y-6">
          {/* Active Farmer & Crop Context Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Active Procurement Candidate
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  {booking.farmer_name} <span className="text-slate-400 text-sm font-mono">({booking.farmer_id})</span>
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold bg-slate-100 px-2.5 py-1 rounded border border-slate-300">
                  {booking.digital_token}
                </span>
                <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
                  Status: {booking.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 text-xs">
              <div>
                <span className="text-slate-500 block">Crop Type:</span>
                <strong className="text-slate-800 text-sm">{booking.crop}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Expected Quantity:</span>
                <strong className="text-slate-800 text-sm">{booking.quantity_quintals || booking.expected_quantity} Quintals</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Government MSP Rate:</span>
                <strong className="text-emerald-700 text-sm font-mono">₹{cropMsp.toLocaleString()} / Q</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Farmer Contact:</span>
                <span className="text-slate-700 font-mono">{booking.farmer_mobile}</span>
              </div>
            </div>
          </div>

          {/* Step 2: Digital Weighbridge Form */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-700" />
                <h2 className="text-sm font-bold text-slate-900">Step 2: Electronic Weighbridge Entry</h2>
              </div>
              <span className="text-xs text-slate-500 font-mono">Precision: 0.01 Quintals</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gross Weight (Loaded Vehicle / Bags)</label>
                <div className="relative">
                  <input
                    id="gross-weight-input"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={grossWeight}
                    onChange={(e) => setGrossWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold text-sm"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400 font-bold">Q</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tare Weight (Empty Vehicle / Bags)</label>
                <div className="relative">
                  <input
                    id="tare-weight-input"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={tareWeight}
                    onChange={(e) => setTareWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono font-bold text-sm"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400 font-bold">Q</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Net Procured Weight (Gross &minus; Tare)
                </label>
                <div className="px-3 py-2 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-900 font-mono font-black text-sm flex items-center justify-between">
                  <span>{netWeight} Quintals</span>
                  <span className="text-[10px] font-bold uppercase text-emerald-700">Calculated</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Moisture & Quality Assessment */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-700" />
                <h2 className="text-sm font-bold text-slate-900">Step 3: Moisture &amp; Quality Inspection</h2>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  qualityStatus === 'Passed' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                Inspection Result: {qualityStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Moisture Content (% &bull; Standard Max 12.0%)
                </label>
                <div className="relative">
                  <input
                    id="moisture-input"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    required
                    value={moisturePercent}
                    onChange={(e) => setMoisturePercent(Number(e.target.value))}
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-slate-900 font-mono font-bold text-sm ${
                      moisturePercent > 12.0 ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                    }`}
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400 font-bold">%</span>
                </div>
                {moisturePercent > 12.0 && (
                  <span className="text-rose-600 text-[11px] mt-1 block">
                    Moisture exceeds government procurement specification (12.0%).
                  </span>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Foreign Matter / Inerts (% &bull; Standard Max 2.0%)
                </label>
                <div className="relative">
                  <input
                    id="foreign-matter-input"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    required
                    value={foreignMatterPercent}
                    onChange={(e) => setForeignMatterPercent(Number(e.target.value))}
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-slate-900 font-mono font-bold text-sm ${
                      foreignMatterPercent > 2.0 ? 'border-rose-400 bg-rose-50/50' : 'border-slate-300'
                    }`}
                  />
                  <span className="absolute right-3 top-2.5 text-slate-400 font-bold">%</span>
                </div>
              </div>

              <div className="col-span-full">
                <label className="block font-semibold text-slate-700 mb-1">Quality Assessment Notes</label>
                <input
                  type="text"
                  value={qualityNotes}
                  onChange={(e) => setQualityNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Financial Calculation & Receipt Generation Confirmation */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-indigo-700" />
                <h2 className="text-sm font-bold text-slate-900">Step 4: Procurement Valuation &amp; Finalization</h2>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Net Weight Procured:</span>
                <span className="text-lg font-bold text-slate-900">{netWeight} Quintals</span>
              </div>
              <div>
                <span className="text-slate-500 block">MSP Support Price:</span>
                <span className="text-lg font-bold text-slate-900 font-mono">₹{cropMsp.toLocaleString()} / Q</span>
              </div>
              <div>
                <span className="text-slate-500 block">Total Disbursable Amount:</span>
                <span className="text-2xl font-black text-emerald-800 font-mono">₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Simulated Payment Flow Preview (Step 5) */}
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 text-xs text-purple-950 flex items-start gap-2.5">
              <CreditCard className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
              <div>
                <strong>Step 5 (Simulated Payment Notice):</strong> Submitting this procurement issues an official
                government receipt and schedules DBT credit of <strong>₹{totalAmount.toLocaleString()}</strong> to the
                farmer's Aadhaar-linked PFMS bank account.
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setBooking(null);
                  setCurrentStep(1);
                }}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Reset / Change Token
              </button>

              <button
                id="submit-procurement-btn"
                type="button"
                disabled={submittingProcurement || qualityStatus === 'Rejected'}
                onClick={handleCompleteProcurement}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#064E3B] hover:bg-[#053e2f] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {submittingProcurement ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating Official Digital Receipt...
                  </>
                ) : (
                  <>
                    <ReceiptText className="w-4 h-4" />
                    Complete Procurement &amp; Issue Receipt
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Receipt Modal Popup upon completion */}
      <ReceiptModal receipt={generatedReceipt} onClose={() => setGeneratedReceipt(null)} />
    </div>
  );
};
