import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, User, AlertCircle, ArrowLeft, Building2 } from 'lucide-react';
import { SyntheticDataBadge } from '../components/SyntheticDataBadge';

export const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginAdmin(username, password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-sans">
      <header className="bg-white border-b border-slate-200 py-3 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" />
            Back to Portal Selection
          </Link>
          <SyntheticDataBadge />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Top colored band */}
          <div className="bg-[#064E3B] px-8 py-6 text-white text-center relative border-b border-[#053e2f]">
            <div className="w-12 h-12 rounded-xl bg-[#FFD700] text-[#064E3B] flex items-center justify-center mx-auto mb-3 font-extrabold text-xl shadow-xs">
              KQ
            </div>
            <h2 className="text-xl font-bold tracking-tight">KisanQueue Admin Portal</h2>
            <p className="text-xs text-emerald-200/90 mt-1">State Administration &amp; Master Data Governance</p>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#064E3B] focus:border-[#064E3B] transition-colors"
                    placeholder="Enter admin username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#064E3B] focus:border-[#064E3B] transition-colors"
                    placeholder="Enter password"
                  />
                </div>
              </div>

              <button
                id="admin-login-submit"
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-[#064E3B] hover:bg-[#053e2f] text-white font-bold rounded-lg text-sm shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In to Admin Dashboard'}
              </button>
            </form>

            {/* Prototype Credentials Notice */}
            <div className="mt-6 pt-5 border-t border-slate-200">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1 text-amber-900">
                <div className="font-bold flex items-center gap-1.5">
                  <span>Prototype Demo Credentials</span>
                </div>
                <div className="font-mono text-[11px] text-amber-800">
                  Username: <strong>admin</strong> | Password: <strong>Admin@123</strong>
                </div>
                <p className="text-[10px] text-amber-700 mt-1 leading-tight">
                  In production: Passwords are hashed with bcrypt, JWT authorization is strictly validated, and
                  credentials are never hard-coded.
                </p>
              </div>

              <div className="mt-4 text-center">
                <Link to="/officer/login" className="text-xs text-emerald-800 hover:text-emerald-950 font-semibold">
                  Switch to Procurement Officer Login &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-slate-500">
        KisanQueue Admin Portal • Department of Agricultural Marketing
      </footer>
    </div>
  );
};
