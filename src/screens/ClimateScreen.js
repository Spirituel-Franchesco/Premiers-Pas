import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import colors from "../styles/colors";
import { getCity } from "../services/storageService";

const CITY_COORDS = {
  quebec: { lat: 46.8139, lon: -71.208 },
  levis: { lat: 46.7139, lon: -71.1745 },
  montreal: { lat: 45.5017, lon: -73.5673 },
};

const SEASONS = [
  { key: "winter", emoji: "❄️", color: "#E3F2FD", textColor: "#0B5394" },
  { key: "spring", emoji: "🌸", color: "#F3E5F5", textColor: "#7B1FA2" },
  { key: "summer", emoji: "☀️", color: "#FFF8E1", textColor: "#F57F17" },
  { key: "fall", emoji: "🍂", color: "#FBE9E7", textColor: "#BF360C" },
];

const getClothingCategory = (temp) => {
  if (temp <= -25) return "cold";
  if (temp <= 0) return "cool";
  if (temp <= 15) return "mild";
  return "warm";
};

const getClothingEmoji = (category) => {
  const emojis = {
    cold: "🧥🧤",
    cool: "🧥🧣",
    mild: "🧥",
    warm: "👕",
  };
  return emojis[category];
};

const getTempColor = (temp) => {
  if (temp <= -25) return "#0B5394";
  if (temp <= 0) return "#5B9BD5";
  if (temp <= 15) return "#2A9D8F";
  return "#F4A261";
};

export default function ClimateScreen({ navigation }) {
  const { t } = useTranslation();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadWeather = async () => {
      try {
        const city = await getCity();
        const coords = CITY_COORDS[city] || CITY_COORDS.quebec;
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true&temperature_unit=celsius`;
        const response = await fetch(url);
        const data = await response.json();
        setWeather(data.current_weather);
      } catch (e) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    loadWeather();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primaryBlue} />
          <Text style={styles.loadingText}>{t("climate.loading")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const temp = weather ? Math.round(weather.temperature) : null;
  const category = temp !== null ? getClothingCategory(temp) : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>{t("onboarding.back")}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t("climate.title")}</Text>
          <Text style={styles.headerSubtitle}>{t("climate.subtitle")}</Text>
        </View>

        {/* Température actuelle */}
        {temp !== null && (
          <View style={[styles.tempCard, { borderColor: getTempColor(temp) }]}>
            <Text style={styles.tempEmoji}>{getClothingEmoji(category)}</Text>
            <View style={styles.tempInfo}>
              <Text style={styles.tempLabel}>{t("climate.currentTemp")}</Text>
              <Text style={[styles.tempValue, { color: getTempColor(temp) }]}>
                {temp}°C
              </Text>
              <Text style={styles.tempCategory}>
                {t(`climate.tempRange.${category}`)}
              </Text>
            </View>
          </View>
        )}

        {/* Conseils vestimentaires */}
        {category && (
          <View style={styles.clothingCard}>
            <Text style={styles.sectionTitle}>👔 {t("climate.tips")}</Text>
            <Text style={styles.clothingText}>
              {t(`climate.clothing.${category}`)}
            </Text>
          </View>
        )}

        {/* Les 4 saisons */}
        <Text style={styles.sectionTitle}>🗓️ {t("climate.seasons")}</Text>
        {SEASONS.map((season) => (
          <View
            key={season.key}
            style={[styles.seasonCard, { backgroundColor: season.color }]}
          >
            <View style={styles.seasonHeader}>
              <Text style={styles.seasonEmoji}>{season.emoji}</Text>
              <Text style={[styles.seasonTitle, { color: season.textColor }]}>
                {t(`climate.${season.key}`)}
              </Text>
            </View>
            <Text style={styles.seasonDesc}>
              {t(`climate.${season.key}Desc`)}
            </Text>
          </View>
        ))}

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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: colors.mediumGray,
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
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },

  // Température
  tempCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    gap: 16,
  },
  tempEmoji: {
    fontSize: 48,
  },
  tempInfo: {
    flex: 1,
  },
  tempLabel: {
    fontSize: 12,
    color: colors.mediumGray,
    marginBottom: 4,
  },
  tempValue: {
    fontSize: 48,
    fontWeight: "700",
    lineHeight: 52,
  },
  tempCategory: {
    fontSize: 13,
    color: colors.mediumGray,
    marginTop: 4,
  },

  // Conseils vestimentaires
  clothingCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  clothingText: {
    fontSize: 15,
    color: colors.darkGray,
    lineHeight: 22,
    marginTop: 8,
  },

  // Saisons
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.darkGray,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  seasonCard: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
  },
  seasonHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  seasonEmoji: {
    fontSize: 24,
  },
  seasonTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  seasonDesc: {
    fontSize: 14,
    color: colors.darkGray,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 24,
  },
});
