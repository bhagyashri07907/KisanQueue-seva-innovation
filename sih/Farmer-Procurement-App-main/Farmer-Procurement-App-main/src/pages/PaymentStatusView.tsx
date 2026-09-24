import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IndianRupee, ShieldCheck, HelpCircle } from 'lucide-react';
import { MobileLayout } from '../layouts/MobileLayout';
import { PaymentCard } from '../components/PaymentCard';
import { getBookingById, getMyBookings } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Booking } from '../types';

export const PaymentStatusView: React.FC = () => {
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
          const found = list.find((b) => b.id === id) || (await getBookingById(id));
          setSelectedBooking(found || null);
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
            <IndianRupee className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Payment Records</h3>
          <p className="text-xs text-slate-600">
            You don't have any procurement payment records yet.
          </p>
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
              {t('paymentStatusTitle')}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {t('paymentStatusSubtitle')}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        {/* If farmer has multiple bookings, selector */}
        {bookings.length > 1 && (
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Select Record:
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
                  {b.cropName} ({b.date}) - Payout: {b.paymentStatus}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Payment Detail Card */}
        <PaymentCard booking={selectedBooking} />

        {/* DBT Payout Guidelines Notice */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-slate-700 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Government Direct Benefit Transfer (DBT)</span>
          </div>
          <p className="leading-relaxed text-slate-600">
            All MSP payments are transferred directly to the farmer's Aadhaar-linked bank account within 3 to 7 working days following successful physical weighment and moisture verification.
          </p>
        </div>
      </div>
    </MobileLayout>
  );
};
