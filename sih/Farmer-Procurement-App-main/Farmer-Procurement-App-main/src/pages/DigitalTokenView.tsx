import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Ticket,
  CalendarCheck,
  Home,
  CheckCircle2,
  AlertCircle,
  Clock,
  Activity,
  Building2,
  Wheat,
  MapPin,
  Calendar,
  Mail,
  Info
} from 'lucide-react';
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
          <p className="text-xs font-semibold text-slate-500">{t('loadingTokenStatus')}</p>
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
          <h3 className="text-lg font-bold text-slate-900">{t('noActiveToken')}</h3>
          <p className="text-xs text-slate-600 max-w-xs mx-auto">
            You don't have any confirmed slot booking tokens right now. Book a procurement slot to generate your token.
          </p>
          <Link
            to="/select-crop"
            className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-sm"
          >
            <span>{t('cardBookSlot')}</span>
          </Link>
        </div>
      </MobileLayout>
    );
  }

  const emailStatus = (booking.emailStatus || booking.email_status || '').toUpperCase();

  return (
    <MobileLayout showBack backTitle={t('navHome')} onBack={() => navigate('/dashboard')}>
      <div className="p-4 sm:p-6 space-y-4">
        {/* Confirmed Banner */}
        <div className="bg-emerald-700 text-white rounded-2xl p-5 shadow-sm space-y-2 text-center">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-1">
            <CheckCircle2 className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-xl font-black tracking-tight">{t('bookingConfirmed')}</h2>
          <p className="text-xs text-emerald-100 max-w-xs mx-auto">
            Your procurement appointment is successfully reserved in the system.
          </p>
        </div>

        {/* Email Notification Status Banner (Section 13) */}
        {emailStatus === 'SENT' ? (
          <div id="email-status-banner" className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
            <div className="p-2 bg-emerald-100 rounded-xl text-emerald-800 shrink-0 mt-0.5">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-900">{t('emailNotificationSent')}</h4>
              <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                Your booking is confirmed. A confirmation email has been sent to your registered email address.
              </p>
            </div>
          </div>
        ) : emailStatus === 'FAILED' ? (
          <div id="email-status-banner" className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-800 shrink-0 mt-0.5">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900">{t('emailNotificationFailed')}</h4>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Your booking is confirmed, but we could not send the email. Your booking details and token are available here.
              </p>
            </div>
          </div>
        ) : emailStatus === 'PENDING' ? (
          <div id="email-status-banner" className="bg-blue-50 border border-blue-300 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
            <div className="p-2 bg-blue-100 rounded-xl text-blue-800 shrink-0 mt-0.5">
              <Clock className="w-4 h-4 animate-spin" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-blue-900">{t('emailNotificationProcessing')}</h4>
              <p className="text-xs text-blue-800 mt-0.5 leading-relaxed">
                Your booking is confirmed. A confirmation email is currently being dispatched to your email address.
              </p>
            </div>
          </div>
        ) : (
          <div id="email-status-banner" className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
            <div className="p-2 bg-slate-200 rounded-xl text-slate-700 shrink-0 mt-0.5">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">{t('emailNotificationNotSent')}</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Your booking is confirmed. {farmer?.email ? 'Email service is currently offline. Your booking and token are securely stored here.' : 'No email address registered. You can add one in your Profile for future bookings.'}
              </p>
            </div>
          </div>
        )}

        {/* Title */}
        <div className="text-center pt-1 pb-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">{t('officialDocument')}</span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            {t('digitalTokenTitle')}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {t('digitalTokenSubtitle')}
          </p>
        </div>

        {/* Prominent Digital Token Component (No QR code) */}
        <TokenCard booking={booking} />

        {/* Booking Details Summary Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-100">
            Booking &amp; Center Summary
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">{t('bookingId')}</span>
              <strong className="text-slate-900 font-mono text-sm">{booking.id}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">{t('tokenLabel')}</span>
              <strong className="text-emerald-700 font-mono text-sm">{booking.digitalToken}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">{t('cropAndQuantity')}</span>
              <strong className="text-slate-900">{booking.cropName} &bull; {booking.expectedQuantityQuintals} Qtl</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">{t('dateAndTime')}</span>
              <strong className="text-slate-900">{booking.date} ({booking.timeSlot})</strong>
            </div>
            <div className="col-span-2">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">{t('procurementCenter')}</span>
              <strong className="text-slate-900">{booking.centerName || 'Assigned Center'}</strong>
              <span className="text-slate-500 text-[11px] block">{booking.centerLocation || booking.centerDistrict}</span>
            </div>
          </div>
        </div>

        {/* Required Buttons: View Booking Details & Return to Dashboard (Section 13) */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link
            id="view-booking-details-btn"
            to={`/procurement-status/${booking.id}`}
            className="py-3.5 px-4 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition"
          >
            <Activity className="w-4 h-4 text-emerald-700" />
            <span>{t('viewBookingDetails')}</span>
          </Link>

          <Link
            id="return-to-dashboard-btn"
            to="/dashboard"
            className="py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition"
          >
            <Home className="w-4 h-4 text-white" />
            <span>{t('returnDashboard')}</span>
          </Link>
        </div>

        <div className="text-center pt-1">
          <Link
            to="/bookings"
            className="text-xs font-semibold text-slate-500 hover:text-slate-700 underline"
          >
            View All My Bookings &rarr;
          </Link>
        </div>
      </div>
    </MobileLayout>
  );
};
