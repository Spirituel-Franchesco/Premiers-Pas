import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useFonts, Poppins_700Bold, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import colors from '../styles/colors';
import { isOnboardingDone, getLanguage } from '../services/storageService';
import '../services/translationService';
import i18n from 'i18next';

export default function SplashScreen({ navigation }) {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  const [fontsLoaded] = useFonts({
    'Poppins-Bold': Poppins_700Bold,
    'Poppins-SemiBold': Poppins_600SemiBold,
  });

  useEffect(() => {
    // Animation d'entrée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Vérifier si onboarding déjà fait
    const checkOnboarding = async () => {
      const done = await isOnboardingDone();
      const savedLanguage = await getLanguage();

      // Restaurer la langue sauvegardée
      if (savedLanguage) {
        i18n.changeLanguage(savedLanguage);
      }

      setTimeout(() => {
        if (done) {
          navigation.replace('Home');
        } else {
          navigation.replace('Onboarding');
        }
      }, 2500);
    };

    checkOnboarding();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Text style={styles.logoEmoji}>👣</Text>
        <Text style={styles.appName}>PREMIERS PAS</Text>
        <Text style={styles.tagline}>Bienvenue au Québec</Text>
      </Animated.View>
      <Text style={styles.version}>v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryBlue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  appName: {
    fontFamily: 'Poppins-Bold',
    fontSize: 32,
    color: colors.white,
    letterSpacing: 3,
    marginBottom: 8,
  },
  tagline: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: colors.orange,
    letterSpacing: 1,
  },
  version: {
    position: 'absolute',
    bottom: 40,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
});