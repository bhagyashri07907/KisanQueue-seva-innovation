import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Activity, Ticket, Building2, Calendar, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { MobileLayout } from '../layouts/MobileLayout';
import { StatusStepper } from '../components/StatusStepper';
import { getBookingById, getMyBookings } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Booking } from '../types';

export const ProcurementStatusView: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { farmer } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      if (farmer) {
        const list = await getMyBookings(farmer.id);
        setBookings(list);
        if (id) {
          const target = list.find((b) => b.id === id) || (await getBookingById(id));
          setSelectedBooking(target || null);
        } else if (list.length > 0) {
          setSelectedBooking(list[0]);
        }
      }
      setLoading(false);
    };

    load();
  }, [id, farmer]);

  if (loading) {
    return (
      <MobileLayout>
        <div className="py-12 text-center space-y-2">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">{t('loading')}</p>
        </div>
      </MobileLayout>
    );
  }

  if (!selectedBooking) {
    return (
      <MobileLayout showBack backTitle={t('navHome')} onBack={() => navigate('/dashboard')}>
        <div className="p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Activity className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Booking Found</h3>
          <p className="text-xs text-slate-600">
            You don't have any bookings to track right now.
          </p>
          <Link
            to="/select-crop"
            className="inline-block px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold"
          >
            Book Slot Now
          </Link>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showBack backTitle={t('navHome')} onBack={() => navigate('/dashboard')}>
      <div className="p-4 sm:p-6 space-y-4">
        {/* Title */}
        <div className="flex justify-between items-start pt-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 leading-tight">
              {t('procurementStatusTitle')}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {t('procurementStatusSubtitle')}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* If farmer has multiple bookings, selector dropdown */}
        {bookings.length > 1 && (
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Select Booking:
            </label>
            <select
              value={selectedBooking.id}
              onChange={(e) => {
                const b = bookings.find((item) => item.id === e.target.value);
                if (b) setSelectedBooking(b);
              }}
              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600"
            >
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.cropName} ({b.date}) - Token: {b.digitalToken}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Booking Snapshot Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Digital Token</span>
              <p className="font-mono text-base font-black text-emerald-800 mt-0.5">
                {selectedBooking.digitalToken}
              </p>
            </div>
            <Link
              to={`/token/${selectedBooking.id}`}
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl hover:bg-emerald-100/70 transition shadow-2xs"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>View Pass</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 pt-1">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Crop:</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{selectedBooking.cropName}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Quantity:</span>
              <span className="font-bold text-slate-800 mt-0.5 block">{selectedBooking.expectedQuantityQuintals} Quintals</span>
            </div>
          </div>

          <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">{selectedBooking.centerName}</span>
          </div>
        </div>

        {/* 4-Step Procurement Progress Stepper */}
        <StatusStepper
          currentStatus={selectedBooking.status}
          verifiedAt={selectedBooking.verifiedAt}
          procurementAt={selectedBooking.procurementAt}
          completedAt={selectedBooking.completedAt}
        />

        {/* Link to Payment Status */}
        <Link
          to={`/payment-status/${selectedBooking.id}`}
          className="block w-full py-4 px-5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl text-center text-xs font-bold shadow-sm hover:border-emerald-300 transition"
        >
          Check Payment / DBT Status →
        </Link>
      </div>
    </MobileLayout>
  );
};
