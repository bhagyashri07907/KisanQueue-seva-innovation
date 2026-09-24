import React, { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';
import { TechStackStatus, RedisLockInfo } from '../types';
import {
  Layers,
  X,
  Database,
  Lock,
  Cpu,
  ShieldCheck,
  Smartphone,
  BarChart2,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle2,
  Server
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const TechStackModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [techStack, setTechStack] = useState<TechStackStatus | null>(null);
  const [locks, setLocks] = useState<RedisLockInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Form for new test lock
  const [newSlotId, setNewSlotId] = useState('SLOT0002');
  const [newFarmerId, setNewFarmerId] = useState('FR005');
  const [newFarmerName, setNewFarmerName] = useState('Govind Kulkarni');

  useEffect(() => {
    if (isOpen) {
      loadSystemData();
    }
  }, [isOpen]);

  const loadSystemData = async () => {
    try {
      setLoading(true);
      const [stackRes, locksRes] = await Promise.all([
        apiRequest('/system/tech-stack'),
        apiRequest('/system/redis-locks')
      ]);
      setTechStack(stackRes);
      setLocks(locksRes.locks || []);
    } catch (err) {
      console.error('Failed to load system data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcquireLock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/system/redis-locks/acquire', {
        method: 'POST',
        body: JSON.stringify({
          slot_id: newSlotId,
          farmer_id: newFarmerId,
          farmer_name: newFarmerName,
          center_id: 'PC001',
          center_name: 'Government Procurement Center - Baramati'
        })
      });
      setToast(`Redis concurrency lock established on ${newSlotId} for ${newFarmerName}`);
      loadSystemData();
      setTimeout(() => setToast(null), 4000);
    } catch (err: any) {
      setToast(`Error: ${err.message}`);
      setTimeout(() => setToast(null), 4000);
    }
  };

  const handleReleaseLock = async (key: string) => {
    try {
      await apiRequest('/system/redis-locks/release', {
        method: 'POST',
        body: JSON.stringify({ key })
      });
      setToast(`Redis lock released: ${key}`);
      loadSystemData();
      setTimeout(() => setToast(null), 4000);
    } catch (err: any) {
      setToast(`Error releasing lock: ${err.message}`);
      setTimeout(() => setToast(null), 4000);
    }
  };

  if (!isOpen) return null;

  const stackItems = [
    {
      tech: 'React.js + TypeScript',
      icon: Cpu,
      color: 'text-blue-700 bg-blue-50 border-blue-200',
      role: 'Admin & Procurement Officer Web Portal frontend with strict type validation',
      status: 'Active (Port 3000)'
    },
    {
      tech: 'FastAPI (Python) / Node.js Microservice Gateway',
      icon: Server,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      role: 'Common REST API endpoints, JWT token authentication, and business logic routing',
      status: 'Online'
    },
    {
      tech: 'MongoDB (JSON Collections)',
      icon: Database,
      color: 'text-teal-700 bg-teal-50 border-teal-200',
      role: 'Durable stores for centers, officers, slots, bookings, procurements & payments',
      status: `${techStack?.metrics.centers_in_db || 50} Centers Indexed`
    },
    {
      tech: 'Redis In-Memory Engine',
      icon: Lock,
      color: 'text-rose-700 bg-rose-50 border-rose-200',
      role: 'Real-time slot availability, temporary checkout locks, preventing double-bookings',
      status: `${locks.length} Active Locks`
    },
    {
      tech: 'JWT & bcrypt/Passlib',
      icon: ShieldCheck,
      color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
      role: 'Role-based access control (Admin / Officer claims) and salted password hashing',
      status: 'Secured (12h Expiry)'
    },
    {
      tech: 'Axios HTTP Client',
      icon: Server,
      color: 'text-sky-700 bg-sky-50 border-sky-200',
      role: 'Frontend API client with token interceptor and standardized error response handler',
      status: 'Attached'
    },
    {
      tech: 'Recharts SVG Engine',
      icon: BarChart2,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      role: 'Interactive analytical dashboards, volume by crop charts & DBT distribution trends',
      status: 'Integrated'
    },
    {
      tech: 'FCM Push & Government SMS API',
      icon: Smartphone,
      color: 'text-purple-700 bg-purple-50 border-purple-200',
      role: 'Simulated real-time status dispatch to farmers (booking, weighing, receipts & DBT)',
      status: `${techStack?.metrics.notifications_dispatched || 5} Alerts Dispatched`
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#064E3B] text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-800 rounded-lg">
              <Layers className="w-5 h-5 text-[#FFD700]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">KisanQueue Architecture &amp; Tech Stack</h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-800 text-emerald-100 font-bold">
                  System Transparency
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-0.5">
                Full-stack technical infrastructure powering high-volume digital slot booking &amp; procurement
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

        {toast && (
          <div className="px-6 py-2 bg-emerald-50 border-b border-emerald-200 text-xs font-bold text-[#064E3B] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#064E3B]" />
            <span>{toast}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F8FAFC]">
          {/* Tech Stack Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Configured Technology Stack
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {stackItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-xl border border-slate-200 p-3 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-1.5 rounded-lg border ${item.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {item.status}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-900 leading-tight">{item.tech}</div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-normal">{item.role}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Redis Concurrency Lock Manager */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-rose-700" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Redis Temporary Slot Locks &amp; Race-Condition Barrier
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Protects slot intake capacity from simultaneous double-booking during farmer mobile checkout
                </p>
              </div>
              <button
                onClick={loadSystemData}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                Refresh Locks
              </button>
            </div>

            {/* Active Locks Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2">Redis Key</th>
                    <th className="px-3 py-2">Target Slot</th>
                    <th className="px-3 py-2">Locked For (Farmer)</th>
                    <th className="px-3 py-2">Purpose</th>
                    <th className="px-3 py-2">TTL</th>
                    <th className="px-3 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {locks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-6 text-center text-slate-400 text-xs">
                        No active Redis concurrency locks currently held in memory.
                      </td>
                    </tr>
                  ) : (
                    locks.map((lock) => (
                      <tr key={lock.key} className="hover:bg-slate-50/60">
                        <td className="px-3 py-2.5 font-mono text-[11px] font-bold text-slate-800">
                          {lock.key}
                        </td>
                        <td className="px-3 py-2.5 font-bold text-[#064E3B]">
                          {lock.slot_id}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="font-semibold text-slate-800">{lock.farmer_name || lock.farmer_id}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{lock.farmer_id}</div>
                        </td>
                        <td className="px-3 py-2.5 text-slate-600 max-w-xs truncate">
                          {lock.purpose}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                            {lock.ttl_seconds}s remaining
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <button
                            onClick={() => handleReleaseLock(lock.key)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors border border-rose-200 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            Release Lock
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Test Lock Simulator */}
            <form
              onSubmit={handleAcquireLock}
              className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/70 p-3 rounded-lg flex flex-wrap items-center gap-3"
            >
              <span className="text-xs font-bold text-slate-700">Simulate Farmer Slot Lock:</span>
              <input
                type="text"
                value={newSlotId}
                onChange={(e) => setNewSlotId(e.target.value)}
                placeholder="Slot ID (e.g. SLOT0002)"
                className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded font-mono focus:outline-none focus:ring-1 focus:ring-[#064E3B]"
              />
              <input
                type="text"
                value={newFarmerId}
                onChange={(e) => setNewFarmerId(e.target.value)}
                placeholder="Farmer ID"
                className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded font-mono focus:outline-none focus:ring-1 focus:ring-[#064E3B]"
              />
              <input
                type="text"
                value={newFarmerName}
                onChange={(e) => setNewFarmerName(e.target.value)}
                placeholder="Farmer Name"
                className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#064E3B]"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-[#064E3B] text-white hover:bg-[#053e2f] text-xs font-bold rounded shadow-2xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                Acquire Lock
              </button>
            </form>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
