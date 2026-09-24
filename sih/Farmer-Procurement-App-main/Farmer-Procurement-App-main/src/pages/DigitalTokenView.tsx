import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Ticket, CalendarCheck, Home, Download, Share2, Activity } from 'lucide-react';
import { MobileLayout } from '../layouts/MobileLayout';
import { TokenCard } from '../components/TokenCard';
import { getBookingById, getMyBookings } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Booking } from '../types';

export const DigitalTokenView: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { farmer } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      if (id) {
        // First try looking up by booking ID
        let found = await getBookingById(id);
        if (!found) {
          // If not found by booking_id, it might be a digital token value — search through all bookings
          const list = await getMyBookings();
          found = list.find(b => b.digitalToken === id || b.id === id) || null;
        }
        setBooking(found || null);
      } else if (farmer) {
        // If visiting /token without ID, get latest booking
        const list = await getMyBookings(farmer.id);
        if (list.length > 0) {
          setBooking(list[0]);
        }
      }
      setLoading(false);
    };

    fetchBooking();
  }, [id, farmer]);

  if (loading) {
    return (
      <MobileLayout>
        <div className="p-8 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Loading your digital token...</p>
        </div>
      </MobileLayout>
    );
  }

  if (!booking) {
    return (
      <MobileLayout showBack backTitle={t('navHome')} onBack={() => navigate('/dashboard')}>
        <div className="p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
            <Ticket className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Active Digital Token</h3>
          <p className="text-xs text-slate-600 max-w-xs mx-auto">
            You don't have any confirmed slot booking tokens right now. Book a procurement slot to generate your token.
          </p>
          <Link
            to="/select-crop"
            className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-sm"
          >
            <span>Book Procurement Slot</span>
          </Link>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showBack backTitle={t('navHome')} onBack={() => navigate('/dashboard')}>
      <div className="p-4 sm:p-6 space-y-4">
        {/* Title */}
        <div className="text-center pt-2 pb-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Official Document</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            {t('digitalTokenTitle')}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t('digitalTokenSubtitle')}
          </p>
        </div>

        {/* Prominent Digital Token Component (No QR code) */}
        <TokenCard booking={booking} />

        {/* Quick action buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link
            to={`/procurement-status/${booking.id}`}
            className="py-3.5 px-4 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition"
          >
            <Activity className="w-4 h-4 text-emerald-700" />
            <span>Track Status</span>
          </Link>

          <Link
            to="/bookings"
            className="py-3.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition"
          >
            <CalendarCheck className="w-4 h-4 text-slate-500" />
            <span>All Bookings</span>
          </Link>
        </div>
      </div>
    </MobileLayout>
  );
};
