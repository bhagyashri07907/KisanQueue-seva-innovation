import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, X } from 'lucide-react';
import { AppNotification } from '../types';
import { useAuth } from '../hooks/useAuth';
import { getNotifications, markNotificationAsRead } from '../services/api';
import { useTranslation } from 'react-i18next';

const DISMISSED_KEY = 'kq_dismissed_notification_popups';

function getDismissedIds(): Set<string> {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(DISMISSED_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

export const NotificationPopups: React.FC = () => {
  const { farmer } = useAuth();
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState<AppNotification[]>([]);

  const refresh = useCallback(async () => {
    if (!farmer) {
      setAlerts([]);
      return;
    }
    const dismissed = getDismissedIds();
    const messages = await getNotifications(farmer.id);
    setAlerts(messages.filter((message) => !message.read && !dismissed.has(message.id)));
  }, [farmer]);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 12000);
    const onFocus = () => void refresh();
    window.addEventListener('focus', onFocus);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  }, [refresh]);

  const hidePopup = useCallback((id: string) => {
    const dismissed = getDismissedIds();
    dismissed.add(id);
    sessionStorage.setItem(DISMISSED_KEY, JSON.stringify([...dismissed]));
    setAlerts((current) => current.filter((alert) => alert.id !== id));
  }, []);

  const dismiss = useCallback(async (id: string) => {
    hidePopup(id);
    try {
      await markNotificationAsRead(id);
    } catch {
      // Keep the alert dismissed for this tab if the network is temporarily unavailable.
    }
  }, [hidePopup]);

  if (!farmer || alerts.length === 0) return null;

  return (
    <section aria-label={t('newFarmerMessages')} className="px-3 pt-3 space-y-2" id="farmer-notification-popups">
      {alerts.map((alert) => (
        <NotificationPopupItem key={alert.id} alert={alert} onDismiss={dismiss} onTimeout={hidePopup} />
      ))}
    </section>
  );
};

const NotificationPopupItem: React.FC<{
  alert: AppNotification;
  onDismiss: (id: string) => void;
  onTimeout: (id: string) => void;
}> = ({ alert, onDismiss, onTimeout }) => {
  const { t } = useTranslation();
  useEffect(() => {
    const timer = window.setTimeout(() => onTimeout(alert.id), 7000);
    return () => window.clearTimeout(timer);
  }, [alert.id, onTimeout]);

  return (
    <div role="status" className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-3 shadow-sm">
      <div className="flex items-start gap-2.5">
        <Bell className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold text-emerald-950">{alert.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-emerald-900">{alert.message}</p>
          {alert.timestamp && <p className="mt-1 text-[10px] text-emerald-700">{alert.timestamp}</p>}
          <Link to={alert.linkTo || '/notifications'} onClick={() => void onDismiss(alert.id)} className="mt-2 inline-block text-[11px] font-bold text-emerald-800 underline">
            {t('viewMessage')}
          </Link>
        </div>
        <button type="button" aria-label={t('dismissMessage')} onClick={() => void onDismiss(alert.id)} className="rounded-md p-1 text-emerald-700 hover:bg-emerald-100">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
