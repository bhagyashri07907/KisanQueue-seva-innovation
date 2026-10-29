import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { translateBookingStatus } from '../i18n/status';
import { localizePersonName } from '../i18n/personName';
import {
  CalendarPlus,
  CalendarCheck,
  Ticket,
  Activity,
  IndianRupee,
  User,
  ChevronRight,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { MobileLayout } from '../layouts/MobileLayout';
import { useAuth } from '../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { getMyBookings } from '../services/api';
import { DashboardSkeleton } from '../components/skeletons/DashboardSkeleton';
import { DashboardMenu } from '../components/dashboard/DashboardMenu';
import { Booking } from '../types';

export const Dashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { farmer } = useAuth();
  const navigate = useNavigate();
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings', farmer?.id],
    queryFn: () => getMyBookings(farmer?.id),
    enabled: !!farmer && !!localStorage.getItem('kq_farmer_token'),
  });

  const latestBooking = bookings.length > 0 ? bookings[0] : null;

  if (isLoading) {
    return (
      <MobileLayout>
        <DashboardSkeleton />
      </MobileLayout>
    );
  }

  const firstName = localizePersonName(farmer?.fullName?.split(' ')[0] || 'Farmer', i18n.resolvedLanguage || i18n.language);

  return (
    <MobileLayout>
      <div className="p-4 sm:p-6 space-y-4">
        {/* Welcome Card */}
        <div id="dashboard-welcome-banner" className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-start justify-between relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-50 rounded-full opacity-60 pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-800 border border-emerald-200 uppercase tracking-widest mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t('portalBadge')}</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-800">
              {t('welcome')}, {firstName}
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
              {t('farmerId')}: <span className="text-slate-700">{farmer?.farmerId || 'MH-PUN-2026-0814'}</span>
            </p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {farmer?.village}, Tal. {farmer?.taluka}, Dist. {farmer?.district}
            </p>
          </div>
          <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center text-2xl shrink-0 shadow-xs">
            🌾
          </div>
        </div>

        {/* Hero Section: Book New Procurement Slot */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-black text-slate-800 leading-tight">
                {t('bookNewProcurementSlot')}
              </h2>
              <p className="text-slate-500 text-xs mt-1">
                {t('bookSlotDescription')}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <CalendarPlus className="w-6 h-6 stroke-[2.2]" />
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs mb-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                {t('intakeDistrict')}
              </span>
              <span className="font-bold text-slate-900">
                {farmer?.district || 'Pune'} (Tal. {farmer?.taluka || 'Baramati'})
              </span>
            </div>
            <Link
              to="/select-location"
              className="text-emerald-800 font-bold underline text-[11px] hover:text-emerald-950"
            >
              {t('changeLocation')}
            </Link>
          </div>

          <Link
            to="/select-location"
            id="btn-book-slot-hero"
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-4 rounded-2xl font-bold text-base shadow-lg shadow-emerald-700/20 active:scale-[0.99] flex items-center justify-center gap-2 transition"
          >
            <span>{t('confirmLocationStart')}</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Geometric Metric Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">
              {t('totalSold')}
            </p>
            <p className="text-3xl font-black text-slate-900 leading-none">
              145 <span className="text-sm font-semibold text-slate-400">{t('quintals')}</span>
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1.5">
              {t('activeBookings')}
            </p>
            <p className="text-3xl font-black text-emerald-800 leading-none">
              {latestBooking ? '01' : '00'}
            </p>
          </div>
        </div>

        {/* Active Digital Token (Geometric Balance style) */}
        {latestBooking && (
          <div id="dashboard-active-token-preview" className="bg-white rounded-2xl p-6 shadow-md border-t-4 border-emerald-600 border-x border-b border-slate-200 relative overflow-hidden space-y-4">
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-50 rounded-full opacity-60 pointer-events-none" />
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {t('activeToken')}
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                {translateBookingStatus(latestBooking.status, t)}
              </span>
            </div>

            <div className="text-center py-2">
              <div className="inline-block bg-slate-50 px-4 py-1.5 rounded-lg border border-slate-200 mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('tokenIdLabel')}</span>
              </div>
              <p className="text-3xl sm:text-4xl font-black tracking-tighter text-emerald-800 font-mono">
                {latestBooking.digitalToken}
              </p>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-4 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-medium">{t('cropLabel')}</span>
                <span className="font-bold text-slate-900">{latestBooking.cropName}</span>
              </div>
              <div className="flex justify-between py-1 border-t border-slate-100">
                <span className="text-slate-400 font-medium">{t('centerLabelPlain')}</span>
                <span className="font-bold text-slate-900 text-right truncate max-w-[180px]">{latestBooking.centerName}</span>
              </div>
              <div className="flex justify-between py-1 border-t border-slate-100">
                <span className="text-slate-400 font-medium">{t('dateTimeLabel')}</span>
                <span className="font-bold text-slate-900">{latestBooking.date} • {latestBooking.timeSlot}</span>
              </div>
            </div>

            <Link
              to={`/token/${latestBooking.id}`}
              className="mt-2 bg-slate-800 hover:bg-slate-900 text-white p-3.5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold tracking-wider uppercase shadow-sm transition"
            >
              <span>{t('cardDigitalToken')}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Dashboard Menu Section */}
        <DashboardMenu />

        {/* Support Card (from Geometric Balance Design) */}
        <div className="bg-emerald-900 rounded-2xl p-6 text-white shadow-sm">
          <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">{t('support')}</p>
          <p className="text-sm text-emerald-100 mb-4">
            {t('tollFreeSupport')}
          </p>
          <a
            href="tel:18001208040"
            className="w-full bg-emerald-700 hover:bg-emerald-600 active:scale-[0.99] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-center block shadow-sm transition"
          >
            {t('callTollFree')}
          </a>
        </div>
      </div>
    </MobileLayout>
  );
};
