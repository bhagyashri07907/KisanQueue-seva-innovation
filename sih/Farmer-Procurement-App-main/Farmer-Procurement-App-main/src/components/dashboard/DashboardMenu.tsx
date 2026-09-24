import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CalendarPlus,
  CalendarCheck,
  Ticket,
  Activity,
  IndianRupee,
  User,
} from 'lucide-react';

export const DashboardMenu: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-3 pt-1">
      <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest px-1">
        Dashboard Menu
      </h2>

      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/select-crop"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-600 hover:bg-emerald-50/20 transition-all flex flex-col justify-between h-34 active:scale-98"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center">
            <CalendarPlus className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 leading-snug">
              {t('cardBookSlot')}
            </h4>
            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
              {t('cardBookSlotDesc')}
            </p>
          </div>
        </Link>

        <Link
          to="/bookings"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-600 hover:bg-emerald-50/20 transition-all flex flex-col justify-between h-34 active:scale-98"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 flex items-center justify-center">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 leading-snug">
              {t('cardMyBookings')}
            </h4>
            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
              {t('cardMyBookingsDesc')}
            </p>
          </div>
        </Link>

        <Link
          to="/token"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-600 hover:bg-emerald-50/20 transition-all flex flex-col justify-between h-34 active:scale-98"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 leading-snug">
              {t('cardDigitalToken')}
            </h4>
            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
              {t('cardDigitalTokenDesc')}
            </p>
          </div>
        </Link>

        <Link
          to="/procurement-status"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-600 hover:bg-emerald-50/20 transition-all flex flex-col justify-between h-34 active:scale-98"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 leading-snug">
              {t('cardProcurementStatus')}
            </h4>
            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
              {t('cardProcurementStatusDesc')}
            </p>
          </div>
        </Link>

        <Link
          to="/payment-status"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-600 hover:bg-emerald-50/20 transition-all flex flex-col justify-between h-34 active:scale-98"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 leading-snug">
              {t('cardPaymentStatus')}
            </h4>
            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
              {t('cardPaymentStatusDesc')}
            </p>
          </div>
        </Link>

        <Link
          to="/profile"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-600 hover:bg-emerald-50/20 transition-all flex flex-col justify-between h-34 active:scale-98"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 leading-snug">
              {t('cardProfile')}
            </h4>
            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
              {t('cardProfileDesc')}
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};
