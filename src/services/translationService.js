import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import fr from '../locales/fr.json';
import en from '../locales/en.json';
import es from '../locales/es.json';

const initI18n = async () => {
  const savedLanguage = await AsyncStorage.getItem('user_language');

  i18n
    .use(initReactI18next)
    .init({
      compatibilityJSON: 'v3',
      lng: savedLanguage || 'fr',
      fallbackLng: 'fr',
      resources: {
        fr: { translation: fr },
        en: { translation: en },
        es: { translation: es },
      },
      interpolation: {
        escapeValue: false,
      },
    });
};

initI18n();

export default i18n;