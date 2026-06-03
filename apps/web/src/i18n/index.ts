import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Placeholder for translation files
const resources = {
  en: {
    common: {
      welcome: 'Welcome to MedicaLink HMS',
      loading: 'Loading...',
    },
  },
  ar: {
    common: {
      welcome: 'مرحبًا بك في MedicaLink HMS',
      loading: 'جاري التحميل...',
    },
  },
  fr: {
    common: {
      welcome: 'Bienvenue sur MedicaLink HMS',
      loading: 'Chargement...',
    },
  },
  es: {
    common: {
      welcome: 'Bienvenido a MedicaLink HMS',
      loading: 'Cargando...',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    defaultNS: 'common',
  });

export default i18n;
