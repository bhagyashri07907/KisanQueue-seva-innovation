import React from 'react';
import { Receipt } from '../types';
import { Printer, X, CheckCircle2, ShieldCheck, Building2 } from 'lucide-react';

interface Props {
  receipt: Receipt | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<Props> = ({ receipt, onClose }) => {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-100 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#064E3B]" />
            <span className="font-bold text-slate-900 text-sm">Official Procurement Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="print-receipt-btn"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-[#064E3B] text-white hover:bg-[#053e2f] transition-colors shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Receipt
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Official Printable Receipt Content */}
        <div className="p-6 print:p-0 font-sans text-slate-900 bg-white" id="printable-receipt">
          {/* Header */}
          <div className="border-b-2 border-[#064E3B] pb-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold tracking-wider uppercase text-[#064E3B] mb-1">
              <Building2 className="w-4 h-4" />
              Government of Maharashtra • Department of Agricultural Marketing
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">KisanQueue Procurement Receipt</h1>
            <p className="text-xs text-slate-600 mt-0.5">Minimum Support Price (MSP) Digital Procurement System</p>
          </div>

          {/* Status Ribbon */}
          <div className="my-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#064E3B]" />
              <span className="text-xs font-bold text-emerald-950">Procurement Status: {receipt.status}</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-200 text-[#064E3B]">
              Verified Digital Record
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-x-5 gap-y-3 text-sm mt-3">
            <div className="border-b border-slate-100 pb-1.5">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Receipt ID</span>
              <span className="text-sm font-bold font-mono text-[#064E3B]">{receipt.receipt_id}</span>
            </div>

            <div className="border-b border-slate-100 pb-1.5">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date of Procurement</span>
              <span className="text-xs font-medium text-slate-800">{receipt.date}</span>
            </div>

            <div className="border-b border-slate-100 pb-1.5">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Farmer Name</span>
              <span className="text-sm font-bold text-slate-900">{receipt.farmer_name}</span>
              <span className="block text-[10px] text-slate-500 font-mono">ID: {receipt.farmer_id}</span>
            </div>

            <div className="border-b border-slate-100 pb-1.5">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Digital Token</span>
              <span className="inline-block px-1.5 py-0.5 font-mono text-xs font-bold bg-slate-100 text-slate-800 rounded border border-slate-300">
                {receipt.digital_token}
              </span>
            </div>

            <div className="col-span-2 border-b border-slate-100 pb-1.5">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Procurement Center</span>
              <span className="text-xs font-semibold text-slate-800">{receipt.procurement_center}</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="block text-[10px] font-bold text-slate-500 uppercase">Crop</span>
              <span className="text-base font-bold text-slate-900">{receipt.crop}</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="block text-[10px] font-bold text-slate-500 uppercase">Procured Weight</span>
              <span className="text-base font-extrabold text-[#064E3B]">{receipt.quantity_quintals} Quintals</span>
            </div>

            {receipt.rate_per_quintal && (
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="block text-[10px] font-bold text-slate-500 uppercase">MSP Rate</span>
                <span className="text-sm font-bold text-slate-800">₹{receipt.rate_per_quintal.toLocaleString()} / Quintal</span>
              </div>
            )}

            {receipt.total_amount && (
              <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                <span className="block text-[10px] font-bold text-emerald-800 uppercase">Estimated Total Amount</span>
                <span className="text-base font-black text-[#064E3B]">₹{receipt.total_amount.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Quality & Verification Notice */}
          <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-slate-500 space-y-1">
            <p>
              • Quality Assessment: <strong className="text-slate-800">{receipt.quality_status || 'Passed (Moisture &amp; Foreign Matter Compliant)'}</strong>
            </p>
            <p>
              • Payment Mode: <strong className="text-slate-800">Direct Benefit Transfer (DBT via PFMS - Simulated)</strong>
            </p>
            <p className="text-[11px] text-slate-400 mt-2">
              Note: This is an authentic digital receipt generated by KisanQueue Agricultural Procurement System. Farmer can verify and track procurement and payment status via the KisanQueue Farmer application.
            </p>
          </div>

          {/* Signatures */}
          <div className="mt-8 pt-4 flex items-center justify-between border-t border-dashed border-slate-300 text-xs text-slate-600">
            <div>
              <span className="block font-medium">Verified by:</span>
              <span className="text-[11px] text-slate-500">Procurement Officer Digital Signature</span>
            </div>
            <div className="text-right">
              <span className="block font-medium">Digital Token Timestamp:</span>
              <span className="text-[11px] text-slate-500">{receipt.date}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#064E3B] rounded-lg hover:bg-[#053e2f] transition-colors shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};
