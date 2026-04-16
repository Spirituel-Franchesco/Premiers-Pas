import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";

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
      return "#2A9D8F";
    case "inProgress":
      return "#F4A261";
    default:
      return "#999999";
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
  const { theme } = useTheme();
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

  const styles = makeStyles(theme);

  return (
    <View style={styles.container}>
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

              <Text style={styles.stepDescription}>
                {t(`admin.steps.${stepKey}.description`)}
              </Text>

              {isCompleted && completionDates[stepKey] && (
                <Text style={styles.completionDate}>
                  ✅ {t("admin.completedOn")}{" "}
                  {formatDate(completionDates[stepKey])}
                </Text>
              )}

              <View style={styles.stepFooter}>
                <TouchableOpacity
                  onPress={() => {
                    if (isCompleted)
                      Linking.openURL(t(`admin.steps.${stepKey}.link`));
                    else toggleStep(stepKey);
                  }}
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor: isCompleted ? "#2A9D8F" : theme.primary,
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

        {completedCount === totalCount && (
          <View style={styles.congratsCard}>
            <Text style={styles.congratsEmoji}>🎉</Text>
            <Text style={styles.congratsText}>{t("admin.congrats")}</Text>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const makeStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    header: {
      backgroundColor: theme.header,
      paddingHorizontal: 24,
      paddingTop: 50,
      paddingBottom: 28,
    },
    backButton: { marginBottom: 12 },
    backButtonText: {
      color: "rgba(255,255,255,0.8)",
      fontSize: 14,
      fontWeight: "600",
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: "#fff",
      marginBottom: 4,
    },
    headerSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.7)" },
    progressContainer: {
      backgroundColor: theme.card,
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 16,
      padding: 16,
      elevation: 4,
    },
    progressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    progressText: {
      fontSize: 13,
      color: theme.subtext,
      fontWeight: "500",
      flex: 1,
    },
    progressPercent: { fontSize: 14, color: theme.primary, fontWeight: "700" },
    progressBarBackground: {
      height: 8,
      backgroundColor: theme.border,
      borderRadius: 4,
      overflow: "hidden",
    },
    progressBarFill: {
      height: "100%",
      backgroundColor: theme.primary,
      borderRadius: 4,
    },
    progressBarComplete: { backgroundColor: "#2A9D8F" },
    scrollView: { marginTop: 16, paddingHorizontal: 16 },
    stepCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      elevation: 2,
      borderWidth: 2,
      borderColor: "transparent",
    },
    stepCardCompleted: {
      borderColor: "#2A9D8F",
      backgroundColor: theme.background,
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
      borderColor: theme.border,
      justifyContent: "center",
      alignItems: "center",
    },
    checkboxCompleted: { backgroundColor: "#2A9D8F", borderColor: "#2A9D8F" },
    checkboxCheck: { color: "#fff", fontSize: 16, fontWeight: "700" },
    stepTitleContainer: { flex: 1, gap: 2 },
    stepNumber: { fontSize: 11, color: theme.subtext, fontWeight: "700" },
    stepTitle: { fontSize: 14, fontWeight: "700", color: theme.text },
    stepTitleCompleted: { color: "#2A9D8F" },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 20,
      borderWidth: 1,
    },
    statusText: { fontSize: 11, fontWeight: "700" },
    stepDescription: {
      fontSize: 13,
      color: theme.subtext,
      lineHeight: 18,
      marginBottom: 8,
      marginLeft: 36,
    },
    completionDate: {
      fontSize: 12,
      color: "#2A9D8F",
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
    actionButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    actionButtonText: { color: "#fff", fontSize: 12, fontWeight: "700" },
    congratsCard: {
      backgroundColor: theme.background,
      borderRadius: 16,
      padding: 20,
      alignItems: "center",
      marginBottom: 12,
      borderWidth: 2,
      borderColor: "#2A9D8F",
    },
    congratsEmoji: { fontSize: 40, marginBottom: 8 },
    congratsText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#2A9D8F",
      textAlign: "center",
    },
  });
