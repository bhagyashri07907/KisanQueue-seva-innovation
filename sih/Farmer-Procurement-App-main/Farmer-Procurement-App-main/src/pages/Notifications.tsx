import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, CheckCircle2, Ticket, Clock, IndianRupee, Info, CheckCheck } from 'lucide-react';
import { MobileLayout } from '../layouts/MobileLayout';
import { getNotifications, markNotificationsAsRead } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { AppNotification } from '../types';

export const Notifications: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { farmer } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (farmer) {
      setLoading(true);
      getNotifications(farmer.id).then((data) => {
        setNotifications(data);
        setLoading(false);
      });
    }
  }, [farmer]);

  const handleMarkAllRead = async () => {
    if (farmer) {
      await markNotificationsAsRead(farmer.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'token':
        return <Ticket className="w-5 h-5 text-yellow-600" />;
      case 'payment':
        return <IndianRupee className="w-5 h-5 text-emerald-600" />;
      case 'procurement':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'booking':
      default:
        return <Bell className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <MobileLayout showBack backTitle={t('navHome')} onBack={() => navigate('/dashboard')}>
      <div className="p-4 space-y-4">
        {/* Title */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {t('notificationsTitle')}
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Procurement alerts and slot updates
            </p>
          </div>

          {notifications.some((n) => !n.read) && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {loading && (
          <div className="py-12 text-center space-y-2">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">{t('loading')}</p>
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
            <Bell className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No Notifications</h3>
            <p className="text-xs text-slate-500">You are all caught up with your updates.</p>
          </div>
        )}

        {!loading && (
          <div className="space-y-3" id="notifications-list">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  notif.read
                    ? 'bg-white border-slate-200'
                    : 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    notif.read ? 'bg-slate-100' : 'bg-white shadow-xs'
                  }`}
                >
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium shrink-0 ml-2">
                      {notif.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
};
