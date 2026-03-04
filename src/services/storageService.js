import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  LANGUAGE: 'user_language',
  CITY: 'user_city',
  ONBOARDING_DONE: 'onboarding_done',
};

// Sauvegarder la langue
export const saveLanguage = async (languageCode) => {
  await AsyncStorage.setItem(KEYS.LANGUAGE, languageCode);
};

// Sauvegarder la ville
export const saveCity = async (cityCode) => {
  await AsyncStorage.setItem(KEYS.CITY, cityCode);
};

// Marquer l'onboarding comme complété
export const saveOnboardingDone = async () => {
  await AsyncStorage.setItem(KEYS.ONBOARDING_DONE, 'true');
};

// Récupérer la langue
export const getLanguage = async () => {
  return await AsyncStorage.getItem(KEYS.LANGUAGE);
};

// Récupérer la ville
export const getCity = async () => {
  return await AsyncStorage.getItem(KEYS.CITY);
};

// Vérifier si onboarding déjà fait
export const isOnboardingDone = async () => {
  const value = await AsyncStorage.getItem(KEYS.ONBOARDING_DONE);
  return value === 'true';
};

// Tout effacer (utile pour les tests)
export const clearAll = async () => {
  await AsyncStorage.multiRemove(Object.values(KEYS));
};