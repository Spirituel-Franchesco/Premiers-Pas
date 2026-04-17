import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";

const GUIDES = [
  {
    key: "welcome",
    emoji: "👋",
    color: "#E3F2FD",
  },
  {
    key: "navigation",
    emoji: "🗺️",
    color: "#F3E5F5",
  },
  {
    key: "admin",
    emoji: "📋",
    color: "#E8F5E9",
  },
  {
    key: "transport",
    emoji: "🚌",
    color: "#FFF3E0",
  },
  {
    key: "climate",
    emoji: "❄️",
    color: "#E0F7FA",
  },
  {
    key: "health",
    emoji: "🏥",
    color: "#FCE4EC",
  },
  {
    key: "vocabulary",
    emoji: "💬",
    color: "#E8F5E9",
  },
  {
    key: "daily",
    emoji: "🏪",
    color: "#FFF8E1",
  },
  {
    key: "settings",
    emoji: "⚙️",
    color: "#F3E5F5",
  },
];

export default function GuidesScreen({ navigation }) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState(null);

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
        <Text style={styles.headerTitle}>{t("guides.title")} 📚</Text>
        <Text style={styles.headerSubtitle}>{t("guides.subtitle")}</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {GUIDES.map((guide) => {
          const isOpen = activeSection === guide.key;
          return (
            <View key={guide.key} style={styles.accordionContainer}>
              {/* En-tête accordéon */}
              <TouchableOpacity
                style={[
                  styles.accordionHeader,
                  { backgroundColor: guide.color },
                ]}
                onPress={() => setActiveSection(isOpen ? null : guide.key)}
                activeOpacity={0.8}
              >
                <Text style={styles.accordionEmoji}>{guide.emoji}</Text>
                <Text style={styles.accordionTitle}>
                  {t(`guides.${guide.key}.title`)}
                </Text>
                <Text style={styles.accordionArrow}>{isOpen ? "⌄" : "›"}</Text>
              </TouchableOpacity>

              {/* Contenu accordéon */}
              {isOpen && (
                <View style={styles.accordionContent}>
                  <Text style={styles.accordionDesc}>
                    {t(`guides.${guide.key}.description`)}
                  </Text>

                  {/* Points clés */}
                  {[1, 2, 3, 4].map((num) => {
                    const point = t(`guides.${guide.key}.point${num}`, {
                      defaultValue: "",
                    });
                    if (!point) return null;
                    return (
                      <View key={num} style={styles.pointRow}>
                        <Text style={styles.pointBullet}>📌</Text>
                        <Text style={styles.pointText}>{point}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
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
    headerSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.7)" },
    list: { padding: 16, gap: 10 },
    accordionContainer: {
      borderRadius: 16,
      overflow: "hidden",
      elevation: 2,
    },
    accordionHeader: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      gap: 12,
    },
    accordionEmoji: { fontSize: 24 },
    accordionTitle: {
      flex: 1,
      fontSize: 16,
      fontWeight: "700",
      color: "#333333",
    },
    accordionArrow: { fontSize: 20, color: "#333333", fontWeight: "700" },
    accordionContent: {
      backgroundColor: theme.card,
      padding: 16,
    },
    accordionDesc: {
      fontSize: 14,
      color: theme.text,
      lineHeight: 20,
      marginBottom: 12,
    },
    pointRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
      marginBottom: 8,
    },
    pointBullet: { fontSize: 14 },
    pointText: { flex: 1, fontSize: 14, color: theme.text, lineHeight: 20 },
  });
