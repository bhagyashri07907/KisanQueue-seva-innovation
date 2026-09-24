import React, { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';
import { NotificationRecord } from '../types';
import {
  Bell,
  X,
  Smartphone,
  Send,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  Radio,
  MessageSquare
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [channelFilter, setChannelFilter] = useState<'All' | 'SMS' | 'FCM_PUSH'>('All');
  const [search, setSearch] = useState('');
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, channelFilter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (channelFilter !== 'All') params.append('channel', channelFilter);
      if (search) params.append('search', search);

      const res = await apiRequest(`/notifications?${params.toString()}`);
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (id: string) => {
    try {
      setResendingId(id);
      const res = await apiRequest(`/notifications/resend/${id}`, { method: 'POST' });
      setToastMessage(res.message || 'Notification resent successfully');
      fetchNotifications();
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      setToastMessage(`Error resending: ${err.message}`);
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setResendingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#064E3B] text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-800 rounded-lg">
              <Bell className="w-5 h-5 text-[#FFD700]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">Farmer SMS &amp; FCM Push Notification Monitor</h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-800 text-emerald-100 font-bold">
                  Live Dispatch Gateway
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-0.5">
                Automated status alerts dispatched to registered farmers during booking, verification, weighing &amp; payment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Channel:</span>
            <div className="flex bg-white rounded-lg border border-slate-200 p-0.5">
              {(['All', 'SMS', 'FCM_PUSH'] as const).map((ch) => (
                <button
                  key={ch}
                  onClick={() => setChannelFilter(ch)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    channelFilter === ch
                      ? 'bg-[#064E3B] text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {ch === 'All' ? 'All Channels' : ch === 'SMS' ? 'SMS Gateway' : 'FCM Push'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchNotifications()}
                placeholder="Search by Mobile, Token, Farmer Name..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#064E3B]"
              />
            </div>
            <button
              onClick={fetchNotifications}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {toastMessage && (
          <div className="px-6 py-2 bg-emerald-50 border-b border-emerald-200 text-xs font-bold text-[#064E3B] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#064E3B]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-[#F8FAFC]">
          {loading && notifications.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-slate-800 border-t-transparent rounded-full animate-spin" />
              <span>Querying dispatch logs...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No notification logs matched the filter criteria.
            </div>
          ) : (
            notifications.map((notif) => {
              const isSMS = notif.channel === 'SMS' || notif.channel === 'BOTH';
              const isFCM = notif.channel === 'FCM_PUSH' || notif.channel === 'BOTH';

              return (
                <div
                  key={notif.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-emerald-50 text-[#064E3B] shrink-0 mt-0.5 border border-emerald-100">
                      {isSMS && !isFCM ? (
                        <MessageSquare className="w-4 h-4" />
                      ) : isFCM && !isSMS ? (
                        <Radio className="w-4 h-4" />
                      ) : (
                        <Smartphone className="w-4 h-4" />
                      )}
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-black text-slate-900">{notif.title}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                          {notif.type}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            notif.channel === 'FCM_PUSH'
                              ? 'bg-purple-100 text-purple-800'
                              : notif.channel === 'SMS'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-[#064E3B]'
                          }`}
                        >
                          {notif.channel}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          {notif.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 font-sans leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        {notif.message}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 pt-1">
                        <span>
                          Farmer: <strong className="text-slate-800">{notif.recipient_name}</strong>
                        </span>
                        <span>
                          Mobile: <span className="font-mono text-slate-700">{notif.recipient_mobile}</span>
                        </span>
                        <span>
                          Token: <span className="font-mono font-bold text-[#064E3B]">{notif.digital_token}</span>
                        </span>
                        <span className="text-slate-400">
                          Ref: <span className="font-mono">{notif.carrier_ref}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col items-end justify-between md:justify-start gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button
                      onClick={() => handleResend(notif.id)}
                      disabled={resendingId === notif.id}
                      className="px-2.5 py-1 text-[11px] font-bold rounded bg-slate-100 hover:bg-[#064E3B] hover:text-white text-slate-700 transition-colors inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-2.5 h-2.5" />
                      {resendingId === notif.id ? 'Resending...' : 'Resend'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Total Dispatched: <strong className="text-slate-800">{notifications.length}</strong> Alerts Recorded
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            Close Monitor
          </button>
        </div>
      </div>
    </div>
  );
};
