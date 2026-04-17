import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useTranslation } from "react-i18next";
import "../services/translationService";
import { getCity } from "../services/storageService";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../context/ThemeContext";

const MODULES = [
  { key: "transport", emoji: "🚌", screen: "Transport", color: "#FFF3E0" },
  { key: "daily", emoji: "🏪", screen: "DailyLife", color: "#E8F5E9" },
  { key: "health", emoji: "🏥", screen: "Health", color: "#FCE4EC" },
  { key: "vocabulary", emoji: "💬", screen: "Vocabulary", color: "#E3F2FD" },
  { key: "climate", emoji: "❄️", screen: "Climate", color: "#E0F7FA" },
  { key: "admin", emoji: "📋", screen: "AdminSteps", color: "#F3E5F5" },
];

export default function HomeScreen({ navigation }) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [city, setCity] = React.useState("");

  useFocusEffect(
    React.useCallback(() => {
      const loadCity = async () => {
        const savedCity = await getCity();
        setCity(savedCity || "quebec");
      };
      loadCity();
    }, []),
  );

  const getCityTransitName = (cityCode) => {
    const names = { quebec: "RTC", levis: "STLévis", montreal: "STM" };
    return names[cityCode] || "RTC";
  };

  const getCityLabel = () => {
    const cityMap = {
      quebec: t("cities.quebec"),
      levis: t("cities.levis"),
      montreal: t("cities.montreal"),
    };
    return cityMap[city] || "";
  };

  const styles = makeStyles(theme);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>{t("home.welcome")}</Text>
        <Text style={styles.cityText}>{getCityLabel()}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Grille des modules */}
        <View style={styles.grid}>
          {MODULES.map((module) => (
            <TouchableOpacity
              key={module.key}
              style={styles.moduleCard}
              onPress={() => navigation.navigate(module.screen)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: module.color },
                ]}
              >
                <Text style={styles.moduleEmoji}>{module.emoji}</Text>
              </View>
              <Text style={styles.moduleTitle}>
                {t(`home.modules.${module.key}`)}
              </Text>
              <Text style={styles.moduleSub}>
                {module.key === "transport"
                  ? `${getCityTransitName(city)}, ${t("home.modules.transportSub")}`
                  : t(`home.modules.${module.key}Sub`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navEmoji}>🏠</Text>
          <Text style={[styles.navLabel, styles.navLabelActive]}>
            {t("nav.home")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Guides")}
        >
          <Text style={styles.navEmoji}>📚</Text>
          <Text style={styles.navLabel}>{t("nav.guides")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Settings")}
        >
          <Text style={styles.navEmoji}>⚙️</Text>
          <Text style={styles.navLabel}>{t("nav.settings")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const makeStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      backgroundColor: theme.header,
      paddingHorizontal: 24,
      paddingTop: 50,
      paddingBottom: 32,
    
    },
    welcomeText: {
      fontSize: 16,
      color: "rgba(255,255,255,0.8)",
      fontWeight: "400",
      marginBottom: 4,
    },
    cityText: {
      fontSize: 32,
      color: "#ffffff",
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      paddingHorizontal: 16,
      paddingTop: 24,
      gap: 12,
    },
    moduleCard: {
      width: "47%",
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius: 8,
      elevation: 3,
    },
    iconContainer: {
      width: 52,
      height: 52,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    moduleEmoji: { fontSize: 28 },
    moduleTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 4,
    },
    moduleSub: {
      fontSize: 12,
      color: theme.subtext,
      lineHeight: 16,
    },
    bottomNav: {
      flexDirection: "row",
      backgroundColor: theme.card,
      paddingVertical: 20,
      paddingHorizontal: 8,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 8,
    },
    navItem: {
      flex: 1,
      alignItems: "center",
      gap: 4,
    },
    navEmoji: { fontSize: 22 },
    navLabel: {
      fontSize: 11,
      color: theme.subtext,
      fontWeight: "500",
    },
    navLabelActive: {
      color: theme.primary,
      fontWeight: "700",
    },
  });
