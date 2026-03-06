import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useTranslation } from "react-i18next";
import * as Location from "expo-location";
import colors from "../styles/colors";
import { getCity } from "../services/storageService";
import { getTransportData } from "../services/firebaseService";
import i18n from "i18next";

const getCityTransitName = (cityCode) => {
  const names = {
    quebec: "RTC",
    levis: "STLévis",
    montreal: "STM",
  };
  return names[cityCode] || "RTC";
};

const CITY_TRANSIT_URLS = {
  quebec: "https://www.rtcquebec.ca",
  levis: "https://www.stlevis.ca",
  montreal: "https://www.stm.info",
};

export default function TransportScreen({ navigation }) {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState(null);
  const [transportData, setTransportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [city, setCity] = useState("quebec");
  const [locationStatus, setLocationStatus] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedCity = await getCity();
        setCity(savedCity || "quebec");
        const data = await getTransportData(savedCity || "quebec");
        if (data) {
          setTransportData(data);
        } else {
          setError(true);
        }
      } catch (e) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleOpenItinerary = () => {
    const urls = {
      quebec: "https://www.google.com/maps/dir/?api=1&travelmode=transit&hl=fr",
      levis: "https://www.google.com/maps/dir/?api=1&travelmode=transit&hl=fr",
      montreal:
        "https://www.google.com/maps/dir/?api=1&travelmode=transit&hl=fr",
    };
    Linking.openURL(urls[city]);
  };

  const handleFindStations = async () => {
    setLocationStatus("loading");
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationStatus("permission");
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const queries = {
        quebec: "arrêts+RTC",
        levis: "arrêts+STLévis",
        montreal: "stations+STM+métro",
      };

      const query = queries[city] || "arrêts+transport+commun";
      const url = `https://www.google.com/maps/search/${query}/@${latitude},${longitude},15z`;
      Linking.openURL(url);
      setLocationStatus(null);
    } catch (e) {
      setLocationStatus("error");
    }
  };

  const MENU_ITEMS = [
    {
      key: "fares",
      emoji: "💳",
      color: "#E3F2FD",
    },
    {
      key: "guides",
      emoji: "📖",
      color: "#F3E5F5",
    },
    {
      key: "itinerary",
      emoji: "🗺️",
      color: "#E8F5E9",
    },
    {
      key: "stations",
      emoji: "🚏",
      color: "#FFF3E0",
    },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primaryBlue} />
          <Text style={styles.loadingText}>{t("transport.loading")}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !transportData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.errorEmoji}>😕</Text>
          <Text style={styles.errorText}>{t("transport.error")}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryText}>← {t("onboarding.back")}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.headerTitle}>{t("transport.title")} 🚌</Text>
          <Text style={styles.headerSubtitle}>
            {getCityTransitName(city)} — {t("transport.subtitle")}
          </Text>
        </View>

        {/* Menu principal — 4 sections */}
        <View style={styles.menuGrid}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.menuCard,
                { backgroundColor: item.color },
                activeSection === item.key && styles.menuCardActive,
              ]}
              onPress={() =>
                setActiveSection(activeSection === item.key ? null : item.key)
              }
              activeOpacity={0.7}
            >
              <Text style={styles.menuEmoji}>{item.emoji}</Text>
              <Text style={styles.menuTitle}>
                {t(`transport.menu.${item.key}`)}
              </Text>
              <Text style={styles.menuSub}>
                {item.key === "fares"
                  ? `${t("transport.menu.faresSub_prefix")} ${getCityTransitName(city)}`
                  : t(`transport.menu.${item.key}Sub`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Section Tarifs */}
        {activeSection === "fares" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💳 {t("transport.fares")}</Text>
            <View style={styles.card}>
              <View style={styles.fareRow}>
                <Text style={styles.fareLabel}>
                  🧑 {t("transport.fare_adult")}
                </Text>
                <Text style={styles.fareValue}>{transportData.fare_adult}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.fareRow}>
                <Text style={styles.fareLabel}>
                  🎓 {t("transport.fare_reduced")}
                </Text>
                <Text style={styles.fareValue}>
                  {transportData.fare_reduced}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.fareRow}>
                <Text style={styles.fareLabel}>
                  📅 {t("transport.fare_monthly")}
                </Text>
                <Text style={styles.fareValue}>
                  {transportData.fare_monthly}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Section Guides */}
        {activeSection === "guides" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📖 {t("transport.tips")}</Text>
            <View style={styles.card}>
              {[1, 2, 3].map((num, index) => {
                const tip =
                  transportData[`tip_${i18n.language}_${num}`] ||
                  transportData[`tip_fr_${num}`];
                if (!tip) return null;
                return (
                  <View key={index}>
                    <View style={styles.tipRow}>
                      <Text style={styles.tipBullet}></Text>
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                    {index < 2 && <View style={styles.divider} />}
                  </View>
                );
              })}
            </View>

            {/* Lien vers le site officiel */}
            <TouchableOpacity
              style={styles.websiteButton}
              onPress={() => Linking.openURL(transportData.website)}
            >
              <Text style={styles.websiteButtonText}>
                🌐 {transportData.network}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Section Itinéraires */}
        {activeSection === "itinerary" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              🗺️ {t("transport.itinerary.title")}
            </Text>
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <Text style={styles.infoEmoji}>📞</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{t("transport.phone")}</Text>
                  <TouchableOpacity
                    onPress={() =>
                      Linking.openURL(`tel:${transportData.phone}`)
                    }
                  >
                    <Text style={styles.infoLink}>{transportData.phone}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.mapsButton}
              onPress={handleOpenItinerary}
            >
              <Text style={styles.mapsButtonText}>
                🗺️ {t("transport.itinerary.open")}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Section Stations */}
        {activeSection === "stations" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              🚏 {t("transport.stations.title")}
            </Text>

            {locationStatus === "loading" && (
              <View style={styles.locationCard}>
                <ActivityIndicator color={colors.primaryBlue} />
                <Text style={styles.locationText}>
                  {t("transport.stations.locating")}
                </Text>
              </View>
            )}

            {locationStatus === "permission" && (
              <View style={styles.locationCard}>
                <Text style={styles.locationError}>
                  ⚠️ {t("transport.stations.permission")}
                </Text>
              </View>
            )}

            {locationStatus === "error" && (
              <View style={styles.locationCard}>
                <Text style={styles.locationError}>
                  😕 {t("transport.stations.error")}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.mapsButton}
              onPress={handleFindStations}
            >
              <Text style={styles.mapsButtonText}>
                📍 {t("transport.stations.open")}
              </Text>
            </TouchableOpacity>
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
  errorEmoji: {
    fontSize: 48,
  },
  errorText: {
    fontSize: 16,
    color: colors.mediumGray,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 8,
    padding: 12,
    backgroundColor: colors.primaryBlue,
    borderRadius: 12,
  },
  retryText: {
    color: colors.white,
    fontWeight: "600",
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

  // Menu Grid
  menuGrid: {
    //flex: 1,
    //alignContent: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 12,
  },
  menuCard: {
    width: "47%",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  menuCardActive: {
    borderWidth: 2,
    borderColor: colors.primaryBlue,
  },
  menuEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.darkGray,
    marginBottom: 4,
  },
  menuSub: {
    fontSize: 12,
    color: colors.mediumGray,
  },

  // Sections
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.darkGray,
    marginBottom: 12,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: colors.lightGray,
    marginHorizontal: 12,
  },

  // Tarifs
  fareRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  fareLabel: {
    fontSize: 15,
    color: colors.darkGray,
    fontWeight: "500",
  },
  fareValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primaryBlue,
  },

  // Tips
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    gap: 10,
  },
  tipBullet: {
    fontSize: 18,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: colors.darkGray,
    lineHeight: 20,
  },

  // Boutons
  websiteButton: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  websiteButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  mapsButton: {
    backgroundColor: colors.healthGreen,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  mapsButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },

  // Info rows
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
  },
  infoEmoji: {
    fontSize: 24,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.mediumGray,
    marginBottom: 2,
  },
  infoLink: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primaryBlue,
    textDecorationLine: "underline",
  },

  // Location
  locationCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  locationText: {
    fontSize: 15,
    color: colors.mediumGray,
  },
  locationError: {
    fontSize: 15,
    color: colors.emergencyRed,
    textAlign: "center",
  },
  bottomSpacing: {
    height: 24,
  },
});
