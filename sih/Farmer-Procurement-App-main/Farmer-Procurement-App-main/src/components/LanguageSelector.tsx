import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  compact?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ compact = false }) => {
  const { i18n } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('kq_language', lang);
  };

  const languages = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'hi', label: 'हिंदी', short: 'हिंदी' },
    { code: 'mr', label: 'मराठी', short: 'मराठी' },
  ];

  if (compact) {
    return (
      <div id="language-selector-compact" className="inline-flex items-center rounded-full bg-emerald-900/80 p-0.5 text-xs font-semibold text-white shadow-inner">
        {languages.map((l) => {
          const isActive = i18n.language === l.code;
          return (
            <button
              key={l.code}
              id={`lang-btn-${l.code}`}
              type="button"
              onClick={() => changeLanguage(l.code)}
              className={`px-2.5 py-0.5 rounded-full transition-all text-[11px] ${
                isActive
                  ? 'bg-white text-emerald-800 shadow-sm font-bold'
                  : 'text-emerald-100 hover:text-white font-medium'
              }`}
            >
              {l.short}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div id="language-selector-full" className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
      <Globe className="w-4 h-4 text-emerald-700 ml-2 shrink-0" />
      <div className="flex gap-1.5 w-full">
        {languages.map((l) => {
          const isActive = i18n.language === l.code;
          return (
            <button
              key={l.code}
              id={`lang-full-btn-${l.code}`}
              type="button"
              onClick={() => changeLanguage(l.code)}
              className={`flex-1 py-2 px-3 text-xs sm:text-sm font-bold rounded-xl transition-all text-center ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {l.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
