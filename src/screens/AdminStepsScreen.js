import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colors from "../styles/colors";

const STEPS_KEYS = ["nas", "ramq", "bank", "license", "housing"];
const STORAGE_KEY = "admin_steps_progress";

export default function AdminStepsScreen({ navigation }) {
  const { t } = useTranslation();
  const [completedSteps, setCompletedSteps] = useState([]);

  // Charger la progression sauvegardée
  useEffect(() => {
    const loadProgress = async () => {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) setCompletedSteps(JSON.parse(saved));
    };
    loadProgress();
  }, []);

  // Cocher/décocher une étape
  const toggleStep = async (stepKey) => {
    let updated;
    if (completedSteps.includes(stepKey)) {
      updated = completedSteps.filter((s) => s !== stepKey);
    } else {
      updated = [...completedSteps, stepKey];
    }
    setCompletedSteps(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const completedCount = completedSteps.length;
  const totalCount = STEPS_KEYS.length;
  const progressPercent = (completedCount / totalCount) * 100;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}> {t("onboarding.back")}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("admin.title")}</Text>
        <Text style={styles.headerSubtitle}>{t("admin.subtitle")}</Text>
      </View>

      {/* Barre de progression */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>
            {completedCount}/{totalCount} {t("admin.progress")}
          </Text>
          <Text style={styles.progressPercent}>
            {Math.round(progressPercent)}%
          </Text>
        </View>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${progressPercent}%` },
              completedCount === totalCount && styles.progressBarComplete,
            ]}
          />
        </View>
      </View>

      {/* Liste des étapes */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {STEPS_KEYS.map((stepKey, index) => {
          const isCompleted = completedSteps.includes(stepKey);
          return (
            <TouchableOpacity
              key={stepKey}
              style={[styles.stepCard, isCompleted && styles.stepCardCompleted]}
              onPress={() => toggleStep(stepKey)}
              activeOpacity={0.7}
            >
              {/* Numéro + Checkbox */}
              <View style={styles.stepLeft}>
                <View
                  style={[
                    styles.checkbox,
                    isCompleted && styles.checkboxCompleted,
                  ]}
                >
                  {isCompleted && <Text style={styles.checkboxCheck}>✓</Text>}
                </View>
              </View>

              {/* Contenu */}
              <View style={styles.stepContent}>
                <View style={styles.stepTitleRow}>
                  <Text style={styles.stepNumber}>0{index + 1}</Text>
                  <Text
                    style={[
                      styles.stepTitle,
                      isCompleted && styles.stepTitleCompleted,
                    ]}
                  >
                    {t(`admin.steps.${stepKey}.title`)}
                  </Text>
                </View>
                <Text style={styles.stepDescription}>
                  {t(`admin.steps.${stepKey}.description`)}
                </Text>
                {/* Lien cliquable */}
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL(t(`admin.steps.${stepKey}.link`))
                  }
                  style={styles.stepLink}
                >
                  <Text style={styles.stepLinkText}>
                    🔗 {t(`admin.steps.${stepKey}.linkLabel`)}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Message de félicitations */}
        {completedCount === totalCount && (
          <View style={styles.congratsCard}>
            <Text style={styles.congratsEmoji}>🎉</Text>
            <Text style={styles.congratsText}>{t("admin.congrats")}</Text>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    backgroundColor: colors.primaryBlue,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 28,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },

  // Progression
  progressContainer: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: -16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: colors.mediumGray,
    fontWeight: "500",
  },
  progressPercent: {
    fontSize: 14,
    color: colors.primaryBlue,
    fontWeight: "700",
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: colors.lightGray,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.primaryBlue,
    borderRadius: 4,
  },
  progressBarComplete: {
    backgroundColor: colors.healthGreen,
  },

  // Steps
  scrollView: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  stepLink: {
    marginTop: 8,
    marginLeft: 20,
  },
  stepLinkText: {
    fontSize: 13,
    color: colors.primaryBlue,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  stepCard: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: "transparent",
  },
  stepCardCompleted: {
    borderColor: colors.healthGreen,
    backgroundColor: "#F0FDF4",
  },
  stepLeft: {
    marginRight: 16,
    justifyContent: "center",
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxCompleted: {
    backgroundColor: colors.healthGreen,
    borderColor: colors.healthGreen,
  },
  checkboxCheck: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  stepContent: {
    flex: 1,
  },
  stepTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 8,
  },
  stepNumber: {
    fontSize: 12,
    color: colors.mediumGray,
    fontWeight: "700",
  },
  stepTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: colors.darkGray,
  },
  stepTitleCompleted: {
    color: colors.healthGreen,
    textDecorationLine: "line-through",
  },
  stepDescription: {
    fontSize: 13,
    color: colors.mediumGray,
    lineHeight: 18,
    marginLeft: 20,
  },

  // Félicitations
  congratsCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.healthGreen,
  },
  congratsEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  congratsText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.healthGreen,
    textAlign: "center",
  },
  bottomSpacing: {
    height: 24,
  },
});
