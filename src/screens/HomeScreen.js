import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useTranslation } from "react-i18next";
import "../services/translationService";
import colors from "../styles/colors";
import { getCity, clearAll } from "../services/storageService";

const MODULES = [
  {
    key: "transport",
    emoji: "🚌",
    screen: "Transport",
    color: "#FFF3E0",
    iconColor: "#F4A261",
  },
  {
    key: "daily",
    emoji: "🏪",
    screen: "DailyLife",
    color: "#E8F5E9",
    iconColor: "#2A9D8F",
  },
  {
    key: "health",
    emoji: "🏥",
    screen: "Health",
    color: "#FCE4EC",
    iconColor: "#E63946",
  },
  {
    key: "vocabulary",
    emoji: "💬",
    screen: "Vocabulary",
    color: "#E3F2FD",
    iconColor: "#5B9BD5",
  },
  {
    key: "climate",
    emoji: "❄️",
    screen: "Climate",
    color: "#E0F7FA",
    iconColor: "#0B5394",
  },
  {
    key: "admin",
    emoji: "📋",
    screen: "AdminSteps",
    color: "#F3E5F5",
    iconColor: "#9C27B0",
  },
];

export default function HomeScreen({ navigation }) {
  const { t } = useTranslation();
  const [city, setCity] = React.useState("");

  React.useEffect(() => {
    const loadCity = async () => {
      const savedCity = await getCity();
      setCity(savedCity || "quebec");
    };
    loadCity();
  }, []);

  const handleReset = async () => {
    await clearAll();
    navigation.replace("Onboarding");
  };

  const getCityLabel = () => {
    const cityMap = {
      quebec: t("cities.quebec"),
      levis: t("cities.levis"),
      montreal: t("cities.montreal"),
    };
    return cityMap[city] || "";
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>{t("home.welcome")}</Text>
          <Text style={styles.cityText}>{getCityLabel()}</Text>

          {/* Bouton reset discret */}
          <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
            <Text style={styles.resetText}>🔄 Changer de profil</Text>
          </TouchableOpacity>
        </View>

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
                {t(`home.modules.${module.key}Sub`)}
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

        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navEmoji}>🗺️</Text>
          <Text style={styles.navLabel}>{t("nav.explore")}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navEmoji}>📚</Text>
          <Text style={styles.navLabel}>{t("nav.guides")}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navEmoji}>⚙️</Text>
          <Text style={styles.navLabel}>{t("nav.settings")}</Text>
        </TouchableOpacity>
      </View>
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
    paddingTop: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "400",
    marginBottom: 4,
  },
  cityText: {
    fontSize: 32,
    color: colors.white,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // Grille
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 12,
  },
  moduleCard: {
    width: "47%",
    backgroundColor: colors.white,
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
  moduleEmoji: {
    fontSize: 28,
  },
  moduleTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.darkGray,
    marginBottom: 4,
  },
  moduleSub: {
    fontSize: 12,
    color: colors.mediumGray,
    lineHeight: 16,
  },

  // Bottom Nav
  bottomNav: {
    flexDirection: "row",
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
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
  navEmoji: {
    fontSize: 22,
  },
  navLabel: {
    fontSize: 11,
    color: colors.mediumGray,
    fontWeight: "500",
  },
  navLabelActive: {
    color: colors.primaryBlue,
    fontWeight: "700",
  },
  resetButton: {
    marginTop: 12,
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  resetText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
});
