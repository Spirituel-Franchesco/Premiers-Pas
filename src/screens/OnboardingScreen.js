import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
} from "react-native";
import { useTranslation } from "react-i18next";
import "../services/translationService";
import colors from "../styles/colors";
import globalStyles from "../styles/globalStyles";
import { saveLanguage, saveCity, saveOnboardingDone } from '../services/storageService';

const LANGUAGES = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];

const CITIES = [
  { code: "quebec", label: "🏙️ Québec" },
  { code: "levis", label: "🌉 Lévis" },
  { code: "montreal", label: "🗺️ Montréal" },
];

export default function OnboardingScreen({ navigation }) {
  const { t, i18n } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState("fr");
  const [selectedCity, setSelectedCity] = useState(null);

  const handleLanguageSelect = (code) => {
    setSelectedLanguage(code);
    i18n.changeLanguage(code);
  };

const handleContinue = async () => {
  if (currentStep === 0) {
    await saveLanguage(selectedLanguage);
    setCurrentStep(1);
  } else {
    await saveCity(selectedCity);
    await saveOnboardingDone();
    navigation.replace('Home');
  }
};

  return (
    <SafeAreaView style={styles.container}>
      {/* Indicateur d'étapes */}
      <View style={styles.stepsIndicator}>
        <View
          style={[styles.stepDot, currentStep === 0 && styles.stepDotActive]}
        />
        <View style={styles.stepLine} />
        <View
          style={[styles.stepDot, currentStep === 1 && styles.stepDotActive]}
        />
      </View>

      {/* Étape 0 - Choix de langue */}
      {currentStep === 0 && (
        <View style={styles.content}>
          <Text style={styles.emoji}>🌍</Text>
          <Text style={styles.title}>{t("onboarding.welcome")}</Text>
          <Text style={styles.subtitle}>{t("onboarding.chooseLanguage")}</Text>

          <View style={styles.optionsContainer}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.optionCard,
                  selectedLanguage === lang.code && styles.optionCardSelected,
                ]}
                onPress={() => handleLanguageSelect(lang.code)}
              >
                <Text style={styles.optionFlag}>{lang.flag}</Text>
                <Text
                  style={[
                    styles.optionLabel,
                    selectedLanguage === lang.code &&
                      styles.optionLabelSelected,
                  ]}
                >
                  {lang.label}
                </Text>
                {selectedLanguage === lang.code && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Étape 1 - Choix de ville */}
      {currentStep === 1 && (
        <View style={styles.content}>
          {/* Bouton Retour */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentStep(0)}
          >
            <Text style={styles.backButtonText}>← Retour</Text>
          </TouchableOpacity>

          <Text style={styles.emoji}>📍</Text>
          <Text style={styles.title}>{t("onboarding.chooseCity")}</Text>

          <View style={styles.optionsContainer}>
            {CITIES.map((city) => (
              <TouchableOpacity
                key={city.code}
                style={[
                  styles.optionCard,
                  selectedCity === city.code && styles.optionCardSelected,
                ]}
                onPress={() => setSelectedCity(city.code)}
              >
                <Text style={styles.optionLabel}>{city.label}</Text>
                {selectedCity === city.code && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Bouton Continuer */}
      <TouchableOpacity
        style={[
          styles.button,
          currentStep === 1 && !selectedCity && styles.buttonDisabled,
        ]}
        onPress={handleContinue}
        disabled={currentStep === 1 && !selectedCity}
      >
        <Text style={styles.buttonText}>
          {currentStep === 0 ? t("onboarding.continue") : t("onboarding.start")}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  stepsIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.lightGray,
  },
  stepDotActive: {
    backgroundColor: colors.primaryBlue,
    width: 24,
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: colors.lightGray,
    marginHorizontal: 8,
  },
  content: {
    flex: 1,
    alignItems: "center",
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontFamily: "Poppins-Bold",
    fontSize: 28,
    color: colors.darkGray,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    color: colors.mediumGray,
    textAlign: "center",
    marginBottom: 32,
  },
  optionsContainer: {
    width: "100%",
    gap: 12,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.lightGray,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  optionCardSelected: {
    borderColor: colors.primaryBlue,
    backgroundColor: "#EBF4FF",
  },
  optionFlag: {
    fontSize: 28,
    marginRight: 16,
  },
  optionLabel: {
    flex: 1,
    fontSize: 18,
    color: colors.darkGray,
    fontWeight: "500",
  },
  optionLabelSelected: {
    color: colors.primaryBlue,
    fontWeight: "700",
  },
  checkmark: {
    fontSize: 20,
    color: colors.primaryBlue,
    fontWeight: "700",
  },
  button: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: colors.primaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: colors.mediumGray,
    shadowOpacity: 0,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  backButton: {
  alignSelf: 'flex-start',
  marginBottom: 16,
},
backButtonText: {
  fontSize: 16,
  color: colors.primaryBlue,
  fontWeight: '600',
  marginLeft: 10,
},
});
