import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Image } from "react-native";
import {
  useFonts,
  Poppins_700Bold,
  Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";
import colors from "../styles/colors";
import { isOnboardingDone, getLanguage } from "../services/storageService";
import "../services/translationService";
import i18n from "i18next";

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const [fontsLoaded] = useFonts({
    "Poppins-Bold": Poppins_700Bold,
    "Poppins-SemiBold": Poppins_600SemiBold,
  });

  useEffect(() => {
    if (!fontsLoaded) return;

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
      if (savedLanguage) {
        i18n.changeLanguage(savedLanguage);
      }
      setTimeout(() => {
        if (done) {
          navigation.replace("Home");
        } else {
          navigation.replace("Onboarding");
        }
      }, 2500);
    };
    checkOnboarding();
  }, [fontsLoaded]); // ← dépend de fontsLoaded

  // Affiche le fond bleu pendant le chargement
  if (!fontsLoaded) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Image source={require("../assets/logo.png")} style={styles.logo} />
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
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    width: 400,
    height: 400,
    resizeMode: "contain",
    marginBottom: 20,
  },
  appName: {
    fontFamily: "Poppins-Bold",
    fontSize: 32,
    color: colors.white,
    letterSpacing: 3,
    marginBottom: 8,
  },
  tagline: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 16,
    color: colors.orange,
    letterSpacing: 1,
  },
  version: {
    position: "absolute",
    bottom: 40,
    fontFamily: "Poppins-SemiBold",
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },
});
