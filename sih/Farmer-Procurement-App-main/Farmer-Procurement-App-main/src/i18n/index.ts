import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../../public/locales/en/translation.json';
import hi from '../../public/locales/hi/translation.json';
import mr from '../../public/locales/mr/translation.json';

const supportedLanguages = ['en', 'hi', 'mr'] as const;
const storedLanguage = typeof window !== 'undefined' ? localStorage.getItem('kq_language') : null;
const savedLang = storedLanguage && supportedLanguages.includes(storedLanguage as (typeof supportedLanguages)[number])
  ? storedLanguage
  : 'en';

i18n
  .use(initReactI18next)
  .init({
    lng: savedLang,
    fallbackLng: 'en',
    supportedLngs: [...supportedLanguages],
    load: 'languageOnly',
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      mr: { translation: mr },
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
