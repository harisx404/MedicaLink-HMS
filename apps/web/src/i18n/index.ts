import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

import enCommon from './locales/en/common.json';
import arCommon from './locales/ar/common.json';
import esCommon from './locales/es/common.json';
import frCommon from './locales/fr/common.json';

const resources = {
  en: { common: enCommon.translation.common },
  ar: { common: arCommon.translation.common },
  es: { common: esCommon.translation.common },
  fr: { common: frCommon.translation.common },
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

// Automatically handle RTL layout when language changes
i18n.on('languageChanged', (lng) => {
  const dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
});

// Set initial direction
const currentLng = i18n.language || 'en';
document.documentElement.dir = currentLng === 'ar' ? 'rtl' : 'ltr';
document.documentElement.lang = currentLng;

export default i18n;
