import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { translateBookingStatus } from '../i18n/status';
import { useQuery } from '@tanstack/react-query';
import { CalendarCheck, Calendar, Clock, Ticket, ChevronRight, Plus, Building2, Sprout } from 'lucide-react';
import { MobileLayout } from '../layouts/MobileLayout';
import { MyBookingsSkeleton } from '../components/skeletons/MyBookingsSkeleton';
import { getMyBookings } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Booking } from '../types';

export const MyBookings: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { farmer } = useAuth();
  const [activeTab, setActiveTab] = useState<'All' | 'Confirmed' | 'Completed'>('All');

  const { data: bookings = [], isLoading: loading } = useQuery({
    queryKey: ['bookings', farmer?.id],
    queryFn: () => getMyBookings(farmer?.id),
    enabled: !!farmer,
  });

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Confirmed') return b.status === 'Booked' || b.status === 'Verified' || b.status === 'In Procurement';
    if (activeTab === 'Completed') return b.status === 'Completed';
    return true;
  });

  return (
    <MobileLayout showBack backTitle={t('navHome')} onBack={() => navigate('/dashboard')}>
      <div className="p-4 sm:p-6 space-y-4">
        {/* Title and Add Slot Action */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 leading-tight">
              {t('myBookingsTitle')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('bookingsCount', { count: bookings.length })}
            </p>
          </div>

          <Link
            to="/select-crop"
            className="flex items-center gap-1.5 py-2.5 px-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t('bookNewSlot')}</span>
          </Link>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-xs font-bold border border-slate-200">
          {(['All', 'Confirmed', 'Completed'] as const).map((tab) => (
            <button
              key={tab}
              id={`filter-tab-${tab.toLowerCase()}`}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg transition-all text-center ${
                activeTab === tab
                  ? 'bg-white text-emerald-800 shadow-2xs border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab === 'All' ? t('allFilter') : tab === 'Confirmed' ? t('activeFilter') : t('completedFilter')}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && <MyBookingsSkeleton />}

        {/* Empty State */}
        {!loading && filteredBookings.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">{t('noBookings')}</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              {t('noBookingsInCategory')}
            </p>
            <Link
              to="/select-crop"
              className="inline-block mt-2 px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs"
            >
              {t('bookNewSlot')}
            </Link>
          </div>
        )}

        {/* Bookings List */}
        {!loading && (
          <div className="space-y-3.5" id="bookings-list">
            {filteredBookings.map((booking) => {
              const isCompleted = booking.status === 'Completed';

              return (
                <Link
                  key={booking.id}
                  to={`/token/${booking.id}`}
                  id={`booking-card-${booking.id}`}
                  className="block bg-white rounded-2xl border border-slate-200 hover:border-emerald-600 p-5 shadow-sm hover:shadow-md transition-all active:scale-[0.99] space-y-3.5 group"
                >
                  {/* Top Bar: Crop & Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 flex items-center justify-center">
                        <Sprout className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-800 leading-tight group-hover:text-emerald-800 transition">
                          {booking.cropName}
                        </h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">{t('bookingIdShort')} {booking.id}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                        isCompleted
                          ? 'bg-slate-50 text-slate-600 border-slate-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {translateBookingStatus(booking.status, t)}
                    </span>
                  </div>

                  {/* Center info */}
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{booking.centerName}</span>
                  </div>

                  {/* Date & Time pill */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span className="font-semibold text-slate-700">{booking.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span className="font-semibold text-slate-700 truncate">{booking.timeSlot}</span>
                    </div>
                  </div>

                  {/* Bottom Row: Token & Quantity */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-emerald-700" />
                      <span className="font-mono text-xs font-black text-slate-800">
                        {booking.digitalToken}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700">
                        {booking.expectedQuantityQuintals} Qtl
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </MobileLayout>
  );
};
