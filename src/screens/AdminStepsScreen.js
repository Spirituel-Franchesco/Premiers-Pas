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
const DATES_KEY = "admin_steps_dates";

const getStatus = (stepKey, completedSteps) => {
  if (completedSteps.includes(stepKey)) return "completed";
  return "notStarted";
};

const getStatusColor = (status) => {
  switch (status) {
    case "completed":
      return colors.healthGreen;
    case "inProgress":
      return colors.alertYellow;
    default:
      return colors.mediumGray;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-CA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function AdminStepsScreen({ navigation }) {
  const { t } = useTranslation();
  const [completedSteps, setCompletedSteps] = useState([]);
  const [completionDates, setCompletionDates] = useState({});

  useEffect(() => {
    const loadProgress = async () => {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      const savedDates = await AsyncStorage.getItem(DATES_KEY);
      if (saved) setCompletedSteps(JSON.parse(saved));
      if (savedDates) setCompletionDates(JSON.parse(savedDates));
    };
    loadProgress();
  }, []);

  const toggleStep = async (stepKey) => {
    let updatedSteps;
    let updatedDates = { ...completionDates };

    if (completedSteps.includes(stepKey)) {
      updatedSteps = completedSteps.filter((s) => s !== stepKey);
      delete updatedDates[stepKey];
    } else {
      updatedSteps = [...completedSteps, stepKey];
      updatedDates[stepKey] = new Date().toISOString();
    }

    setCompletedSteps(updatedSteps);
    setCompletionDates(updatedDates);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSteps));
    await AsyncStorage.setItem(DATES_KEY, JSON.stringify(updatedDates));
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
          <Text style={styles.backButtonText}>{t("onboarding.back")}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("admin.title")}</Text>
        <Text style={styles.headerSubtitle}>{t("admin.subtitle")}</Text>
      </View>

      {/* Barre de progression */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>
            {t("admin.title")} : {completedCount}/{totalCount}{" "}
            {t("admin.progress")}
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
          const status = getStatus(stepKey, completedSteps);
          const isCompleted = status === "completed";
          const statusColor = getStatusColor(status);

          return (
            <View
              key={stepKey}
              style={[styles.stepCard, isCompleted && styles.stepCardCompleted]}
            >
              {/* En-tête de la carte */}
              <View style={styles.stepHeader}>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    isCompleted && styles.checkboxCompleted,
                  ]}
                  onPress={() => toggleStep(stepKey)}
                >
                  {isCompleted && <Text style={styles.checkboxCheck}>✓</Text>}
                </TouchableOpacity>

                <View style={styles.stepTitleContainer}>
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

                {/* Badge statut */}
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: statusColor + "20",
                      borderColor: statusColor,
                    },
                  ]}
                >
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {t(`admin.status.${status}`)}
                  </Text>
                </View>
              </View>

              {/* Description */}
              <Text style={styles.stepDescription}>
                {t(`admin.steps.${stepKey}.description`)}
              </Text>

              {/* Date de complétion */}
              {isCompleted && completionDates[stepKey] && (
                <Text style={styles.completionDate}>
                  ✅ {t("admin.completedOn")}{" "}
                  {formatDate(completionDates[stepKey])}
                </Text>
              )}

              <View style={styles.stepFooter}>
                <TouchableOpacity
                  onPress={() => {
                    if (isCompleted) {
                      Linking.openURL(t(`admin.steps.${stepKey}.link`));
                    } else {
                      toggleStep(stepKey);
                    }
                  }}
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: isCompleted
                        ? colors.healthGreen
                        : colors.primaryBlue,
                    },
                  ]}
                >
                  <Text style={styles.actionButtonText}>
                    {isCompleted ? t("admin.details") : t("admin.start")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* Message félicitations */}
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
    fontSize: 13,
    color: colors.mediumGray,
    fontWeight: "500",
    flex: 1,
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
  stepCard: {
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
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
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
  stepTitleContainer: {
    flex: 1,
    gap: 2,
  },
  stepNumber: {
    fontSize: 11,
    color: colors.mediumGray,
    fontWeight: "700",
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.darkGray,
  },
  stepTitleCompleted: {
    color: colors.healthGreen,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  stepDescription: {
    fontSize: 13,
    color: colors.mediumGray,
    lineHeight: 18,
    marginBottom: 8,
    marginLeft: 36,
  },
  completionDate: {
    fontSize: 12,
    color: colors.healthGreen,
    fontWeight: "600",
    marginLeft: 36,
    marginBottom: 8,
  },
  stepFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginLeft: 36,
    marginTop: 4,
  },
  stepLink: {
    flex: 1,
  },
  stepLinkText: {
    fontSize: 12,
    color: colors.primaryBlue,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "700",
  },

  // Félicitations
  congratsCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
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
