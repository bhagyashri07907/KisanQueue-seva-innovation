import React from 'react';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { OfflineIndicator } from '../components/OfflineIndicator';
import { useAuth } from '../hooks/useAuth';

interface MobileLayoutProps {
  children: React.ReactNode;
  showBack?: boolean;
  backTitle?: string;
  onBack?: () => void;
  hideBottomNav?: boolean;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  showBack = false,
  backTitle,
  onBack,
  hideBottomNav = false,
}) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-200 flex justify-center items-start sm:py-6">
      {/* Mobile container centered on tablet/desktop */}
      <div className="w-full max-w-md bg-slate-50 min-h-screen sm:min-h-[94vh] sm:rounded-2xl shadow-xl sm:border sm:border-slate-200 flex flex-col relative overflow-x-hidden">
        <OfflineIndicator />
        <Header showBack={showBack} backTitle={backTitle} onBack={onBack} />
        <PWAInstallButton />

        {/* Content area with bottom padding for BottomNav */}
        <main className={`flex-1 flex flex-col ${!hideBottomNav && isAuthenticated ? 'pb-20' : 'pb-6'}`}>
          {children}
        </main>

        {/* Geometric Balance Official Footer Bar */}
        <footer className="bg-white border-t border-slate-200 px-4 py-2 text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center justify-between">
          <span className="truncate">Ministry of Agriculture & Farmers Welfare</span>
          <span className="text-emerald-700 font-extrabold shrink-0 ml-2">© 2026 KisanQueue</span>
        </footer>

        {!hideBottomNav && isAuthenticated && <BottomNav />}
      </div>
    </div>
  );
};
